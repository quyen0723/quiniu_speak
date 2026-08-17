# quiniu_speak — Personal Bilingual TTS Reader

A minimal single-user Text-to-Speech reader (Vietnamese / English) with background
music mixing. Dán văn bản → nghe giọng AI + nhạc nền. Zero-cost, no SaaS bloat.

Design source of truth: [`docs/Hệ Thống TTS Cá Nhân.md`](docs/Hệ%20Thống%20TTS%20Cá%20Nhân.md).
Deployment overrides (Vercel + GitHub Pages) are documented in the project plan.

## Architecture

```
GitHub Pages (static frontend)  ──fetch + Bearer──►  Vercel Function (api/speech.ts)
  React + Vite + TS + Tailwind                            Node serverless
  IndexedDB cache (localForage)                           edge-tts-universal → Microsoft Edge TTS
  Web Audio API mixer                                     OpenAI-compatible /v1/audio/speech
  Token in localStorage (entered once)                    Bearer auth + CORS
```

- **Frontend** deploys to GitHub Pages (public repo, free).
- **Backend** is a single Vercel serverless function — no Docker, no DB, stateless.
- Edge-TTS has **no API key**; the Bearer token exists only to stop strangers from
  abusing the public endpoint and to future-proof for a paid provider.

## Repo layout

```
api/speech.ts              # Vercel function (OpenAI-compatible TTS proxy)
vercel.json                # routes + runtime config
frontend/                  # React + Vite app
  src/lib/                 # config, token, ttsClient, chunker, cache, audioQueue, mixer
  public/music/            # background music mp3s
.github/workflows/         # GitHub Pages deploy
```

## Setup (local dev)

### 1. Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local` (gitignored, never committed):
```
VITE_TTS_API_BASE=https://your-vercel-project.vercel.app
VITE_TTS_TOKEN=your-dev-only-token
```
> If the `.env.example` template is missing, create it from the block above.
> `VITE_TTS_API_BASE` is a public URL (safe to bundle). `VITE_TTS_TOKEN` is dev-only
> convenience — in production the token is entered via the in-app **TokenPrompt**
> and stored in `localStorage`; it is **never** baked into the static bundle.

```bash
npm run dev    # http://localhost:5173/quiniu_speak/
npm run build  # outputs frontend/dist
```

### 2. Backend function (Vercel)
```bash
npm install   # at repo root — installs edge-tts-universal for the function
```
Import the repo into Vercel (Root Directory = repo root). Set env vars:
- `TTS_BEARER_TOKEN` = `openssl rand -hex 32` (64-hex secret)
- `TTS_ALLOWED_ORIGIN` = `https://quyen0723.github.io, http://localhost:5173`

Acceptance test:
```bash
curl -X POST https://<vercel-project>.vercel.app/v1/audio/speech \
  -H "Authorization: Bearer <TTS_BEARER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"model":"tts-1","input":"Xin chào","voice":"vi-VN-HoaiMyNeural"}' \
  --output test.mp3
```

## Deployment
- **Frontend → GitHub Pages**: push to `main` (under `frontend/`) triggers
  `.github/workflows/deploy-frontend.yml` (builds Vite, copies `index.html`→`404.html`,
  publishes `frontend/dist`).
  1. Enable in repo Settings → Pages → Source: **GitHub Actions**.
  2. Add a repository **variable** (NOT a secret — the value is public) at
     Settings → Secrets and variables → Actions → Variables:
     `VITE_TTS_API_BASE` = `https://<your-vercel-project>.vercel.app`
  3. App URL: `https://quyen0723.github.io/quiniu_speak/`
- **Function → Vercel**: auto-deploys on push to `main`.

## Background music
Drop mp3 files into `frontend/public/music/` (gitignored? no — committed, but they are
your own royalty-free tracks). The app references `lofi-1.mp3` and `piano-1.mp3` by
default; edit `MUSIC_TRACKS` in `frontend/src/App.tsx` to add more. If a file is
missing, the music player fails silently (no crash).

## License note
`edge-tts-universal` is AGPL-3.0. This repo is public, so source disclosure is satisfied.