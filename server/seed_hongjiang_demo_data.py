from __future__ import annotations

import argparse
import csv
import os
import random
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "hongjiang-auth" / "hongjiang-auth.sqlite"
DEFAULT_OUTPUT_PATH = PROJECT_ROOT / "outputs" / "hongjiang-demo-volunteers.csv"
DEMO_PHONE_PREFIX = "1709001"

FAMILY_NAMES = [
    "李",
    "王",
    "张",
    "刘",
    "陈",
    "杨",
    "赵",
    "黄",
    "周",
    "吴",
    "徐",
    "孙",
    "胡",
    "朱",
    "高",
    "林",
    "何",
    "郭",
    "马",
    "罗",
    "梁",
    "宋",
    "郑",
    "谢",
    "韩",
    "唐",
    "冯",
    "于",
    "董",
    "萧",
    "程",
    "曹",
]

GIVEN_NAMES = [
    "明轩",
    "子涵",
    "宇航",
    "梓晴",
    "嘉豪",
    "雨桐",
    "欣怡",
    "浩然",
    "思源",
    "俊杰",
    "晨曦",
    "佳宁",
    "一诺",
    "若溪",
    "博文",
    "诗涵",
    "泽宇",
    "雅婷",
    "昊天",
    "梓萱",
    "彦辰",
    "嘉怡",
    "奕辰",
    "沐阳",
    "书瑶",
    "皓轩",
    "语彤",
    "锦程",
    "清扬",
    "芷晴",
    "星辰",
    "梦琪",
]

SERVICE_TITLES = [
    "社区便民维修日",
    "老人智能手机辅导",
    "小家电故障义诊",
    "手机基础维修陪练",
    "居民设备使用咨询",
    "公益维修知识讲解",
    "社区上门排查服务",
    "旧机清理与安全提醒",
]

COURSE_TITLES = [
    "手机维修安全规范",
    "智能手机常见故障判断",
    "老人手机使用辅导",
    "小家电基础检查流程",
    "社区服务沟通礼仪",
    "维修记录填写规范",
]


def db_path_from_env() -> Path:
    value = os.environ.get("DB_PATH")
    return Path(value) if value else DEFAULT_DB_PATH


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
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
        """
    )
    user_columns = [row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()]
    if "service_direction" in user_columns:
        conn.execute("ALTER TABLE users DROP COLUMN service_direction")


def volunteer_name(index: int) -> str:
    family = FAMILY_NAMES[index % len(FAMILY_NAMES)]
    given = GIVEN_NAMES[(index * 7 + index // len(FAMILY_NAMES)) % len(GIVEN_NAMES)]
    return f"{family}{given}"


def service_record_count(index: int) -> int:
    if index % 13 == 0:
        return 0
    if index % 7 == 0:
        return 1
    if index % 5 == 0:
        return 2
    return 3 + (index % 4)


def seed(conn: sqlite3.Connection, count: int) -> list[dict[str, str]]:
    rng = random.Random(20260908)
    now = datetime(2026, 9, 8, 10, 0, 0)
    demo_rows = []

    demo_user_ids = [
        row[0]
        for row in conn.execute(
            "SELECT id FROM users WHERE phone LIKE ?",
            (f"{DEMO_PHONE_PREFIX}%",),
        ).fetchall()
    ]
    if demo_user_ids:
        placeholders = ",".join("?" for _ in demo_user_ids)
        conn.execute(f"DELETE FROM volunteer_service_records WHERE user_id IN ({placeholders})", demo_user_ids)
        conn.execute(f"DELETE FROM volunteer_learning_records WHERE user_id IN ({placeholders})", demo_user_ids)

    for index in range(1, count + 1):
        phone = f"{DEMO_PHONE_PREFIX}{index:04d}"
        name = volunteer_name(index)
        created_at = now - timedelta(days=120 - (index % 90), hours=index % 11)
        created_text = created_at.strftime("%Y-%m-%d %H:%M:%S")

        conn.execute(
            """
            INSERT INTO users (phone, name, role, created_at, updated_at)
            VALUES (?, ?, 'volunteer', ?, ?)
            ON CONFLICT(phone) DO UPDATE SET
              name=excluded.name,
              role='volunteer',
              updated_at=excluded.updated_at;
            """,
            (phone, name, created_text, created_text),
        )
        user_id = conn.execute("SELECT id FROM users WHERE phone=?", (phone,)).fetchone()[0]

        total_minutes = 0
        learning_minutes = 0
        total_count = service_record_count(index)
        for record_index in range(total_count):
            service_date = now.date() - timedelta(days=(index * 3 + record_index * 11) % 125)
            duration = rng.choice([35, 45, 50, 60, 75, 90, 100, 120, 150, 180])
            total_minutes += duration
            title = SERVICE_TITLES[(index + record_index) % len(SERVICE_TITLES)]
            conn.execute(
                """
                INSERT INTO volunteer_service_records
                  (user_id, title, service_date, duration_minutes, status, created_at)
                VALUES (?, ?, ?, ?, 'completed', ?);
                """,
                (
                    user_id,
                    title,
                    service_date.isoformat(),
                    duration,
                    (datetime.combine(service_date, datetime.min.time()) + timedelta(hours=18)).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                ),
            )

        learning_count = 2 + (index % 5)
        for learning_index in range(learning_count):
            learned_at = now.date() - timedelta(days=(index * 2 + learning_index * 9) % 100)
            duration = rng.choice([20, 25, 30, 35, 40, 45, 50, 60])
            if index % 11 == 0:
                duration += 30
            learning_minutes += duration
            course_title = COURSE_TITLES[(index + learning_index) % len(COURSE_TITLES)]
            conn.execute(
                """
                INSERT INTO volunteer_learning_records
                  (user_id, course_title, learned_at, duration_minutes, created_at)
                VALUES (?, ?, ?, ?, ?);
                """,
                (
                    user_id,
                    course_title,
                    learned_at.isoformat(),
                    duration,
                    (datetime.combine(learned_at, datetime.min.time()) + timedelta(hours=20)).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                ),
            )

        demo_rows.append(
            {
                "name": name,
                "phone": phone,
                "demo_code": "123456",
                "service_count": str(total_count),
                "service_hours": f"{total_minutes / 60:.1f}",
                "learning_hours": f"{learning_minutes / 60:.1f}",
            }
        )

    conn.commit()
    return demo_rows


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "name",
                "phone",
                "demo_code",
                "service_count",
                "service_hours",
                "learning_hours",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Hongjiang volunteer demo accounts.")
    parser.add_argument("--count", type=int, default=128)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    args = parser.parse_args()

    if args.count < 100:
        raise SystemExit("--count must be at least 100 for the competition demo data set.")

    db_path = db_path_from_env()
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    try:
        init_schema(conn)
        rows = seed(conn, args.count)
    finally:
        conn.close()

    write_csv(args.output, rows)
    total_services = sum(int(row["service_count"]) for row in rows)
    total_hours = sum(float(row["service_hours"]) for row in rows)
    total_learning_hours = sum(float(row["learning_hours"]) for row in rows)
    print(f"Seeded {len(rows)} demo volunteers into {db_path}")
    print(f"Created {total_services} completed service records, about {total_hours:.1f} service hours")
    print(f"Created learning records, about {total_learning_hours:.1f} learning hours")
    print(f"Demo account CSV: {args.output}")
    print("Demo login code for seeded 1709001**** accounts: 123456")


if __name__ == "__main__":
    main()
