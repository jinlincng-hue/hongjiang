import http from "node:http";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const PORT = Number(process.env.PORT || 3107);
const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DATA_DIR =
  process.platform === "win32" ? join(PROJECT_ROOT, "data", "hongjiang-auth") : "/var/lib/hongjiang-auth";
const LOCAL_DEMO_MODE = process.platform === "win32" && process.env.NODE_ENV !== "production";
const DB_PATH = process.env.DB_PATH || join(DEFAULT_DATA_DIR, "hongjiang-auth.sqlite");
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(DEFAULT_DATA_DIR, "uploads");
const JWT_SECRET =
  process.env.JWT_SECRET || (LOCAL_DEMO_MODE ? "hongjiang-local-demo-jwt-secret-please-change-before-production" : "");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const DEMO_AUTH_CODE = process.env.DEMO_AUTH_CODE || (LOCAL_DEMO_MODE ? "123456" : "");
const SMS_PROVIDER = process.env.SMS_PROVIDER || "disabled";
const SMS_WEBHOOK_URL = process.env.SMS_WEBHOOK_URL || "";
const SMS_WEBHOOK_TOKEN = process.env.SMS_WEBHOOK_TOKEN || "";
const ALIYUN_PNVS_ACCESS_KEY_ID =
  process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || process.env.ALIYUN_ACCESS_KEY_ID || "";
const ALIYUN_PNVS_ACCESS_KEY_SECRET =
  process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || process.env.ALIYUN_ACCESS_KEY_SECRET || "";
const ALIYUN_PNVS_ENDPOINT = process.env.ALIYUN_PNVS_ENDPOINT || "dypnsapi.aliyuncs.com";
const ALIYUN_PNVS_SIGN_NAME = process.env.ALIYUN_PNVS_SIGN_NAME || "";
const ALIYUN_PNVS_TEMPLATE_CODE = process.env.ALIYUN_PNVS_TEMPLATE_CODE || "";
const ALIYUN_PNVS_TEMPLATE_PARAM = process.env.ALIYUN_PNVS_TEMPLATE_PARAM || '{"code":"##code##"}';
const ALIYUN_PNVS_SCHEME_NAME = process.env.ALIYUN_PNVS_SCHEME_NAME || "";
const ALIYUN_PNVS_H5_SCENE_CODE =
  process.env.ALIYUN_PNVS_H5_SCENE_CODE || process.env.ALIYUN_PNVS_SCHEME_NAME || "";
const ALIYUN_PNVS_H5_ORIGIN = process.env.ALIYUN_PNVS_H5_ORIGIN || "https://hongjiang.fixone.cloud";
const ALIYUN_PNVS_H5_URL = process.env.ALIYUN_PNVS_H5_URL || "https://hongjiang.fixone.cloud/";
const FIXONE_ORIGIN = (process.env.FIXONE_ORIGIN || "https://fixone.cloud").replace(/\/+$/, "");
const FIXONE_SYNC_USERNAME = process.env.FIXONE_SYNC_USERNAME || "hongjiang_school_sync";
const FIXONE_SYNC_PASSWORD = process.env.FIXONE_SYNC_PASSWORD || "hongjiang-fixone-sync-2026";
const FIXONE_SYNC_EMAIL = process.env.FIXONE_SYNC_EMAIL || "hongjiang-school-sync@fixone.cloud";
const FIXONE_SYNC_DISPLAY_NAME = process.env.FIXONE_SYNC_DISPLAY_NAME || "红匠学堂";
const CORS_ALLOWED_ORIGINS = new Set([
  "https://fixone.cloud",
  "https://www.fixone.cloud",
  "https://hongjiang.fixone.cloud",
  "http://127.0.0.1:8888",
  "http://localhost:8888",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
]);

if (!JWT_SECRET || JWT_SECRET.length < 24) {
  console.error("JWT_SECRET must be set and at least 24 characters.");
  process.exit(1);
}

mkdirSync(dirname(DB_PATH), { recursive: true });
mkdirSync(UPLOAD_DIR, { recursive: true });

let pythonCommand;

function getPythonCommand() {
  if (pythonCommand !== undefined) return pythonCommand;
  for (const command of ["python", "py", "python3"]) {
    const result = spawnSync(command, ["-c", "import sqlite3"], { encoding: "utf8" });
    if (result.status === 0) {
      pythonCommand = command;
      return pythonCommand;
    }
  }
  pythonCommand = "";
  return pythonCommand;
}

function sqliteViaPython(sql, jsonMode = false) {
  const command = getPythonCommand();
  if (!command) throw new Error("sqlite3 command not found and Python sqlite3 fallback is unavailable");
  const runner = `
import json
import sqlite3
import sys

db_path = sys.argv[1]
mode = sys.argv[2]
sql = sys.stdin.read()
sql = sql.encode("utf-8", "ignore").decode("utf-8", "ignore")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
try:
    if mode == "json":
        cursor = conn.execute(sql)
        rows = [dict(row) for row in cursor.fetchall()]
        sys.stdout.write(json.dumps(rows, ensure_ascii=True))
    else:
        conn.executescript(sql)
        conn.commit()
finally:
    conn.close()
`;
  const result = spawnSync(command, ["-c", runner, DB_PATH, jsonMode ? "json" : "exec"], {
    encoding: "utf8",
    input: sql,
    maxBuffer: 1024 * 1024 * 10,
  });
  if (result.status !== 0) throw new Error(result.stderr || "sqlite python fallback failed");
  return result.stdout.trim();
}

function sqlite(sql) {
  const result = spawnSync("sqlite3", [DB_PATH, sql], { encoding: "utf8" });
  if (result.error?.code === "ENOENT") return sqliteViaPython(sql);
  if (result.status !== 0) {
    throw new Error(result.stderr || "sqlite failed");
  }
  return result.stdout.trim();
}

function sqliteJson(sql) {
  const result = spawnSync("sqlite3", ["-json", DB_PATH, sql], { encoding: "utf8" });
  if (result.error?.code === "ENOENT") {
    const output = sqliteViaPython(sql, true);
    return output ? JSON.parse(output) : [];
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || "sqlite failed");
  }
  return result.stdout.trim() ? JSON.parse(result.stdout) : [];
}

function q(value) {
  return `'${String(value ?? "").replace(/[\uD800-\uDFFF]/g, "").replaceAll("'", "''")}'`;
}

function slugify(value) {
  const base = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `activity-${Date.now()}`;
}

function uniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let index = 2;
  while (sqliteJson(`SELECT id FROM activities WHERE slug=${q(slug)} LIMIT 1;`).length) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

function currentChinaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function adminAuthorized(req) {
  if (!ADMIN_TOKEN || ADMIN_TOKEN.length < 6) return false;
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : String(req.headers["x-admin-token"] || "");
  if (!token || token.length !== ADMIN_TOKEN.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(ADMIN_TOKEN));
}

function saveDataImage(dataUrl, prefix) {
  const value = String(dataUrl || "");
  if (!value) return "";
  if (value.startsWith("/api/uploads/")) return value;
  const match = value.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  if (!match) throw new Error("INVALID_IMAGE");

  const extension = match[1].toLowerCase().replace("jpeg", "jpg");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error("INVALID_IMAGE_SIZE");
  const safePrefix =
    String(prefix || "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36) || "activity";
  const filename = `${safePrefix}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
  writeFileSync(join(UPLOAD_DIR, filename), bytes);
  return `/api/uploads/${filename}`;
}

function normalizeActivity(row) {
  const paragraphs = JSON.parse(row.paragraphs_json || "[]");
  let contentBlocks = [];
  try {
    contentBlocks = JSON.parse(row.content_blocks_json || "[]");
  } catch {
    contentBlocks = [];
  }
  if (!contentBlocks.length) {
    contentBlocks = paragraphs.map((text) => ({ type: "paragraph", text }));
    if (row.second_image_url) {
      const insertAt = Math.min(2, contentBlocks.length);
      contentBlocks.splice(insertAt, 0, {
        type: "image",
        url: row.second_image_url,
        caption: row.second_caption || "",
      });
    }
  }
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    lead: row.lead,
    date: row.activity_date,
    place: row.place,
    category: row.category,
    status: row.status || "published",
    firstPublishedAt: row.first_published_at || "",
    cover: row.cover_url,
    coverAlt: row.cover_alt || row.title,
    caption: row.caption || "",
    secondImage: row.second_image_url || "",
    secondCaption: row.second_caption || "",
    summary: row.summary,
    paragraphs,
    contentBlocks,
  };
}

function initDb() {
  sqlite(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'volunteer',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      purpose TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_codes_phone_created ON verification_codes(phone, created_at);
    CREATE INDEX IF NOT EXISTS idx_codes_ip_created ON verification_codes(ip, created_at);
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      lead TEXT NOT NULL,
      activity_date TEXT NOT NULL,
      place TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      cover_url TEXT NOT NULL,
      cover_alt TEXT,
      caption TEXT,
      second_image_url TEXT,
      second_caption TEXT,
      paragraphs_json TEXT NOT NULL,
      content_blocks_json TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      first_published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at);
    CREATE TABLE IF NOT EXISTS volunteer_service_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      service_date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_volunteer_records_user_date
      ON volunteer_service_records(user_id, service_date);
    CREATE TABLE IF NOT EXISTS volunteer_learning_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_title TEXT NOT NULL,
      learned_at TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_volunteer_learning_user_date
      ON volunteer_learning_records(user_id, learned_at);
  `);

  const userColumns = sqliteJson("PRAGMA table_info(users);").map((column) => column.name);
  if (userColumns.includes("service_direction")) {
    sqlite("ALTER TABLE users DROP COLUMN service_direction;");
  }

  const codeColumns = sqliteJson("PRAGMA table_info(verification_codes);").map((column) => column.name);
  if (!codeColumns.includes("provider")) {
    sqlite("ALTER TABLE verification_codes ADD COLUMN provider TEXT NOT NULL DEFAULT 'local';");
  }
  if (!codeColumns.includes("provider_out_id")) {
    sqlite("ALTER TABLE verification_codes ADD COLUMN provider_out_id TEXT;");
  }
  if (!codeColumns.includes("provider_biz_id")) {
    sqlite("ALTER TABLE verification_codes ADD COLUMN provider_biz_id TEXT;");
  }

  const activityColumns = sqliteJson("PRAGMA table_info(activities);").map((column) => column.name);
  if (!activityColumns.includes("status")) {
    sqlite("ALTER TABLE activities ADD COLUMN status TEXT NOT NULL DEFAULT 'published';");
  }
  if (!activityColumns.includes("first_published_at")) {
    sqlite("ALTER TABLE activities ADD COLUMN first_published_at TEXT;");
    sqlite("UPDATE activities SET first_published_at=activity_date WHERE status='published' AND (first_published_at IS NULL OR first_published_at='');");
  }
  if (!activityColumns.includes("content_blocks_json")) {
    sqlite("ALTER TABLE activities ADD COLUMN content_blocks_json TEXT;");
  }
  sqlite("CREATE INDEX IF NOT EXISTS idx_activities_status_created ON activities(status, created_at);");
}

initDb();

function volunteerStats(userId) {
  const stats = sqliteJson(`
    SELECT
      COUNT(*) AS service_count,
      COALESCE(SUM(duration_minutes), 0) AS service_minutes
    FROM volunteer_service_records
    WHERE user_id=${Number(userId)} AND status='completed';
  `)[0] || { service_count: 0, service_minutes: 0 };

  return {
    service_count: Number(stats.service_count || 0),
    service_minutes: Number(stats.service_minutes || 0),
  };
}

function withVolunteerStats(user) {
  return user ? { ...user, ...volunteerStats(user.id) } : user;
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function sendFile(res, status, body, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  res.end(body);
}

function applyCors(req, res) {
  const origin = String(req.headers.origin || "");
  if (CORS_ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "false");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Token");
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Cache-Control": "no-store" });
    res.end();
    return true;
  }
  return false;
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("INVALID_JSON");
    error.statusCode = 400;
    throw error;
  }
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

function isPhone(phone) {
  return /^1[3-9]\d{9}$/.test(String(phone || ""));
}

function hashCode(phone, code) {
  return crypto.createHmac("sha256", JWT_SECRET).update(`${phone}:${code}`).digest("hex");
}

function smsConfigError(message = "SMS_PROVIDER_NOT_CONFIGURED") {
  const error = new Error(message);
  error.code = "SMS_PROVIDER_NOT_CONFIGURED";
  return error;
}

function normalizeAliyunTemplateParam(value) {
  const raw = String(value || "").trim();
  if (!raw) return '{"code":"##code##"}';

  try {
    JSON.parse(raw);
    return raw;
  } catch {
    // When /etc/hongjiang-auth.env is sourced by shell, JSON quotes can be stripped:
    // {"code":"##code##","min":"5"} -> {code:##code##,min:5}
    if (raw.startsWith("{") && raw.endsWith("}")) {
      const parsed = {};
      const body = raw.slice(1, -1);
      for (const pair of body.split(",")) {
        const [key, ...valueParts] = pair.split(":");
        if (!key || valueParts.length === 0) continue;
        parsed[key.trim().replace(/^["']|["']$/g, "")] = valueParts
          .join(":")
          .trim()
          .replace(/^["']|["']$/g, "");
      }
      if (Object.keys(parsed).length > 0) return JSON.stringify(parsed);
    }
  }

  return raw;
}

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  const [header, body, sig] = String(token || "").split(".");
  if (!header || !body || !sig) return null;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

let aliyunPnvsClient;

function getAliyunPnvsClient() {
  if (!ALIYUN_PNVS_ACCESS_KEY_ID || !ALIYUN_PNVS_ACCESS_KEY_SECRET) {
    throw smsConfigError("ALIYUN_ACCESS_KEY_NOT_CONFIGURED");
  }
  if (!ALIYUN_PNVS_SIGN_NAME || !ALIYUN_PNVS_TEMPLATE_CODE) {
    throw smsConfigError("ALIYUN_TEMPLATE_NOT_CONFIGURED");
  }
  if (aliyunPnvsClient) return aliyunPnvsClient;

  const Dypnsapi = require("@alicloud/dypnsapi20170525");
  aliyunPnvsClient = new Dypnsapi.default({
    accessKeyId: ALIYUN_PNVS_ACCESS_KEY_ID,
    accessKeySecret: ALIYUN_PNVS_ACCESS_KEY_SECRET,
    endpoint: ALIYUN_PNVS_ENDPOINT,
  });
  return aliyunPnvsClient;
}

async function sendAliyunPnvsSms(phone) {
  const Dypnsapi = require("@alicloud/dypnsapi20170525");
  const Dara = require("@darabonba/typescript");
  const client = getAliyunPnvsClient();
  const outId = crypto.randomUUID();
  const request = new Dypnsapi.SendSmsVerifyCodeRequest({
    phoneNumber: phone,
    countryCode: "86",
    signName: ALIYUN_PNVS_SIGN_NAME,
    templateCode: ALIYUN_PNVS_TEMPLATE_CODE,
    templateParam: normalizeAliyunTemplateParam(ALIYUN_PNVS_TEMPLATE_PARAM),
    schemeName: ALIYUN_PNVS_SCHEME_NAME || undefined,
    outId,
    codeLength: 6,
    codeType: 1,
    duplicatePolicy: 1,
    interval: 60,
    validTime: 300,
    returnVerifyCode: false,
  });
  const runtime = new Dara.RuntimeOptions({
    connectTimeout: 15000,
    readTimeout: 15000,
    autoretry: true,
    maxAttempts: 3,
    backoffPolicy: "fixed",
    backoffPeriod: 1000,
  });
  const response = await client.sendSmsVerifyCodeWithOptions(request, runtime);
  const body = response?.body || {};
  if (!(body.success === true || body.code === "OK")) {
    throw new Error(`Aliyun PNVS send failed: ${body.code || "UNKNOWN"} ${body.message || ""}`.trim());
  }

  return {
    provider: "aliyun_pnvs",
    codeHash: "",
    providerOutId: body.model?.outId || outId,
    providerBizId: body.model?.bizId || "",
  };
}

async function checkAliyunPnvsSms(record, phone, code) {
  const Dypnsapi = require("@alicloud/dypnsapi20170525");
  const Dara = require("@darabonba/typescript");
  const client = getAliyunPnvsClient();
  const request = new Dypnsapi.CheckSmsVerifyCodeRequest({
    phoneNumber: phone,
    countryCode: "86",
    verifyCode: code,
    outId: record.provider_out_id || undefined,
    schemeName: ALIYUN_PNVS_SCHEME_NAME || undefined,
    caseAuthPolicy: 1,
  });
  const runtime = new Dara.RuntimeOptions({
    connectTimeout: 15000,
    readTimeout: 15000,
    autoretry: true,
    maxAttempts: 3,
    backoffPolicy: "fixed",
    backoffPeriod: 1000,
  });
  const response = await client.checkSmsVerifyCodeWithOptions(request, runtime);
  const body = response?.body || {};
  if (!(body.success === true || body.code === "OK")) {
    throw new Error(`Aliyun PNVS check failed: ${body.code || "UNKNOWN"} ${body.message || ""}`.trim());
  }
  return body.model?.verifyResult === "PASS";
}

async function getAliyunPnvsH5AuthToken() {
  if (!ALIYUN_PNVS_H5_SCENE_CODE) {
    throw smsConfigError("ALIYUN_H5_SCENE_CODE_NOT_CONFIGURED");
  }
  const Dypnsapi = require("@alicloud/dypnsapi20170525");
  const Dara = require("@darabonba/typescript");
  const client = getAliyunPnvsClient();
  const request = new Dypnsapi.GetAuthTokenRequest({
    origin: ALIYUN_PNVS_H5_ORIGIN,
    url: ALIYUN_PNVS_H5_URL,
    sceneCode: ALIYUN_PNVS_H5_SCENE_CODE,
    bizType: 1,
  });
  const response = await client.getAuthTokenWithOptions(
    request,
    new Dara.RuntimeOptions({ connectTimeout: 15000, readTimeout: 15000 }),
  );
  const body = response?.body || {};
  if (body.code !== "OK" || !body.tokenInfo?.accessToken || !body.tokenInfo?.jwtToken) {
    throw new Error(`Aliyun PNVS H5 auth failed: ${body.code || "UNKNOWN"} ${body.message || ""}`.trim());
  }
  return body.tokenInfo;
}

async function getAliyunPnvsPhoneWithToken(spToken) {
  const Dypnsapi = require("@alicloud/dypnsapi20170525");
  const Dara = require("@darabonba/typescript");
  const client = getAliyunPnvsClient();
  const request = new Dypnsapi.GetPhoneWithTokenRequest({ spToken });
  const response = await client.getPhoneWithTokenWithOptions(
    request,
    new Dara.RuntimeOptions({ connectTimeout: 15000, readTimeout: 15000 }),
  );
  const body = response?.body || {};
  const phone = String(body.data?.mobile || "").trim();
  if (body.code !== "OK" || !isPhone(phone)) {
    throw new Error(`Aliyun PNVS H5 phone failed: ${body.code || "UNKNOWN"} ${body.message || ""}`.trim());
  }
  return phone;
}

function loginOrCreateVolunteer(phone, name = "") {
  const existing = sqliteJson(`SELECT * FROM users WHERE phone=${q(phone)} LIMIT 1;`)[0];
  if (existing) {
    sqlite(`
      UPDATE users
      SET name=COALESCE(NULLIF(${q(name)}, ''), name),
          updated_at=datetime('now')
      WHERE phone=${q(phone)};
    `);
  } else {
    sqlite(`
      INSERT INTO users (phone, name, role)
      VALUES (${q(phone)}, ${q(name || "志愿者")}, 'volunteer');
    `);
  }

  const user = withVolunteerStats(
    sqliteJson(`SELECT id, phone, name, role FROM users WHERE phone=${q(phone)} LIMIT 1;`)[0],
  );
  const now = Math.floor(Date.now() / 1000);
  const token = signToken({ sub: user.id, phone: user.phone, role: user.role, iat: now, exp: now + 60 * 60 * 24 * 7 });
  return { token, user };
}

async function sendSmsChallenge(phone) {
  if (SMS_PROVIDER === "aliyun_pnvs") {
    return sendAliyunPnvsSms(phone);
  }

  if (SMS_PROVIDER === "webhook" && SMS_WEBHOOK_URL) {
    const code = String(crypto.randomInt(100000, 1000000));
    const response = await fetch(SMS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SMS_WEBHOOK_TOKEN ? { Authorization: `Bearer ${SMS_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        phone,
        code,
        template: "volunteer_login",
        scene: "红匠助修志愿者登录",
      }),
    });
    if (!response.ok) throw new Error(`sms webhook failed: ${response.status}`);
    return {
      provider: "webhook",
      codeHash: hashCode(phone, code),
      providerOutId: "",
      providerBizId: "",
    };
  }

  throw smsConfigError();
}

async function handleSendCode(req, res) {
  const body = await readJson(req);
  const phone = String(body.phone || "").trim();
  const ip = clientIp(req);

  if (!isPhone(phone)) {
    return json(res, 400, { ok: false, message: "请输入正确的手机号" });
  }

  const recent = sqliteJson(
    `SELECT COUNT(*) AS count FROM verification_codes WHERE phone=${q(phone)} AND created_at > datetime('now','-60 seconds');`,
  )[0]?.count ?? 0;
  if (recent > 0) {
    return json(res, 429, { ok: false, message: "验证码发送过快，请稍后再试" });
  }

  const daily = sqliteJson(
    `SELECT COUNT(*) AS count FROM verification_codes WHERE phone=${q(phone)} AND created_at > datetime('now','-1 day');`,
  )[0]?.count ?? 0;
  if (daily >= 10) {
    return json(res, 429, { ok: false, message: "该手机号今日验证码次数已达上限" });
  }

  const ipHourly = sqliteJson(
    `SELECT COUNT(*) AS count FROM verification_codes WHERE ip=${q(ip)} AND created_at > datetime('now','-1 hour');`,
  )[0]?.count ?? 0;
  if (ipHourly >= 30) {
    return json(res, 429, { ok: false, message: "请求过于频繁，请稍后再试" });
  }

  let smsChallenge;
  try {
    smsChallenge = await sendSmsChallenge(phone);
  } catch (error) {
    if (error.code === "SMS_PROVIDER_NOT_CONFIGURED" || String(error.message).includes("MODULE_NOT_FOUND")) {
      return json(res, 503, {
        ok: false,
        message: "短信服务尚未配置，请先配置短信服务商参数",
      });
    }
    console.error(error);
    return json(res, 502, { ok: false, message: "短信发送失败，请稍后重试" });
  }

  sqlite(`
    INSERT INTO verification_codes (phone, purpose, code_hash, expires_at, ip, provider, provider_out_id, provider_biz_id)
    VALUES (
      ${q(phone)},
      'volunteer_auth',
      ${q(smsChallenge.codeHash)},
      datetime('now','+5 minutes'),
      ${q(ip)},
      ${q(smsChallenge.provider)},
      ${q(smsChallenge.providerOutId)},
      ${q(smsChallenge.providerBizId)}
    );
  `);

  return json(res, 200, { ok: true, message: "验证码已发送，5 分钟内有效" });
}

async function handleVerifyCode(req, res) {
  const body = await readJson(req);
  const phone = String(body.phone || "").trim();
  const code = String(body.code || "").trim();
  const mode = body.mode === "register" ? "register" : "login";
  const name = String(body.name || "").trim().slice(0, 40);

  if (!isPhone(phone)) return json(res, 400, { ok: false, message: "请输入正确的手机号" });
  if (!/^\d{6}$/.test(code)) return json(res, 400, { ok: false, message: "请输入 6 位验证码" });
  if (mode === "register" && !name) return json(res, 400, { ok: false, message: "注册需要填写姓名" });

  if (DEMO_AUTH_CODE && code === DEMO_AUTH_CODE && /^1709001\d{4}$/.test(phone)) {
    const demoUser = sqliteJson(`SELECT id FROM users WHERE phone=${q(phone)} AND role='volunteer' LIMIT 1;`)[0];
    if (demoUser) {
      const result = loginOrCreateVolunteer(phone, name);
      return json(res, 200, { ok: true, token: result.token, user: result.user });
    }
  }

  const rows = sqliteJson(`
    SELECT * FROM verification_codes
    WHERE phone=${q(phone)}
      AND purpose='volunteer_auth'
      AND used_at IS NULL
      AND expires_at > datetime('now')
    ORDER BY id DESC
    LIMIT 1;
  `);
  const record = rows[0];
  if (!record) return json(res, 400, { ok: false, message: "验证码不存在或已过期" });
  if (record.attempts >= 5) return json(res, 429, { ok: false, message: "验证码错误次数过多，请重新获取" });

  let verified = false;
  try {
    if (record.provider === "aliyun_pnvs") {
      verified = await checkAliyunPnvsSms(record, phone, code);
    } else {
      verified = record.code_hash === hashCode(phone, code);
    }
  } catch (error) {
    console.error(error);
    return json(res, 502, { ok: false, message: "验证码核验失败，请稍后重试" });
  }

  if (!verified) {
    sqlite(`UPDATE verification_codes SET attempts = attempts + 1 WHERE id=${Number(record.id)};`);
    return json(res, 400, { ok: false, message: "验证码错误" });
  }

  sqlite(`UPDATE verification_codes SET used_at=datetime('now') WHERE id=${Number(record.id)};`);

  const { token, user } = loginOrCreateVolunteer(phone, name);
  return json(res, 200, { ok: true, token, user });
}

async function handleH5AuthToken(req, res) {
  try {
    const tokenInfo = await getAliyunPnvsH5AuthToken();
    return json(res, 200, {
      ok: true,
      accessToken: tokenInfo.accessToken,
      jwtToken: tokenInfo.jwtToken,
    });
  } catch (error) {
    console.error(error);
    return json(res, 502, { ok: false, message: "一键登录暂不可用，请使用短信验证码" });
  }
}

async function handleH5Login(req, res) {
  const body = await readJson(req);
  const spToken = String(body.spToken || "").trim();
  if (!spToken) return json(res, 400, { ok: false, message: "缺少运营商登录凭证" });

  try {
    const phone = await getAliyunPnvsPhoneWithToken(spToken);
    const { token, user } = loginOrCreateVolunteer(phone, "");
    return json(res, 200, { ok: true, token, user });
  } catch (error) {
    console.error(error);
    return json(res, 502, { ok: false, message: "一键登录失败，请使用短信验证码" });
  }
}

function handleMe(req, res) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) return json(res, 401, { ok: false, message: "未登录或登录已过期" });

  const user = withVolunteerStats(
    sqliteJson(
      `SELECT id, phone, name, role FROM users WHERE id=${Number(payload.sub)} LIMIT 1;`,
    )[0],
  );
  if (!user) return json(res, 401, { ok: false, message: "用户不存在" });
  return json(res, 200, { ok: true, user });
}

async function handleUpdateMe(req, res) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) return json(res, 401, { ok: false, message: "未登录或登录已过期" });

  const body = await readJson(req);
  const name = String(body.name || "").trim().slice(0, 40);
  if (!name) return json(res, 400, { ok: false, message: "请填写姓名" });

  const existing = sqliteJson(
    `SELECT id FROM users WHERE id=${Number(payload.sub)} LIMIT 1;`,
  )[0];
  if (!existing) return json(res, 401, { ok: false, message: "用户不存在" });

  sqlite(`
    UPDATE users
    SET name=${q(name)},
        updated_at=datetime('now')
    WHERE id=${Number(payload.sub)};
  `);

  const user = withVolunteerStats(
    sqliteJson(
      `SELECT id, phone, name, role FROM users WHERE id=${Number(payload.sub)} LIMIT 1;`,
    )[0],
  );
  return json(res, 200, { ok: true, user });
}

function handleVolunteerServiceRecords(req, res) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) return json(res, 401, { ok: false, message: "未登录或登录已过期" });

  const records = sqliteJson(`
    SELECT id, title, service_date, duration_minutes
    FROM volunteer_service_records
    WHERE user_id=${Number(payload.sub)} AND status='completed'
    ORDER BY service_date DESC, id DESC
    LIMIT 20;
  `).map((record) => ({
    id: Number(record.id),
    title: record.title,
    service_date: record.service_date,
    duration_minutes: Number(record.duration_minutes || 0),
  }));

  return json(res, 200, {
    ok: true,
    stats: volunteerStats(payload.sub),
    records,
  });
}

async function handleCreateVolunteerLearningRecord(req, res) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) return json(res, 401, { ok: false, message: "未登录或登录已过期" });

  const existing = sqliteJson(
    `SELECT id FROM users WHERE id=${Number(payload.sub)} AND role='volunteer' LIMIT 1;`,
  )[0];
  if (!existing) return json(res, 401, { ok: false, message: "用户不存在" });

  const body = await readJson(req);
  const durationSeconds = Math.max(0, Math.min(600, Math.floor(Number(body.durationSeconds || 0))));
  const durationMinutes = Math.floor(durationSeconds / 60);
  const projectTitle = String(body.projectTitle || body.courseTitle || "Fixone维修教学视频").trim().slice(0, 80);
  const clipTitle = String(body.clipTitle || "").trim().slice(0, 80);
  const source = String(body.source || "fixone").trim().slice(0, 30);
  const projectId = String(body.projectId || "").trim().slice(0, 80);
  const courseTitle = [projectTitle, clipTitle && clipTitle !== projectTitle ? clipTitle : "", source === "fixone" ? "Fixone" : ""]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 140);

  if (durationMinutes < 1) return json(res, 400, { ok: false, message: "学习时长不足 1 分钟" });

  sqlite(`
    INSERT INTO volunteer_learning_records (user_id, course_title, learned_at, duration_minutes)
    VALUES (${Number(payload.sub)}, ${q(projectId ? `${courseTitle}（${projectId}）` : courseTitle)}, date('now'), ${durationMinutes});
  `);

  const stats = sqliteJson(`
    SELECT COALESCE(SUM(duration_minutes), 0) AS learning_minutes
    FROM volunteer_learning_records
    WHERE user_id=${Number(payload.sub)};
  `)[0] || { learning_minutes: 0 };

  return json(res, 201, {
    ok: true,
    credited_minutes: durationMinutes,
    learning_minutes: Number(stats.learning_minutes || 0),
  });
}

function normalizeFixoneUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${FIXONE_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function normalizeTrainingCourse(project) {
  return {
    id: String(project?.id || ""),
    title: String(project?.title || "维修教学视频"),
    description: String(project?.description || ""),
    category: String(project?.category || project?.repair_part || "维修教学"),
    device_model: String(project?.device_model || project?.model || ""),
    uploader_name: String(project?.uploader_name || ""),
    created_at: String(project?.created_at || ""),
    thumbnailUrl: normalizeFixoneUrl(project?.thumbnail_file_path || project?.thumbnailUrl || ""),
    videoUrl: normalizeFixoneUrl(project?.video_file_path || project?.videoUrl || ""),
    relevance_score: Number(project?.relevance_score || 0),
  };
}

function normalizeTrainingSearchText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

const TRAINING_SEARCH_SYNONYMS = [
  ["电饭锅", "电饭煲", "电饭"],
  ["热水壶", "电水壶", "烧水壶"],
  ["取暖器", "小太阳", "电热扇"],
  ["空开", "空气开关", "断路器"],
  ["尾插", "充电口", "充电接口"],
];

function expandTrainingSearchTerms(query) {
  const normalizedQuery = normalizeTrainingSearchText(query);
  const terms = new Set([normalizedQuery]);

  for (const group of TRAINING_SEARCH_SYNONYMS) {
    if (group.some((term) => normalizedQuery.includes(normalizeTrainingSearchText(term)))) {
      for (const term of group) terms.add(normalizeTrainingSearchText(term));
    }
  }

  return Array.from(terms).filter(Boolean);
}

function courseMatchesTrainingQuery(course, query) {
  const terms = expandTrainingSearchTerms(query);
  if (!terms.length) return true;

  const searchable = normalizeTrainingSearchText([
    course.title,
    course.description,
    course.category,
    course.device_model,
    course.uploader_name,
  ].join(" "));

  return terms.some((term) => searchable.includes(term));
}

async function fetchFixoneJson(pathname, options = {}) {
  const response = await fetch(`${FIXONE_ORIGIN}${pathname}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Accept": "application/json",
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "视修工坊接口暂不可用");
    error.statusCode = response.status;
    throw error;
  }
  return data;
}

async function getFixoneSyncToken() {
  try {
    await fetchFixoneJson("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: FIXONE_SYNC_USERNAME,
        display_name: FIXONE_SYNC_DISPLAY_NAME,
        password: FIXONE_SYNC_PASSWORD,
        email: FIXONE_SYNC_EMAIL,
      }),
    });
  } catch (error) {
    if (error.statusCode !== 409) throw error;
  }

  const result = await fetchFixoneJson("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: FIXONE_SYNC_USERNAME,
      password: FIXONE_SYNC_PASSWORD,
    }),
  });
  const token = result?.user?.sessionToken;
  if (!token) throw new Error("视修工坊同步账号登录失败");
  return token;
}

async function handleTrainingCourses(req, res) {
  const requestUrl = new URL(req.url, "http://localhost");
  const query = String(requestUrl.searchParams.get("q") || "").trim();
  const keywords = query
    ? expandTrainingSearchTerms(query)
    : ["维修", "家电", "电脑", "电动车", "五金", "电池", "屏幕", "充电", "不开机", "工具", "数据"];
  const courses = new Map();
  const groups = [];

  for (const keyword of keywords) {
    const data = await fetchFixoneJson(`/api/search?q=${encodeURIComponent(keyword)}`);
    const group = [...(data.projects || []), ...(data.relatedProjects || [])]
      .map(normalizeTrainingCourse)
      .filter((course) => course.id && courseMatchesTrainingQuery(course, query));
    groups.push(group);
  }

  const maxGroupLength = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < maxGroupLength; index += 1) {
    for (const group of groups) {
      const course = group[index];
      if (!course || courses.has(course.id)) continue;
      courses.set(course.id, course);
      if (courses.size >= (query ? 18 : 30)) break;
    }
    if (courses.size >= (query ? 18 : 30)) break;
  }

  return json(res, 200, {
    ok: true,
    courses: Array.from(courses.values()),
  });
}

async function handleTrainingCourseDetail(req, res, projectId) {
  const data = await fetchFixoneJson(`/api/repair-video-projects/${encodeURIComponent(projectId)}/playlist`);
  const project = normalizeTrainingCourse(data.project || {});
  const clips = Array.isArray(data.clips)
    ? data.clips.map((clip) => ({
        id: String(clip.id || project.id),
        clipTitle: String(clip.clipTitle || clip.title || project.title),
        clipDescription: String(clip.clipDescription || clip.description || ""),
        videoUrl: normalizeFixoneUrl(clip.videoUrl || ""),
        status: String(clip.status || ""),
      }))
    : [];

  return json(res, 200, {
    ok: true,
    project,
    clips,
    message: String(data.message || ""),
  });
}

async function handleTrainingCourseComments(req, res, projectId) {
  const data = await fetchFixoneJson(`/api/repair-video-projects/${encodeURIComponent(projectId)}/comments`);
  return json(res, 200, {
    ok: true,
    comments: Array.isArray(data.comments) ? data.comments : [],
    count: Number(data.count || 0),
  });
}

async function handleCreateTrainingCourseComment(req, res, projectId) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) return json(res, 401, { ok: false, message: "未登录或登录已过期" });

  const user = sqliteJson(
    `SELECT id, phone, name, role FROM users WHERE id=${Number(payload.sub)} AND role='volunteer' LIMIT 1;`,
  )[0];
  if (!user) return json(res, 401, { ok: false, message: "用户不存在" });

  const body = await readJson(req);
  const content = String(body.content || "").trim();
  if (!content) return json(res, 400, { ok: false, message: "请输入评论内容" });
  if (content.length > 420) return json(res, 400, { ok: false, message: "评论不能超过 420 个字" });

  const displayName = String(user.name || "红匠志愿者").replace(/[\r\n]+/g, " ").slice(0, 30);
  const syncToken = await getFixoneSyncToken();
  const result = await fetchFixoneJson(`/api/repair-video-projects/${encodeURIComponent(projectId)}/comments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${syncToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `红匠学堂｜${displayName}：${content}`,
    }),
  });

  return json(res, 201, {
    ok: true,
    message: result.message || "评论发表成功",
    comment: result.comment || null,
  });
}

function handlePublicStats(req, res) {
  const userStats = sqliteJson(`
    SELECT COUNT(*) AS volunteer_count
    FROM users
    WHERE role='volunteer';
  `)[0] || { volunteer_count: 0 };

  const serviceStats = sqliteJson(`
    SELECT
      COUNT(*) AS service_count,
      COALESCE(SUM(duration_minutes), 0) AS service_minutes
    FROM volunteer_service_records
    WHERE status='completed';
  `)[0] || { service_count: 0, service_minutes: 0 };

  return json(res, 200, {
    ok: true,
    stats: {
      volunteer_count: Number(userStats.volunteer_count || 0),
      service_count: Number(serviceStats.service_count || 0),
      service_minutes: Number(serviceStats.service_minutes || 0),
    },
  });
}

function handleVolunteerRankings(req, res) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = token ? verifyToken(token) : null;
  const serviceRows = sqliteJson(`
    SELECT
      u.id,
      u.name,
      COUNT(r.id) AS service_count,
      COALESCE(SUM(r.duration_minutes), 0) AS service_minutes
    FROM users u
    LEFT JOIN volunteer_service_records r
      ON r.user_id=u.id AND r.status='completed'
    WHERE u.role='volunteer'
    GROUP BY u.id
  `);
  const learningRows = sqliteJson(`
    SELECT
      u.id,
      u.name,
      COALESCE(SUM(l.duration_minutes), 0) AS learning_minutes
    FROM users u
    LEFT JOIN volunteer_learning_records l
      ON l.user_id=u.id
    WHERE u.role='volunteer'
    GROUP BY u.id
  `);

  function serviceItem(row) {
    const serviceMinutes = Number(row.service_minutes || 0);
    return {
      id: Number(row.id),
      name: row.name || "红匠志愿者",
      service_count: Number(row.service_count || 0),
      service_minutes: serviceMinutes,
      service_hours: Math.round((serviceMinutes / 60) * 10) / 10,
    };
  }

  function learningItem(row) {
    const learningMinutes = Number(row.learning_minutes || 0);
    return {
      id: Number(row.id),
      name: row.name || "红匠志愿者",
      learning_minutes: learningMinutes,
      learning_hours: Math.round((learningMinutes / 60) * 10) / 10,
    };
  }

  const serviceItems = serviceRows.map(serviceItem);
  const learningItems = learningRows.map(learningItem);
  const serviceHours = [...serviceItems].sort(
    (a, b) => b.service_minutes - a.service_minutes || b.service_count - a.service_count || a.id - b.id,
  );
  const serviceCount = [...serviceItems].sort(
    (a, b) => b.service_count - a.service_count || b.service_minutes - a.service_minutes || a.id - b.id,
  );
  const learningHours = [...learningItems].sort((a, b) => b.learning_minutes - a.learning_minutes || a.id - b.id);
  const userId = payload ? Number(payload.sub) : 0;
  const myRankings = userId
    ? {
        serviceHours: rankForUser(serviceHours, userId),
        serviceCount: rankForUser(serviceCount, userId),
        learningHours: rankForUser(learningHours, userId),
      }
    : null;

  return json(res, 200, {
    ok: true,
    myRankings,
    rankings: {
      serviceHours: serviceHours.slice(0, 10),
      serviceCount: serviceCount.slice(0, 10),
      learningHours: learningHours.slice(0, 10),
    },
  });
}

function rankForUser(items, userId) {
  const index = items.findIndex((item) => Number(item.id) === Number(userId));
  if (index < 0) return null;
  return { rank: index + 1, total: items.length, item: items[index] };
}

async function handleCreateVolunteerServiceRecord(req, res) {
  if (!adminAuthorized(req)) return json(res, 401, { ok: false, message: "管理员口令错误" });

  const body = await readJson(req);
  const phone = String(body.phone || "").trim();
  const title = String(body.title || "志愿服务").trim().slice(0, 80);
  const serviceDate = String(body.serviceDate || currentChinaDate()).trim();
  const durationMinutes = Number(body.durationMinutes);
  if (!isPhone(phone)) return json(res, 400, { ok: false, message: "志愿者手机号不正确" });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
    return json(res, 400, { ok: false, message: "服务日期格式应为 YYYY-MM-DD" });
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 24 * 60) {
    return json(res, 400, { ok: false, message: "志愿时长应为 1 到 1440 分钟" });
  }

  const user = sqliteJson(`SELECT id FROM users WHERE phone=${q(phone)} LIMIT 1;`)[0];
  if (!user) return json(res, 404, { ok: false, message: "未找到该志愿者" });

  sqlite(`
    INSERT INTO volunteer_service_records (user_id, title, service_date, duration_minutes, status)
    VALUES (${Number(user.id)}, ${q(title || "志愿服务")}, ${q(serviceDate)}, ${durationMinutes}, 'completed');
  `);
  return json(res, 201, { ok: true, stats: volunteerStats(user.id) });
}

function handleActivities(req, res) {
  const rows = sqliteJson(`
    SELECT *
    FROM activities
    WHERE status='published'
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT 30;
  `);
  return json(res, 200, { ok: true, activities: rows.map(normalizeActivity) });
}

function handleAdminActivities(req, res) {
  if (!adminAuthorized(req)) return json(res, 401, { ok: false, message: "管理员口令错误" });
  const rows = sqliteJson(`
    SELECT *
    FROM activities
    ORDER BY datetime(updated_at) DESC, id DESC
    LIMIT 100;
  `);
  return json(res, 200, { ok: true, activities: rows.map(normalizeActivity) });
}

function assertPublishToken(body) {
  const token = String(body.publishToken || "");
  if (!ADMIN_TOKEN || token.length !== ADMIN_TOKEN.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(ADMIN_TOKEN));
}

function activityPayload(body, existing = null) {
  const title = String(body.title || "").trim().slice(0, 120);
  const lead = String(body.lead || "").trim().slice(0, 300);
  const place = String(body.place || "").trim().slice(0, 60);
  const category = String(body.category || "").trim().slice(0, 40);
  const summary = String(body.summary || "").trim().slice(0, 260);
  const coverAlt = String(body.coverAlt || title).trim().slice(0, 120);
  const caption = String(body.caption || "").trim().slice(0, 120);
  const secondCaption = String(body.secondCaption || "").trim().slice(0, 120);
  const requestedStatus = body.status === "published" ? "published" : "draft";
  const existingStatus = existing?.status || "draft";
  const isPublishing = requestedStatus === "published" && existingStatus !== "published";
  const activityDate = existing?.activity_date || (isPublishing ? currentChinaDate() : "");
  let firstPublishedAt = existing?.first_published_at || "";
  if (isPublishing && !firstPublishedAt) firstPublishedAt = activityDate || currentChinaDate();

  if (!title) return { error: "请填写活动标题" };
  if (requestedStatus === "published" && !assertPublishToken(body)) {
    return { error: "发布前请再次输入正确口令" };
  }

  let coverUrl = "";
  let secondImageUrl = "";
  let contentBlocks = [];
  try {
    const safeSlug = slugify(title);
    coverUrl = body.coverDataUrl ? saveDataImage(body.coverDataUrl, `${safeSlug}-cover`) : String(body.coverUrl || existing?.cover_url || "");
    secondImageUrl = body.secondImageDataUrl
      ? saveDataImage(body.secondImageDataUrl, `${safeSlug}-second`)
      : String(body.secondImageUrl || existing?.second_image_url || "");

    if (Array.isArray(body.contentBlocks)) {
      contentBlocks = body.contentBlocks
        .map((block, index) => {
          const type = block?.type === "heading" ? "heading" : block?.type === "image" ? "image" : "paragraph";
          if (type === "image") {
            const url = block.imageDataUrl
              ? saveDataImage(block.imageDataUrl, `${safeSlug}-block-${index + 1}`)
              : String(block.url || "");
            return {
              type: "image",
              url,
              caption: String(block.caption || "").trim().slice(0, 140),
            };
          }
          return {
            type,
            text: String(block.text || "").trim().slice(0, type === "heading" ? 120 : 1200),
          };
        })
        .filter((block) => (block.type === "image" ? block.url : block.text))
        .slice(0, 40);
    }
  } catch (error) {
    if (error.message === "INVALID_IMAGE_SIZE") return { error: "图片不能超过 5MB" };
    return { error: "图片格式仅支持 png / jpg / webp" };
  }
  if (!coverUrl) return { error: "请上传活动封面图" };

  const fallbackParagraphs = Array.isArray(body.paragraphs)
    ? body.paragraphs.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 20)
    : String(body.body || "")
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20);

  if (!contentBlocks.length && fallbackParagraphs.length) {
    contentBlocks = fallbackParagraphs.map((text) => ({ type: "paragraph", text }));
    if (secondImageUrl) {
      contentBlocks.splice(Math.min(2, contentBlocks.length), 0, {
        type: "image",
        url: secondImageUrl,
        caption: secondCaption,
      });
    }
  }

  const paragraphs = contentBlocks
    .filter((block) => block.type !== "image" && block.text)
    .map((block) => block.text)
    .slice(0, 20);

  const firstBodyImage = contentBlocks.find((block) => block.type === "image" && block.url);
  if (!secondImageUrl && firstBodyImage) secondImageUrl = firstBodyImage.url;

  if (requestedStatus === "published" && paragraphs.length === 0) {
    return { error: "发布前请至少添加一段正文" };
  }
  if (requestedStatus === "published" && (!lead || !place || !category || !summary)) {
    return { error: "发布前请填写完整活动信息" };
  }

  return {
    title,
    lead,
    activityDate,
    place,
    category,
    summary,
    coverUrl,
    coverAlt,
    caption,
    secondImageUrl,
    secondCaption,
    paragraphs,
    contentBlocks,
    status: requestedStatus,
    firstPublishedAt,
  };
}

async function handleCreateActivity(req, res) {
  if (!adminAuthorized(req)) return json(res, 401, { ok: false, message: "管理员口令错误" });

  const body = await readJson(req);
  const payload = activityPayload(body);
  if (payload.error) return json(res, 400, { ok: false, message: payload.error });

  const slug = uniqueSlug(payload.title);
  sqlite(`
    INSERT INTO activities (
      slug, title, lead, activity_date, place, category, summary,
      cover_url, cover_alt, caption, second_image_url, second_caption, paragraphs_json,
      content_blocks_json, status, first_published_at
    )
    VALUES (
      ${q(slug)}, ${q(payload.title)}, ${q(payload.lead)}, ${q(payload.activityDate)}, ${q(payload.place)}, ${q(payload.category)}, ${q(payload.summary)},
      ${q(payload.coverUrl)}, ${q(payload.coverAlt)}, ${q(payload.caption)}, ${q(payload.secondImageUrl)}, ${q(payload.secondCaption)}, ${q(JSON.stringify(payload.paragraphs))},
      ${q(JSON.stringify(payload.contentBlocks))}, ${q(payload.status)}, ${q(payload.firstPublishedAt)}
    );
  `);

  const row = sqliteJson(`SELECT * FROM activities WHERE slug=${q(slug)} LIMIT 1;`)[0];
  return json(res, 201, { ok: true, activity: normalizeActivity(row) });
}

async function handleUpdateActivity(req, res, id) {
  if (!adminAuthorized(req)) return json(res, 401, { ok: false, message: "管理员口令错误" });

  const existing = sqliteJson(`SELECT * FROM activities WHERE id=${Number(id)} LIMIT 1;`)[0];
  if (!existing) return json(res, 404, { ok: false, message: "活动不存在" });

  const body = await readJson(req);
  const payload = activityPayload(body, existing);
  if (payload.error) return json(res, 400, { ok: false, message: payload.error });

  sqlite(`
    UPDATE activities
    SET title=${q(payload.title)},
        lead=${q(payload.lead)},
        activity_date=${q(payload.activityDate)},
        place=${q(payload.place)},
        category=${q(payload.category)},
        summary=${q(payload.summary)},
        cover_url=${q(payload.coverUrl)},
        cover_alt=${q(payload.coverAlt)},
        caption=${q(payload.caption)},
        second_image_url=${q(payload.secondImageUrl)},
        second_caption=${q(payload.secondCaption)},
        paragraphs_json=${q(JSON.stringify(payload.paragraphs))},
        content_blocks_json=${q(JSON.stringify(payload.contentBlocks))},
        status=${q(payload.status)},
        first_published_at=${q(payload.firstPublishedAt)},
        updated_at=datetime('now')
    WHERE id=${Number(id)};
  `);

  const row = sqliteJson(`SELECT * FROM activities WHERE id=${Number(id)} LIMIT 1;`)[0];
  return json(res, 200, { ok: true, activity: normalizeActivity(row) });
}

function handleDeleteActivity(req, res, id) {
  if (!adminAuthorized(req)) return json(res, 401, { ok: false, message: "管理员口令错误" });

  const existing = sqliteJson(`SELECT id FROM activities WHERE id=${Number(id)} LIMIT 1;`)[0];
  if (!existing) return json(res, 404, { ok: false, message: "活动不存在" });
  sqlite(`DELETE FROM activities WHERE id=${Number(id)};`);
  return json(res, 200, { ok: true });
}

function handleUploadedFile(req, res) {
  const rawName = decodeURIComponent(String(req.url || "").replace("/api/uploads/", ""));
  if (!/^[a-zA-Z0-9._\-\u4e00-\u9fa5]+?\.(png|jpg|jpeg|webp)$/i.test(rawName)) {
    return json(res, 404, { ok: false, message: "Not found" });
  }

  const filePath = join(UPLOAD_DIR, rawName);
  if (!existsSync(filePath)) return json(res, 404, { ok: false, message: "Not found" });
  const ext = rawName.split(".").pop().toLowerCase();
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return sendFile(res, 200, readFileSync(filePath), contentType);
}

const server = http.createServer(async (req, res) => {
  try {
    if (applyCors(req, res)) return;
    if (req.method === "GET" && req.url === "/api/health") {
      return json(res, 200, { ok: true });
    }
    if (req.method === "POST" && req.url === "/api/auth/send-code") return await handleSendCode(req, res);
    if (req.method === "POST" && req.url === "/api/auth/verify-code") return await handleVerifyCode(req, res);
    if (req.method === "GET" && req.url === "/api/auth/h5-auth-token") return await handleH5AuthToken(req, res);
    if (req.method === "POST" && req.url === "/api/auth/h5-login") return await handleH5Login(req, res);
    if (req.method === "GET" && req.url === "/api/auth/me") return handleMe(req, res);
    if (req.method === "PATCH" && req.url === "/api/auth/me") return await handleUpdateMe(req, res);
    if (req.method === "GET" && req.url === "/api/volunteer/service-records") {
      return handleVolunteerServiceRecords(req, res);
    }
    if (req.method === "POST" && req.url === "/api/volunteer/learning-records") {
      return await handleCreateVolunteerLearningRecord(req, res);
    }
    if (req.method === "GET" && String(req.url || "").startsWith("/api/training/courses?")) {
      return await handleTrainingCourses(req, res);
    }
    if (req.method === "GET" && req.url === "/api/training/courses") {
      return await handleTrainingCourses(req, res);
    }
    const trainingCommentsMatch = String(req.url || "").match(/^\/api\/training\/courses\/([^/]+)\/comments$/);
    if (trainingCommentsMatch && req.method === "GET") {
      return await handleTrainingCourseComments(req, res, decodeURIComponent(trainingCommentsMatch[1]));
    }
    if (trainingCommentsMatch && req.method === "POST") {
      return await handleCreateTrainingCourseComment(req, res, decodeURIComponent(trainingCommentsMatch[1]));
    }
    const trainingCourseMatch = String(req.url || "").match(/^\/api\/training\/courses\/([^/]+)$/);
    if (trainingCourseMatch && req.method === "GET") {
      return await handleTrainingCourseDetail(req, res, decodeURIComponent(trainingCourseMatch[1]));
    }
    if (req.method === "GET" && req.url === "/api/public/stats") return handlePublicStats(req, res);
    if (req.method === "GET" && req.url === "/api/public/volunteer-rankings") return handleVolunteerRankings(req, res);
    if (req.method === "POST" && req.url === "/api/admin/volunteer-service-records") {
      return await handleCreateVolunteerServiceRecord(req, res);
    }
    if (req.method === "GET" && req.url === "/api/activities") return handleActivities(req, res);
    if (req.method === "GET" && req.url === "/api/admin/activities") return handleAdminActivities(req, res);
    if (req.method === "POST" && req.url === "/api/admin/activities") return await handleCreateActivity(req, res);
    const adminActivityMatch = String(req.url || "").match(/^\/api\/admin\/activities\/(\d+)$/);
    if (adminActivityMatch && req.method === "PATCH") return await handleUpdateActivity(req, res, adminActivityMatch[1]);
    if (adminActivityMatch && req.method === "DELETE") return handleDeleteActivity(req, res, adminActivityMatch[1]);
    if (req.method === "GET" && String(req.url || "").startsWith("/api/uploads/")) return handleUploadedFile(req, res);
    return json(res, 404, { ok: false, message: "Not found" });
  } catch (error) {
    if (error.statusCode === 400 || error.message === "INVALID_JSON") {
      return json(res, 400, { ok: false, message: "请求格式错误" });
    }
    console.error(error);
    return json(res, 500, { ok: false, message: "服务器内部错误" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`hongjiang auth api listening on 127.0.0.1:${PORT}`);
});
