from pydantic import BaseModel
from schemas.customer import CustomerInput
from schemas.prediction import PredictionResult


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    customer: CustomerInput
    prediction: PredictionResult
    messages: list[ChatMessage]
