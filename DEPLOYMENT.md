# Production Deployment Checklist (Vercel)

## Pre-flight (local)

- [ ] `npm install`
- [ ] `npm run check:deploy`
- [ ] `.env.example` reviewed

## GitHub

- [ ] Initial commit created
- [ ] Repository pushed to `main`
- [ ] GitHub repo connected in Vercel

## Vercel Project

- [ ] Framework = Next.js
- [ ] Install Command = `npm install`
- [ ] Build Command = `npm run build`
- [ ] Environment variable `NEYNAR_API_KEY` added (recommended)

## Domain

- [ ] Production domain points to `shevas.vercel.app` (or temporary `<project>.vercel.app`)

## Final QA (production URL)

- [ ] `/` homepage loads with animations and no layout shifts
- [ ] `/projects/crypto-dashboard`
- [ ] `/projects/ai-chat`
- [ ] `/projects/defi-analytics`
- [ ] `/projects/farcaster-widget`
- [ ] `/projects/telegram-bot`
- [ ] `/sitemap.xml`
- [ ] `/robots.txt`
- [ ] Open Graph preview is generated
