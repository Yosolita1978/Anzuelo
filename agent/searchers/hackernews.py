import time
import requests

ALGOLIA_URL = "https://hn.algolia.com/api/v1/search_by_date"
SEVEN_DAYS_AGO = int(time.time()) - (7 * 24 * 60 * 60)


def search(brand: str, config: dict) -> list[dict]:
    seen = set()
    results = []

    keywords = config.get("keywords", [])

    for keyword in keywords:
        try:
            response = requests.get(
                ALGOLIA_URL,
                params={
                    "query": keyword,
                    "tags": "(comment,story)",
                    "hitsPerPage": 10,
                    "numericFilters": f"created_at_i>{SEVEN_DAYS_AGO}",
                },
                timeout=15,
            )
            response.raise_for_status()
            hits = response.json().get("hits", [])

            for hit in hits:
                object_id = hit["objectID"]
                if object_id in seen:
                    continue
                seen.add(object_id)

                title = hit.get("title") or ""
                comment_text = hit.get("comment_text") or ""
                content = f"{title} {comment_text}".strip()[:1000]

                results.append({
                    "post_id": object_id,
                    "author": hit.get("author"),
                    "content": content,
                    "url": f"https://news.ycombinator.com/item?id={object_id}",
                    "platform": "hackernews",
                })
        except Exception as e:
            print(f"  [hackernews] Error searching for '{keyword}': {e}")

    return results
