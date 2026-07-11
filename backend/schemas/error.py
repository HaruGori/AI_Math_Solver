from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error: str
    message: str
    detail: str | None = None
    retry_after: int | None = None
