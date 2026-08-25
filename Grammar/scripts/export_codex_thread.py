#!/usr/bin/env python3

import argparse
import json
from datetime import datetime
from pathlib import Path


def find_session_file(thread_id: str) -> Path:
    sessions_root = Path.home() / ".codex" / "sessions"
    matches = sorted(sessions_root.rglob(f"*{thread_id}*.jsonl"))
    if not matches:
        raise FileNotFoundError(f"No Codex session file found for thread {thread_id}")
    return matches[-1]


def clean_text(text: str) -> str:
    normalized = text.replace("\r\n", "\n").strip()
    if normalized.startswith("<environment_context>"):
        return ""
    return normalized


def extract_messages(session_file: Path):
    messages = []
    with session_file.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            event = json.loads(raw_line)
            if event.get("type") != "response_item":
                continue

            payload = event.get("payload", {})
            role = payload.get("role")
            if role not in {"user", "assistant"}:
                continue

            parts = []
            for item in payload.get("content", []):
                item_type = item.get("type")
                text = item.get("text")
                if item_type in {"input_text", "output_text"} and isinstance(text, str):
                    cleaned = clean_text(text)
                    if cleaned:
                        parts.append(cleaned)

            if not parts:
                continue

            metadata = payload.get("internal_chat_message_metadata_passthrough", {})
            messages.append(
                {
                    "role": role,
                    "text": "\n\n".join(parts).strip(),
                    "create_time": metadata.get("create_time"),
                }
            )
    return messages


def render_markdown(thread_id: str, session_file: Path, messages, exported_at: datetime) -> str:
    lines = [
        "# Codex Transcript Export",
        "",
        f"- Thread ID: `{thread_id}`",
        f"- Source session: `{session_file}`",
        f"- Exported at: `{exported_at.isoformat()}`",
        "",
    ]

    for index, message in enumerate(messages, start=1):
        lines.extend(
            [
                f"## {index}. {message['role'].capitalize()}",
                "",
                message["text"],
                "",
            ]
        )

    return "\n".join(lines).rstrip() + "\n"


def export_thread(thread_id: str, output_dir: Path) -> Path:
    session_file = find_session_file(thread_id)
    messages = extract_messages(session_file)
    exported_at = datetime.now().astimezone()
    timestamp = exported_at.strftime("%Y%m%d-%H%M%S")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"thread-{thread_id}-{timestamp}.md"
    output_file.write_text(
        render_markdown(thread_id, session_file, messages, exported_at),
        encoding="utf-8",
    )
    return output_file


def main():
    parser = argparse.ArgumentParser(description="Export a Codex thread transcript to Markdown.")
    parser.add_argument("thread_id", help="Codex thread id")
    parser.add_argument("output_dir", help="Directory for exported Markdown files")
    args = parser.parse_args()

    output_path = export_thread(args.thread_id, Path(args.output_dir).expanduser())
    print(output_path)


if __name__ == "__main__":
    main()
