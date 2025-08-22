# AI 360 Career Chatbot — Demo (Next.js)

A demo-ready project: smooth UX, no external DB, profile-aware roadmaps, and a chatbot that performs local RAG over your provided datasets. Optionally plug in Gemini 1.5 Pro for higher-quality generation.

## Quick start

```bash
npm install
# Optional
echo "GEMINI_API_KEY=your_key_here" > .env.local

npm run dev
# Open http://localhost:5050
```

## What’s included

- Next.js 14 + Tailwind
- Onboarding → Dashboard with roadmap → Chat
- Local RAG over `data/seeds/*.txt` (no DB)
- Optional Gemini integration (install `@google/generative-ai` and set `GEMINI_API_KEY`)

## Add your own knowledge
Drop more `.txt` files into `data/seeds/`. The loader picks them up automatically.
