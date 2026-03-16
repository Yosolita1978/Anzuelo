import json
import re
import anthropic
from storage.db import save_opportunity

_client = anthropic.Anthropic()

_SYSTEM_PROMPT = """You are a content strategist analyzing social media conversations to find content gaps.
Identify recurring gaps — unanswered questions, unresolved frustrations, or topics where useful content is missing.
For each gap, suggest a specific piece of content that serves the audience AND naturally introduces the product without being spammy.
Respond ONLY with valid JSON array, no markdown, no preamble:
[{"gap_summary": "...", "suggested_content": "...", "suggested_format": "..."}]
Valid formats: bluesky_thread, reddit_post, youtube_short, linkedin_post, mastodon_post, threads_post"""


def analyze_gaps(
    brand: str,
    display_name: str,
    posts: list[dict],
    platforms_used: list[str],
) -> None:
    if len(posts) < 5:
        print(f"  [gaps] Skipping {brand} — only {len(posts)} posts (need at least 5)")
        return

    numbered = []
    for i, post in enumerate(posts[:30], 1):
        truncated = (post.get("content") or "")[:200]
        platform = post.get("platform", "unknown")
        numbered.append(f"{i}. [{platform}] {truncated}")
    posts_list = "\n".join(numbered)

    user_message = f"Brand: {display_name}\n\nRecent posts:\n{posts_list}\n\nIdentify 2-3 content gaps."

    message = _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        system=[
            {
                "type": "text",
                "text": _SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_message}],
    )

    raw = message.content[0].text
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
    cleaned = match.group(1).strip() if match else raw.strip()
    gaps = json.loads(cleaned)

    for gap in gaps:
        save_opportunity({
            "brand": brand,
            "gap_summary": gap["gap_summary"],
            "suggested_content": gap["suggested_content"],
            "suggested_format": gap["suggested_format"],
            "source_platforms": platforms_used,
        })

    print(f"  [gaps] Saved {len(gaps)} content opportunities for {brand}")
