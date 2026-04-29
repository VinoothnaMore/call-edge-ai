import os
from dotenv import load_dotenv
load_dotenv()

if os.getenv("GEMINI_API_KEY"):
    print("GEMINI_API_KEY loaded.")
else:
    print("WARNING: GEMINI_API_KEY is not set — AI explanation features will be unavailable.")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.health import router as health_router
from routes.predict import router as predict_router
from routes.explain import router as explain_router
from routes.chat import router as chat_router

app = FastAPI(
    title="CallEdge API",
    description="Bank Marketing Predictor with AI Explanation Engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(predict_router)
app.include_router(explain_router)
app.include_router(chat_router)


@app.get("/", tags=["Root"])
def root() -> dict:
    return {
        "app": "CallEdge API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }
