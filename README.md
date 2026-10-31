# RadMap

RadMap is a Next.js frontend with a FastAPI backend, PostgreSQL persistence, and an optional Gemma-compatible analysis endpoint.

## Run with Docker Compose

1. Copy `.env.example` to `.env` and replace the example `POSTGRES_PASSWORD` with a strong local value. The checked-in `.env` contains only placeholders for this workspace; replace them before using it beyond local development. Keep the `.env` file local; it is ignored by Git.
2. Set `GEMMA_BASE_URL`, `GEMMA_MODEL`, and, if required by the provider, `GEMMA_API_KEY`. For a local Ollama OpenAI-compatible endpoint in Docker Desktop, `host.docker.internal` is used as the host.
3. Start the database and API:

   ```powershell
   docker compose up --build
   ```

4. In another terminal, configure and start the frontend:

   ```powershell
   Copy-Item frontend\.env.local.example frontend\.env.local
   Set-Location frontend
   npm install
   npm run dev
   ```

The UI is at `http://localhost:3000`, API documentation at `http://localhost:8001/docs`, and health check at `http://localhost:8001/health`. The API is published on host port `8001`, and PostgreSQL on host port `5434`, to avoid conflicts with existing local services. On first startup, the backend creates the tables and seeds clearly identified illustrative records. Tables are retained in the named PostgreSQL volume.

## Run the API without Docker

From the `RadMap` directory, start PostgreSQL and set `DATABASE_URL` in `.env`, then run:

```powershell
py -3.12 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8001
```

The API reads database and Gemma configuration from environment variables or the root `.env`. Gemma requests are proxied by the backend; the frontend never receives the provider key. `GEMMA_BASE_URL` should be an OpenAI-compatible API base URL ending in `/v1`; the backend sends requests to `/chat/completions`.

The workspace Python interpreter is configured to use `backend\.venv` so Pylance can resolve the API dependencies.

## API overview

- `GET /dashboard`, `/stations`, `/readings`, `/anomalies`, `/evidence`, `/analytics`, `/integrity`, `/settings`
- `POST /readings` to ingest a station observation (the API creates a baseline anomaly and evidence record if the reading is sufficiently elevated)
- `PATCH /anomalies/{id}` to persist a reviewer decision
- `PUT /settings` to persist workspace preferences
- `POST /integrity/run` and `PATCH /integrity/{id}` for checks and review status
- `POST /ai/analyze` to ask the configured Gemma model to analyze database evidence

Seeded measurements are illustrative only. Do not treat anomaly screening or AI output as a safety determination.
