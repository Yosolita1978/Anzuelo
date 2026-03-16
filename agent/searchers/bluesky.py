import os
import time
from datetime import datetime, timedelta, timezone
from atproto import Client

SEVEN_DAYS_AGO = datetime.now(timezone.utc) - timedelta(days=7)


def search(brand: str, config: dict) -> list[dict]:
    seen = set()
    results = []

    handle = os.environ.get("BLUESKY_HANDLE")
    password = os.environ.get("BLUESKY_APP_PASSWORD")

    if not handle or not password:
        print("  [bluesky] Missing BLUESKY_HANDLE or BLUESKY_APP_PASSWORD")
        return []

    client = Client()
    client.login(handle, password)

    hashtags = config.get("hashtags", [])

    for hashtag in hashtags:
        try:
            response = client.app.bsky.feed.search_posts(
                params={
                    "q": f"#{hashtag}",
                    "limit": 10,
                    "since": SEVEN_DAYS_AGO.isoformat(),
                }
            )

            for post in response.posts:
                uri = post.uri
                if uri in seen:
                    continue
                seen.add(uri)

                post_id = uri.split("/")[-1]
                author = post.author.handle
                content = post.record.text[:1000] if post.record.text else ""
                url = f"https://bsky.app/profile/{author}/post/{post_id}"

                results.append({
                    "post_id": f"bsky_{post_id}",
                    "author": author,
                    "content": content,
                    "url": url,
                    "platform": "bluesky",
                })

            time.sleep(0.5)

        except Exception as e:
            print(f"  [bluesky] Error searching for '#{hashtag}': {e}")

    return results
