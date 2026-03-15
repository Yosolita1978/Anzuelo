import json
import re
import anthropic
from .prompts import PROMPTS

_client = anthropic.Anthropic()


def _extract_json(text: str) -> str:
    """Strip markdown code fences if present."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()


def score_lead(brand: str, content: str) -> dict:
    message = _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        system=[
            {
                "type": "text",
                "text": PROMPTS[brand],
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": content}],
    )

    raw = message.content[0].text if message.content else ""
    cleaned = _extract_json(raw)
    result = json.loads(cleaned)

    return {
        "score": int(result["score"]),
        "reason": str(result["reason"]),
        "suggested_reply": str(result["suggested_reply"]),
    }
