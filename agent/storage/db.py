import os
from supabase import create_client, Client

_url = os.environ["SUPABASE_URL"]
_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
_client: Client = create_client(_url, _key)


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
