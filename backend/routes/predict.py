from fastapi import APIRouter, HTTPException
from schemas.customer import CustomerInput
from schemas.prediction import PredictionResult
from services import ml_service

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("/", response_model=PredictionResult)
def predict(customer: CustomerInput) -> PredictionResult:
    try:
        result = ml_service.predict(customer.model_dump())
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return PredictionResult(**result)
