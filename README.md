# beats TV (Android TV / Google TV / Fire TV)

App nativo-híbrido para TV: casca Kotlin + interface HTML/CSS/JS dentro do APK, com o mesmo
backend (Supabase) e o mesmo **liquid glass** do site, no visual do Apple Music para Apple TV.

## Telas
Início · Novo · Rádio · Buscar (teclado na tela + resultados ao vivo) · Perfil (login / meu perfil) ·
Artista · Álbum · Créditos da música · Tela da música (Now Playing com fila) · Mini player.

## Gerar o APK pelo GitHub
1. Crie um repositório e envie **todo** este conteúdo (inclusive a pasta `.github`).
2. Vá em **Actions → "Gerar APK (beats TV)" → Run workflow** (também roda sozinho a cada push).
3. Ao terminar, baixe `beats-tv.apk` em **Artifacts** ou em **Releases**.
4. O workflow baixa sozinho as bibliotecas (supabase-js e fonte Inter) com `scripts/baixar-libs.sh`.

## Instalar na TV
Ative o modo desenvolvedor, instale "Downloader" (ou use `adb install beats-tv.apk`) e abra o app **beats**.

## Controle remoto
- Setas: navegar · OK: selecionar · Voltar: volta/fecha · Play/Pause, Próxima e Anterior funcionam em qualquer tela.
- Na barra de progresso da tela da música, ← → avançam/voltam 10 s.
- Na busca também funciona teclado USB/Bluetooth.

## Liquid glass
Usa o mesmo filtro de refração do site (mapa de deslocamento + aberração cromática). Se o Android System
WebView da sua TV for antigo e o vidro ficar transparente, vá em **Perfil → Liquid Glass** e troque para "simples".

## Dados
`app/src/main/assets/www/js/data.js` — URL/chave do Supabase, tabelas `releases`, `release_tracks`,
`profiles`, `streams`. `LIMIT` define quantos lançamentos são carregados (200).
Créditos: a tela lê, se existirem nas tabelas, campos como `composer`, `producer`, `label`, `genre`, `isrc`,
`copyright` etc. (veja `creditsFor` em `js/screens2.js`) e sempre mostra artista, álbum, faixa, data e classificação.
