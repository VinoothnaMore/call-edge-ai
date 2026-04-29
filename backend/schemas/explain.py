from pydantic import BaseModel
from schemas.customer import CustomerInput
from schemas.prediction import PredictionResult


class ExplainRequest(BaseModel):
    customer: CustomerInput
    prediction: PredictionResult
