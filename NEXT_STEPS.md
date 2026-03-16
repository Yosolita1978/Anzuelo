# Anzuelo — Progress & Next Steps

## What's done (2026-03-14)

### Phase 1 — Agent core
- [x] Supabase schema (leads, content_opportunities, content_calendar, facebook_groups)
- [x] `searches.yaml` config for 3 brands
- [x] Reddit searcher (public JSON API — no auth needed)
- [x] Hacker News searcher (Algolia API — no auth needed)
- [x] Lead scoring with Claude Haiku + prompt caching
- [x] Content gap analysis with Claude Haiku
- [x] `main.py` entrypoint

### Phase 2 — Dashboard: Leads + Gaps
- [x] Next.js 14 scaffolding (TypeScript, Tailwind, App Router)
- [x] Dropdown filters (brand required, platform/status optional)
- [x] LeadCard, LeadList, GapCard, GapList components
- [x] PATCH API routes for lead/gap status updates
- [x] Custom branding (logo, icon, favicon)

### Phase 3 — Dashboard: Studio + Calendar
- [x] ContentStudio with streaming Claude Sonnet generation
- [x] CalendarGrid grouped by week
- [x] Generate API route (streamed)
- [x] Calendar API route (POST + PATCH)

---

## What's next

### Phase 4 — Agent: Bluesky + Mastodon
- [ ] `agent/searchers/bluesky.py`
- [ ] `agent/searchers/mastodon.py`
- [ ] Update `agent/main.py` to include both
- [ ] Add `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`, `MASTODON_ACCESS_TOKEN` to `.env`
- [ ] Test run

### Phase 5 — Agent: YouTube
- [ ] `agent/searchers/youtube.py`
- [ ] Update `agent/main.py`
- [ ] Add `YOUTUBE_API_KEY` to `.env`
- [ ] Test run

### Phase 6 — Agent: LinkedIn via Serper
- [ ] Sign up for Serper.dev, get API key
- [ ] `agent/searchers/linkedin.py` (uses `site:linkedin.com/posts` queries)
- [ ] Add `SERPER_API_KEY` to `.env` and GitHub secrets
- [ ] Update `agent/main.py`
- [ ] Test run

### Phase 7 — Scheduling
- [ ] Create `.github/workflows/run-agent.yml` (cron: 3x daily)
- [ ] Add all env vars as GitHub repo secrets
- [ ] Test with `workflow_dispatch` manual trigger

### Phase 8 — Deploy dashboard
- [ ] Push to GitHub
- [ ] Vercel → New Project → import `anzuelo` → Root Directory: `dashboard/`
- [ ] Add env vars in Vercel settings
- [ ] Verify production build

---

## How to add a new brand

Adding a brand requires changes in 3 files. No code changes needed — just config and prompts.

### 1. Add search config — `agent/config/searches.yaml`

Add a new entry under `brands:`:

```yaml
  mynewbrand:
    display_name: "My New Brand"
    reddit:
      subreddits:
        - relevant_subreddit_1
        - relevant_subreddit_2
      keywords:
        - "keyword one"
        - "keyword two"
    hackernews:
      keywords:
        - "keyword one"
    bluesky:
      hashtags:
        - relevant_hashtag
    mastodon:
      hashtags:
        - relevant_hashtag
    youtube:
      queries:
        - "search query"
    linkedin:
      queries:
        - "search query"
```

You only need to include the platforms you want to search. If you skip a platform, the agent will just skip it for that brand.

### 2. Add scoring prompt — `agent/scoring/prompts.py`

Add a new entry to the `PROMPTS` dict:

```python
    "mynewbrand": """You are evaluating whether a social media post represents a potential lead for My New Brand.

My New Brand is: [One sentence describing what the product does and who it's for.]

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "score": <integer 1-10>,
  "reason": "<one sentence explaining why>",
  "suggested_reply": "<natural, non-spammy reply — add value first, mention product only if it genuinely fits. Match the language of the post.>"
}

Score guide:
9-10: Actively looking for exactly what this product offers
7-8: Strong signal — related pain point
5-6: Weak signal — tangentially related
1-4: Not a lead""",
```

### 3. Add to dashboard — `dashboard/components/Filters.tsx`

Add the brand to the `BRANDS` array:

```typescript
const BRANDS = [
  { value: '', label: 'Select brand...' },
  { value: 'picasyfijas', label: 'Picas y Fijas' },
  { value: 'fluentaspeech', label: 'Fluentaspeech' },
  { value: 'comadrelab', label: 'ComadreLab' },
  { value: 'mynewbrand', label: 'My New Brand' },  // ← add here
]
```

Also add it to `dashboard/components/StatusBadge.tsx` for the badge colors:

```typescript
const BRAND_STYLES: Record<string, { bg: string; fg: string }> = {
  // ...existing brands...
  mynewbrand: { bg: '#f0fdf4', fg: '#16a34a' },  // ← pick your colors
}

const BRAND_LABELS: Record<string, string> = {
  // ...existing brands...
  mynewbrand: 'My New Brand',
}
```

And to `dashboard/components/ContentStudio.tsx`:

```typescript
const BRANDS = [
  // ...existing brands...
  { value: 'mynewbrand', label: 'My New Brand' },
]
```

That's it. Run the agent and the new brand's leads will appear in the dashboard.

---

## Known Issues

- Some subreddits return 403 (private/restricted) — remove them from `searches.yaml` if they error
- Claude Haiku sometimes wraps JSON in markdown code fences — the parser strips them automatically
- Clear `.next` cache (`rm -rf dashboard/.next`) if you see hydration errors after component changes
