#!/usr/bin/env sh
# Load InRead's persistent Node.js toolchain from the VEPFS project directory.
set -eu

INREAD_ROOT="/vepfs/queue010/team2"
export PATH="${INREAD_ROOT}/tools/node-v20.20.2/bin:${PATH}"

if [ "$#" -eq 0 ]; then
  exec "${SHELL:-/bin/sh}"
fi

exec "$@"
