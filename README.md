# SHEVAS Portfolio

A high-end portfolio website for **SHEVAS** — _AI-Powered Web3 Builder_.

Built with a dark neon visual language, rich motion design, and interactive project showcases focused on AI, Web3, and DeFi.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** (scroll/hover/transitions)
- **Three.js + React Three Fiber + Drei** (3D hero effects)
- **Recharts** (data visualizations)
- **React Markdown + highlight.js** (AI chat markdown/code rendering)

## Key Features

- Cinematic hero with particle constellation + glitch/typewriter effects
- Custom cursor, smooth scrolling, magnetic buttons, and micro-interactions
- Bento-grid projects section with animated previews
- Dedicated pages for 5 showcase projects:
  - Crypto Dashboard
  - AI Chat Interface
  - DeFi Analytics
  - Farcaster Widget
  - Telegram Bot Landing
- SEO-ready metadata setup:
  - dynamic Open Graph / Twitter image routes
  - sitemap and robots routes
  - app icon and apple icon routes
- Mobile-first responsive behavior with touch-safe animation fallbacks
- GitHub Actions preflight workflow (`npm run check:deploy` on push/PR to `main`)
- Production smoke route checks (`npm run smoke:routes`) before deploy, including `/api/health`
- Post-deploy production verifier (`npm run verify:production -- --url=https://...`) for routes + `/api/health`
- Manual GitHub Actions workflow `Production Verify` for post-deploy QA (URL input + retry controls)
- Deploy readiness report (`npm run status:deploy`) with git/remote/workflow/file checks before handoff

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev                 # start local dev server
npm run build               # production build
npm run start               # start production server
npm run lint                # run lint checks
npm run status:deploy       # deployment readiness report (git/files/workflows)
npm run smoke:routes        # local production smoke checks for critical routes
npm run verify:production   # verify deployed URL routes + content types
```

## Project Structure

```text
src/
  app/                # routes, layout, metadata/image routes
  components/
    providers/        # client providers (cursor, smooth scroll)
    sections/         # homepage sections
    projects/         # dedicated project showcase UIs
    three/            # 3D scene/particle components
    ui/               # reusable UI primitives
  hooks/              # custom hooks
  lib/                # typed data layers and constants
```

## Deployment (Vercel)

### 0) Check deployment readiness snapshot

```bash
npm run status:deploy
```

This report validates git branch/clean state, remote tracking, deploy scripts, and required workflow/config files.

### 1) Push repository to GitHub

```bash
git add .
git commit -m "feat: portfolio launch"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 2) Import into Vercel

1. Open [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build` (already set in `vercel.json`)
5. Install command: `npm install` (already set in `vercel.json`)

### 3) Configure environment variables

In **Project Settings → Environment Variables** add:

- `NEYNAR_API_KEY` (recommended for stable Farcaster widget data)

You can copy the variable list from `.env.example`.

### 4) Domain setup

- Default production domain target: `shevas.vercel.app`
- If unavailable, use `<project>.vercel.app` temporarily and later attach a custom domain

### 5) Pre-deploy check

```bash
npm run check:deploy
```

`check:deploy` runs `lint + build + smoke:routes` (critical route checks, including `/api/health`, against a local production server).

If this passes locally, Vercel auto-deploy from `main` is ready.

### 6) Post-deploy verification

After the project is live, run:

```bash
npm run verify:production -- --url=https://shevas.vercel.app --attempts=5 --retry-delay-ms=6000 --initial-delay-ms=15000
```

`verify:production` validates production endpoints (`/`, `/projects/*`, `/api/health`, `/sitemap.xml`, `/robots.txt`, OG/Twitter images), status codes, content-type markers, and supports retries for fresh deploy warm-up windows.

You can also run the same verification from GitHub Actions via `.github/workflows/production-verify.yml` (workflow: **Production Verify**).

CI guardrails included:
- `.github/workflows/deploy-preflight.yml` — runs `check:deploy` on every push/PR to `main`
- `.github/workflows/production-verify.yml` — manual post-deploy verification with URL input + retry controls
