from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from schemas.chat import ChatRequest
from services import ai_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/")
def chat(request: ChatRequest) -> StreamingResponse:
    return StreamingResponse(
        ai_service.stream_chat(
            customer_profile=request.customer.model_dump(),
            label=request.prediction.label,
            confidence=request.prediction.confidence,
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
