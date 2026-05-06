# CallEdge — Bank Marketing Predictor

A full-stack AI tool that helps bank agents predict whether a customer will subscribe to a term deposit, then explains *why* and coaches the agent before the call.

---

## What it does

1. **Predict** — Enter a customer profile; a trained ML model returns a yes/no prediction with a confidence score.
2. **Explain** — A streaming AI explanation translates the model's reasoning into plain English for non-technical agents.
3. **Chat** — An AI sales advisor answers follow-up questions about how to approach the customer, grounded in the prediction context.

---

## Tech stack

| Area | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Axios |
| **Backend API** | Python, FastAPI, Uvicorn |
| **ML model** | scikit-learn (pre-trained, loaded via joblib) |
| **AI / LLM** | Google Gemini 2.5 Flash (`google-genai` SDK), streamed via Server-Sent Events |
| **Validation** | Pydantic v2 |
| **Deployment** | Frontend → Vercel · Backend → Render |

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/predict` | Returns `{ label, confidence }` |
| `GET` | `/explain` | SSE stream — plain-English model explanation |
| `GET/POST` | `/chat` | SSE stream — sales advisor chat |
| `GET` | `/health` | Health check |

---

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | backend `.env` | Required for explain & chat features |
| `FRONTEND_URL` | backend `.env` | Extra CORS origin (optional, for custom deployments) |
| `VITE_API_URL` | frontend `.env` | Backend base URL |

> Without `GEMINI_API_KEY` the app still predicts, but the explanation and chat features return an error.

---

## Customer input fields

The model accepts 16 fields matching the [UCI Bank Marketing dataset](https://archive.ics.uci.edu/ml/datasets/bank+marketing): `age`, `job`, `marital`, `education`, `default`, `balance`, `housing`, `loan`, `contact`, `day`, `month`, `duration`, `campaign`, `pdays`, `previous`, `poutcome`.

Set `pdays = 999` to indicate the customer was never previously contacted.
