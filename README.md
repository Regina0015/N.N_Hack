# AI Wellness Coach (working title)

A personal AI coach that builds your gym routine around your sports, counts calories from a photo of your meal,
adapts training intensity to your daily energy and cycle, and keeps you motivated without guilt.

Built for the **Nebius × NVIDIA Global AI Hackathon** — *Personal AI* track.
Powered by **NVIDIA Nemotron** open models running on **Nebius Token Factory**.

> ⚠️ Not medical advice. This app does not replace a doctor or nutritionist.

## Architecture

```
Next.js (frontend/)  ──►  FastAPI (backend/)  ──►  Nebius Token Factory (NVIDIA Nemotron)
                                     │
                                     └──►  USDA FoodData Central · Open Food Facts · wger · Supabase  (planned)
```

| Part     | Stack                                   | Hosting (planned) |
|----------|-----------------------------------------|-------------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind | Vercel            |
| Backend  | Python 3.12, FastAPI, OpenAI-compatible SDK | Render            |
| AI       | Nemotron 3 Super (coach), Nemotron Nano 2 VL (food photos) | Nebius Token Factory |

## Run locally

Requirements: Node.js 20+, [uv](https://docs.astral.sh/uv/).

**Backend**

```bash
cd backend
cp .env.example .env      # add your NEBIUS_API_KEY and model IDs
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Without a key, the backend runs in **mock mode** and returns placeholder replies.

**Database**

- Default: a local SQLite file (`backend/data/dev.db`), created automatically.
- Supabase: set `DATABASE_URL` in `backend/.env` to the **Session pooler** URI (IPv4-compatible).
  The schema lives in `backend/supabase/migrations` and is applied by the Supabase GitHub integration
  (working directory `backend`) on push to `main`, or manually:

  ```bash
  cd backend
  npx supabase link --project-ref <project-ref>
  npx supabase db push
  ```

- Every table has Row Level Security enabled, so the public Data API cannot read it.

**Frontend**

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

## API

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| GET    | `/health`         | Status and whether mock mode is on |
| POST   | `/api/coach/chat` | `{ messages: [{role, content}] }` → `{ reply, mock }` |

## License

[MIT](LICENSE)
