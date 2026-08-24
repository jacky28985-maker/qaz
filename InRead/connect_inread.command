#!/bin/zsh

LOCAL_PORT=13000
INREAD_URL="http://127.0.0.1:${LOCAL_PORT}/"
LOG_FILE="${TMPDIR:-/tmp}/inread-ssh-tunnel.log"

if ! command -v ssh >/dev/null 2>&1; then
  echo "OpenSSH was not found. Install Xcode Command Line Tools first."
  read "?Press Return to close..."
  exit 1
fi

if lsof -nP -iTCP:"${LOCAL_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "InRead is already available at ${INREAD_URL}"
  open "${INREAD_URL}"
  exit 0
fi

echo "Connecting to InRead..."
nohup ssh -N \
  -L "127.0.0.1:${LOCAL_PORT}:127.0.0.1:3000" \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  snxy-dev >"${LOG_FILE}" 2>&1 &

sleep 3
if ! lsof -nP -iTCP:"${LOCAL_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "The SSH tunnel could not be started."
  echo "Check ~/.ssh/config and your private key, then inspect ${LOG_FILE}."
  read "?Press Return to close..."
  exit 1
fi

echo "InRead is available at ${INREAD_URL}"
open "${INREAD_URL}"
