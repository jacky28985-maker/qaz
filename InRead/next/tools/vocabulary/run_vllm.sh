#!/usr/bin/env bash
set -euo pipefail

ROOT="/vepfs/queue010/public/inread-team2-models"
export HF_HOME="$ROOT/cache/huggingface"
export TMPDIR="$ROOT/tmp"
exec "$ROOT/runtime/bin/vllm" serve "$ROOT/qwen3-14b-awq" \
  --host 127.0.0.1 \
  --port 8001 \
  --served-model-name inread-qwen3-14b \
  --quantization awq \
  --gpu-memory-utilization 0.88 \
  --max-model-len 8192 \
  --max-num-seqs 48 \
  --enable-prefix-caching
