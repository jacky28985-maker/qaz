#!/usr/bin/env python3

import json
import shutil
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from export_codex_thread import export_thread


EXCLUDED_PROJECT_NAMES = {
    ".DS_Store",
    ".git",
    ".state",
    "__pycache__",
    "exports",
}


def run(cmd, cwd=None, capture_output=False):
    return subprocess.run(
        cmd,
        cwd=cwd,
        check=True,
        text=True,
        capture_output=capture_output,
    )


def get_git_config(repo_dir: Path, key: str):
    result = subprocess.run(
        ["git", "config", "--get", key],
        cwd=repo_dir,
        check=False,
        text=True,
        capture_output=True,
    )
    value = result.stdout.strip()
    return value or ""


def load_config(config_path: Path):
    with config_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_state(state_dir: Path, last_export: Path):
    state_dir.mkdir(parents=True, exist_ok=True)
    (state_dir / "last-export.txt").write_text(str(last_export) + "\n", encoding="utf-8")


def copy_project_tree(source_root: Path, target_root: Path):
    if target_root.exists():
        shutil.rmtree(target_root)
    target_root.mkdir(parents=True, exist_ok=True)

    for source_path in source_root.rglob("*"):
        relative_path = source_path.relative_to(source_root)
        if any(part in EXCLUDED_PROJECT_NAMES for part in relative_path.parts):
            continue

        destination = target_root / relative_path
        if source_path.is_dir():
            destination.mkdir(parents=True, exist_ok=True)
            continue

        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, destination)


def ensure_repo(repo_dir: Path, repo_url: str, proxy: str):
    repo_dir.parent.mkdir(parents=True, exist_ok=True)
    if not (repo_dir / ".git").exists():
        clone_cmd = ["git"]
        if proxy:
            clone_cmd.extend(["-c", f"http.proxy={proxy}", "-c", f"https.proxy={proxy}"])
        clone_cmd.extend(["clone", repo_url, str(repo_dir)])
        run(clone_cmd)
    else:
        run(["git", "remote", "set-url", "origin", repo_url], cwd=repo_dir)

    if proxy:
        run(["git", "config", "http.proxy", proxy], cwd=repo_dir)
        run(["git", "config", "https.proxy", proxy], cwd=repo_dir)

    run(["git", "fetch", "origin", "--prune"], cwd=repo_dir)


def ensure_commit_identity(repo_dir: Path, name: str, email: str):
    if name:
        run(["git", "config", "user.name", name], cwd=repo_dir)
    if email:
        run(["git", "config", "user.email", email], cwd=repo_dir)


def has_commit_identity(repo_dir: Path):
    return bool(get_git_config(repo_dir, "user.name") and get_git_config(repo_dir, "user.email"))


def checkout_remote_branch(repo_dir: Path, branch: str):
    run(["git", "checkout", "-B", branch, f"origin/{branch}"], cwd=repo_dir)


def commit_and_push(repo_dir: Path, branch: str, message: str):
    status = run(["git", "status", "--porcelain"], cwd=repo_dir, capture_output=True).stdout.strip()
    if not status:
        return False

    run(["git", "add", "-A"], cwd=repo_dir)
    run(["git", "commit", "-m", message], cwd=repo_dir)
    run(["git", "push", "origin", branch], cwd=repo_dir)
    return True


def sync_main_branch(repo_dir: Path, branch: str, folder_name: str, transcript_path: Path):
    checkout_remote_branch(repo_dir, branch)
    target_dir = repo_dir / folder_name
    target_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(transcript_path, target_dir / transcript_path.name)
    changed = commit_and_push(
        repo_dir,
        branch,
        f"Add Codex transcript {transcript_path.name}",
    )
    return changed, target_dir / transcript_path.name


def sync_inread_branch(repo_dir: Path, branch: str, folder_name: str, local_root: Path):
    checkout_remote_branch(repo_dir, branch)
    target_dir = repo_dir / folder_name
    copy_project_tree(local_root, target_dir)
    changed = commit_and_push(
        repo_dir,
        branch,
        f"Sync Grammar workspace from {local_root.name}",
    )
    return changed, target_dir


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: hourly_sync.py /absolute/path/to/sync-config.json")

    config_path = Path(sys.argv[1]).expanduser().resolve()
    config = load_config(config_path)

    local_root = Path(config["local_root"]).expanduser().resolve()
    exports_dir = Path(config["exports_dir"]).expanduser().resolve()
    state_dir = Path(config["state_dir"]).expanduser().resolve()
    repo_dir = Path(config["repo_dir"]).expanduser().resolve()

    transcript_path = export_thread(config["thread_id"], exports_dir)
    write_state(state_dir, transcript_path)

    repo_url = config.get("repo_url", "").strip()
    if not repo_url:
        print(f"Transcript exported locally: {transcript_path}")
        print("GitHub sync skipped: sync-config.json is missing repo_url.")
        return

    try:
        ensure_repo(repo_dir, repo_url, config.get("git_proxy", "").strip())
        ensure_commit_identity(
            repo_dir,
            config.get("git_user_name", "").strip(),
            config.get("git_user_email", "").strip(),
        )

        if not has_commit_identity(repo_dir):
            print(f"Transcript exported locally: {transcript_path}")
            print("GitHub sync skipped: missing git user.name or user.email for commits.")
            return

        main_changed, main_target = sync_main_branch(
            repo_dir,
            config["main_branch"],
            config["main_folder"],
            transcript_path,
        )
        inread_changed, inread_target = sync_inread_branch(
            repo_dir,
            config["inread_branch"],
            config["inread_folder"],
            local_root,
        )
    except subprocess.CalledProcessError as exc:
        print(f"Transcript exported locally: {transcript_path}")
        print(f"GitHub sync skipped: {exc}")
        return

    print(f"Transcript exported locally: {transcript_path}")
    print(f"main branch target: {main_target} (changed={str(main_changed).lower()})")
    print(f"InRead branch target: {inread_target} (changed={str(inread_changed).lower()})")


if __name__ == "__main__":
    main()
