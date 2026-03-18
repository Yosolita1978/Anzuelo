# Anzuelo

> Cast the hook, catch the leads, reel them in.

Anzuelo is a social media lead finder and content engagement hub. A Python agent searches Reddit, Hacker News, Bluesky, Mastodon, YouTube, LinkedIn, and Threads for conversations where real people might benefit from your products. It scores each lead using the Claude API, detects content gaps, and stores everything in Supabase. A Next.js dashboard surfaces leads, gaps, and a content studio where you can generate platform-ready posts and save them to a calendar.

**The user always pastes replies manually.** Anzuelo never sends messages automatically.

---

## Brands

Brands are fully dynamic — managed from the `/brands` page in the dashboard. Each brand has its own scoring prompt, search terms per platform, badge colors, and optional Plausible analytics link. Add new brands from the UI and the agent picks them up on the next run.

Default brands:

| Brand | What it is |
|-------|-----------|
| **Picas y Fijas** | A number/code-guessing logic game based on Bulls and Cows (Mastermind) |
| **Fluentaspeech** | An AI-powered pronunciation practice app for English learners |
| **ComadreLab** | A bilingual web development studio for small businesses |

---

## How It Works

```
Supabase "brands" table (name, scoring prompt, colors)
       +
Supabase "brand_searches" table (search terms per platform)
       |
   Searcher modules (Reddit, HN, Bluesky, Mastodon, YouTube, LinkedIn, Threads)
       |
   Raw posts (deduplicated by post_id)
       |
   Duplicate check against Supabase
       |
   Ignored author check against Supabase "ignored_authors" table
       |
   Claude Haiku scores each post (1-10 + reason + suggested reply)
       |
   Score < 5 → discard
       |
   Save to Supabase "leads" table
       |
   Claude Haiku analyzes all posts per brand for content gaps
       |
   Save to Supabase "content_opportunities" table
       |
   Dashboard reads from Supabase → user acts on leads
```

---

## Project Structure

```
anzuelo/
├── agent/                  # Python agent
│   ├── config/
│   │   └── searches.yaml   # Legacy config (now reads from DB)
│   ├── searchers/          # One module per platform (7 searchers)
│   ├── scoring/            # Claude API scoring with prompt caching
│   ├── analysis/           # Content gap detection
│   ├── storage/            # Supabase read/write
│   ├── main.py             # Entrypoint
│   └── requirements.txt
├── dashboard/              # Next.js 14 App Router
│   ├── app/                # Pages + API routes
│   │   ├── leads/          # Lead browser with score filter
│   │   ├── gaps/           # Content opportunities
│   │   ├── studio/         # AI content generation
│   │   ├── calendar/       # Content calendar
│   │   ├── stats/          # Analytics + Plausible embeds
│   │   ├── brands/         # Brand management + search config
│   │   └── api/
│   │       ├── leads/      # GET, DELETE (batch), PATCH (status + ignore)
│   │       ├── gaps/       # GET, PATCH
│   │       ├── brands/     # CRUD + search config
│   │       ├── ignored/    # GET, DELETE ignored authors
│   │       ├── agent/      # Trigger + status via GitHub Actions API
│   │       ├── calendar/   # POST, PATCH
│   │       ├── stats/      # Aggregated metrics
│   │       └── generate/   # Claude Sonnet streaming
│   ├── components/         # UI components
│   └── lib/                # Supabase client, types, useBrands hook
├── supabase/
│   ├── schema.sql          # Full database schema
│   └── migrations/         # Incremental migrations
│       ├── 001_add_brands_and_ignored_authors.sql
│       └── 002_add_brand_searches.sql
└── .github/
    └── workflows/
        └── run-agent.yml   # Scheduled + manual trigger
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `brands` | Brand config: slug, display name, colors, scoring prompt, website URL, Plausible link |
| `brand_searches` | Search terms per brand+platform (queries, keywords, or hashtags) |
| `leads` | Scored leads with status (new/replied/skipped) |
| `ignored_authors` | Authors to skip in future runs (per brand) |
| `content_opportunities` | AI-detected content gaps |
| `content_calendar` | Scheduled content entries |
| `facebook_groups` | Facebook group tracking |

---

## Setup

### 1. Database

Create a [Supabase](https://supabase.com) project. Run `supabase/schema.sql` in the SQL Editor, then run the migrations in order:

```bash
# In the Supabase SQL Editor:
# 1. supabase/schema.sql (base tables)
# 2. supabase/migrations/001_add_brands_and_ignored_authors.sql
# 3. supabase/migrations/002_add_brand_searches.sql
```

### 2. Agent

```bash
cd agent
pip install -r requirements.txt
```

Create `agent/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
BLUESKY_HANDLE=your-handle
BLUESKY_APP_PASSWORD=your-app-password
SERPER_API_KEY=your-serper-key
YOUTUBE_API_KEY=your-youtube-key
```

Run the agent:

```bash
python main.py
```

### 3. Dashboard

```bash
cd dashboard
npm install
```

Create `dashboard/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-anthropic-key
GITHUB_TOKEN=your-github-fine-grained-token
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=anzuelo
```

The GitHub token needs **Actions (read/write)** and **Metadata (read)** permissions on the repo.

Run the dashboard:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Dashboard Tabs

- **Leads** — Browse scored leads. Filter by brand, platform, status, and score range. Copy suggested replies, open original posts, mark as replied or skipped. "Skip & Ignore" to block an author from future runs. Batch delete old skipped leads (1 week / 2 weeks / 1 month).
- **Gaps** — Content opportunities detected from conversation patterns. Open them in the Studio to generate content.
- **Studio** — Generate platform-ready posts using Claude Sonnet. Pick brand, platform, content type, and language. Stream the output, copy it, or save to calendar.
- **Calendar** — View and manage scheduled content. Mark posts as published or skip them.
- **Stats** — Internal metrics (leads by platform, score distribution, daily counts) plus Plausible analytics embeds per brand.
- **Brands** — Add, edit, and deactivate brands. Manage search terms per platform. Trigger the agent manually via GitHub Actions.

---

## Scheduling

The agent runs daily at 6 AM PST via GitHub Actions, and can be triggered manually from the Brands page or the GitHub UI.

```yaml
on:
  schedule:
    - cron: '0 14 * * *'  # 6 AM PST
  workflow_dispatch:        # Manual trigger
```

See `.github/workflows/run-agent.yml` for the full workflow.

---

## Cost

| Task | Model | Est. cost/run |
|------|-------|--------------|
| Lead scoring (~150 posts) | Claude Haiku | ~$0.02 |
| Gap analysis (3 brands) | Claude Haiku | ~$0.002 |
| Content generation | Claude Sonnet (on-demand) | ~$0.01/generation |

At 3 runs/day: **under $1/month**.

Prompt caching is enabled for scoring — posts 2+ in each brand's scoring loop use cached system prompts (90% input token savings).

---

## Key Rules

- No automatic message sending — clipboard copy only
- Score threshold is 5 — lower scores are discarded
- Content truncated to 1000 chars before scoring (cost control)
- Suggested replies match the post's language
- Ignored authors are skipped before scoring (saves API calls)
- If a platform errors, log it and continue — no retries, no fallbacks
- TypeScript strict mode in the dashboard — no `any`
