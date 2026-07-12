FROM python:3.11-slim

WORKDIR /app

RUN pip install uv --no-cache-dir

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-cache

COPY backend/ ./backend/
COPY backend/alembic.ini ./
COPY backend/alembic/ ./alembic/

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
