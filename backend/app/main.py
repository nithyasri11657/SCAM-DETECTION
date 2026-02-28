from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import datetime

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# PHASE 1: History Storage
# ----------------------------
analysis_history = []

# ----------------------------
# PHASE 2: ML Model (DistilBERT)
# ----------------------------
classifier = pipeline("text-classification", model="distilbert-base-uncased")

# ----------------------------
# Root Endpoint
# ----------------------------
@app.get("/")
def root():
    return {"message": "AI Scam Detection Backend Running 🚀"}

# ----------------------------
# Analyze Endpoint (HYBRID + DETAILED REASON)
# ----------------------------
@app.post("/api/v1/analyze")
def analyze(data: dict):
    text = data.get("text", "")
    text_lower = text.lower()

    # Rule-Based Detection
    scam_keywords = [
        "win", "won", "lottery", "prize", "urgent",
        "click here", "free", "claim", "limited offer", "otp"
    ]

    detected_words = [word for word in scam_keywords if word in text_lower]
    keyword_score = len(detected_words)
    rule_confidence = min(keyword_score * 0.15, 0.95)

    # ML Prediction
    try:
        ml_result = classifier(text)[0]
        ml_label = ml_result["label"]
        ml_score = ml_result["score"]
    except:
        ml_label = "UNKNOWN"
        ml_score = 0.5

    # Hybrid Decision Logic
    if keyword_score > 0 or ml_score > 0.7:
        risk = "SCAM"
        confidence = max(rule_confidence, ml_score)

        if detected_words:
            reason = f"Detected suspicious keywords: {', '.join(detected_words)}"
        else:
            reason = f"AI model flagged message with confidence {round(ml_score,2)}"

    else:
        risk = "SAFE"
        confidence = 0.85
        reason = "No significant scam indicators detected"

    result = {
        "risk": risk,
        "confidence": round(confidence, 2),
        "reason": reason,
        "timestamp": str(datetime.datetime.now())
    }

    # Store History
    analysis_history.append(result)

    return result


# ----------------------------
# History Endpoint
# ----------------------------
@app.get("/api/v1/history")
def get_history():
    return analysis_history