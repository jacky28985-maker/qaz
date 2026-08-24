(() => {
  let queuedState = null;
  let syncTimer = null;
  let accountUser = null;

  async function hydrate() {
    const response = await fetch("/api/profile", { credentials: "same-origin" });
    if (!response.ok) {
      window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      throw new Error("UNAUTHORIZED");
    }
    const { user } = await response.json();
    accountUser = user;
    const savedState = user.profile?.learningState;
    if (savedState && typeof savedState === "object" && Object.keys(savedState).length) {
      sessionStorage.setItem("inread-state", JSON.stringify(savedState));
    }
    const mountMenu = () => {
      const actions = document.querySelector(".header-actions");
      if (!actions) return;
      if (actions.querySelector(".legacy-account-menu")) return;
      const state = user.profile?.learningState || {};
      const learned = state.completion?.length || 0;
      const planned = state.plan?.flatMap((day) => day.tasks || []).length || 0;
      const hasBook = Boolean(state.selectedBook?.id);
      const hasPlan = planned > 0;
      const studyTarget = state.studySession && !state.studySession.completed ? "/legacy/study.html" : "/legacy/plan.html";
      const chinese = localStorage.getItem("inread-language") === "zh";
      const copy = chinese
        ? { label: "学习进度", emptyBook: "还没有选择书籍", emptyPlan: "暂未创建学习计划", mastered: "已掌握", read: "继续阅读", study: "继续背词", plan: "当前训练计划", logout: "退出登录" }
        : { label: "Learning progress", emptyBook: "Choose a book to begin", emptyPlan: "No study plan yet.", mastered: "words mastered", read: "Continue reading", study: "Continue vocabulary study", plan: "Current study plan", logout: "Log out" };
      const menu = document.createElement("div");
      menu.className = "legacy-account-menu";
      menu.innerHTML = `
        <a class="legacy-account-chip" href="/account"><span class="legacy-avatar">${escapeHtml(user.avatar || "·")}</span><span>${escapeHtml(user.nickname || user.account)}</span></a>
        <div class="legacy-account-popover">
          <span class="legacy-account-label">${copy.label}</span>
          <strong>${escapeHtml(state.selectedBook?.title || copy.emptyBook)}</strong>
          <span>${hasPlan ? `${learned} / ${planned} ${copy.mastered}` : copy.emptyPlan}</span>
          <a class="legacy-continue" href="${hasBook ? `/reader?book=${encodeURIComponent(state.selectedBook.id)}` : "/legacy/search.html"}">${copy.read}</a>
          <a class="legacy-continue" href="${hasPlan ? studyTarget : "/legacy/search.html"}">${copy.study}</a>
          <a class="legacy-continue" href="${hasPlan ? "/legacy/plan.html" : "/legacy/search.html"}">${copy.plan}</a>
          ${user.role === "admin" ? '<a class="legacy-admin-link" href="/admin">Admin console</a>' : ""}
          <button type="button" class="legacy-logout">${copy.logout}</button>
        </div>`;
      menu.querySelector(".legacy-logout").addEventListener("click", async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
        window.location.assign("/");
      });
      actions.appendChild(menu);
    };

    // hydrate() can finish after DOMContentLoaded, so mount immediately in that case.
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", mountMenu, { once: true });
    } else {
      mountMenu();
    }
    return user;
  }

  function saveState(state) {
    queuedState = state;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      fetch("/api/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ learningState: queuedState }),
        keepalive: true
      }).catch(() => {});
    }, 700);
  }

  async function flushState(state) {
    const nextState = state || queuedState;
    if (!nextState) return;
    queuedState = nextState;
    clearTimeout(syncTimer);
    await fetch("/api/profile", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ learningState: nextState }),
      keepalive: true
    }).catch(() => {});
  }

  window.addEventListener("pagehide", () => { flushState(); });
  window.InReadAccount = { ready: hydrate(), saveState, flushState, getUser: () => accountUser };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]);
  }
})();
