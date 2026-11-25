#!/usr/bin/env bash
# Recoloca os arquivos soltos nas pastas certas do projeto Android (roda só no build do GitHub).
set -euo pipefail
cd "$(dirname "$0")"
W=app/src/main/assets/www
put(){ # arquivo destino-dir [novo-nome]
  [ -f "$1" ] || { echo "FALTA: $1"; MISSING=1; return 0; }
  mkdir -p "$2"; mv "$1" "$2/${3:-$1}"; }
MISSING=0
put index.html $W
for f in app.css fonts.css; do put $f $W/css; done
for f in util glass data player nav screens screens2 main; do put $f.js $W/js; done
put MainActivity.kt app/src/main/java/com/beats/tv
put AndroidManifest.xml app/src/main
for f in strings.xml themes.xml; do put $f app/src/main/res/values; done
for f in banner.xml ic_launcher.xml; do put $f app/src/main/res/drawable; done
put app-build.gradle.kts app build.gradle.kts
put root-build.gradle.kts . build.gradle.kts
put baixar-libs.sh scripts
[ "$MISSING" = 0 ] || { echo "Arquivos faltando acima. Envie-os para a raiz do repositório."; exit 1; }
mkdir -p $W/lib/fonts
echo "Projeto organizado."
