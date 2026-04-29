import os
from google import genai
from google.genai import types

# new google-genai SDK uses Client, not genai.configure()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

_MODEL = "gemini-2.5-flash"

_EXPLAIN_SYSTEM = (
    "You are an AI assistant helping bank agents understand ML model predictions. "
    "Explain in 3-5 plain English sentences why this customer received this prediction, "
    "referencing specific features from their profile. Do not use ML jargon. "
    "Write as if explaining to a non-technical bank employee. Be direct and specific."
)

_CHAT_SYSTEM_TEMPLATE = (
    "You are a sales strategy advisor helping a bank agent prepare for a call. "
    "Answer questions concisely and practically. Focus on actionable advice. "
    "Keep responses under 150 words unless the question demands more.\n"
    "Customer context: {customer_profile}\n"
    "Prediction: {label} with {confidence}% confidence."
)


def stream_explanation(customer_profile: dict, label: str, confidence: float):
    prompt = (
        f"Customer profile: {customer_profile}\n"
        f"Prediction: {label} (confidence: {confidence}%)\n"
        "Explain why this customer received this prediction."
    )
    try:
        # new SDK: client.models.generate_content_stream() instead of model.generate_content(stream=True)
        for chunk in client.models.generate_content_stream(
            model=_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(system_instruction=_EXPLAIN_SYSTEM),
        ):
            if chunk.text:
                yield f"data: {chunk.text}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"


def stream_chat(customer_profile: dict, label: str, confidence: float, messages: list):
    system_instruction = _CHAT_SYSTEM_TEMPLATE.format(
        customer_profile=customer_profile,
        label=label,
        confidence=confidence,
    )

    # Convert OpenAI-style messages to Gemini history format.
    # Gemini uses "model" where OpenAI uses "assistant".
    # All messages except the last become history; the last is sent now.
    history = [
        types.Content(
            role="model" if msg["role"] == "assistant" else msg["role"],
            parts=[types.Part(text=msg["content"])],
        )
        for msg in messages[:-1]
    ]
    last_message = messages[-1]["content"]

    try:
        # new SDK: client.chats.create() instead of model.start_chat()
        chat = client.chats.create(
            model=_MODEL,
            config=types.GenerateContentConfig(system_instruction=system_instruction),
            history=history,
        )
        # new SDK: chat.send_message_stream() instead of chat.send_message(stream=True)
        for chunk in chat.send_message_stream(last_message):
            if chunk.text:
                yield f"data: {chunk.text}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"
