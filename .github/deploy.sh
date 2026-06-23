#!/usr/bin/env bash
set -euo pipefail
cd /opt/data/eduexpress-dashboard || exit 1
git fetch origin main
git reset --hard origin/main
npm ci --production=false
npx next build
pkill -f "next start" || true
nohup npx next start -p 3000 > /tmp/nextjs.log 2>&1 &
echo "Deployment complete"
