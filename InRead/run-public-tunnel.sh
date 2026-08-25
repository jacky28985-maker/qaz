#!/usr/bin/env sh

exec /vepfs/queue010/team2/bin/cloudflared tunnel --no-autoupdate --url http://127.0.0.1:3000
