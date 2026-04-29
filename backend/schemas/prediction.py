from typing import Literal
from pydantic import BaseModel, Field, ConfigDict


class PredictionResult(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "label": "no",
                "confidence": 96.0,
            }
        }
    )

    label: Literal["yes", "no"] = Field(
        ...,
        description="Prediction: 'yes' = will subscribe to term deposit, 'no' = will not subscribe",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Probability of the predicted class as a percentage (0–100)",
    )
