# Runway Command

Local-first PWA daily schedule app for BCIT preparation.

## Quick start

```bash
npm install
npm run dev -- --host
```

Open the shown local network URL on your phone (same Wi-Fi), then add to home screen.

## Build for production

```bash
npm run build
npm run preview -- --host
```

## Deploy from phone with Vercel

1. Push this repo to GitHub.
2. In Vercel (mobile browser), tap **New Project** and import the repo.
3. Keep defaults and deploy. This repo includes `vercel.json` for Vite output + SPA routing.
4. Open the generated `.vercel.app` URL.
5. Install to phone home screen from browser menu.

### If Vercel URL shows 404

- Check **Deployments** tab in Vercel:
  - If build failed, open logs and fix the error, then redeploy.
  - If build passed, confirm output is `dist` (configured in `vercel.json`).
- In Vercel project settings, ensure **Root Directory** is the repo root (not a subfolder).
- If URL still 404s, redeploy latest commit and hard refresh browser.

## Features

- Today / Week / Edit / Settings pages
- LocalStorage persistence for schedule edits + checkbox progress
- Daily auto-reset checkbox logic
- Broken Day Mode + Night Blade jump
- Offline-first service worker + web manifest for install
- Dark mobile-first interface

No backend, no auth, no APIs.
