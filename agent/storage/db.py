import os
from supabase import create_client, Client

_url = os.environ["SUPABASE_URL"]
_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
_client: Client = create_client(_url, _key)


def is_ignored_author(brand: str, author: str) -> bool:
    if not author:
        return False
    result = _client.table("ignored_authors").select("id").eq("brand", brand).eq("author", author).execute()
    return len(result.data) > 0


def is_duplicate(post_id: str) -> bool:
    result = _client.table("leads").select("id").eq("post_id", post_id).execute()
    return len(result.data) > 0


def save_lead(lead: dict) -> None:
    try:
        _client.table("leads").insert(lead).execute()
    except Exception as e:
        if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
            return
        raise


def save_opportunity(opportunity: dict) -> None:
    _client.table("content_opportunities").insert(opportunity).execute()


def get_brand_prompt(brand_slug: str) -> str | None:
    result = _client.table("brands").select("scoring_prompt").eq("slug", brand_slug).eq("active", True).execute()
    if result.data and len(result.data) > 0:
        return result.data[0].get("scoring_prompt")
    return None


def get_active_brands() -> list[dict]:
    """Returns list of active brands: [{slug, display_name}, ...]"""
    result = _client.table("brands").select("slug, display_name").eq("active", True).execute()
    return result.data or []


def get_brand_searches(brand_slug: str) -> dict[str, dict]:
    """Returns search config for a brand, keyed by platform.
    Example: {"reddit": {"queries": [...]}, "bluesky": {"hashtags": [...]}}
    """
    result = (
        _client.table("brand_searches")
        .select("platform, config_key, terms")
        .eq("brand_slug", brand_slug)
        .eq("active", True)
        .execute()
    )
    config = {}
    for row in result.data or []:
        config[row["platform"]] = {row["config_key"]: row["terms"]}
    return config
