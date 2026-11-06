"""FastAPI transport layer for the local Red Flag Radar detector."""

from typing import Any, Literal, Optional, Union

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .engine import MAX_MESSAGES, MAX_TEXT_LENGTH, analyze


class MessageInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    timestamp: Optional[str] = Field(None, max_length=80)


class AnalyzeRequest(BaseModel):
    mode: Literal["single", "conversation", "url"]
    message: Optional[str] = Field(None, max_length=MAX_TEXT_LENGTH)
    messages: Optional[list[Union[MessageInput, str]]] = Field(None, max_items=MAX_MESSAGES)
    url: Optional[str] = Field(None, max_length=MAX_TEXT_LENGTH)


class Evidence(BaseModel):
    code: str
    messageIndex: Optional[int] = None
    text: str
    explanation: str


class MessageFinding(BaseModel):
    messageIndex: int
    riskScore: int
    riskLevel: Literal["Low", "Medium", "High"]
    evidence: list[Evidence]


class Pattern(BaseModel):
    code: str
    message: str


class ChecklistItem(BaseModel):
    id: str
    title: str
    why: str
    completed: bool = False


class AnalysisResponse(BaseModel):
    riskScore: int
    riskLevel: Literal["Low", "Medium", "High"]
    summary: str
    evidence: list[Evidence]
    messageFindings: list[MessageFinding]
    patterns: list[Pattern]
    recommendations: list[str]
    verificationChecklist: list[ChecklistItem]


app = FastAPI(
    title="Red Flag Radar Detection Service",
    description="Local, explainable warning-sign analysis. Scores are heuristic estimates, not probabilities.",
    version="0.1.0",
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Avoid reflecting user-submitted message/URL values in validation errors."""
    return JSONResponse(status_code=422, content={"detail": "Invalid request. Check the mode, content, and input size."})


@app.get("/health")
def health() -> dict[str, str]:
    """Return service status without accepting or exposing submitted content."""
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
def analyze_route(request: AnalyzeRequest) -> dict[str, Any]:
    """Validate an analysis request and return structured rule findings."""
    payload = request.model_dump() if hasattr(request, "model_dump") else request.dict()
    # Normalize conversation entries while preserving their submitted order.
    if payload.get("messages") is not None:
        payload["messages"] = [
            item.get("text") if isinstance(item, dict) else item
            for item in payload["messages"]
        ]
    try:
        return analyze(payload)
    except ValueError as exc:
        # Error messages describe the bad field/rule, not the submitted content.
        raise HTTPException(status_code=422, detail=str(exc)) from None
