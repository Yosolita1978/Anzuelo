import os
import time
from datetime import datetime, timedelta, timezone
from googleapiclient.discovery import build

SEVEN_DAYS_AGO = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()


def search(brand: str, config: dict) -> list[dict]:
    seen = set()
    results = []

    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        print("  [youtube] Missing YOUTUBE_API_KEY")
        return []

    youtube = build("youtube", "v3", developerKey=api_key)
    queries = config.get("queries", [])

    for query in queries:
        try:
            response = youtube.search().list(
                q=query,
                part="snippet",
                type="video",
                maxResults=10,
                publishedAfter=SEVEN_DAYS_AGO,
                order="date",
            ).execute()

            for item in response.get("items", []):
                video_id = item["id"]["videoId"]
                if video_id in seen:
                    continue
                seen.add(video_id)

                snippet = item["snippet"]
                title = snippet.get("title", "")
                description = snippet.get("description", "")
                content = f"{title} {description}".strip()[:1000]
                author = snippet.get("channelTitle", "")
                url = f"https://www.youtube.com/watch?v={video_id}"

                results.append({
                    "post_id": f"yt_{video_id}",
                    "author": author,
                    "content": content,
                    "url": url,
                    "platform": "youtube",
                })

            time.sleep(0.5)

        except Exception as e:
            print(f"  [youtube] Error searching for '{query}': {e}")

    return results
