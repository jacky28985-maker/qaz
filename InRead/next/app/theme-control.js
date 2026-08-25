"use client";

import { useEffect, useRef, useState } from "react";

const THEME_STORAGE_KEY = "inread-theme";
const THEME_EGG_STORAGE_KEY = "inread-theme-easter-egg";
const BASE_THEMES = ["light", "dark", "pink", "blue"];
const ALL_THEMES = [...BASE_THEMES, "aurora"];

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeControl() {
  const [theme, setTheme] = useState("light");
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(false);
  const [showEasterNotice, setShowEasterNotice] = useState(false);
  const themeRef = useRef("light");
  const streakRef = useRef(0);

  function setActiveTheme(nextTheme) {
    themeRef.current = nextTheme;
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  async function persistAppearance(nextTheme, unlocked) {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    localStorage.setItem(THEME_EGG_STORAGE_KEY, unlocked ? "1" : "0");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ appearance: { theme: nextTheme, easterEggUnlocked: unlocked } })
    }).catch(() => {});
  }

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const localUnlock = localStorage.getItem(THEME_EGG_STORAGE_KEY) === "1";
    const initial = ALL_THEMES.includes(stored) ? stored : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setActiveTheme(initial);
    setEasterEggUnlocked(localUnlock);
    fetch("/api/me").then((response) => response.json()).then(({ user }) => {
      const appearance = user?.profile?.appearance;
      const unlocked = Boolean(appearance?.easterEggUnlocked);
      const savedTheme = appearance?.theme;
      setEasterEggUnlocked(unlocked);
      if (ALL_THEMES.includes(savedTheme) && (savedTheme !== "aurora" || unlocked)) setActiveTheme(savedTheme);
    }).catch(() => {});
  }, []);

  function cycleTheme() {
    streakRef.current += 1;
    const justUnlocked = !easterEggUnlocked && streakRef.current >= 10;
    const unlocked = easterEggUnlocked || justUnlocked;
    const options = unlocked ? ALL_THEMES : BASE_THEMES;
    const nextTheme = justUnlocked ? "aurora" : options[(options.indexOf(themeRef.current) + 1) % options.length];
    if (justUnlocked) {
      setEasterEggUnlocked(true);
      setShowEasterNotice(true);
    }
    setActiveTheme(nextTheme);
    void persistAppearance(nextTheme, unlocked);
  }

  return <div className="theme-control"><button type="button" className="plain-button theme-toggle" data-theme-choice={theme} onClick={cycleTheme} aria-label="切换网站主题" title="切换网站主题"><span className="theme-dot" aria-hidden="true" /></button>{showEasterNotice && <div className="theme-easter-toast" role="status"><strong>恭喜你触发彩蛋</strong><span>现在可以切换彩蛋背景。</span><button type="button" onClick={() => setShowEasterNotice(false)} aria-label="关闭提示">×</button></div>}</div>;
}
