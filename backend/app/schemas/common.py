from typing import Generic, TypeVar, Optional, Any, List, Dict
from pydantic import BaseModel, Field

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None
    request_id: Optional[str] = None

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1)
    total: int = Field(default=0, ge=0)
    total_pages: int = Field(default=1, ge=0)

def success_response(data: Any = None) -> Dict[str, Any]:
    return {"success": True, "data": data, "error": None}

def error_response(code: str, message: str, details: Any = None, request_id: Optional[str] = None) -> Dict[str, Any]:
    err: Dict[str, Any] = {
        "code": code,
        "message": message,
        "details": details
    }
    if request_id:
        err["request_id"] = request_id
    return {
        "success": False,
        "data": None,
        "error": err
    }
