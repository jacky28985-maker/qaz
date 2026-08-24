# Grammar Sync Workspace

This folder is the local working directory for the Grammar project.

- `scripts/export_codex_thread.py` exports the Codex task transcript to Markdown.
- `scripts/hourly_sync.py` exports the transcript, then syncs GitHub when `repo_url` is set in `sync-config.json`.
- `exports/` stores transcript snapshots for the target Codex task.
- `.state/` stores local sync state and the temporary Git clone used for branch updates.

Before GitHub sync can run end-to-end, set these fields in `sync-config.json`:

- `repo_url`
- `git_user_name`
- `git_user_email`
