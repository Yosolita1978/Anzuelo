import sys
from dotenv import load_dotenv

load_dotenv()

# Force unbuffered output so GitHub Actions shows logs in real time
sys.stdout.reconfigure(line_buffering=True)

from searchers import reddit, hackernews, bluesky, mastodon, threads, youtube, linkedin
from scoring.relevance import score_lead
from storage.db import is_duplicate, is_ignored_author, save_lead, mark_seen, get_active_brands, get_brand_searches
from analysis.gaps import analyze_gaps

SEARCHERS = {
    "reddit": reddit,
    "hackernews": hackernews,
    "bluesky": bluesky,
    "mastodon": mastodon,
    "threads": threads,
    "youtube": youtube,
    "linkedin": linkedin,
}


def run():
    print("Agent starting...")
    brands = get_active_brands()
    print(f"Found {len(brands)} active brands.")

    if not brands:
        print("No active brands found in database.")
        return

    total_saved = 0

    for brand in brands:
        brand_slug = brand["slug"]
        display_name = brand["display_name"]
        brand_config = get_brand_searches(brand_slug)

        print(f"\n--- {display_name} ---")

        if not brand_config:
            print("  No search config found, skipping.")
            continue

        all_posts = []
        platforms_used = []

        for platform_name, searcher in SEARCHERS.items():
            platform_config = brand_config.get(platform_name)
            if not platform_config:
                continue

            print(f"  Searching {platform_name}...")

            try:
                posts = searcher.search(brand_slug, platform_config)
            except Exception as e:
                print(f"  [ERROR] {platform_name} searcher failed: {e}")
                continue

            print(f"  Found {len(posts)} posts")
            all_posts.extend(posts)
            platforms_used.append(platform_name)

            for post in posts:
                if is_duplicate(post["post_id"]):
                    continue

                mark_seen(post["post_id"])

                if is_ignored_author(brand_slug, post.get("author", "")):
                    print(f"  > Ignored author: {post.get('author')}")
                    continue

                try:
                    result = score_lead(brand_slug, post["content"])
                except Exception as e:
                    print(f"  [ERROR] Scoring failed for {post['post_id']}: {e}")
                    continue

                if result["score"] < 5:
                    continue

                save_lead({
                    "brand": brand_slug,
                    "platform": post["platform"],
                    "post_id": post["post_id"],
                    "author": post.get("author"),
                    "content": post.get("content"),
                    "url": post.get("url"),
                    "score": result["score"],
                    "score_reason": result["reason"],
                    "suggested_reply": result["suggested_reply"],
                })

                print(f"  > Saved lead [{brand_slug}] [{platform_name}] score={result['score']}")
                total_saved += 1

        try:
            analyze_gaps(brand_slug, display_name, all_posts, platforms_used)
        except Exception as e:
            print(f"  [ERROR] Gap analysis failed for {brand_slug}: {e}")

    print(f"\nRun complete. {total_saved} new leads saved.")


if __name__ == "__main__":
    run()
