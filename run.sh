#!/usr/bin/env bash
# ============================================================
# Intelligence Workspace — Runner
# ============================================================
#   ./run.sh dev          → jalankan development server
#   ./run.sh build        → production build
#   ./run.sh start        → jalankan production (setelah build)
#   ./run.sh test-api     → smoke test semua endpoint API
#   ./run.sh seed         → isi data ke PostgreSQL (butuh DATABASE_URL)
#   ./run.sh sync         → pull code terbaru dari GitHub + install deps
#   ./run.sh env          → tampilkan env yang aktif (tanpa rahasia penuh)
# ============================================================
set -euo pipefail

CMD="${1:-dev}"

# Pastikan .env dimuat (dengan fallback .env.example)
if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
  echo "ℹ️  .env dibuat dari .env.example"
fi

case "$CMD" in
  dev)
    echo "▶️  Starting dev server on http://localhost:3000"
    npm run dev
    ;;
  build)
    echo "▶️  Building production…"
    npm run build
    ;;
  start)
    echo "▶️  Starting production on http://localhost:3000"
    npm run start
    ;;
  seed)
    echo "▶️  Seeding database (butuh DATABASE_URL)…"
    npx tsx src/db/seed.ts
    ;;
  test-api)
    echo "▶️  Testing API endpoints…"
    BASE="${BASE_URL:-http://localhost:3000}"
    for p in "/api/health" "/api/projects" "/api/projects/arbitrum" \
             "/api/projects/arbitrum/knowledge" "/api/projects/arbitrum/knowledge/K-001" \
             "/api/projects/arbitrum/entities" "/api/projects/arbitrum/relationships" \
             "/api/projects/arbitrum/events" "/api/projects/arbitrum/conflicts" \
             "/api/projects/arbitrum/conflicts/C-001" "/api/projects/arbitrum/qa" \
             "/api/projects/arbitrum/behavior" "/api/search?q=type:conflict" \
             "/api/market/arbitrum" "/api/config"; do
      code=$(curl -s -o /tmp/api.out -w "%{http_code}" -m 15 "$BASE$p" || echo "000")
      size=$(wc -c < /tmp/api.out 2>/dev/null || echo 0)
      echo "  $code  ($size B)  $p"
    done
    ;;
  sync)
    echo "▶️  Pulling latest code + installing deps…"
    git fetch origin
    git pull --ff-only origin "$(git branch --show-current)" || echo "⚠️  pull gagal (mungkin sudah sinkron)"
    npm install
    ;;
  env)
    echo "▶️  Env aktif (rahasia disamarkan):"
    awk -F= '/^[A-Z]/{split($1,k,"_"); v=$2; print "  " $1 "=" (length(v)>8 ? substr(v,1,6)"***" : v)}' .env 2>/dev/null || echo "  (tidak ada .env)"
    ;;
  *)
    echo "Perintah tidak dikenal: $CMD"
    echo "Gunakan: dev | build | start | test-api | seed | sync | env"
    exit 1
    ;;
esac
