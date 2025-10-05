from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では、より具体的なオリジンを指定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Problem(BaseModel):
    id: int
    text: str
    explanation: str
    tags: List[str]

class CreateProblem(BaseModel):
    text: str
    explanation: str
    tags: List[str]


problems = [
    {
        "id": 1,
        "text": "x^2 + 2x + 1 = 0 を解け",
        "explanation": "解は x = -1",
        "tags": ["二次方程式"],
    },
    {
        "id": 2,
        "text": "3の2乗は？",
        "explanation": "答えは9",
        "tags": ["算数", "平方根"],
    }
]

@app.get("/api", response_model=List[Problem])
def get_problems():
    return problems

@app.post("/api", response_model=Problem)
def add_problem(problem: CreateProblem):
    new_id = max(p["id"] for p in problems) + 1 if problems else 1
    new_problem = {"id": new_id, **problem.dict()}
    problems.append(new_problem)
    return new_problem

@app.post("/api/upload")
def upload_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # 本来ならここでファイル保存処理をする
    return {
        "message": "ファイルを受け取りました",
        "filename": file.filename,
        "size": file.size,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
