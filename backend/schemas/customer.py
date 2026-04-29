from typing import Literal
from pydantic import BaseModel, Field, ConfigDict


class CustomerInput(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "age": 41,
                "job": "management",
                "marital": "married",
                "education": "secondary",
                "default": "no",
                "balance": 1500,
                "housing": "yes",
                "loan": "no",
                "contact": "cellular",
                "day": 15,
                "month": "may",
                "duration": 150,
                "campaign": 1,
                "pdays": 999,
                "previous": 0,
                "poutcome": "unknown",
            }
        }
    )

    age: int = Field(..., description="Age of the customer in years")
    job: Literal[
        "admin.", "blue-collar", "entrepreneur", "housemaid",
        "management", "retired", "self-employed", "services",
        "student", "technician", "unemployed", "unknown",
    ] = Field(..., description="Type of job")
    marital: Literal["divorced", "married", "single"] = Field(..., description="Marital status")
    education: Literal["primary", "secondary", "tertiary", "unknown"] = Field(..., description="Education level")
    default: Literal["yes", "no"] = Field(..., description="Has credit in default?")
    balance: int = Field(..., description="Average yearly bank balance in euros (can be negative)")
    housing: Literal["yes", "no"] = Field(..., description="Has housing loan?")
    loan: Literal["yes", "no"] = Field(..., description="Has personal loan?")
    contact: Literal["cellular", "telephone", "unknown"] = Field(..., description="Contact communication type")
    day: int = Field(..., ge=1, le=31, description="Last contact day of the month (1–31)")
    month: Literal[
        "jan", "feb", "mar", "apr", "may", "jun",
        "jul", "aug", "sep", "oct", "nov", "dec",
    ] = Field(..., description="Last contact month of year")
    duration: int = Field(..., ge=0, description="Last contact duration in seconds")
    campaign: int = Field(..., ge=1, description="Number of contacts performed during this campaign")
    pdays: int = Field(..., description="Days since last contact from a previous campaign (999 = never contacted)")
    previous: int = Field(..., ge=0, description="Number of contacts performed before this campaign")
    poutcome: Literal["failure", "other", "success", "unknown"] = Field(
        ..., description="Outcome of the previous marketing campaign"
    )
