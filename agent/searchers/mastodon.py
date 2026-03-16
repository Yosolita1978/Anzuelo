import re
import time
import requests

HEADERS = {"User-Agent": "anzuelo/1.0 (lead finder bot)"}
BASE_URL = "https://mastodon.social/api/v1"


def search(brand: str, config: dict) -> list[dict]:
    seen = set()
    results = []

    hashtags = config.get("hashtags", [])

    for hashtag in hashtags:
        try:
            response = requests.get(
                f"{BASE_URL}/timelines/tag/{hashtag}",
                params={"limit": 10},
                headers=HEADERS,
                timeout=15,
            )
            response.raise_for_status()
            statuses = response.json()

            for status in statuses:
                status_id = status["id"]
                if status_id in seen:
                    continue
                seen.add(status_id)

                # Strip HTML tags from content
                text = status.get("content", "")
                for tag in ["<p>", "</p>", "<br>", "<br/>", "<br />"]:
                    text = text.replace(tag, " ")
                text = re.sub(r"<[^>]+>", "", text).strip()[:1000]

                author = status.get("account", {}).get("acct", "")
                url = status.get("url", "")

                results.append({
                    "post_id": f"masto_{status_id}",
                    "author": author,
                    "content": text,
                    "url": url,
                    "platform": "mastodon",
                })

            time.sleep(0.5)

        except Exception as e:
            print(f"  [mastodon] Error searching for '#{hashtag}': {e}")

    return results
