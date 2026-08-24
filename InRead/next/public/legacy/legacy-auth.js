(() => {
  let queuedState = null;
  let syncTimer = null;

  async function hydrate() {
    const response = await fetch("/api/profile", { credentials: "same-origin" });
    if (!response.ok) {
      window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      throw new Error("UNAUTHORIZED");
    }
    const { user } = await response.json();
    const savedState = user.profile?.learningState;
    if (savedState && typeof savedState === "object" && Object.keys(savedState).length) {
      sessionStorage.setItem("inread-state", JSON.stringify(savedState));
    }
    window.addEventListener("DOMContentLoaded", () => {
      const actions = document.querySelector(".header-actions");
      if (!actions) return;
      const state = user.profile?.learningState || {};
      const learned = state.completion?.length || 0;
      const menu = document.createElement("div");
      menu.className = "legacy-account-menu";
      menu.innerHTML = `
        <a class="legacy-account-chip" href="/account"><span class="legacy-avatar">${escapeHtml(user.avatar || "·")}</span><span>${escapeHtml(user.nickname || user.account)}</span></a>
        <div class="legacy-account-popover">
          <span class="legacy-account-label">Recent learning</span>
          <strong>${escapeHtml(state.selectedBook?.title || "Choose a book to begin")}</strong>
          <span>${learned ? `${learned} words mastered` : "Your next reading path will appear here."}</span>
          <a class="legacy-continue" href="/legacy/search.html">Continue learning</a>
          ${user.role === "admin" ? '<a class="legacy-admin-link" href="/admin">Admin console</a>' : ""}
          <button type="button" class="legacy-logout">Log out</button>
        </div>`;
      menu.querySelector(".legacy-logout").addEventListener("click", async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
        window.location.assign("/");
      });
      actions.appendChild(menu);
    });
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

  window.addEventListener("pagehide", () => { if (queuedState) saveState(queuedState); });
  window.InReadAccount = { ready: hydrate(), saveState };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]);
  }
})();
