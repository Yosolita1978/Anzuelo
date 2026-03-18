import json
import re
import anthropic
from .prompts import PROMPTS
from storage.db import get_brand_prompt

_client = anthropic.Anthropic()

_prompt_cache: dict[str, str] = {}


def _extract_json(text: str) -> str:
    """Strip markdown code fences if present."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()


def _get_prompt(brand: str) -> str:
    if brand in _prompt_cache:
        return _prompt_cache[brand]

    # Try DB first, fallback to local prompts dict
    prompt = get_brand_prompt(brand)
    if not prompt:
        prompt = PROMPTS.get(brand)
    if not prompt:
        raise ValueError(f"No scoring prompt found for brand: {brand}")

    _prompt_cache[brand] = prompt
    return prompt


def score_lead(brand: str, content: str) -> dict:
    prompt = _get_prompt(brand)

    message = _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        system=[
            {
                "type": "text",
                "text": prompt,
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
