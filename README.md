# Anzuelo

> Cast the hook, catch the leads, reel them in.

Anzuelo is a social media lead finder and content engagement hub. A Python agent searches Reddit, Hacker News, Bluesky, Mastodon, YouTube, and LinkedIn for conversations where real people might benefit from one of three products. It scores each lead using the Claude API, detects content gaps, and stores everything in Supabase. A Next.js dashboard surfaces leads, gaps, and a content studio where you can generate platform-ready posts and save them to a calendar.

**The user always pastes replies manually.** Anzuelo never sends messages automatically.

---

## Brands

| Brand | What it is |
|-------|-----------|
| **Picas y Fijas** | A number/code-guessing logic game based on Bulls and Cows (Mastermind) |
| **Fluentaspeech** | An AI-powered pronunciation practice app for English learners |
| **ComadreLab** | A bilingual web development studio for small businesses |

---

## How It Works

```
searches.yaml (keywords, subreddits, hashtags per brand)
       |
   Searcher modules (Reddit, HN, Bluesky, Mastodon, YouTube, LinkedIn)
       |
   Raw posts (deduplicated by post_id)
       |
   Duplicate check against Supabase
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
│   │   └── searches.yaml   # All keywords, subreddits, hashtags
│   ├── searchers/          # One module per platform
│   ├── scoring/            # Claude API scoring with prompt caching
│   ├── analysis/           # Content gap detection
│   ├── storage/            # Supabase read/write
│   ├── main.py             # Entrypoint
│   └── requirements.txt
├── dashboard/              # Next.js 14 App Router
│   ├── app/                # Pages: leads, gaps, studio, calendar
│   ├── components/         # UI components
│   └── lib/                # Supabase client, types
└── supabase/
    └── schema.sql          # Database schema
```

---

## Setup

### 1. Database

Create a [Supabase](https://supabase.com) project. Run `supabase/schema.sql` in the SQL Editor.

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
```

Optional (for later phases):
```env
BLUESKY_HANDLE=
BLUESKY_APP_PASSWORD=
MASTODON_ACCESS_TOKEN=
MASTODON_API_BASE_URL=https://mastodon.social
YOUTUBE_API_KEY=
SERPER_API_KEY=
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
```

Run the dashboard:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Scheduling

The agent is designed to run 3x daily via GitHub Actions:

```yaml
on:
  schedule:
    - cron: '0 8,14,20 * * *'
```

See `.github/workflows/run-agent.yml` for the full workflow (Phase 7).

---

## Dashboard Tabs

- **Leads** — Browse scored leads. Filter by brand, platform, status. Copy suggested replies, open original posts, mark as replied or skipped.
- **Gaps** — Content opportunities detected from conversation patterns. Open them in the Studio to generate content.
- **Studio** — Generate platform-ready posts using Claude Sonnet. Pick brand, platform, content type, and language. Stream the output, copy it, or save to calendar.
- **Calendar** — View and manage scheduled content. Mark posts as published or skip them.

---

## Key Rules

- No automatic message sending — clipboard copy only
- Score threshold is 5 — lower scores are discarded
- Content truncated to 1000 chars before scoring (cost control)
- Suggested replies match the post's language
- If a platform errors, log it and continue — no retries, no fallbacks
- TypeScript strict mode in the dashboard — no `any`
