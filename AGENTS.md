# AI Math Solver — AGENTS.md

## Project structure

Monorepo: `frontend/` (Next.js 14 + React 19) + `backend/` (FastAPI + SQLAlchemy).

## Commands

### Backend (uv)
```bash
cd backend && uv sync          # install deps + create .venv
source .venv/bin/activate
uv run python -m pytest tests/ -v    # single run (matches CI)
uv run pytest tests/test_foo.py -v   # single file
uv run uvicorn backend.main:app --reload --port 8000
```

Env file: `backend/.env.local`. CI uses `DATABASE_URL=sqlite:///test.db`.

### Frontend (pnpm)
```bash
cd frontend
pnpm install --frozen-lockfile  # ci / fresh clone
pnpm dev                        # http://localhost:3001 (AUTH_URL baked into script)
pnpm test                       # vitest run
pnpm exec biome ci .            # lint+format check (CI)
pnpm run biome                  # lint+format+organizeImports --write
pnpm build                      # standalone output (output: "standalone" in next.config.js)
```

Env file: `frontend/.env.local`.

### Docker Compose
```bash
docker compose up -d            # production: postgres + backend(:8001) + frontend(:3000)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d  # dev with hot-reload
docker compose down -v
```
Root `.env` supplies `POSTGRES_PASSWORD`, `OPENROUTER_API_KEY`, `NEXTAUTH_SECRET`.

## Key conventions

- **Gitmoji commits**: `<emoji> <Japanese message> (#<issue>)` — e.g. `✨ Add feature (#5)`, `🐛 Fix bug (#8)`. Message in Japanese, emoji prefix in English.
- **Frontend Biome**: tab indent, double quotes, organises imports on save. `components/ui/` has relaxed a11y rules (shadcn/ui components).
- **Pre-commit hook** (`.husky/pre-commit`): runs `pnpm install` then stages `pnpm-lock.yaml`.
- **TypeScript path alias**: `@/` → `frontend/`.
- **shadcn/ui** components in `components/ui/` — regenerate via `pnpm dlx shadcn@latest add <name>`.

### Dev Container
`.devcontainer/` — open the repo root in VS Code/Cursor to auto-build and attach. Requires Docker Compose (db, backend, frontend also start via compose).

## Architecture notes

- **Backend entrypoint**: `backend/main.py`. Alembic migrations run **on app startup** (`@app.on_event("startup")`), not via CLI.
- **Backend package layout**: `backend/` is a Python package (`__init__.py`). `backend/models/`, `backend/schemas/`, `backend/routers/` are sub-packages. `backend/backend/static/` serves uploaded files at `/static`.
- **Settings**: `backend/config.py` uses pydantic-settings with `@lru_cache` singleton. Loads from `backend/.env.local`.
- **DB session**: `backend/database.py` — `SessionLocal()` factory + `get_db()` generator for FastAPI dependency injection.
- **AI logic** in `backend/services/ai_service.py` (OpenRouter via tenacity retry with exponential backoff).
- **Frontend API layer** in `lib/api.ts` — timeout (30s) + retry (3x, GET only via exponential backoff). NO retry for POST/PUT/DELETE.
- **Auth**: NextAuth v5 beta with Google provider (`auth.ts`). `middleware.ts` protects `/problems`, `/upload` routes. `app/api/auth/[...nextauth]/` handles auth endpoints.

## Testing quirks

- Backend tests auto-set `DATABASE_URL=sqlite:///...` in `conftest.py` — no external DB needed. A `test_api.db` file is created and cleaned up per test run.
- CI sets `PYTHONPATH: ${{ github.workspace }}` and runs tests via `uv run python -m pytest tests/ -v`.
- Frontend tests use vitest + jsdom + @testing-library/react. Setup in `vitest.setup.ts`.
- Frontend fixtures in `lib/__tests__/` and `lib/mock-data.ts`.

## CI pipeline (`.github/workflows/ci.yml`)

Triggered on push/PR to `main`. Three parallel jobs:
1. **backend**: uv sync → `uv run python -m pytest tests/ -v`
2. **frontend**: pnpm install → `pnpm exec biome ci .` → `pnpm test` → `pnpm build`
3. **docker**: `docker compose build` → `docker compose up -d` → health checks → `docker compose down -v`

## Issue workflow

1. Branch name: `feature/<issue_number>`. Create from the current branch and start working.
2. During work, log every command, its output, your reasoning, choices made, and why. This goes into the PR body later.
3. After implementation, create a PR.
4. After creating the PR, self-review for **redundancy, performance, test coverage, and readability**.
5. If no issues remain, merge the PR and close the corresponding issue.
