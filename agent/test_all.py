from dotenv import load_dotenv
load_dotenv()

import yaml
import os
from searchers import reddit, hackernews, bluesky, mastodon, threads, youtube, linkedin

SEARCHERS = {
    "reddit": reddit,
    "hackernews": hackernews,
    "bluesky": bluesky,
    "mastodon": mastodon,
    "threads": threads,
    "youtube": youtube,
    "linkedin": linkedin,
}

config_path = os.path.join(os.path.dirname(__file__), "config", "searches.yaml")
with open(config_path) as f:
    config = yaml.safe_load(f)

# Test with just one brand to save API calls
brand_slug = "picasyfijas"
brand_config = config["brands"][brand_slug]
print(f"=== Testing {brand_config['display_name']} ===\n")

total = 0
for name, searcher in SEARCHERS.items():
    platform_config = brand_config.get(name)
    if not platform_config:
        print(f"  {name}: no config, skipping")
        continue

    try:
        results = searcher.search(brand_slug, platform_config)
        total += len(results)
        print(f"  {name}: {len(results)} posts found")
        if results:
            print(f"    example: {results[0]['url']}")
    except Exception as e:
        print(f"  {name}: ERROR - {e}")

print(f"\nTotal: {total} posts found across all platforms")
