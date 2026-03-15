import time
import requests

SEVEN_DAYS_AGO = time.time() - (7 * 24 * 60 * 60)
HEADERS = {"User-Agent": "anzuelo/1.0 (lead finder bot)"}


def search(brand: str, config: dict) -> list[dict]:
    seen = set()
    results = []

    subreddits = config.get("subreddits", [])
    keywords = config.get("keywords", [])

    for subreddit_name in subreddits:
        for keyword in keywords:
            try:
                response = requests.get(
                    f"https://www.reddit.com/r/{subreddit_name}/search.json",
                    params={
                        "q": keyword,
                        "sort": "new",
                        "limit": 10,
                        "restrict_sr": "on",
                        "t": "week",
                    },
                    headers=HEADERS,
                    timeout=15,
                )
                response.raise_for_status()
                data = response.json()

                for child in data.get("data", {}).get("children", []):
                    post = child["data"]

                    if post["created_utc"] < SEVEN_DAYS_AGO:
                        continue
                    if post["id"] in seen:
                        continue
                    seen.add(post["id"])

                    title = post.get("title", "")
                    selftext = post.get("selftext", "")
                    content = f"{title} {selftext}".strip()[:1000]

                    results.append({
                        "post_id": post["id"],
                        "author": post.get("author"),
                        "content": content,
                        "url": f"https://www.reddit.com{post.get('permalink', '')}",
                        "platform": "reddit",
                    })

                # Rate limit: ~1 request per second
                time.sleep(1)

            except Exception as e:
                print(f"  [reddit] Error searching r/{subreddit_name} for '{keyword}': {e}")

    return results
