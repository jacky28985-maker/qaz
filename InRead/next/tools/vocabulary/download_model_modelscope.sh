#!/usr/bin/env bash
set -euo pipefail

ROOT="/vepfs/queue010/public/inread-team2-models"
MODEL_DIR="$ROOT/qwen3-14b-awq"
BASE_URL="https://www.modelscope.cn/models/Qwen/Qwen3-14B-AWQ/resolve/master"
FILES=(
  config.json
  generation_config.json
  merges.txt
  model-00001-of-00002.safetensors
  model-00002-of-00002.safetensors
  model.safetensors.index.json
  tokenizer.json
  tokenizer_config.json
  vocab.json
)

mkdir -p "$MODEL_DIR"
for file in "${FILES[@]}"; do
  curl --fail --location --continue-at - --retry 8 --retry-delay 3 \
    --output "$MODEL_DIR/$file" "$BASE_URL/$file"
done
