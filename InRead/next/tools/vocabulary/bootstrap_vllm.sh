#!/usr/bin/env bash
set -euo pipefail

ROOT="/vepfs/queue010/public/inread-team2-models"
RUNTIME="$ROOT/runtime"
MODEL_DIR="$ROOT/qwen3-14b-awq"
export PIP_CACHE_DIR="$ROOT/cache/pip"
export HF_HOME="$ROOT/cache/huggingface"
export TMPDIR="$ROOT/tmp"
mkdir -p "$PIP_CACHE_DIR" "$HF_HOME" "$TMPDIR"

if [[ ! -x "$RUNTIME/bin/python" ]]; then
  python3 -m venv "$RUNTIME"
fi
"$RUNTIME/bin/pip" install --upgrade pip
"$RUNTIME/bin/pip" install "vllm>=0.10.0" "huggingface_hub>=0.30.0"
"$RUNTIME/bin/python" - <<'PY'
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id="Qwen/Qwen3-14B-AWQ",
    local_dir="/vepfs/queue010/public/inread-team2-models/qwen3-14b-awq",
)
PY
