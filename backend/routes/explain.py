from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from schemas.explain import ExplainRequest
from services import ai_service

router = APIRouter(prefix="/explain", tags=["Explanation"])


@router.post("/")
def explain(request: ExplainRequest) -> StreamingResponse:
    return StreamingResponse(
        ai_service.stream_explanation(
            customer_profile=request.customer.model_dump(),
            label=request.prediction.label,
            confidence=request.prediction.confidence,
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
