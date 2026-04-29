from pathlib import Path
import joblib
import numpy as np

_MODEL_DIR = Path(__file__).resolve().parent.parent / "model"

model = joblib.load(_MODEL_DIR / "model.pkl")
scaler = joblib.load(_MODEL_DIR / "scaler.pkl")

FEATURE_COLUMNS = [
    "age",
    "balance",
    "day",
    "previous",
    "job_admin.",
    "job_blue-collar",
    "job_entrepreneur",
    "job_housemaid",
    "job_management",
    "job_retired",
    "job_self-employed",
    "job_services",
    "job_student",
    "job_technician",
    "job_unemployed",
    "marital_divorced",
    "marital_married",
    "marital_single",
    "education_primary",
    "education_secondary",
    "education_tertiary",
    "default_no",
    "default_yes",
    "housing_no",
    "housing_yes",
    "loan_no",
    "loan_yes",
    "contact_cellular",
    "contact_telephone",
    "contact_unknown",
    "poutcome_failure",
    "poutcome_other",
    "poutcome_success",
    "poutcome_unknown",
    "has_contacted_True",
]

_JOB_CATS = [
    "admin.", "blue-collar", "entrepreneur", "housemaid", "management",
    "retired", "self-employed", "services", "student", "technician", "unemployed",
]
_MARITAL_CATS = ["divorced", "married", "single"]
_EDUCATION_CATS = ["primary", "secondary", "tertiary"]
_DEFAULT_CATS = ["no", "yes"]
_HOUSING_CATS = ["no", "yes"]
_LOAN_CATS = ["no", "yes"]
_CONTACT_CATS = ["cellular", "telephone", "unknown"]
_POUTCOME_CATS = ["failure", "other", "success", "unknown"]


def _encode(raw: dict) -> dict:
    """Convert a raw CustomerInput dict to the 35-column binary feature dict."""
    encoded: dict = {
        "age": raw["age"],
        "balance": raw["balance"],
        "day": raw["day"],
        "previous": raw["previous"],
    }
    for cat in _JOB_CATS:
        encoded[f"job_{cat}"] = 1 if raw["job"] == cat else 0
    for cat in _MARITAL_CATS:
        encoded[f"marital_{cat}"] = 1 if raw["marital"] == cat else 0
    for cat in _EDUCATION_CATS:
        encoded[f"education_{cat}"] = 1 if raw["education"] == cat else 0
    for cat in _DEFAULT_CATS:
        encoded[f"default_{cat}"] = 1 if raw["default"] == cat else 0
    for cat in _HOUSING_CATS:
        encoded[f"housing_{cat}"] = 1 if raw["housing"] == cat else 0
    for cat in _LOAN_CATS:
        encoded[f"loan_{cat}"] = 1 if raw["loan"] == cat else 0
    for cat in _CONTACT_CATS:
        encoded[f"contact_{cat}"] = 1 if raw["contact"] == cat else 0
    for cat in _POUTCOME_CATS:
        encoded[f"poutcome_{cat}"] = 1 if raw["poutcome"] == cat else 0
    # pdays == 999 means the customer was never contacted before this campaign
    encoded["has_contacted_True"] = 1 if raw["pdays"] != 999 else 0
    return encoded


def predict(features: dict) -> dict:
    try:
        encoded = _encode(features)
        vector = np.array([[encoded[col] for col in FEATURE_COLUMNS]], dtype=float)
        scaled = scaler.transform(vector)
        prediction = int(model.predict(scaled)[0])
        proba = model.predict_proba(scaled)[0]
        confidence = round(float(proba[prediction]) * 100, 2)
        label = "yes" if prediction == 1 else "no"
        return {"label": label, "confidence": confidence}
    except Exception as exc:
        raise RuntimeError(f"Prediction failed: {exc}") from exc
