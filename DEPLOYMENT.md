# Production Deployment Checklist (Vercel)

## Pre-flight (local)

- [ ] `npm install`
- [ ] `npm run status:deploy` (git/remote/workflow/config readiness snapshot)
- [ ] `npm run check:deploy` (lint + build + smoke route checks)
- [ ] `.env.example` reviewed

`status:deploy` should pass without ❌ failures; ⚠️ warnings are actionable hints (for example, missing `origin` remote before first push).

## CI Guardrail

- [x] GitHub Actions preflight workflow added: `.github/workflows/deploy-preflight.yml`
- [x] Push/PR to `main` runs `npm run check:deploy` automatically
- [x] Manual post-deploy verifier workflow added: `.github/workflows/production-verify.yml`

## Automated Smoke Coverage

- [x] `npm run smoke:routes` boots production build locally and checks key routes:
  - `/`
  - `/projects/*`
  - `/api/health`
  - `/sitemap.xml`
  - `/robots.txt`
  - `/opengraph-image`
  - `/twitter-image`

## GitHub

- [x] Initial commit created (`60038a7`, `f0b0585`)
- [x] Origin bootstrap helper added (`npm run connect:origin -- --url=... --push`)
- [ ] Repository pushed to `main`
- [ ] GitHub repo connected in Vercel

Quick command once repo URL is known:

```bash
npm run connect:origin -- --url=https://github.com/<your-username>/<repo-name>.git --push
```

## Vercel Project

- [ ] Framework = Next.js
- [ ] Install Command = `npm install`
- [ ] Build Command = `npm run build`
- [ ] Environment variable `NEYNAR_API_KEY` added (recommended)

## Domain

- [ ] Production domain points to `shevas.vercel.app` (or temporary `<project>.vercel.app`)

## Automated Production Verification

- [ ] `npm run verify:production -- --url=https://<production-domain> --attempts=5 --retry-delay-ms=6000 --initial-delay-ms=15000`
- [ ] Or run GitHub Actions workflow **Production Verify** (`.github/workflows/production-verify.yml`) with `production_url` input
- [ ] Verifier passes on all critical endpoints (`/`, `/projects/*`, `/api/health`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/twitter-image`)

## Final QA (production URL)

- [ ] `/` homepage loads with animations and no layout shifts
- [ ] `/projects/crypto-dashboard`
- [ ] `/projects/ai-chat`
- [ ] `/projects/defi-analytics`
- [ ] `/projects/farcaster-widget`
- [ ] `/projects/telegram-bot`
- [ ] `/api/health`
- [ ] `/sitemap.xml`
- [ ] `/robots.txt`
- [ ] Open Graph + Twitter previews are generated
