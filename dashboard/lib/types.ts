export type Lead = {
  id: string
  brand: string
  platform: string
  post_id: string
  author: string | null
  content: string | null
  url: string | null
  score: number
  score_reason: string | null
  suggested_reply: string | null
  status: 'new' | 'replied' | 'skipped'
  found_at: string
}

export type ContentOpportunity = {
  id: string
  brand: string
  gap_summary: string | null
  suggested_content: string | null
  suggested_format: string | null
  source_platforms: string[] | null
  status: 'new' | 'done' | 'dismissed'
  found_at: string
}

export type CalendarEntry = {
  id: string
  brand: string
  platform: string
  content: string
  content_type: string | null
  scheduled_for: string | null
  status: 'draft' | 'posted' | 'skipped'
  source_lead_id: string | null
  source_gap_id: string | null
  created_at: string
}

export type BrandConfig = {
  id: string
  slug: string
  display_name: string
  color_bg: string
  color_fg: string
  description: string | null
  scoring_prompt: string | null
  website_url: string | null
  plausible_link: string | null
  active: boolean
  created_at: string
}

export type Platform = 'reddit' | 'hackernews' | 'bluesky' | 'mastodon' | 'youtube' | 'linkedin' | 'all'
