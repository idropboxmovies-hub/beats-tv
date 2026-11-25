#!/usr/bin/env bash
# Baixa as bibliotecas usadas pelo app para dentro do APK (assets/www/lib).
# Roda automaticamente no GitHub Actions antes do build.
set -euo pipefail
cd "$(dirname "$0")/../app/src/main/assets/www/lib"
mkdir -p fonts

echo "→ supabase-js"
curl -fsSL --retry 3 -o supabase.min.js \
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"

echo "→ fonte Inter"
for w in 400 500 600 700 800; do
  curl -fsSL --retry 3 -o "fonts/inter-$w.woff2" \
    "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.19/files/inter-latin-$w-normal.woff2"
done

ls -la . fonts
