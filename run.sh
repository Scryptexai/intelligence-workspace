#!/usr/bin/env bash
# ============================================================
# Intelligence Workspace — Runner
# ============================================================
#   ./run.sh dev              → development server
#   ./run.sh build            → production build
#   ./run.sh start            → jalankan production (setelah build)
#   ./run.sh sync             → pull code GitHub + install deps + seed Supabase
#   ./run.sh seed-supabase    → isi tabel Supabase yang masih kosong (mock)
#   ./run.sh test-api         → smoke test SEMUA endpoint API + health
#   ./run.sh env              → tampilkan env aktif (rahasia disamarkan)
# ============================================================
set -euo pipefail

CMD="${1:-dev}"

# Pastikan .env ada
if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
  echo "ℹ️  .env dibuat dari .env.example"
fi

# Muat .env untuk sub-command (node --env-file)
load_env() {
  if [[ -f .env ]]; then
    set -a; source <(grep -vE '^#|^$' .env | sed 's/^/export /'); set +a
  fi
}

case "$CMD" in
  dev)
    echo "▶️  Dev server on http://localhost:3000"
    npm run dev
    ;;
  build)
    echo "▶️  Production build…"
    npm run build
    ;;
  start)
    echo "▶️  Production on http://localhost:3000"
    load_env
    npm run start
    ;;
  sync)
    echo "▶️  SYNC: pull GitHub + install deps + seed Supabase…"
    git fetch origin
    git pull --ff-only origin "$(git branch --show-current)" || echo "⚠️  pull gagal (mungkin sudah sinkron)"
    npm install
    load_env
    echo "▶️  Mengisi tabel Supabase yang masih kosong…"
    npx tsx src/db/seedSupabase.ts
    echo "✔  Sync selesai. Jalankan: ./run.sh build && ./run.sh start"
    ;;
  seed-supabase)
    echo "▶️  Mengisi tabel Supabase yang kosong (dari mock data)…"
    load_env
    npx tsx src/db/seedSupabase.ts
    ;;
  test-api)
    echo "▶️  Testing semua endpoint API…"
    load_env
    BASE="${BASE_URL:-http://localhost:3000}"
    fail=0
    for p in "/api/health" "/api/config" "/api/projects" \
             "/api/projects/arbitrum" "/api/projects/arbitrum/knowledge" \
             "/api/projects/arbitrum/knowledge/K-001" \
             "/api/projects/arbitrum/entities" "/api/projects/arbitrum/relationships" \
             "/api/projects/arbitrum/events" "/api/projects/arbitrum/conflicts" \
             "/api/projects/arbitrum/conflicts/C-001" "/api/projects/arbitrum/qa" \
             "/api/projects/arbitrum/behavior" \
             "/api/projects/optimism/knowledge" "/api/projects/optimism/conflicts" \
             "/api/search?q=type:conflict" "/api/market/arbitrum"; do
      code=$(curl -s -o /tmp/api.out -w "%{http_code}" -m 20 "$BASE$p" || echo "000")
      size=$(wc -c < /tmp/api.out 2>/dev/null || echo 0)
      if [[ "$code" == "200" && "$size" -gt 5 ]]; then
        echo "  ✓ $code ($size B)  $p"
      else
        echo "  ✗ $code ($size B)  $p"
        fail=1
      fi
    done
    if [[ "$fail" == "0" ]]; then
      echo "✅ SEMUA endpoint OK"
    else
      echo "⚠️  Ada endpoint gagal — cek log server."
    fi
    exit $fail
    ;;
  env)
    echo "▶️  Env aktif (rahasia disamarkan):"
    awk -F= '/^[A-Z]/{v=$2; print "  " $1 "=" (length(v)>8 ? substr(v,1,6)"***" : v)}' .env 2>/dev/null || echo "  (tidak ada .env)"
    ;;
  *)
    echo "Perintah tidak dikenal: $CMD"
    echo "Gunakan: dev | build | start | sync | seed-supabase | test-api | env"
    exit 1
    ;;
esac
