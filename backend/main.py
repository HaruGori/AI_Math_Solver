from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_settings
from backend.database import engine, Base
from backend.routers import problems, upload
from backend import models

settings = get_settings()

app = FastAPI(
    title="AI Math Solver API",
    description="数学問題の解説を作成・管理するAPI",
    version="1.0.0"
)

# CORS設定
# TODO: Use more specific origins from settings in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Create all tables
    Base.metadata.create_all(bind=engine)

# ルーターの登録
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
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
