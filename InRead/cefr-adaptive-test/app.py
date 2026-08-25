from __future__ import annotations

import argparse
import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

from cefr_engine import AdaptiveCEFREngine
from llm_client import LocalLLMClient


INDEX_HTML = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CEFR Adaptive Test</title>
  <style>
    :root {
      --bg: #f5f1e8;
      --panel: rgba(255,255,255,0.86);
      --ink: #1d2a32;
      --accent: #bc5f3c;
      --accent-soft: #f2d3c5;
      --muted: #60727d;
      --line: rgba(29,42,50,0.12);
      --ok: #29775d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Georgia, "Noto Serif SC", serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, #f9ddc9 0, transparent 25%),
        radial-gradient(circle at bottom right, #d6e7e1 0, transparent 28%),
        linear-gradient(135deg, #efe6d2, #f7f4ee 55%, #e8efe9);
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .shell {
      width: min(900px, 100%);
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 28px;
      backdrop-filter: blur(12px);
      box-shadow: 0 18px 60px rgba(41, 35, 24, 0.12);
      overflow: hidden;
    }
    .hero, .content, .result { padding: 28px; }
    .hero {
      border-bottom: 1px solid var(--line);
      background: linear-gradient(120deg, rgba(188,95,60,0.12), rgba(41,119,93,0.08));
    }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 5vw, 44px); line-height: 1.05; margin-bottom: 12px; }
    .sub { color: var(--muted); line-height: 1.6; max-width: 700px; }
    .meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    .pill {
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.72);
      border: 1px solid var(--line);
      font-size: 14px;
    }
    button {
      border: 0;
      border-radius: 999px;
      padding: 14px 22px;
      background: var(--accent);
      color: white;
      font: inherit;
      cursor: pointer;
      transition: transform .18s ease, opacity .18s ease;
    }
    button:hover { transform: translateY(-1px); }
    button[disabled] { opacity: 0.55; cursor: not-allowed; }
    .secondary { background: #355567; }
    .content, .result { display: none; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 14px 16px;
      background: rgba(255,255,255,0.7);
    }
    .label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
    .value { font-size: 22px; margin-top: 6px; }
    .question-box {
      border: 1px solid var(--line);
      border-radius: 22px;
      padding: 24px;
      background: white;
    }
    .prompt { font-size: 14px; color: var(--muted); margin-bottom: 10px; }
    .passage {
      padding: 14px 16px;
      background: #f8f4ec;
      border-left: 4px solid var(--accent-soft);
      border-radius: 14px;
      line-height: 1.7;
      margin: 14px 0;
    }
    .question {
      font-size: clamp(22px, 4vw, 30px);
      line-height: 1.35;
      margin: 12px 0 18px;
    }
    .option {
      display: block;
      margin: 12px 0;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid var(--line);
      cursor: pointer;
      background: #fcfbf9;
      transition: border-color .18s ease, transform .18s ease, background .18s ease;
    }
    .option:hover { transform: translateY(-1px); border-color: rgba(188,95,60,0.5); }
    .option input { margin-right: 10px; }
    .actions {
      margin-top: 22px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .status { color: var(--muted); min-height: 22px; }
    .result h2 { font-size: 34px; margin-bottom: 12px; }
    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin: 18px 0 22px;
    }
    ul { margin: 10px 0 0; padding-left: 18px; }
    li { margin: 6px 0; }
    .summary {
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 18px;
      background: rgba(214,231,225,0.36);
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <div class="shell">
    <section class="hero" id="hero">
      <h1>20 分钟自适应 CEFR 英语测试</h1>
      <p class="sub">单题展示，每 3 题动态调难度。完整测试约 32-36 题，默认从 B1 起测，根据你的表现向上或向下修正，尽量在 15-20 分钟内给出较稳定的 CEFR 估计。</p>
      <div class="meta">
        <div class="pill">每次只显示 1 题</div>
        <div class="pill">约 32-36 题自适应</div>
        <div class="pill">目标时长约 20 分钟</div>
      </div>
      <div class="actions" style="margin-top:22px;">
        <button id="startBtn">开始测试</button>
        <span class="status" id="bootStatus"></span>
      </div>
    </section>

    <section class="content" id="content">
      <div class="stats">
        <div class="card"><div class="label">已答题数</div><div class="value" id="answered">0 / 36</div></div>
        <div class="card"><div class="label">本组进度</div><div class="value" id="groupProgress">0 / 3</div></div>
        <div class="card"><div class="label">剩余时间</div><div class="value" id="timer">20:00</div></div>
      </div>

      <div class="question-box">
        <div class="prompt" id="prompt"></div>
        <div class="passage" id="passage" style="display:none;"></div>
        <div class="question" id="question"></div>
        <form id="answerForm">
          <div id="options"></div>
          <div class="actions">
            <button type="submit" id="submitBtn">提交并进入下一题</button>
            <span class="status" id="questionStatus"></span>
          </div>
        </form>
      </div>
    </section>

    <section class="result" id="result">
      <h2 id="resultLevel">CEFR 结果</h2>
      <p class="sub" id="resultBand"></p>
      <div class="result-grid">
        <div class="card"><div class="label">能力估计</div><div class="value" id="abilityValue"></div></div>
        <div class="card"><div class="label">置信度</div><div class="value" id="confidenceValue"></div></div>
        <div class="card"><div class="label">答题数</div><div class="value" id="countValue"></div></div>
        <div class="card"><div class="label">耗时</div><div class="value" id="timeValue"></div></div>
      </div>
      <div class="card">
        <div class="label">优势</div>
        <ul id="strengthList"></ul>
      </div>
      <div class="card" style="margin-top:12px;">
        <div class="label">待加强</div>
        <ul id="gapList"></ul>
      </div>
      <div class="summary" style="margin-top:18px;" id="summaryBox"></div>
      <div class="actions" style="margin-top:22px;">
        <button class="secondary" id="restartBtn">重新测试</button>
      </div>
    </section>
  </div>

  <script>
    const state = { sessionId: null, timerHandle: null };

    function formatSeconds(total) {
      const minutes = String(Math.floor(total / 60)).padStart(2, "0");
      const seconds = String(total % 60).padStart(2, "0");
      return `${minutes}:${seconds}`;
    }

    function showSection(name) {
      document.getElementById("hero").style.display = name === "hero" ? "block" : "none";
      document.getElementById("content").style.display = name === "content" ? "block" : "none";
      document.getElementById("result").style.display = name === "result" ? "block" : "none";
    }

    function renderProgress(progress) {
      document.getElementById("answered").textContent = `${progress.answered} / ${progress.total_questions}`;
      document.getElementById("groupProgress").textContent = `${progress.group_answered} / ${progress.group_size}`;
      document.getElementById("timer").textContent = formatSeconds(progress.remaining_seconds);
      if (state.timerHandle) {
        clearInterval(state.timerHandle);
      }
      let remaining = progress.remaining_seconds;
      state.timerHandle = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        document.getElementById("timer").textContent = formatSeconds(remaining);
      }, 1000);
    }

    function renderQuestion(payload) {
      showSection("content");
      renderProgress(payload.progress);
      const question = payload.question;
      document.getElementById("prompt").textContent = question.prompt;
      document.getElementById("question").textContent = question.question;
      document.getElementById("questionStatus").textContent = "";
      const passageEl = document.getElementById("passage");
      if (question.passage) {
        passageEl.style.display = "block";
        passageEl.textContent = question.passage;
      } else {
        passageEl.style.display = "none";
        passageEl.textContent = "";
      }
      const options = document.getElementById("options");
      options.innerHTML = "";
      question.options.forEach((text, index) => {
        const label = document.createElement("label");
        label.className = "option";
        label.innerHTML = `<input type="radio" name="choice" value="${index}" /> ${text}`;
        options.appendChild(label);
      });
    }

    function renderResult(payload) {
      showSection("result");
      if (state.timerHandle) {
        clearInterval(state.timerHandle);
      }
      const result = payload.result;
      document.getElementById("resultLevel").textContent = `估计 CEFR 等级：${result.cefr_level}`;
      document.getElementById("resultBand").textContent = `当前估计区间：${result.cefr_band}`;
      document.getElementById("abilityValue").textContent = result.ability_estimate;
      document.getElementById("confidenceValue").textContent = result.confidence;
      document.getElementById("countValue").textContent = result.questions_answered;
      document.getElementById("timeValue").textContent = `${result.minutes_used} 分钟`;
      document.getElementById("summaryBox").textContent = result.llm_summary;

      const strengthList = document.getElementById("strengthList");
      strengthList.innerHTML = "";
      result.strengths.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        strengthList.appendChild(li);
      });

      const gapList = document.getElementById("gapList");
      gapList.innerHTML = "";
      result.gaps.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        gapList.appendChild(li);
      });
    }

    async function startSession() {
      const startBtn = document.getElementById("startBtn");
      const status = document.getElementById("bootStatus");
      startBtn.disabled = true;
      status.textContent = "正在初始化测试...";
      try {
        const response = await fetch("/api/start", { method: "POST", credentials: "same-origin" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.session_id) {
          throw new Error(payload.error || "测试服务暂时不可用，请稍后重试。");
        }
        state.sessionId = payload.session_id;
        status.textContent = "";
        renderQuestion(payload);
      } catch (error) {
        status.textContent = error.message || "无法启动测试，请检查网络后重试。";
        startBtn.disabled = false;
      }
    }

    async function submitAnswer(event) {
      event.preventDefault();
      const selected = document.querySelector('input[name="choice"]:checked');
      if (!selected) {
        document.getElementById("questionStatus").textContent = "请先选择一个答案。";
        return;
      }
      const submitBtn = document.getElementById("submitBtn");
      submitBtn.disabled = true;
      document.getElementById("questionStatus").textContent = "正在记录答案...";
      try {
        const response = await fetch("/api/answer", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: state.sessionId,
            choice_index: Number(selected.value),
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "答案提交失败，请重试。");
        if (payload.status === "finished") {
          renderResult(payload);
        } else {
          renderQuestion(payload);
        }
      } catch (error) {
        document.getElementById("questionStatus").textContent = error.message || "答案提交失败，请重试。";
      } finally {
        submitBtn.disabled = false;
      }
    }

    document.getElementById("startBtn").addEventListener("click", startSession);
    document.getElementById("answerForm").addEventListener("submit", submitAnswer);
    document.getElementById("restartBtn").addEventListener("click", () => {
      state.sessionId = null;
      showSection("hero");
    });
    showSection("hero");
  </script>
</body>
</html>
"""


class CEFRHandler(BaseHTTPRequestHandler):
    engine = AdaptiveCEFREngine(LocalLLMClient())

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self._send_html(INDEX_HTML)
            return
        if parsed.path == "/api/state":
            params = parse_qs(parsed.query)
            session_id = params.get("session_id", [None])[0]
            if not session_id:
                self._send_json({"error": "session_id is required"}, status=HTTPStatus.BAD_REQUEST)
                return
            try:
                payload = self.engine.get_session(session_id)
            except KeyError:
                self._send_json({"error": "session not found"}, status=HTTPStatus.NOT_FOUND)
                return
            self._send_json(payload)
            return
        if parsed.path == "/api/health":
            payload = {
                "ok": True,
                "llm_reachable": self.engine._llm.ping(),  # noqa: SLF001
            }
            self._send_json(payload)
            return
        self._send_json({"error": "not found"}, status=HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/start":
            payload = self.engine.start_session()
            self._send_json(payload)
            return
        if parsed.path == "/api/answer":
            try:
                data = self._read_json()
                payload = self.engine.submit_answer(
                    session_id=str(data["session_id"]),
                    choice_index=int(data["choice_index"]),
                )
                self._send_json(payload)
            except KeyError:
                self._send_json({"error": "session not found"}, status=HTTPStatus.NOT_FOUND)
            except (ValueError, json.JSONDecodeError):
                self._send_json({"error": "invalid request body"}, status=HTTPStatus.BAD_REQUEST)
            return
        self._send_json({"error": "not found"}, status=HTTPStatus.NOT_FOUND)

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
        return

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8"))

    def _send_html(self, html: str, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the CEFR adaptive test server.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=7860)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), CEFRHandler)
    print(f"CEFR adaptive test listening on http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
