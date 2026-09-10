import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Droplets,
  Heart,
  Home,
  KeyRound,
  MapPin,
  MonitorSmartphone,
  PackageSearch,
  Search,
  SendHorizontal,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  UserCheck,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import logoUrl from "./assets/hongjiang-logo-cropped.png";
import heroUrl from "./assets/hero-repair.png";
import siteQrUrl from "./assets/site-qr.png";
import hetangTeamUrl from "./assets/activity-hetang-team.png";
import hetangResidentUrl from "./assets/activity-hetang-resident.png";
import volunteersUrl from "./assets/volunteers.png";

const navItems = [
  { label: "首页", path: "/" },
  { label: "我要报修", path: "/repair" },
  { label: "志愿者招募", path: "/volunteer" },
  { label: "技能培训", path: "/training" },
  { label: "关于我们", hash: "#关于我们" },
];

const bottomNavItems = [
  { label: "首页", path: "/", icon: Home },
  { label: "志愿者", path: "/volunteer", icon: UserCheck },
  { label: "学习", path: "/training", icon: Smartphone },
];

const services = [
  {
    title: "水电维修",
    desc: "水管、水龙头、电路、灯具等",
    color: "blue",
    icon: Droplets,
  },
  {
    title: "门窗维修",
    desc: "门锁、合页、玻璃、窗户等",
    color: "green",
    icon: Home,
  },
  {
    title: "家电维修",
    desc: "电饭煲、水壶、洗衣机等",
    color: "orange",
    icon: MonitorSmartphone,
  },
  {
    title: "手机维修",
    desc: "屏幕、电池、系统故障等",
    color: "purple",
    icon: Smartphone,
  },
  {
    title: "其他服务",
    desc: "更多便民服务欢迎咨询",
    color: "red",
    icon: Sparkles,
  },
];

const stats = [
  { label: "已帮助家庭", value: "12,568", unit: "户", icon: Home },
  { label: "志愿者人数", value: "3,248", unit: "名", icon: UsersRound },
  { label: "服务次数", value: "18,732", unit: "次", icon: Wrench },
  { label: "覆盖城市", value: "156", unit: "个", icon: MapPin },
];

const volunteerChecks = [
  "实名认证与紧急联系人",
  "技能标签和可服务区域",
  "线下培训或线上安全测试",
  "服务记录与居民评价归档",
];

const activities = [
  {
    slug: "hetang-repair",
    title: "志愿暖邻里 维修知识免费学 | 荷塘小区家电维修公益活动初见成效",
    lead: "6月7日，红匠志愿服务队在荷塘小区开展家电数码维修知识公益志愿活动，目前该项便民服务已初见成效。",
    date: "2026-06-07",
    place: "荷塘小区",
    category: "公益活动",
    cover: hetangTeamUrl,
    coverAlt: "红匠志愿服务队在荷塘小区合影",
    caption: "红匠志愿服务队在荷塘小区合影留念",
    secondImage: hetangResidentUrl,
    secondCaption: "志愿者与荷塘小区居民点赞活动",
    summary: "红匠志愿服务队走进小区，把真实维修场景整理成居民看得懂、用得上的公益教学内容。",
    paragraphs: [
      "本次活动由红匠志愿服务队负责人曾锦玲统筹组织，结合荷塘小区居民居家家电、数码设备日常维修的实际痛点开展。服务队收集整理日常真实家电维修现场视频，以实景演示形式，向小区居民讲解常见设备故障辨别、简易基础维修方法，所有教学内容贴合居民居家使用场景，通俗易懂、实操性强。",
      "截至目前，服务队整理的公益维修教学视频已面向居民全面免费开放，解决居民小额家电故障自行处理的需求。针对有深入学习需求的居民，服务队同步提供付费进阶维修技术学习增值渠道。",
      "本次便民志愿活动获得小区居民普遍认可，后续红匠志愿服务队将根据居民反馈优化教学内容，持续常态化开展社区便民维修志愿服务。",
    ],
  },
  {
    slug: "phone-guide",
    title: "一对一辅导老人使用智能手机，红匠志愿者把耐心送到身边",
    lead: "红匠志愿者围绕微信使用、照片清理、常见诈骗识别等内容，为社区老人开展智能手机使用辅导。",
    date: "2026-06-15",
    place: "社区活动室",
    category: "敬老助老",
    cover: hetangResidentUrl,
    coverAlt: "志愿者与居民合影",
    caption: "志愿者与居民互动交流",
    summary: "从字体调大到防诈骗提醒，志愿者用手把手教学帮助老人跨过数字门槛。",
    paragraphs: [
      "针对部分老人不会使用智能手机、遇到弹窗和异常提示容易紧张等问题，红匠志愿服务队组织志愿者开展手机使用辅导活动。志愿者从最常见的微信聊天、视频通话、照片清理和手机存储空间管理讲起，让老人能够听得懂、学得会。",
      "活动现场，志愿者还结合日常维修服务中遇到的案例，提醒老人识别陌生链接、虚假中奖、远程控制等常见风险，帮助居民增强手机使用安全意识。",
      "后续服务队将把智能手机辅导纳入常态化便民服务内容，为有需要的居民提供更细致的数字生活支持。",
    ],
  },
  {
    slug: "repair-class",
    title: "手机维修基础公益课堂开课，志愿者先学技能再服务社区",
    lead: "围绕屏幕、电池、系统故障等常见问题，红匠志愿者开展手机维修基础学习和流程训练。",
    date: "2026-06-22",
    place: "线上学习平台",
    category: "技能培训",
    cover: heroUrl,
    coverAlt: "志愿者维修设备场景",
    caption: "志愿者学习基础维修判断方法",
    summary: "把复杂维修拆成可学习、可考核、可上岗的训练路径，提升志愿服务质量。",
    paragraphs: [
      "为提升志愿服务的专业性和安全性，红匠志愿服务队围绕手机维修基础知识开展公益课堂。课程内容覆盖故障初步判断、维修流程规范、配件安全和服务边界等基础模块。",
      "培训强调先诊断、再处理、留记录的服务流程，帮助新志愿者在参与社区服务前建立规范意识，避免因经验不足造成二次损坏或服务风险。",
      "后续服务队将结合线上学习平台继续完善课程内容，让更多志愿者可以利用碎片时间完成学习和认证。",
    ],
  },
  {
    slug: "repair-day",
    title: "社区便民维修日持续开展，小家电义诊服务居民生活",
    lead: "红匠志愿服务队组织志愿者开展便民维修日，为居民提供小家电检查、故障咨询和使用建议。",
    date: "2026-07-06",
    place: "社区服务点",
    category: "便民维修",
    cover: volunteersUrl,
    coverAlt: "红匠志愿者服务居民",
    caption: "红匠志愿者开展社区便民服务",
    summary: "让居民在家门口获得小修小补支持，也让志愿者在真实服务中持续成长。",
    paragraphs: [
      "社区便民维修日面向居民日常生活中的小额维修需求，重点提供电饭煲、水壶、台灯、手机等设备的基础检查和故障咨询服务。",
      "志愿者在现场记录居民常见问题，并将高频故障整理为后续科普内容，帮助居民掌握更安全、更规范的日常使用方法。",
      "红匠志愿服务队将根据居民反馈持续优化服务流程，逐步形成活动招募、技能培训、现场服务和服务回访的闭环机制。",
    ],
  },
];

function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trainingSearchQuery, setTrainingSearchQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [routePath, setRoutePath] = useState(() => window.location.pathname);
  const [activeSection, setActiveSection] = useState(() => window.location.hash || "#top");
  const [serverActivities, setServerActivities] = useState([]);
  const [publicStats, setPublicStats] = useState(null);
  const [volunteerUser, setVolunteerUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hongjiangVolunteerUser") || "null");
    } catch {
      return null;
    }
  });

  const isTrainingRoute = routePath === "/training" || routePath.startsWith("/training/");
  const trainingVideoId = routePath.startsWith("/training/")
    ? decodeURIComponent(routePath.replace(/^\/training\//, ""))
    : "";
  const isPartsLibraryRoute = routePath === "/parts-library";
  const isVolunteerRoute = routePath === "/volunteer";
  const isVolunteerRankingsRoute = routePath === "/volunteer-rankings";
  const isActivityRoute = routePath.startsWith("/activity/");
  const isAdminRoute = routePath === "/admin-activities";
  const allActivities = useMemo(() => {
    const serverKeys = new Set(serverActivities.flatMap((activity) => [activity.slug, activity.title].filter(Boolean)));
    return [
      ...serverActivities,
      ...activities.filter((activity) => !serverKeys.has(activity.slug) && !serverKeys.has(activity.title)),
    ];
  }, [serverActivities]);
  const homeStats = useMemo(
    () =>
      stats.map((item) => {
        if (item.label === "志愿者人数" && publicStats?.volunteer_count) {
          return { ...item, value: publicStats.volunteer_count.toLocaleString("zh-CN") };
        }
        if (item.label === "服务次数" && publicStats?.service_count) {
          return { ...item, value: publicStats.service_count.toLocaleString("zh-CN") };
        }
        return item;
      }),
    [publicStats],
  );
  const currentActivity =
    allActivities.find((activity) => routePath === `/activity/${activity.slug}`) || allActivities[0];

  const searchMatches = useMemo(() => {
    const keyword = searchQuery.trim();
    if (!keyword) return [];

    return services.filter((item) => {
      const text = `${item.title ?? ""}${item.desc ?? ""}`;
      return text.includes(keyword);
    });
  }, [searchQuery]);

  useEffect(() => {
    function handlePopState() {
      setRoutePath(window.location.pathname);
      setActiveSection(window.location.hash || "#top");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("hongjiangVolunteerToken");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (data.user) {
          localStorage.setItem("hongjiangVolunteerUser", JSON.stringify(data.user));
          setVolunteerUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("hongjiangVolunteerToken");
        localStorage.removeItem("hongjiangVolunteerUser");
        setVolunteerUser(null);
      });
  }, []);

  useEffect(() => {
    fetch("/api/activities")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.activities)) setServerActivities(data.activities);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (data.stats) setPublicStats(data.stats);
      })
      .catch(() => {});
  }, []);

  function navigateHome(hash = "") {
    const nextUrl = `${window.location.origin}/${hash}`;
    window.history.pushState({}, "", nextUrl);
    setRoutePath("/");
    setActiveSection(hash || "#top");
    if (hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function navigateTraining() {
    window.history.pushState({}, "", "/training");
    setRoutePath("/training");
    setActiveSection("#技能培训");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateTrainingVideo(videoId) {
    const nextPath = `/training/${encodeURIComponent(videoId)}`;
    window.history.pushState({}, "", nextPath);
    setRoutePath(nextPath);
    setActiveSection("#技能培训");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigatePartsLibrary() {
    window.history.pushState({}, "", "/parts-library");
    setRoutePath("/parts-library");
    setActiveSection("#配件库");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateVolunteer() {
    window.history.pushState({}, "", "/volunteer");
    setRoutePath("/volunteer");
    setActiveSection("#志愿者");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateVolunteerRankings() {
    window.history.pushState({}, "", "/volunteer-rankings");
    setRoutePath("/volunteer-rankings");
    setActiveSection("#志愿者榜单");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateActivity(slug = activities[0].slug) {
    window.history.pushState({}, "", `/activity/${slug}`);
    setRoutePath(`/activity/${slug}`);
    setActiveSection("#活动风采");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openFlow(type, service = "") {
    if (type === "volunteer" && volunteerUser) {
      navigateVolunteer();
      return;
    }
    setSubmitted(false);
    setModal({ type, service });
  }

  function logoutVolunteer() {
    localStorage.removeItem("hongjiangVolunteerToken");
    localStorage.removeItem("hongjiangVolunteerUser");
    setVolunteerUser(null);
    if (isVolunteerRoute) navigateHome();
  }

  function closeFlow() {
    setModal(null);
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className={isTrainingRoute ? "topbar-inner training-topbar-inner" : "topbar-inner"}>
          <a
            className="brand"
            href="/#top"
            aria-label="红匠助修首页"
            onClick={(event) => {
              event.preventDefault();
              navigateHome();
            }}
          >
            <img src={logoUrl} alt="红匠助修" />
            <span>修善于心 · 助人为乐</span>
          </a>

          {isTrainingRoute ? (
            <label className="training-header-search">
              <Search size={18} />
              <input
                value={trainingSearchQuery}
                onChange={(event) => setTrainingSearchQuery(event.target.value)}
                placeholder="搜索教学视频"
              />
            </label>
          ) : null}

          <nav className="nav" aria-label="主导航">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                className={
                  (isTrainingRoute && item.path === "/training") ||
                  (isVolunteerRoute && item.path === "/volunteer") ||
                  (isVolunteerRankingsRoute && item.path === "/volunteer") ||
                  (!isTrainingRoute &&
                    !isVolunteerRoute &&
                    !isVolunteerRankingsRoute &&
                    !isActivityRoute &&
                    !isAdminRoute &&
                    item.path === "/") ||
                  (!isTrainingRoute && activeSection === item.hash)
                    ? "active"
                    : ""
                }
                href={item.path ?? `/${item.hash}`}
                onClick={(event) => {
                  event.preventDefault();
                  if (item.path === "/training") {
                    navigateTraining();
                  } else if (item.path === "/volunteer") {
                    if (volunteerUser) {
                      navigateVolunteer();
                    } else {
                      openFlow("volunteer");
                    }
                  } else if (item.path === "/repair") {
                    openFlow("repair");
                  } else if (item.path === "/") {
                    navigateHome();
                  } else {
                    navigateHome(item.hash);
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            {!isTrainingRoute ? (
              <button
                className="icon-button"
                aria-label="搜索"
                onClick={() => setSearchOpen((value) => !value)}
                title="搜索"
              >
                <Search size={21} />
              </button>
            ) : null}
            {volunteerUser ? (
              <>
                <button className="ghost-button" onClick={navigateVolunteer}>
                  个人页
                </button>
                <button className="solid-button small" onClick={logoutVolunteer}>
                  退出
                </button>
              </>
            ) : (
              <>
                <button className="ghost-button" onClick={() => openFlow("volunteer")}>
                  登录
                </button>
                <button className="solid-button small" onClick={() => openFlow("volunteer")}>
                  注册
                </button>
              </>
            )}
          </div>
        </div>
        {searchOpen && !isTrainingRoute && !isPartsLibraryRoute && (
          <div className="search-panel">
            <Search size={18} />
            <input
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索服务项目"
            />
            {searchQuery && (
              <span className="search-count">找到 {searchMatches.length} 项</span>
            )}
          </div>
        )}
      </header>

      <main id="top">
        {isTrainingRoute ? (
          <TrainingRoute
            volunteerUser={volunteerUser}
            videoId={trainingVideoId}
            query={trainingSearchQuery}
            onOpenVideo={navigateTrainingVideo}
            onOpenParts={navigatePartsLibrary}
            onBack={navigateTraining}
          />
        ) : isPartsLibraryRoute ? (
          <PartsLibraryRoute onBack={navigateTraining} />
        ) : isVolunteerRoute ? (
          <VolunteerDashboard
            volunteerUser={volunteerUser}
            openFlow={openFlow}
            onTrainingOpen={navigateTraining}
            onVolunteerUserChange={setVolunteerUser}
          />
        ) : isVolunteerRankingsRoute ? (
          <VolunteerRankings
            volunteerUser={volunteerUser}
            openFlow={openFlow}
            onVolunteerEnter={navigateVolunteer}
          />
        ) : isAdminRoute ? (
          <AdminActivities
            onChanged={(activity, action) =>
              setServerActivities((items) => {
                if (action === "delete" || activity.status !== "published") {
                  return items.filter((item) => item.id !== activity.id);
                }
                const exists = items.some((item) => item.id === activity.id);
                return exists
                  ? items.map((item) => (item.id === activity.id ? activity : item))
                  : [activity, ...items];
              })
            }
          />
        ) : isActivityRoute ? (
          <ActivityArticle activity={currentActivity} onBack={() => navigateHome()} />
        ) : (
          <>
            <section className="hero-section">
              <img className="hero-image" src={heroUrl} alt="志愿者为老人维修家用取暖器" />
              <div className="hero-content">
                <h1>红匠助修</h1>
                <p className="hero-subtitle">传青春薪火，技暖千万家</p>
                <div className="hero-points" aria-label="服务特点">
                  <span>
                    <Heart className="filled" />
                    修善于心<br />
                    传递温暖
                  </span>
                  <span>
                    <ShieldCheck className="filled" />
                    专业可靠<br />
                    安全放心
                  </span>
                  <span>
                    <UsersRound className="filled" />
                    邻里互助<br />
                    共建美好
                  </span>
                </div>
                <div className="hero-ctas">
                  <button className="solid-button large" onClick={() => openFlow("repair")}>
                    <Heart size={22} fill="currentColor" />
                    我要报修
                  </button>
                  <button className="outline-button large" onClick={navigateVolunteerRankings}>
                    <CircleUserRound size={22} />
                    加入志愿者
                  </button>
                </div>
              </div>
              <div className="hero-ribbon">
                <span>小修小补暖人心</span>
                <strong>爱心行动每一天</strong>
                <Heart size={28} />
              </div>
            </section>

            <ActivitySection activities={allActivities} onOpen={navigateActivity} />
            <StatsBar stats={homeStats} />
          </>
        )}
      </main>

      <SiteFooter />

      <nav className="bottom-nav" aria-label="手机底部导航">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = item.path === "/" ? routePath === "/" : routePath === item.path;

          return (
            <a
              key={item.label}
              className={active ? "bottom-nav-item active" : "bottom-nav-item"}
              href={item.path ?? `/${item.hash}`}
              onClick={(event) => {
                event.preventDefault();
                if (item.path === "/training") {
                  navigateTraining();
                } else if (item.path === "/volunteer") {
                  if (volunteerUser) {
                    navigateVolunteer();
                  } else {
                    openFlow("volunteer");
                  }
                } else if (item.path === "/") {
                  navigateHome();
                } else {
                  navigateHome(item.hash);
                }
              }}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {modal && (
        <ActionModal
          modal={modal}
          submitted={submitted}
          onClose={closeFlow}
          onSubmit={handleSubmit}
          onVolunteerEnter={navigateVolunteer}
          volunteerUser={volunteerUser}
          onVolunteerUserChange={setVolunteerUser}
        />
      )}
    </div>
  );
}

function ActivitySection({ activities: activityItems, onOpen }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeActivity = activityItems[activeIndex] || activityItems[0];

  useEffect(() => {
    if (activityItems.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % activityItems.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [activityItems.length]);

  function selectActivity(index) {
    setActiveIndex(index);
  }

  return (
    <section className="activity-section" id="活动风采" aria-labelledby="activity-title">
      <div className="activity-section-head">
        <div>
          <span>活动风采</span>
          <h2 id="activity-title">红匠服务现场</h2>
        </div>
        <button type="button" onClick={() => onOpen(activeActivity.slug)}>
          查看更多 <ChevronRight size={16} />
        </button>
      </div>
      <button
        className="activity-hero-card"
        type="button"
        onClick={() => onOpen(activeActivity.slug)}
        aria-label={`查看${activeActivity.title}`}
      >
        <img src={activeActivity.cover} alt={activeActivity.coverAlt} />
        <div className="activity-hero-overlay">
          <h3>{activeActivity.title}</h3>
        </div>
      </button>

      <div className="activity-dots" aria-label="活动轮播切换">
        {activityItems.map((activity, index) => (
          <button
            key={activity.slug}
            className={index === activeIndex ? "active" : ""}
            type="button"
            onClick={() => selectActivity(index)}
            aria-label={`切换到${activity.title}`}
          />
        ))}
      </div>

    </section>
  );
}

function ActivityArticle({ activity, onBack }) {
  const blocks =
    Array.isArray(activity.contentBlocks) && activity.contentBlocks.length
      ? activity.contentBlocks
      : (activity.paragraphs || []).map((text) => ({ type: "paragraph", text }));

  return (
    <article className="activity-article" aria-labelledby="activity-article-title">
      <button className="article-back" type="button" onClick={onBack}>
        返回首页
      </button>
      <header className="article-head">
        <div className="article-tags">
          <span>社区新闻</span>
          <span>{activity.category}</span>
        </div>
        <h1 id="activity-article-title">{activity.title}</h1>
        <p className="article-lead">{activity.lead}</p>
        <div className="article-meta">
          <span>红匠志愿服务队</span>
          <span>{activity.date}</span>
          <span>{activity.place}</span>
        </div>
      </header>

      <figure className="article-figure">
        <img src={activity.cover} alt={activity.coverAlt} />
        <figcaption>{activity.caption}</figcaption>
      </figure>

      <div className="article-body">
        {blocks.map((block, index) => {
          if (block.type === "heading") return <h2 key={`${block.type}-${index}`}>{block.text}</h2>;
          if (block.type === "image") {
            return (
              <figure className="article-figure inline" key={`${block.type}-${index}`}>
                <img src={block.url} alt={block.caption || activity.title} />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          }
          return <p key={`${block.type}-${index}`}>{block.text}</p>;
        })}
      </div>
    </article>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptyActivityForm = {
  id: null,
  title: "",
  lead: "",
  place: "",
  category: "公益活动",
  summary: "",
  caption: "",
  coverUrl: "",
  contentBlocks: [{ id: "block-1", type: "paragraph", text: "" }],
  status: "draft",
};

function blockId() {
  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeEditorBlocks(activity) {
  const sourceBlocks =
    Array.isArray(activity.contentBlocks) && activity.contentBlocks.length
      ? activity.contentBlocks
      : [
          ...(Array.isArray(activity.paragraphs) ? activity.paragraphs.map((text) => ({ type: "paragraph", text })) : []),
          ...(activity.secondImage ? [{ type: "image", url: activity.secondImage, caption: activity.secondCaption || "" }] : []),
        ];
  const blocks = sourceBlocks
    .map((block) => ({
      id: block.id || blockId(),
      type: block.type === "heading" ? "heading" : block.type === "image" ? "image" : "paragraph",
      text: block.text || "",
      url: block.url || "",
      caption: block.caption || "",
      imageDataUrl: "",
    }))
    .filter((block) => block.type === "image" || block.text);
  return blocks.length ? blocks : [{ id: blockId(), type: "paragraph", text: "" }];
}

function activityToForm(activity) {
  return {
    id: activity.id,
    title: activity.title || "",
    lead: activity.lead || "",
    place: activity.place || "",
    category: activity.category || "公益活动",
    summary: activity.summary || "",
    caption: activity.caption || "",
    coverUrl: activity.cover || "",
    contentBlocks: normalizeEditorBlocks(activity),
    status: activity.status || "draft",
  };
}

function AdminActivities({ onChanged }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("hongjiangAdminToken") || "");
  const [entryToken, setEntryToken] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(() => localStorage.getItem("hongjiangAdminToken") === "HJZX666");
  const [activitiesAdmin, setActivitiesAdmin] = useState([]);
  const [form, setForm] = useState(emptyActivityForm);
  const [editing, setEditing] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [publishConfirm, setPublishConfirm] = useState(null);
  const [publishToken, setPublishToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (adminUnlocked) {
      loadAdminActivities();
    }
  }, [adminUnlocked]);

  async function loadAdminActivities() {
    setMessage("");
    try {
      const response = await fetch("/api/admin/activities", {
        headers: { Authorization: `Bearer ${adminToken || "HJZX666"}` },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "活动列表读取失败");
        return;
      }
      setActivitiesAdmin(Array.isArray(data.activities) ? data.activities : []);
    } catch {
      setMessage("活动列表读取失败，请检查网络");
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetEditor() {
    setForm({ ...emptyActivityForm, contentBlocks: [{ id: blockId(), type: "paragraph", text: "" }] });
    setCoverFile(null);
    setCoverPreview("");
    setEditing(false);
    setPublishConfirm(null);
    setPublishToken("");
  }

  function editActivity(activity) {
    setForm(activityToForm(activity));
    setCoverFile(null);
    setCoverPreview(activity.cover || "");
    setEditing(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function newDraft() {
    resetEditor();
    setEditing(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function chooseCover(file) {
    setCoverFile(file || null);
    setCoverPreview(file ? await readFileAsDataUrl(file) : form.coverUrl);
  }

  function addBlock(type) {
    setForm((current) => ({
      ...current,
      contentBlocks: [
        ...current.contentBlocks,
        {
          id: blockId(),
          type,
          text: "",
          url: "",
          caption: "",
          imageDataUrl: "",
        },
      ],
    }));
  }

  function updateBlock(id, patch) {
    setForm((current) => ({
      ...current,
      contentBlocks: current.contentBlocks.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    }));
  }

  async function chooseBlockImage(id, file) {
    const dataUrl = file ? await readFileAsDataUrl(file) : "";
    updateBlock(id, { imageDataUrl: dataUrl, url: dataUrl });
  }

  function moveBlock(id, direction) {
    setForm((current) => {
      const index = current.contentBlocks.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.contentBlocks.length) return current;
      const nextBlocks = [...current.contentBlocks];
      const [item] = nextBlocks.splice(index, 1);
      nextBlocks.splice(nextIndex, 0, item);
      return { ...current, contentBlocks: nextBlocks };
    });
  }

  function removeBlock(id) {
    setForm((current) => {
      const nextBlocks = current.contentBlocks.filter((block) => block.id !== id);
      return {
        ...current,
        contentBlocks: nextBlocks.length ? nextBlocks : [{ id: blockId(), type: "paragraph", text: "" }],
      };
    });
  }

  function unlockAdmin(event) {
    event.preventDefault();
    if (entryToken !== "HJZX666") {
      setMessage("口令错误");
      return;
    }
    localStorage.setItem("hongjiangAdminToken", entryToken);
    setAdminToken(entryToken);
    setAdminUnlocked(true);
    setMessage("");
  }

  async function saveActivity(nextStatus = "draft", token = "") {
    setMessage("");
    setBusy(true);
    try {
      const coverDataUrl = await readFileAsDataUrl(coverFile);
      const contentBlocks = form.contentBlocks
        .map((block) => {
          if (block.type === "image") {
            return {
              type: "image",
              url: block.imageDataUrl ? "" : block.url,
              imageDataUrl: block.imageDataUrl || "",
              caption: block.caption || "",
            };
          }
          return {
            type: block.type,
            text: block.text || "",
          };
        })
        .filter((block) => (block.type === "image" ? block.url || block.imageDataUrl : block.text.trim()));
      const payload = {
        title: form.title,
        lead: form.lead,
        place: form.place,
        category: form.category,
        summary: form.summary,
        caption: form.caption,
        contentBlocks,
        status: nextStatus,
        publishToken: token,
        coverUrl: form.coverUrl,
        coverDataUrl,
        coverAlt: form.title,
        paragraphs: contentBlocks
          .filter((block) => block.type !== "image")
          .map((block) => block.text.trim())
          .filter(Boolean),
      };
      const response = await fetch(form.id ? `/api/admin/activities/${form.id}` : "/api/admin/activities", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "保存失败");
        return;
      }
      localStorage.setItem("hongjiangAdminToken", adminToken);
      setActivitiesAdmin((items) => {
        const exists = items.some((item) => item.id === data.activity.id);
        return exists ? items.map((item) => (item.id === data.activity.id ? data.activity : item)) : [data.activity, ...items];
      });
      onChanged(data.activity, "save");
      setMessage(nextStatus === "published" ? "活动已发布，首页活动风采会自动显示。" : "草稿已保存。");
      setForm(activityToForm(data.activity));
      setCoverFile(null);
      setCoverPreview(data.activity.cover || "");
    } catch {
      setMessage("保存失败，请检查网络或图片大小");
    } finally {
      setBusy(false);
      setPublishConfirm(null);
      setPublishToken("");
    }
  }

  async function submitDraft(event) {
    event.preventDefault();
    await saveActivity("draft");
  }

  function requestPublish(event) {
    event.preventDefault();
    setPublishConfirm(form);
    setPublishToken("");
    setMessage("");
  }

  async function confirmPublish(event) {
    event.preventDefault();
    await saveActivity("published", publishToken);
  }

  async function deleteActivity(activity) {
    if (!window.confirm(`确定删除「${activity.title}」吗？删除后不可恢复。`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/activities/${activity.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "删除失败");
        return;
      }
      setActivitiesAdmin((items) => items.filter((item) => item.id !== activity.id));
      onChanged(activity, "delete");
      if (form.id === activity.id) resetEditor();
      setMessage("活动已删除。");
    } catch {
      setMessage("删除失败，请检查网络");
    } finally {
      setBusy(false);
    }
  }

  if (!adminUnlocked) {
    return (
      <section className="admin-page locked" aria-labelledby="admin-title">
        <div className="admin-head">
          <span>管理员入口</span>
          <h1 id="admin-title">活动页编辑器</h1>
          <p>请输入管理员口令后进入编辑器。此页面不在前台展示入口。</p>
        </div>

        <form className="admin-form admin-unlock" onSubmit={unlockAdmin}>
          <label>
            管理员口令
            <input
              required
              autoFocus
              type="password"
              value={entryToken}
              onChange={(event) => setEntryToken(event.target.value)}
              placeholder="请输入口令"
            />
          </label>
          {message && <p className="admin-message">{message}</p>}
          <button className="solid-button large" type="submit">
            进入编辑器
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-page" aria-labelledby="admin-title">
      <div className="admin-head">
        <span>活动管理</span>
        <h1 id="admin-title">活动页编辑器</h1>
        <p>先在列表里选择活动；草稿不会进入前台，发布时需要再次输入口令，首次发布日期由系统自动写入。</p>
        <button className="solid-button admin-new" type="button" onClick={newDraft}>
          新建活动
        </button>
      </div>

      {editing ? (
        <form className="admin-form admin-editor" onSubmit={submitDraft}>
          <div className="admin-editor-bar">
            <div>
              <span className={`admin-status ${form.status}`}>{form.status === "published" ? "已发布" : "草稿"}</span>
              <strong>{form.id ? "编辑活动" : "新建活动"}</strong>
            </div>
            <button type="button" className="ghost-button" onClick={resetEditor}>
              返回列表
            </button>
          </div>

          <div className="admin-publisher-shell">
            <div className="admin-compose">
              <input
                required
                className="admin-title-input"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="请输入活动标题（必填）"
              />

              <div className="admin-cover-row">
                <label className="admin-cover-picker">
                  <span>封面图（必填）</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseCover(event.target.files?.[0] || null)} />
                  <small>建议横图，图片不超过 5MB。</small>
                </label>
                {coverPreview ? <img src={coverPreview} alt="封面预览" /> : <div className="admin-cover-empty">封面预览</div>}
              </div>

              <label>
                导语
                <textarea value={form.lead} onChange={(event) => updateField("lead", event.target.value)} placeholder="一句话概括活动，发布前必填" />
              </label>

              <div className="admin-two">
                <label>
                  地点
                  <input value={form.place} onChange={(event) => updateField("place", event.target.value)} placeholder="例如：荷塘小区" />
                </label>
                <label>
                  分类
                  <input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="公益活动" />
                </label>
              </div>

              <label>
                首页摘要
                <input value={form.summary} onChange={(event) => updateField("summary", event.target.value)} placeholder="显示在首页轮播/列表的短介绍" />
              </label>

              <label>
                封面图说明
                <input value={form.caption} onChange={(event) => updateField("caption", event.target.value)} />
              </label>

              <div className="admin-toolbar">
                <strong>正文编辑</strong>
                <button type="button" onClick={() => addBlock("paragraph")}>+ 段落</button>
                <button type="button" onClick={() => addBlock("heading")}>+ 小标题</button>
                <button type="button" onClick={() => addBlock("image")}>+ 图片</button>
              </div>

              <div className="admin-blocks">
                {form.contentBlocks.map((block, index) => (
                  <div className={`admin-block ${block.type}`} key={block.id}>
                    <div className="admin-block-head">
                      <span>{block.type === "heading" ? "小标题" : block.type === "image" ? "图片" : `段落 ${index + 1}`}</span>
                      <div>
                        <button type="button" onClick={() => moveBlock(block.id, -1)}>上移</button>
                        <button type="button" onClick={() => moveBlock(block.id, 1)}>下移</button>
                        <button type="button" className="danger" onClick={() => removeBlock(block.id)}>删除</button>
                      </div>
                    </div>

                    {block.type === "image" ? (
                      <>
                        <label className="admin-image-block-picker">
                          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseBlockImage(block.id, event.target.files?.[0] || null)} />
                          {block.url ? <img src={block.url} alt={block.caption || "正文图片"} /> : <span>选择正文图片</span>}
                        </label>
                        <input
                          value={block.caption}
                          onChange={(event) => updateBlock(block.id, { caption: event.target.value })}
                          placeholder="图片说明（可选）"
                        />
                      </>
                    ) : block.type === "heading" ? (
                      <input
                        className="admin-heading-input"
                        value={block.text}
                        onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                        placeholder="输入小标题"
                      />
                    ) : (
                      <textarea
                        value={block.text}
                        onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                        placeholder="输入正文段落"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <aside className="admin-preview">
              <div className="admin-preview-label">文章预览</div>
              <h1>{form.title || "活动标题"}</h1>
              <p className="preview-lead">{form.lead || "这里显示导语内容。"}</p>
              <div className="preview-meta">
                <span>{form.category || "分类"}</span>
                <span>{form.place || "地点"}</span>
              </div>
              {coverPreview && <img className="preview-cover" src={coverPreview} alt="封面预览" />}
              {form.caption && <small>{form.caption}</small>}
              <div className="preview-body">
                {form.contentBlocks.map((block) => {
                  if (block.type === "heading") return block.text ? <h2 key={block.id}>{block.text}</h2> : null;
                  if (block.type === "image") {
                    return block.url ? (
                      <figure key={block.id}>
                        <img src={block.url} alt={block.caption || "正文图片"} />
                        {block.caption && <figcaption>{block.caption}</figcaption>}
                      </figure>
                    ) : null;
                  }
                  return block.text ? <p key={block.id}>{block.text}</p> : null;
                })}
              </div>
            </aside>
          </div>

          {message && <p className="admin-message">{message}</p>}
          <div className="admin-actions">
            <button className="outline-button" type="submit" disabled={busy}>
              {busy ? "保存中..." : "保存草稿"}
            </button>
            <button className="solid-button large" type="button" disabled={busy} onClick={requestPublish}>
              发布
            </button>
          </div>
        </form>
      ) : (
        <div className="admin-list-card">
          <div className="admin-list-head">
            <strong>全部活动</strong>
            <button type="button" onClick={loadAdminActivities}>
              刷新
            </button>
          </div>
          {activitiesAdmin.length === 0 ? (
            <div className="admin-empty">暂无已发布活动或草稿，点击“新建活动”开始。</div>
          ) : (
            activitiesAdmin.map((activity) => (
              <article className="admin-activity-row" key={activity.id}>
                <img src={activity.cover} alt={activity.coverAlt} />
                <div>
                  <span className={`admin-status ${activity.status}`}>{activity.status === "published" ? "已发布" : "草稿"}</span>
                  <h3>{activity.title}</h3>
                  <p>{activity.summary || activity.lead || "未填写摘要"}</p>
                  <small>{activity.date ? `首次发布：${activity.date}` : "未发布，暂无发布日期"}</small>
                </div>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => editActivity(activity)}>
                    编辑
                  </button>
                  {activity.status !== "published" && (
                    <button type="button" onClick={() => editActivity(activity)}>
                      标发布
                    </button>
                  )}
                  <button type="button" className="danger" onClick={() => deleteActivity(activity)}>
                    删除
                  </button>
                </div>
              </article>
            ))
          )}
          {message && <p className="admin-message">{message}</p>}
        </div>
      )}

      {publishConfirm && (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-label="发布确认">
          <form className="admin-publish-box" onSubmit={confirmPublish}>
            <h2>发布前确认</h2>
            <p>发布后会进入首页活动风采轮播，并生成活动详情页。首次发布日期会自动写入今天。</p>
            <label>
              管理员口令
              <input
                required
                autoFocus
                type="password"
                value={publishToken}
                onChange={(event) => setPublishToken(event.target.value)}
                placeholder="请输入口令"
              />
            </label>
            <div className="admin-actions">
              <button type="button" className="outline-button" onClick={() => setPublishConfirm(null)}>
                取消
              </button>
              <button type="submit" className="solid-button large" disabled={busy}>
                确认发布
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function TrainingSection({ openFlow, onTrainingOpen }) {
  return (
    <section className="training-section" id="技能培训" aria-labelledby="training-title">
      <div className="training-copy">
        <span className="training-eyebrow">志愿者技能成长</span>
        <h2 id="training-title">志愿者技能培训</h2>
        <p>
          接入 fixone.cloud 的维修学习思路，把手机维修拆成可学习、可考核、可上岗的训练路径，
          让新志愿者先掌握判断方法，再参与社区服务。
        </p>
        <div className="training-actions">
          <button className="solid-button" onClick={onTrainingOpen}>
            进入培训 <ChevronRight size={18} />
          </button>
          <button className="outline-button" onClick={() => openFlow("volunteer")}>
            报名培训
          </button>
        </div>
      </div>

    </section>
  );
}

function VolunteerRankings({ volunteerUser, openFlow, onVolunteerEnter }) {
  const [rankings, setRankings] = useState({
    serviceHours: [],
    serviceCount: [],
    learningHours: [],
  });
  const [myRankings, setMyRankings] = useState(null);
  const [activeBoardKey, setActiveBoardKey] = useState("serviceHours");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("hongjiangVolunteerToken");
    setLoading(true);
    setMessage("");
    fetch("/api/public/volunteer-rankings", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "排行榜加载失败");
        if (!cancelled) {
          setRankings({
            serviceHours: Array.isArray(data.rankings?.serviceHours) ? data.rankings.serviceHours : [],
            serviceCount: Array.isArray(data.rankings?.serviceCount) ? data.rankings.serviceCount : [],
            learningHours: Array.isArray(data.rankings?.learningHours) ? data.rankings.learningHours : [],
          });
          setMyRankings(data.myRankings || null);
        }
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message || "排行榜加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey, volunteerUser?.id]);

  const boards = [
    {
      title: "志愿时长排行榜",
      desc: "按累计服务小时排序",
      keyName: "serviceHours",
      valueLabel: "service_hours",
      unit: "小时",
      icon: Clock3,
    },
    {
      title: "志愿次数排行榜",
      desc: "按已归档服务次数排序",
      keyName: "serviceCount",
      valueLabel: "service_count",
      unit: "次",
      icon: Wrench,
    },
    {
      title: "学习时长排行榜",
      desc: "按累计培训学习小时排序",
      keyName: "learningHours",
      valueLabel: "learning_hours",
      unit: "小时",
      icon: BookOpen,
    },
  ];
  const activeBoard = boards.find((board) => board.keyName === activeBoardKey) || boards[0];

  function displayValue(item, board) {
    const value = Number(item[board.valueLabel] || 0);
    if (board.unit === "小时") return value.toFixed(value >= 10 ? 0 : 1);
    return String(value);
  }

  function renderBoard(board) {
    const Icon = board.icon;
    const items = rankings[board.keyName] || [];
    const isActive = activeBoard.keyName === board.keyName;
    return (
      <article className={`ranking-board ${isActive ? "active" : ""}`} key={board.keyName}>
        <div className="ranking-board-head">
          <div>
            <Icon size={24} />
          </div>
          <span>{board.desc}</span>
          <h2>{board.title}</h2>
        </div>
        <div className="ranking-list">
          {items.length ? (
            items.map((item, index) => (
              <div className={`ranking-row ${index < 3 ? "top" : ""}`} key={`${board.keyName}-${item.id}`}>
                <strong>{index + 1}</strong>
                <div>
                  <span>{item.name || "红匠志愿者"}</span>
                </div>
                <em>
                  {displayValue(item, board)}
                  <small>{board.unit}</small>
                </em>
              </div>
            ))
          ) : (
            <div className="rankings-empty compact">暂无榜单数据</div>
          )}
        </div>
      </article>
    );
  }

  function renderMyRank(board) {
    const rank = myRankings?.[board.keyName];
    const item = rank?.item;
    return (
      <article className="my-ranking-card" key={board.keyName}>
        <span>{board.title.replace("排行榜", "")}</span>
        {rank && item ? (
          <>
            <strong>第 {rank.rank} 名</strong>
            <p>
              {displayValue(item, board)}
              {board.unit}
              <small> / 共 {rank.total} 人</small>
            </p>
          </>
        ) : (
          <>
            <strong>未上榜</strong>
            <p>暂无记录</p>
          </>
        )}
      </article>
    );
  }

  return (
    <section className="rankings-page" aria-labelledby="rankings-page-title">
      <div className="rankings-hero">
        <div>
          <span className="rankings-title" id="rankings-page-title">志愿者风采榜</span>
        </div>
        <div className="rankings-actions">
          <button
            className="outline-button"
            onClick={volunteerUser ? () => setRefreshKey((current) => current + 1) : () => openFlow("volunteer")}
          >
            {volunteerUser ? "刷新我的排行" : "加入志愿者查看我的排行"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rankings-empty">正在同步排行榜...</div>
      ) : message ? (
        <div className="rankings-empty">{message}</div>
      ) : (
        <div className="rankings-panel">
          {volunteerUser ? (
            <div className="my-ranking-panel" aria-label="我的排行">
              <div>
                <span>我的排行</span>
                <strong>{volunteerUser.name || "红匠志愿者"}</strong>
              </div>
              <div className="my-ranking-grid">{boards.map(renderMyRank)}</div>
            </div>
          ) : null}

          <div className="ranking-tabs" role="tablist" aria-label="排行榜类型">
            {boards.map((board) => {
              const Icon = board.icon;
              return (
                <button
                  key={board.keyName}
                  className={activeBoard.keyName === board.keyName ? "active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={activeBoard.keyName === board.keyName}
                  onClick={() => setActiveBoardKey(board.keyName)}
                >
                  <Icon size={18} />
                  {board.title.replace("排行榜", "")}
                </button>
              );
            })}
          </div>

          <div className="ranking-boards">{boards.map(renderBoard)}</div>
        </div>
      )}
    </section>
  );
}

function VolunteerDashboard({ volunteerUser, openFlow, onTrainingOpen, onVolunteerUserChange }) {
  const tasks = [
    { title: "手机维修陪练", meta: "湖南工商大学 · 本周六 14:00", status: "可报名" },
    { title: "社区便民维修日", meta: "岳麓区望岳街道 · 需 6 人", status: "招募中" },
    { title: "老人手机使用辅导", meta: "线上服务 · 每次 30 分钟", status: "推荐" },
  ];

  const [serviceRecords, setServiceRecords] = useState([]);
  const [serviceStats, setServiceStats] = useState({
    service_count: Number(volunteerUser?.service_count || 0),
    service_minutes: Number(volunteerUser?.service_minutes || 0),
  });
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsMessage, setRecordsMessage] = useState("");

  useEffect(() => {
    if (!volunteerUser) return undefined;
    const token = localStorage.getItem("hongjiangVolunteerToken");
    if (!token) return undefined;
    let cancelled = false;
    setRecordsLoading(true);
    setRecordsMessage("");
    fetch("/api/volunteer/service-records", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "服务记录加载失败");
        if (cancelled) return;
        const nextStats = {
          service_count: Number(data.stats?.service_count || 0),
          service_minutes: Number(data.stats?.service_minutes || 0),
        };
        setServiceStats(nextStats);
        setServiceRecords(Array.isArray(data.records) ? data.records : []);
        const nextUser = { ...volunteerUser, ...nextStats };
        localStorage.setItem("hongjiangVolunteerUser", JSON.stringify(nextUser));
        onVolunteerUserChange(nextUser);
      })
      .catch((error) => {
        if (!cancelled) setRecordsMessage(error.message || "服务记录加载失败");
      })
      .finally(() => {
        if (!cancelled) setRecordsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [volunteerUser?.id]);

  const serviceMinutes = Number(serviceStats.service_minutes || 0);
  const serviceCount = Number(serviceStats.service_count || 0);
  const serviceHours = serviceMinutes / 60;
  const formattedHours = Number.isInteger(serviceHours) ? String(serviceHours) : serviceHours.toFixed(1);
  const profileComplete = volunteerUser?.name && volunteerUser.name !== "志愿者";
  const currentLevel = serviceMinutes >= 600 ? "骨干志愿者" : serviceMinutes >= 180 ? "进阶志愿者" : "见习志愿者";
  const nextLevel = serviceMinutes >= 600 ? "社区带队人" : serviceMinutes >= 180 ? "骨干志愿者" : "进阶志愿者";
  const minutesToNextLevel = serviceMinutes >= 600 ? 360 : serviceMinutes >= 180 ? 600 - serviceMinutes : 180 - serviceMinutes;
  const maskedPhone = volunteerUser?.phone
    ? `${String(volunteerUser.phone).slice(0, 3)}****${String(volunteerUser.phone).slice(-4)}`
    : "未绑定";
  const nextAction = !profileComplete
    ? "完善真实姓名"
    : serviceMinutes === 0
      ? "完成一次培训或社区服务"
      : "继续累计服务时长";
  const averageMinutes = serviceCount ? Math.round(serviceMinutes / serviceCount) : 0;
  const averageHours = averageMinutes ? Math.round((averageMinutes / 60) * 10) / 10 : 0;
  const latestRecordDate = serviceRecords[0]?.service_date || "暂无记录";
  const certifications = [
    { label: "账号注册", done: true, detail: "手机号已验证" },
    { label: "资料完善", done: Boolean(profileComplete), detail: profileComplete ? "姓名已记录" : "待补充真实姓名" },
    { label: "基础学习", done: serviceMinutes > 0, detail: serviceMinutes > 0 ? "已有服务沉淀" : "建议先完成入门课" },
    { label: "社区服务", done: serviceCount > 0, detail: serviceCount > 0 ? "服务记录已归档" : "等待首次服务记录" },
  ];
  const profileDepth = Math.round((certifications.filter((item) => item.done).length / certifications.length) * 100);
  const records = [
    { label: "志愿次数", value: String(serviceStats.service_count || 0), unit: "次" },
    { label: "志愿时长", value: formattedHours, unit: "小时" },
    { label: "志愿等级", value: currentLevel, unit: "" },
    { label: "资料状态", value: profileComplete ? "已完善" : "待完善", unit: "" },
  ];

  if (!volunteerUser) {
    return (
      <section className="volunteer-page" aria-labelledby="volunteer-page-title">
        <div className="volunteer-hero-card volunteer-access-card">
          <div className="volunteer-avatar" aria-hidden="true">
            <UserCheck size={34} />
          </div>
          <div className="volunteer-profile-copy">
            <span>志愿者服务中心</span>
            <h1 id="volunteer-page-title">登录后查看个人志愿记录</h1>
            <p>申请加入或登录志愿者账号，即可查看自己的志愿次数与累计志愿时长。</p>
          </div>
          <button className="solid-button" onClick={() => openFlow("volunteer")}>
            加入 / 登录
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="volunteer-page" aria-labelledby="volunteer-page-title">
      <div className="volunteer-hero-card">
        <div className="volunteer-avatar" aria-hidden="true">
          <UserCheck size={34} />
        </div>
        <div className="volunteer-profile-copy">
          <span>已登录志愿者</span>
          <h1 id="volunteer-page-title">
            {volunteerUser?.name && volunteerUser.name !== "志愿者"
              ? `${volunteerUser.name}的志愿者个人页`
              : "红匠志愿者个人页"}
          </h1>
          <p>账号已创建。这里集中展示你的志愿次数、累计时长和最近服务记录。</p>
          <div className="volunteer-profile-tags" aria-label="志愿者身份信息">
            <span>
              <BadgeCheck size={16} /> {profileComplete ? "资料已完善" : "资料待完善"}
            </span>
            <span>
              <Clock3 size={16} /> 累计 {formattedHours} 小时
            </span>
          </div>
        </div>
        <div className="volunteer-hero-actions">
          <button className="outline-button" onClick={() => openFlow(volunteerUser ? "profile" : "volunteer")}>
            完善资料
          </button>
          <button className="solid-button" onClick={onTrainingOpen}>
            去学习
          </button>
        </div>
      </div>

      <div className="volunteer-stats">
        {records.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>
              {item.value}
              <em>{item.unit}</em>
            </strong>
          </article>
        ))}
      </div>

      <div className="volunteer-dashboard-grid">
        <article className="volunteer-card volunteer-profile-card">
          <div className="section-head compact">
            <h2>我的服务档案</h2>
          </div>
          <div className="volunteer-info-list">
            <div>
              <span>手机号</span>
              <strong>{maskedPhone}</strong>
            </div>
            <div>
              <span>当前等级</span>
              <strong>{currentLevel}</strong>
            </div>
            <div>
              <span>下一步</span>
              <strong>{nextAction}</strong>
            </div>
          </div>
        </article>

        <article className="volunteer-card">
          <div className="section-head compact">
            <h2>成长进度</h2>
          </div>
          <div className="volunteer-progress">
            <div>
              <span>档案完整度</span>
              <strong>{profileDepth}%</strong>
            </div>
            <div className="volunteer-progress-track" aria-hidden="true">
              <span style={{ width: `${profileDepth}%` }} />
            </div>
            <p>
              当前为“{currentLevel}”，距离“{nextLevel}”还需累计 {Math.max(0, minutesToNextLevel)} 分钟服务时长。
            </p>
          </div>
          <div className="volunteer-todo-list">
            {certifications.map((item) => (
              <span className={item.done ? "done" : ""} key={item.label}>
                {item.done ? <Check size={18} /> : <ShieldCheck size={18} />}
                <strong>{item.label}</strong>
                <em>{item.detail}</em>
              </span>
            ))}
          </div>
          <button className="solid-button wide" onClick={onTrainingOpen}>
            开始学习
          </button>
        </article>

        <article className="volunteer-card">
          <div className="section-head compact">
            <h2>最近服务记录</h2>
          </div>
          <div className="volunteer-record-summary">
            <span>
              最近服务
              <strong>{latestRecordDate}</strong>
            </span>
            <span>
              平均时长
              <strong>{averageHours ? `${averageHours}小时` : "暂无"}</strong>
            </span>
            <span>
              记录来源
              <strong>管理员归档</strong>
            </span>
          </div>
          {recordsLoading ? (
            <div className="volunteer-empty">正在同步服务记录...</div>
          ) : recordsMessage ? (
            <div className="volunteer-empty">{recordsMessage}</div>
          ) : serviceRecords.length ? (
            <div className="volunteer-record-list">
              {serviceRecords.slice(0, 5).map((record) => (
                <div className="volunteer-record" key={record.id}>
                  <div>
                    <strong>{record.title}</strong>
                    <p>{record.service_date} · 已完成</p>
                  </div>
                  <span>{Math.round(Number(record.duration_minutes || 0) / 6) / 10}小时</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="volunteer-empty">暂无已归档服务记录，完成服务后会自动显示在这里。</div>
          )}
        </article>

        <article className="volunteer-card volunteer-benefits">
          <div className="section-head compact">
            <h2>推荐服务</h2>
          </div>
          <div className="volunteer-task-list">
            {tasks.map((task) => (
              <div className="volunteer-task" key={task.title}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.meta}</p>
                </div>
                <button className="outline-button" type="button">
                  {task.status}
                </button>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function TrainingRoute({ volunteerUser, videoId, query, onOpenVideo, onOpenParts, onBack }) {
  const videoRef = useRef(null);
  const watchRef = useRef({ pendingSeconds: 0, lastWallTime: Date.now(), lastVideoTime: 0, reporting: false });
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [clips, setClips] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [commentMessage, setCommentMessage] = useState("");

  const activeClip = clips.find((clip) => clip.videoUrl) || null;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setMessage("");
    fetch(`/api/training/courses${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "教学视频加载失败");
        if (cancelled) return;
        const nextCourses = Array.isArray(data.courses) ? data.courses : [];
        setCourses(nextCourses);
        setSelectedCourseId(videoId || "");
      })
      .catch((error) => {
        if (!cancelled && error.name !== "AbortError") setMessage(error.message || "教学视频加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query, videoId]);

  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null);
      setClips([]);
      setComments([]);
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    setMessage("");
    setCommentMessage("");
    Promise.all([
      fetch(`/api/training/courses/${encodeURIComponent(selectedCourseId)}`).then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "教学视频加载失败");
        return data;
      }),
      fetch(`/api/training/courses/${encodeURIComponent(selectedCourseId)}/comments`).then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "评论加载失败");
        return data;
      }),
    ])
      .then(([detail, commentData]) => {
        if (cancelled) return;
        setSelectedCourse(detail.project || null);
        setClips(Array.isArray(detail.clips) ? detail.clips : []);
        setComments(Array.isArray(commentData.comments) ? commentData.comments : []);
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message || "教学视频加载失败");
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  function resetWatchTick() {
    const video = videoRef.current;
    watchRef.current.lastWallTime = Date.now();
    watchRef.current.lastVideoTime = Number(video?.currentTime || 0);
  }

  async function reportLearningTime() {
    const state = watchRef.current;
    const seconds = Math.floor(state.pendingSeconds / 60) * 60;
    if (seconds < 60 || state.reporting) return;
    const token = localStorage.getItem("hongjiangVolunteerToken");
    if (!token || !volunteerUser) {
      setMessage("登录红匠志愿者后，观看时长会同步到我的排行。");
      return;
    }

    state.pendingSeconds -= seconds;
    state.reporting = true;
    try {
      const response = await fetch("/api/volunteer/learning-records", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "fixone",
          projectId: selectedCourse?.id || selectedCourseId,
          projectTitle: selectedCourse?.title || "红匠学堂教学视频",
          clipTitle: activeClip?.clipTitle || selectedCourse?.title || "维修教学视频",
          durationSeconds: seconds,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.message || "学习时长同步失败");
      setMessage(`已同步学习时长 ${data.credited_minutes} 分钟。`);
    } catch (error) {
      state.pendingSeconds += seconds;
      setMessage(error.message || "学习时长同步失败");
    } finally {
      state.reporting = false;
    }
  }

  function collectWatchTime() {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || video.readyState < 2) {
      resetWatchTick();
      return;
    }
    const state = watchRef.current;
    const now = Date.now();
    const currentTime = Number(video.currentTime || 0);
    const wallSeconds = (now - state.lastWallTime) / 1000;
    const mediaSeconds = currentTime - state.lastVideoTime;
    if (wallSeconds > 0 && wallSeconds < 10 && mediaSeconds > 0) {
      state.pendingSeconds += Math.min(wallSeconds, mediaSeconds, 5);
      reportLearningTime();
    }
    state.lastWallTime = now;
    state.lastVideoTime = currentTime;
  }

  async function submitComment(event) {
    event.preventDefault();
    const token = localStorage.getItem("hongjiangVolunteerToken");
    const content = commentText.trim();
    if (!token || !volunteerUser) {
      setCommentMessage("请先登录红匠志愿者账号。");
      return;
    }
    if (!content) {
      setCommentMessage("请输入评论内容。");
      return;
    }

    setCommentMessage("发表中...");
    try {
      const response = await fetch(`/api/training/courses/${encodeURIComponent(selectedCourseId)}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "评论发表失败");
      setCommentText("");
      setCommentMessage("评论已同步到视修工坊。");
      const next = await fetch(`/api/training/courses/${encodeURIComponent(selectedCourseId)}/comments`).then((res) => res.json());
      setComments(Array.isArray(next.comments) ? next.comments : []);
    } catch (error) {
      setCommentMessage(error.message || "评论发表失败");
    }
  }

  function formatCommentDate(value) {
    if (!value) return "刚刚";
    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function openTeachingVideo(courseId) {
    onOpenVideo(courseId);
  }

  return (
    <section className="training-route school-route" aria-labelledby="training-route-title">
      <div className="school-hero">
        <h1 id="training-route-title">红匠学堂</h1>
      </div>

      {message ? <div className="school-message">{message}</div> : null}

      {!videoId ? (
        <section className="school-video-feed" aria-label="教学视频">
          {loading ? (
            <div className="school-empty">正在读取教学视频...</div>
          ) : courses.length ? (
            <div className="school-video-grid">
              {courses.map((course) => (
                <button
                  className="school-video-card"
                  type="button"
                  key={course.id}
                  onClick={() => openTeachingVideo(course.id)}
                >
                  <span className="school-video-cover">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        onLoad={(event) => {
                          const image = event.currentTarget;
                          if (image.naturalWidth && image.naturalHeight) {
                            image.parentElement?.style.setProperty("--cover-ratio", `${image.naturalWidth} / ${image.naturalHeight}`);
                          }
                        }}
                      />
                    ) : course.videoUrl ? (
                      <video src={course.videoUrl} muted playsInline preload="metadata" />
                    ) : (
                      <span>播放</span>
                    )}
                  </span>
                  <strong>{course.title}</strong>
                  <small>{course.device_model || course.uploader_name || "教学视频"}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="school-empty">暂无匹配视频</div>
          )}

          <button className="school-parts-entry" type="button" onClick={onOpenParts}>
            <Wrench size={20} />
            <div>
              <strong>配件库</strong>
              <span>查找维修常用配件</span>
            </div>
          </button>
        </section>
      ) : (
        <div className="school-main">
          <button className="school-back-button" type="button" onClick={onBack}>
            返回学堂
          </button>
          <article className="school-player-card">
            <div className="school-player-head">
              <div>
                <span>{selectedCourse?.category || "红匠学堂"}</span>
                <h2>{selectedCourse?.title || "请选择教学视频"}</h2>
                <p>{selectedCourse?.description || "从左侧选择教学视频后开始学习。"}</p>
              </div>
              <BookOpen size={28} />
            </div>
            <div className="school-video-shell">
              {detailLoading ? (
                <div className="school-empty large">正在加载教学视频...</div>
              ) : activeClip?.videoUrl ? (
                <video
                  ref={videoRef}
                  src={activeClip.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={resetWatchTick}
                  onSeeking={resetWatchTick}
                  onTimeUpdate={collectWatchTime}
                  onPause={() => {
                    collectWatchTime();
                    reportLearningTime();
                  }}
                  onEnded={() => {
                    collectWatchTime();
                    reportLearningTime();
                  }}
                />
              ) : (
                <div className="school-empty large">该教学视频暂不可播放</div>
              )}
            </div>
          </article>

          <article className="school-comments">
            <div className="school-comments-head">
              <div>
                <span>学习讨论</span>
                <strong>学习交流</strong>
              </div>
              <em>{comments.length} 条</em>
            </div>
            <form className="school-comment-form" onSubmit={submitComment}>
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={volunteerUser ? "写下维修经验、疑问或补充说明" : "登录红匠志愿者后可发表评论"}
                disabled={!selectedCourseId}
                maxLength={420}
              />
              <div>
                <span>{commentMessage}</span>
                <button className="solid-button small" type="submit" disabled={!selectedCourseId}>
                  <SendHorizontal size={16} /> 发表评论
                </button>
              </div>
            </form>
            <div className="school-comment-list">
              {comments.length ? (
                comments.map((comment, index) => (
                  <article className="school-comment" key={comment.id || `${comment.created_at}-${index}`}>
                    <div className="school-comment-avatar" aria-hidden="true">
                      {Array.from(comment.display_name || comment.username || "红")[0]}
                    </div>
                    <div>
                      <header>
                        <strong>{comment.display_name || comment.username || "视修工坊用户"}</strong>
                        <time>{formatCommentDate(comment.created_at)}</time>
                      </header>
                      <p>{comment.content}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="school-empty">还没有评论</div>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function PartsLibraryRoute({ onBack }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setMessage("");

    const params = new URLSearchParams({ limit: "36" });
    if (submittedQuery.trim()) params.set("q", submittedQuery.trim());

    fetch(`/api/parts/products?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "配件库暂不可用");
        if (cancelled) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
        setMessage(data.message || "");
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") return;
        setProducts([]);
        setMessage(error.message || "配件库暂不可用");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [submittedQuery]);

  function submitSearch(event) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  return (
    <section className="parts-route" id="配件库" aria-labelledby="parts-title">
      <div className="parts-hero">
        <button className="school-back-button" type="button" onClick={onBack}>
          返回学堂
        </button>
        <div>
          <span>红匠学堂</span>
          <h1 id="parts-title">配件库</h1>
        </div>
        <form className="parts-search" onSubmit={submitSearch}>
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索屏幕、电池、电饭煲配件"
          />
          <button className="solid-button small" type="submit">
            搜索
          </button>
        </form>
      </div>

      {message ? <div className="school-message">{message}</div> : null}

      {loading ? (
        <div className="school-empty large">正在读取配件库...</div>
      ) : products.length ? (
        <div className="parts-grid">
          {products.map((product) => (
            <article className="parts-card" key={product.id}>
              <div className="parts-cover">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      event.currentTarget.parentElement?.classList.add("missing");
                    }}
                  />
                ) : (
                  <PackageSearch size={34} />
                )}
              </div>
              <div className="parts-card-body">
                <div className="parts-card-title">
                  <strong>{product.name}</strong>
                  <span>{product.stock_status || product.condition || "可咨询"}</span>
                </div>
                <p>{product.spec || product.description || product.category_name}</p>
                <div className="parts-meta">
                  <span>
                    <MapPin size={14} />
                    {product.village || product.delivery_area || "本地"}
                  </span>
                  {product.shop_name ? (
                    <span>
                      <Store size={14} />
                      {product.shop_name}
                    </span>
                  ) : null}
                </div>
                <div className="parts-price">
                  <strong>{product.price ? `¥${Number(product.price).toFixed(2)}` : "面议"}</strong>
                  <span>/{product.unit || "件"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="school-empty large">暂无匹配配件</div>
      )}
    </section>
  );
}

function StatsBar({ stats: items = stats }) {
  return (
    <section className="stats-bar" aria-label="平台数据">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="stat-item" key={item.label}>
            <Icon size={48} />
            <div>
              <span>{item.label}</span>
              <strong>
                {item.value}
                <em>{item.unit}</em>
              </strong>
            </div>
          </div>
        );
      })}
    </section>
  );
}


function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={logoUrl} alt="红匠助修" />
          <p>修善于心 · 助人为乐</p>
        </div>
        <div className="footer-links">
          <p>
            关于我们 <span>|</span> 联系我们 <span>|</span> 加入我们 <span>|</span> 隐私政策{" "}
            <span>|</span> 服务条款
          </p>
          <p>红匠助修公益服务平台　备案号：湘ICP备2534012345号</p>
          <p>Email：service@hongjiangzhuxiu.org　电话：0731-8668-6886</p>
          <p>地址：湖南省长沙市岳麓大道569号湖南工商大学</p>
        </div>
        <div className="qr-wrap">
          <div className="qr-code" aria-label="关注二维码">
            <img src={siteQrUrl} alt="红匠助修网站二维码" />
          </div>
          <strong>关注我们</strong>
          <p>了解更多爱心故事</p>
        </div>
      </div>
    </footer>
  );
}

function ActionModal({
  modal,
  submitted,
  onClose,
  onSubmit,
  onVolunteerEnter,
  volunteerUser,
  onVolunteerUserChange,
}) {
  const [authPhone, setAuthPhone] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [profileName, setProfileName] = useState(volunteerUser?.name === "志愿者" ? "" : volunteerUser?.name || "");
  const titleMap = {
    repair: "提交报修信息",
    volunteer: "加入志愿者",
    login: "登录平台",
    register: "注册账号",
    profile: "完善志愿者资料",
  };

  useEffect(() => {
    if (modal.type !== "profile") return;
    setAuthMessage("");
    setProfileName(volunteerUser?.name === "志愿者" ? "" : volunteerUser?.name || "");
  }, [modal.type, volunteerUser]);

  useEffect(() => {
    if (codeCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => {
      setCodeCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [codeCooldown]);

  async function sendVolunteerCode() {
    const phone = authPhone.trim();
    setAuthMessage("");
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setAuthMessage("请输入正确的手机号");
      return;
    }

    setCodeCooldown(60);
    setAuthBusy(true);
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      setAuthMessage(data.message || (response.ok ? "验证码已发送" : "验证码发送失败"));
    } catch {
      setAuthMessage("网络异常，验证码发送失败");
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitVolunteerAuth(event) {
    event.preventDefault();
    setAuthMessage("");
    setAuthBusy(true);
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "login",
          phone: authPhone,
          code: authCode,
          name: "",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setAuthMessage(data.message || "登录失败，请检查验证码");
        return;
      }
      localStorage.setItem("hongjiangVolunteerToken", data.token);
      localStorage.setItem("hongjiangVolunteerUser", JSON.stringify(data.user));
      onVolunteerUserChange(data.user);
      onSubmit(event);
    } catch {
      setAuthMessage("网络异常，登录失败");
    } finally {
      setAuthBusy(false);
    }
  }

  async function loginWithNumberAuth() {
    setAuthMessage("");
    setAuthBusy(true);
    try {
      const tokenResponse = await fetch("/api/auth/h5-auth-token");
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.ok) {
        setAuthMessage(tokenData.message || "一键登录暂不可用，请使用短信验证码");
        return;
      }

      const sdk = await import("aliyun_numberauthsdk_web");
      const PhoneNumberServer =
        sdk.PhoneNumberServer || sdk.default?.PhoneNumberServer || window.PhoneNumberServer;
      if (!PhoneNumberServer) throw new Error("ALIYUN_NUMBER_AUTH_SDK_NOT_LOADED");

      const phoneNumberServer = new PhoneNumberServer();
      await new Promise((resolve, reject) => {
        phoneNumberServer.checkLoginAvailable({
          accessToken: tokenData.accessToken,
          jwtToken: tokenData.jwtToken,
          timeout: 8000,
          success: resolve,
          error: reject,
        });
      });

      const loginResult = await new Promise((resolve, reject) => {
        phoneNumberServer.getLoginToken({
          timeout: 10000,
          authPageOption: {
            navText: "红匠助修",
            btnText: "本机号码一键登录",
            isDialog: true,
            manualClose: false,
            privacyVenderIndex: 0,
            privacyOne: ["红匠助修隐私政策", "https://hongjiang.fixone.cloud/"],
            privacyAlertConfig: {
              title: "服务协议",
              btnText: "同意并登录",
            },
          },
          success: resolve,
          error: reject,
        });
      });

      const spToken =
        loginResult?.spToken || loginResult?.content?.spToken || loginResult?.content?.token || loginResult?.token;
      if (!spToken) throw new Error("ALIYUN_NUMBER_AUTH_TOKEN_MISSING");

      const response = await fetch("/api/auth/h5-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spToken }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setAuthMessage(data.message || "一键登录失败，请使用短信验证码");
        return;
      }
      localStorage.setItem("hongjiangVolunteerToken", data.token);
      localStorage.setItem("hongjiangVolunteerUser", JSON.stringify(data.user));
      onVolunteerUserChange(data.user);
      onSubmit({ preventDefault() {} });
    } catch (error) {
      console.error(error);
      setAuthMessage("当前网络不支持一键登录，请使用短信验证码");
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitVolunteerProfile(event) {
    event.preventDefault();
    const token = localStorage.getItem("hongjiangVolunteerToken");
    if (!token) {
      setAuthMessage("登录状态已过期，请重新登录");
      return;
    }

    setAuthMessage("");
    setAuthBusy(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setAuthMessage(data.message || "资料保存失败");
        return;
      }
      localStorage.setItem("hongjiangVolunteerUser", JSON.stringify(data.user));
      onVolunteerUserChange(data.user);
      onClose();
    } catch {
      setAuthMessage("网络异常，资料保存失败");
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" aria-label="关闭" onClick={onClose}>
          <X size={22} />
        </button>
        {submitted ? (
          <div className="success-state">
            <ShieldCheck size={56} />
            <h2 id="modal-title">已收到信息</h2>
            <p>
              {modal.type === "repair"
                ? "订单号 HJ2026071018 已生成，可在首页进度查询区查看模拟进度。"
                : modal.type === "volunteer"
                  ? "志愿者账号信息已提交，可继续完善资料并报名培训。"
                  : "工作人员会尽快审核资料，并通过电话或短信与您联系。"}
            </p>
            <button
              className="solid-button"
              onClick={() => {
                if (modal.type === "volunteer") {
                  onClose();
                  onVolunteerEnter();
                } else {
                  onClose();
                }
              }}
            >
              {modal.type === "volunteer" ? "进入个人页" : "知道了"}
            </button>
          </div>
        ) : (
          <form
            onSubmit={
              modal.type === "volunteer" ? submitVolunteerAuth : modal.type === "profile" ? submitVolunteerProfile : onSubmit
            }
          >
            {modal.type === "profile" ? (
              <>
                <div className="auth-head">
                  <span>志愿者资料</span>
                  <h2 id="modal-title">完善资料</h2>
                  <p>账号已创建，补充资料后可用于后续报名、培训和服务记录。</p>
                </div>
                <label>
                  手机号
                  <input value={volunteerUser?.phone || ""} readOnly />
                </label>
                <label>
                  姓名
                  <input
                    required
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    placeholder="请输入真实姓名"
                  />
                </label>
                {authMessage && <p className="auth-message">{authMessage}</p>}
                <button className="solid-button large auth-submit" type="submit" disabled={authBusy}>
                  <SendHorizontal size={20} /> 保存资料
                </button>
              </>
            ) : modal.type === "volunteer" ? (
              <>
                <div className="auth-head">
                  <span>志愿者入口</span>
                  <h2 id="modal-title">手机号一键登录</h2>
                  <p>未注册手机号验证通过后会自动创建志愿者账号。</p>
                </div>
                <button className="solid-button large auth-submit" type="button" onClick={loginWithNumberAuth} disabled={authBusy}>
                  <KeyRound size={20} /> 本机号码一键登录
                </button>
                <div className="auth-divider">或使用短信验证码</div>
                <label>
                  手机号
                  <input
                    required
                    value={authPhone}
                    onChange={(event) => setAuthPhone(event.target.value)}
                    placeholder="请输入手机号"
                    inputMode="tel"
                  />
                </label>
                <label>
                  验证码
                  <div className="auth-code-row">
                    <input
                      required
                      value={authCode}
                      onChange={(event) => setAuthCode(event.target.value)}
                      placeholder="请输入短信验证码"
                      inputMode="numeric"
                      maxLength={6}
                    />
                    <button type="button" onClick={sendVolunteerCode} disabled={authBusy || codeCooldown > 0}>
                      {codeCooldown > 0 ? `${codeCooldown}秒后重发` : "获取验证码"}
                    </button>
                  </div>
                </label>
                {authMessage && <p className="auth-message">{authMessage}</p>}
                <button className="solid-button large auth-submit" type="submit" disabled={authBusy}>
                  <KeyRound size={20} /> 登录 / 自动注册
                </button>
              </>
            ) : (
              <>
                <h2 id="modal-title">{titleMap[modal.type] ?? "提交信息"}</h2>
            {(modal.type === "login" || modal.type === "register") && (
              <label>
                手机号
                <input required placeholder="请输入手机号" inputMode="tel" />
              </label>
            )}
            {modal.type === "login" && (
              <label>
                验证码
                <input required placeholder="请输入验证码" inputMode="numeric" />
              </label>
            )}
            {modal.type !== "login" && modal.type !== "register" && (
              <>
                <label>
                  姓名
                  <input required placeholder="请输入姓名" />
                </label>
                <label>
                  联系电话
                  <input required placeholder="请输入手机号" inputMode="tel" />
                </label>
                <label>
                  服务类型
                  <select defaultValue={modal.service || ""}>
                    <option value="" disabled>
                      请选择
                    </option>
                    <option>水电维修</option>
                    <option>门窗维修</option>
                    <option>家电维修</option>
                    <option>手机维修</option>
                  </select>
                </label>
                <label>
                  需求说明
                  <textarea placeholder="请简单描述情况、地址或可服务时间" />
                </label>
              </>
            )}
            {modal.type === "register" && (
              <label>
                身份选择
                <select defaultValue="居民">
                  <option>居民</option>
                  <option>志愿者</option>
                  <option>社区管理员</option>
                </select>
              </label>
            )}
            <button className="solid-button large" type="submit">
              {modal.type === "login" ? (
                <>
                  <KeyRound size={20} /> 登录
                </>
              ) : (
                <>
                  <SendHorizontal size={20} /> 提交
                </>
              )}
            </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}


export default App;
