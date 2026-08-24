#!/bin/zsh

LOCAL_PORT=13000
INREAD_URL="http://127.0.0.1:${LOCAL_PORT}/"
LOG_FILE="${TMPDIR:-/tmp}/inread-ssh-tunnel.log"
SSH_HOST="115.190.90.101"
SSH_PORT=22988
SSH_USER="root"
SSH_KEY="${INREAD_SSH_KEY:-$HOME/.ssh/snxy}"

fail() {
  echo ""
  echo "Connection failed: $1"
  echo "Log: ${LOG_FILE}"
  read "?Press Return to close..."
  exit 1
}

if ! command -v ssh >/dev/null 2>&1; then
  fail "OpenSSH was not found. Install Xcode Command Line Tools first."
fi

if lsof -nP -iTCP:"${LOCAL_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "InRead is already available at ${INREAD_URL}"
  open "${INREAD_URL}"
  exit 0
fi

if [[ ! -f "${SSH_KEY}" ]]; then
  echo "Private key not found at ${SSH_KEY}."
  read "SSH_KEY?Enter the full path to your authorized SSH private key: "
fi

if [[ ! -f "${SSH_KEY}" ]]; then
  fail "No authorized SSH private key was provided."
fi

if command -v nc >/dev/null 2>&1 && ! nc -z -w 6 "${SSH_HOST}" "${SSH_PORT}"; then
  fail "Cannot reach ${SSH_HOST}:${SSH_PORT}. Connect to the academy VPN if you are outside the academy network, then check any local proxy."
fi

echo "Connecting to InRead..."
nohup ssh -N \
  -i "${SSH_KEY}" \
  -p "${SSH_PORT}" \
  -L "127.0.0.1:${LOCAL_PORT}:127.0.0.1:3000" \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  -o StrictHostKeyChecking=accept-new \
  "${SSH_USER}@${SSH_HOST}" >"${LOG_FILE}" 2>&1 &

sleep 4
if ! lsof -nP -iTCP:"${LOCAL_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  tail -n 8 "${LOG_FILE}" 2>/dev/null || true
  fail "The SSH tunnel could not be started."
fi

echo "InRead is available at ${INREAD_URL}"
open "${INREAD_URL}"
