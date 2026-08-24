"use client";

import { useEffect, useRef, useState } from "react";

const copy = {
  en: {
    eyebrow: "Reading, not word hoarding", title: "Read the book in front of you.", lead: "InRead finds the few words that block one real book, then sends you back to the story.", login: "Log in", register: "Create account", enter: "Enter InRead", account: "My account", admin: "Admin console"
  },
  zh: {
    eyebrow: "不背海量词，只读眼前书", title: "在真实阅读中，自然习得。", lead: "InRead 只找出真正卡住当前这本书的少量词汇，再把你送回故事里。", login: "登录", register: "注册", enter: "进入 InRead", account: "我的账户", admin: "管理后台"
  }
};

const THEME_STORAGE_KEY = "inread-theme";
const THEME_EGG_STORAGE_KEY = "inread-theme-easter-egg";
const BASE_THEMES = ["light", "dark", "pink", "blue"];
const ALL_THEMES = [...BASE_THEMES, "aurora"];

function useTheme() {
  const [theme, setTheme] = useState("light");
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(false);
  const [showEasterNotice, setShowEasterNotice] = useState(false);
  const themeRef = useRef("light");
  const streakRef = useRef(0);

  const applyTheme = (nextTheme) => {
    themeRef.current = nextTheme;
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const persistAppearance = (nextTheme, unlocked) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.localStorage.setItem(THEME_EGG_STORAGE_KEY, unlocked ? "1" : "0");
    api("/api/profile", { method: "PATCH", body: JSON.stringify({ appearance: { theme: nextTheme, easterEggUnlocked: unlocked } }) }).catch(() => {});
  };

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const localUnlock = window.localStorage.getItem(THEME_EGG_STORAGE_KEY) === "1";
    const initial = ALL_THEMES.includes(stored)
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(initial);
    setEasterEggUnlocked(localUnlock);
    api("/api/me").then(({ user }) => {
      const appearance = user.profile?.appearance;
      const unlocked = Boolean(appearance?.easterEggUnlocked);
      const savedTheme = appearance?.theme;
      setEasterEggUnlocked(unlocked);
      if (ALL_THEMES.includes(savedTheme) && (savedTheme !== "aurora" || unlocked)) applyTheme(savedTheme);
    }).catch(() => {});
  }, []);

  const cycleTheme = () => {
    streakRef.current += 1;
    const justUnlocked = !easterEggUnlocked && streakRef.current >= 10;
    const unlocked = easterEggUnlocked || justUnlocked;
    const options = unlocked ? ALL_THEMES : BASE_THEMES;
    const nextTheme = justUnlocked ? "aurora" : options[(options.indexOf(themeRef.current) + 1) % options.length];
    if (justUnlocked) {
      setEasterEggUnlocked(true);
      setShowEasterNotice(true);
    }
    applyTheme(nextTheme);
    persistAppearance(nextTheme, unlocked);
  };

  return { theme, cycleTheme, showEasterNotice, dismissEasterNotice: () => setShowEasterNotice(false) };
}

function ThemeToggle() {
  const { theme, cycleTheme, showEasterNotice, dismissEasterNotice } = useTheme();
  return <div className="theme-control"><button type="button" className="plain-button theme-toggle" data-theme-choice={theme} onClick={cycleTheme} aria-label="切换网站主题" title="切换网站主题"><span className="theme-dot" aria-hidden="true" /></button>{showEasterNotice && <div className="theme-easter-toast" role="status"><strong>恭喜你触发彩蛋</strong><span>现在可以切换彩蛋背景。</span><button type="button" onClick={dismissEasterNotice} aria-label="关闭提示">×</button></div>}</div>;
}

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { "content-type": "application/json", ...(options.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "请求失败，请稍后重试。");
  return body;
}

function UserMenu({ user }) {
  const state = user.profile?.learningState || {};
  const learned = state.completion?.length || 0;
  async function logout() { await api("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }
  return <div className="user-menu"><a className="account-chip" href="/account"><span className="mini-avatar">{user.avatar}</span><span>{user.nickname}</span></a><div className="user-popover"><p className="popover-label">最近学习</p><strong>{state.selectedBook?.title || "还没有开始一本书"}</strong><span>{learned ? `已掌握 ${learned} 个词` : "从一本想读的书开始"}</span><a className="secondary-action" href="/legacy/search.html">继续学习</a>{user.role === "admin" && <a className="plain-button admin-popover-link" href="/admin">管理后台</a>}<button className="logout-button" onClick={logout}>退出登录</button></div></div>;
}

export function Landing() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  useEffect(() => { api("/api/me").then(({ user: next }) => setUser(next)).catch(() => setUser(null)); }, []);
  const t = copy[language];
  return <main className="auth-page landing-page">
    <nav className="marketing-nav"><a className="wordmark" href="/">InRead</a><div className="nav-actions"><ThemeToggle /><button className="plain-button" onClick={() => setLanguage(language === "en" ? "zh" : "en")}>{language === "en" ? "中文" : "EN"}</button>{user ? <UserMenu user={user} /> : <><a href="/login">{t.login}</a><a className="dark-link" href="/register">{t.register}</a></>}</div></nav>
    <section className="landing-hero"><p className="auth-eyebrow">{t.eyebrow}</p><h1>InRead</h1><p className="origin-line">不背海量词，只读眼前书</p><p>{t.lead}</p><div className="hero-actions"><a className="primary-action" href="/login">{language === "zh" ? "开始" : "Start"}</a><a className="secondary-action" href="/register">{t.register}</a></div></section>
    <section className="principles"><article><span>01</span><h2>{language === "en" ? "Choose a book" : "先选择一本书"}</h2><p>{language === "en" ? "Search by title and test only the vocabulary that matters for that book." : "按书名搜索，只测试真正影响这本书理解的词汇。"}</p></article><article><span>02</span><h2>{language === "en" ? "Clear the smallest barrier" : "清除最小障碍"}</h2><p>{language === "en" ? "Build a short, personal plan instead of starting another endless list." : "形成短小、个人化的计划，而不是开始另一份无尽词表。"}</p></article><article><span>03</span><h2>{language === "en" ? "Return to the text" : "回到正文中去"}</h2><p>{language === "en" ? "Let the rest of your vocabulary grow inside real reading." : "让剩下的词汇在真实阅读里自然增长。"}</p></article></section>
  </main>;
}

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const t = language === "zh" ? {
    title: "欢迎回来", subtitle: "登录后继续你自己的阅读路径。", account: "账号", password: "密码", submit: "登录", forgot: "我忘记了密码", prompt: "还没有账号？", register: "去注册", home: "返回首页"
  } : {
    title: "Welcome back", subtitle: "Sign in to continue your own reading path.", account: "Account", password: "Password", submit: "Sign in", forgot: "I forgot my password", prompt: "New to InRead?", register: "Create an account", home: "Back home"
  };
  async function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api("/api/auth/login", { method: "POST", body: JSON.stringify({ account: form.get("account"), password: form.get("password") }) }); window.location.href = "/legacy/search.html"; } catch (error) { setMessage(error.message); } }
  return <AuthShell title={t.title} subtitle={t.subtitle} language={language} onLanguageChange={() => setLanguage(language === "en" ? "zh" : "en")} homeLabel={t.home}><form onSubmit={submit} className="auth-form"><label>{t.account}<input name="account" autoComplete="username" required /></label><label>{t.password}<input name="password" type="password" autoComplete="current-password" required /></label>{message && <p className="form-error">{message}</p>}<button className="primary-action">{t.submit}</button><a className="forgot-link" href="/forgot-password">{t.forgot}</a><p>{t.prompt} <a href="/register">{t.register}</a></p></form></AuthShell>;
}

export function RegisterForm() {
  const [message, setMessage] = useState("");
  async function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api("/api/auth/register", { method: "POST", body: JSON.stringify({ account: form.get("account"), nickname: form.get("nickname"), password: form.get("password"), inviteCode: form.get("inviteCode") }) }); window.location.href = "/login"; } catch (error) { setMessage(error.message); } }
  return <AuthShell title="创建你的阅读账户" subtitle="邀请码由管理员每五分钟生成一次。"><form onSubmit={submit} className="auth-form"><label>账号<input name="account" placeholder="小写字母、数字或下划线" autoComplete="username" required /></label><label>昵称<input name="nickname" maxLength="24" required /></label><label>密码<input name="password" type="password" placeholder="6-18 位，含大小写字母和数字" autoComplete="new-password" required /></label><label>8 位邀请码<input name="inviteCode" inputMode="numeric" maxLength="8" required /></label>{message && <p className={message.includes("成功") ? "form-ok" : "form-error"}>{message}</p>}<button className="primary-action">注册</button><p>已有账号？ <a href="/login">去登录</a></p></form></AuthShell>;
}

function AuthShell({ title, subtitle, children, language, onLanguageChange, homeLabel = "返回首页" }) { return <main className="auth-page"><nav className="marketing-nav"><a className="wordmark" href="/">InRead</a><div className="nav-actions"><ThemeToggle />{onLanguageChange && <button type="button" className="plain-button" onClick={onLanguageChange}>{language === "en" ? "中文" : "EN"}</button>}<a href="/">{homeLabel}</a></div></nav><section className="auth-card"><p className="auth-eyebrow">INREAD ACCOUNT</p><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</section></main>; }

export function AccountPanel() {
  const [user, setUser] = useState(null); const [message, setMessage] = useState("");
  useEffect(() => { api("/api/profile").then(({ user: next }) => setUser(next)).catch(() => { window.location.href = "/login"; }); }, []);
  async function save(event) { event.preventDefault(); const form = new FormData(event.currentTarget); try { const result = await api("/api/profile", { method: "PATCH", body: JSON.stringify({ nickname: form.get("nickname"), avatar: form.get("avatar") }) }); setUser(result.user); setMessage("资料已更新。"); } catch (error) { setMessage(error.message); } }
  if (!user) return <main className="auth-page"><p>正在读取账户…</p></main>;
  const state = user.profile?.learningState || {}; const words = state.completion?.length || 0;
  return <main className="auth-page dashboard"><nav className="marketing-nav"><a className="wordmark" href="/">InRead</a><div className="nav-actions"><ThemeToggle /><a href="/legacy/search.html">开始阅读</a><UserMenu user={user} /></div></nav><section className="dashboard-grid"><article className="profile-card"><div className="avatar">{user.avatar}</div><h1>{user.nickname}</h1><p>@{user.account}</p><form onSubmit={save} className="auth-form compact"><label>昵称<input name="nickname" defaultValue={user.nickname} required /></label><label>个性头像<input name="avatar" defaultValue={user.avatar} maxLength="80" required /></label><button className="secondary-action">保存资料</button>{message && <p className="form-ok">{message}</p>}</form><p className="password-note">如需更换密码，请联系管理员帮忙重置。</p></article><article className="progress-card"><p className="auth-eyebrow">YOUR READING DATA</p><h2>学习进度</h2><div className="stat-row"><span>当前水平</span><strong>{user.profile?.level || "未测试"}</strong></div><div className="stat-row"><span>已掌握词汇</span><strong>{words}</strong></div><div className="stat-row"><span>当前书籍</span><strong>{state.selectedBook?.title || "尚未选择"}</strong></div><a className="primary-action" href="/legacy/search.html">继续学习</a></article></section></main>;
}

export function AdminPanel() {
  const [user, setUser] = useState(null), [invite, setInvite] = useState(null), [users, setUsers] = useState([]), [query, setQuery] = useState(""), [message, setMessage] = useState("");
  async function load(search = "") { try { const [me, code, results] = await Promise.all([api("/api/me"), api("/api/admin/invite"), api(`/api/admin/users?q=${encodeURIComponent(search)}`)]); if (me.user.role !== "admin") throw new Error("没有管理员权限。"); setUser(me.user); setInvite(code); setUsers(results.users); } catch { window.location.href = "/account"; } }
  useEffect(() => { load(); const timer = setInterval(() => api("/api/admin/invite").then(setInvite).catch(() => {}), 30000); return () => clearInterval(timer); }, []);
  async function updateUser(id, body) { try { await api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }); await load(query); } catch (error) { setMessage(error.message); } }
  async function resetPassword(item) { const password = window.prompt(`为 @${item.account} 设置新密码（6-18 位，含大小写字母和数字）：`); if (!password) return; try { await api(`/api/admin/users/${item.id}/password`, { method: "PATCH", body: JSON.stringify({ password }) }); setMessage(`@${item.account} 的密码已重置。`); } catch (error) { setMessage(error.message); } }
  async function banIp(event) { event.preventDefault(); const ip = new FormData(event.currentTarget).get("ip"); try { await api("/api/admin/ban-ip", { method: "POST", body: JSON.stringify({ ip }) }); setMessage(`${ip} 已永久封禁。`); event.currentTarget.reset(); } catch (error) { setMessage(error.message); } }
  if (!user) return <main className="auth-page"><p>正在验证管理员权限…</p></main>;
  return <main className="auth-page admin-page"><nav className="marketing-nav"><a className="wordmark" href="/">InRead</a><div className="nav-actions"><ThemeToggle /><a href="/account">我的账户</a><a href="/legacy/search.html">学习区</a></div></nav><section className="admin-header"><div><p className="auth-eyebrow">ADMIN CONSOLE</p><h1>账户与邀请码管理</h1></div><div className="invite-card"><span>当前邀请码</span><strong>{invite?.code || "--------"}</strong><small>{invite && `将在 ${new Date(invite.expiresAt).toLocaleTimeString()} 失效`}</small></div></section><section className="admin-tools"><form onSubmit={(event) => { event.preventDefault(); load(query); }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索账号或昵称" /><button className="secondary-action">搜索</button></form><form onSubmit={banIp}><input name="ip" placeholder="永久封禁 IP" required /><button className="danger-action">封禁 IP</button></form></section>{message && <p className="form-ok">{message}</p>}<section className="user-table"><div className="user-table-head"><span>用户</span><span>学习水平</span><span>最近 IP</span><span>权限与账户控制</span></div>{users.map((item) => <div className="user-row" key={item.id}><span><strong>{item.nickname}</strong><small>@{item.account}</small></span><span>{item.profile?.level || "未测试"}</span><span>{item.lastLoginIp || "-"}</span><span className="row-actions"><button className="plain-button" disabled={item.id === user.id} onClick={() => updateUser(item.id, { role: item.role === "admin" ? "user" : "admin" })}>{item.role === "admin" ? "取消管理员" : "授予管理员"}</button><button className="plain-button" onClick={() => resetPassword(item)}>重置密码</button><button className="danger-action" disabled={item.id === user.id} onClick={() => updateUser(item.id, { banned: !item.banned })}>{item.banned ? "解除封禁" : "永久封禁"}</button></span></div>)}</section></main>;
}
