import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You convert unstructured civic complaints into structured JSON.

Extract these fields:
- category: One of [Road Damage, Streetlight, Water Supply, Drainage, Waste Management, Public Safety, Other]
- sub_category: Specific type (e.g., "Pothole", "Broken Streetlight")
- location: Landmark or street mentioned
- duration: How long it's existed (e.g., "2 weeks", "unknown")
- severity: Integer 1-5 (5 = life-threatening, 1 = cosmetic)
- department: One of [Public Works, Electricity Board, Water Board, Sanitation, Traffic Police, Other]
- summary: One-line clean summary

Rules:
- Missing info → use "unknown"
- Severity must reflect urgency and danger
- ALWAYS return valid JSON, no markdown, no explanation
"""

def triage_complaint(raw_text: str) -> dict:
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": raw_text},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(response.choices[0].message.content)


if __name__ == "__main__":
    test = "Massive pothole near banyan tree on MG Road, almost crashed my bike today."
    print(json.dumps(triage_complaint(test), indent=2))