# Deploy manuale della dApp su GitHub Pages

## Opzione 1: Usa GitHub Actions (Automatico)

1. **Abilita GitHub Pages nel repository:**
   - Vai su Settings → Pages
   - Seleziona "Source: GitHub Actions"

2. **Crea il file workflow** `.github/workflows/deploy-dapp.yml`:
```yaml
name: Deploy dApp to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'dapp/**'

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./dapp
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './dapp/package-lock.json'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dapp/build'
      - uses: actions/deploy-pages@v4
```

3. **Commit e push:**
```bash
git add .github/workflows/deploy-dapp.yml
git commit -m "ci: add GitHub Actions workflow"
git push origin main
```

---

## Opzione 2: Deploy Manuale con gh-pages

```bash
cd dapp
npm install
npm run build
npm run deploy
```

Questo caricherà automaticamente il contenuto di `build/` nel branch `gh-pages`.

---

## Configurazione GitHub Pages

1. Vai su **Settings → Pages**
2. Seleziona:
   - **Source**: GitHub Actions
   - Oppure **Source**: Deploy from a branch → Branch: `gh-pages`

3. L'URL sarà: `https://deruvomichele-cloud.github.io/ash`

---

## ✅ Verifica il Deploy

- Vai su Settings → Pages
- Vedrai il link alla dApp deployata
- Aspetta ~2-3 minuti per il primo deploy

---

**La dApp sarà disponibile su:**
```
https://deruvomichele-cloud.github.io/ash
```
