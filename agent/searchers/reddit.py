import os
import time
import requests

SERPER_URL = "https://google.serper.dev/search"


def search(brand: str, config: dict) -> list[dict]:
    seen = set()
    results = []

    api_key = os.environ.get("SERPER_API_KEY")
    if not api_key:
        print("  [reddit] Missing SERPER_API_KEY")
        return []

    queries = config.get("queries", [])

    for query in queries:
        try:
            response = requests.post(
                SERPER_URL,
                json={
                    "q": f"site:reddit.com {query}",
                    "num": 10,
                    "tbs": "qdr:w",
                },
                headers={
                    "X-API-KEY": api_key,
                    "Content-Type": "application/json",
                },
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            for item in data.get("organic", []):
                link = item.get("link", "")
                if "reddit.com" not in link:
                    continue
                if link in seen:
                    continue
                seen.add(link)

                title = item.get("title", "")
                snippet = item.get("snippet", "")
                content = f"{title} {snippet}".strip()[:1000]

                post_id = link.rstrip("/").split("/")[-1]

                results.append({
                    "post_id": f"reddit_{post_id}",
                    "author": "",
                    "content": content,
                    "url": link,
                    "platform": "reddit",
                })

            time.sleep(0.5)

        except Exception as e:
            print(f"  [reddit] Error searching for '{query}': {e}")

    return results
