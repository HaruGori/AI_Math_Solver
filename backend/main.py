import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.staticfiles import StaticFiles

from backend.config import get_settings
from backend.database import engine, Base
from backend.routers import problems, upload, tags
from backend.schemas.error import ErrorResponse
from backend.services.ai_service import AIGenerationError
from backend.models import Problem, Tag

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="AI Math Solver API",
    description="数学問題の解説を作成・管理するAPI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静的ファイルの配信設定
app.mount("/static", StaticFiles(directory="backend/static"), name="static")


@app.on_event("startup")
def run_migrations():
    """アプリ起動時に未適用のマイグレーションを実行する"""
    import os
    from alembic.config import Config as AlembicConfig
    from alembic.command import upgrade as alembic_upgrade

    alembic_ini = os.path.join(os.path.dirname(__file__), "alembic.ini")
    alembic_cfg = AlembicConfig(alembic_ini)
    alembic_upgrade(alembic_cfg, "head")
    logger.info("Alembic migrations applied successfully")


# =============================================
# グローバル例外ハンドラー
# =============================================

@app.exception_handler(AIGenerationError)
async def ai_generation_error_handler(request: Request, exc: AIGenerationError):
    return JSONResponse(
        status_code=503,
        content=ErrorResponse(
            error=exc.code,
            message=exc.message,
            retry_after=exc.retry_after,
        ).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error="VALIDATION_ERROR",
            message="入力値が不正です。",
            detail=str(exc.errors()),
        ).model_dump(),
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error="HTTP_ERROR",
            message=str(exc.detail),
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = str(uuid.uuid4())[:8]
    logger.exception("Unhandled exception [req=%s] %s: %s", request_id, type(exc).__name__, exc)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="INTERNAL_SERVER_ERROR",
            message="サーバー内部でエラーが発生しました。",
            detail=f"Request ID: {request_id}",
        ).model_dump(),
    )


# ルーターの登録
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
app.include_router(tags.router, prefix="/api", tags=["tags"])
app.include_router(upload.router, prefix="/api", tags=["upload"])


@app.get("/")
def root():
    return {
        "message": "AI Math Solver API",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
