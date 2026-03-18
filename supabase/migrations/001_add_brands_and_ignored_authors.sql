-- Migration: Add brands table and ignored_authors table
-- Run this in the Supabase SQL Editor or via psql
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ============================================================
-- 1. Brands table
-- ============================================================

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  color_bg text default '#f5f5f4',
  color_fg text default '#78716c',
  description text,
  scoring_prompt text,
  website_url text,
  plausible_link text,
  active boolean default true,
  created_at timestamptz default now()
);

alter table brands enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'brands' and policyname = 'public read brands') then
    create policy "public read brands" on brands for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'brands' and policyname = 'public insert brands') then
    create policy "public insert brands" on brands for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'brands' and policyname = 'public update brands') then
    create policy "public update brands" on brands for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'brands' and policyname = 'public delete brands') then
    create policy "public delete brands" on brands for delete using (true);
  end if;
end $$;

-- ============================================================
-- 2. Seed existing brands (skip if already present)
-- ============================================================

insert into brands (slug, display_name, color_bg, color_fg, description, scoring_prompt, website_url, plausible_link)
values
(
  'picasyfijas',
  'Picas y Fijas',
  '#f3f0ff',
  '#7c3aed',
  'A number/code-guessing logic game based on Bulls and Cows (Mastermind).',
  'You are evaluating whether a social media post represents a potential lead for Picas y Fijas.

Picas y Fijas is: A number/code-guessing logic game based on Bulls and Cows (Mastermind). Players guess a secret code and get feedback on correct digits in the right position (fijas) and correct digits in the wrong position (picas). It''s a deduction and logic puzzle game, NOT a word game or language learning tool.

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "score": <integer 1-10>,
  "reason": "<one sentence explaining why>",
  "suggested_reply": "<natural, non-spammy reply — add value first, mention product only if it genuinely fits. When mentioning the product, include the link: https://www.picasyfijas.com/ — Match the language of the post.>"
}

Score guide:
9-10: Actively looking for exactly what this product offers
7-8: Strong signal — related pain point
5-6: Weak signal — tangentially related
1-4: Not a lead',
  'https://www.picasyfijas.com/',
  'https://plausible.io/share/picasyfijas.com?auth=YAafqoFzHUj5ejoRtomWm'
),
(
  'fluentaspeech',
  'Fluentaspeech',
  '#eff6ff',
  '#2563eb',
  'An AI-powered pronunciation practice app for English learners.',
  'You are evaluating whether a social media post represents a potential lead for Fluentaspeech.

Fluentaspeech is: An AI-powered pronunciation practice app that gives real-time feedback on English speech, helping learners reduce accents and prepare for exams like IELTS.

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "score": <integer 1-10>,
  "reason": "<one sentence explaining why>",
  "suggested_reply": "<natural, non-spammy reply — add value first, mention product only if it genuinely fits. When mentioning the product, include the link: https://fluentaspeech.com/ — Match the language of the post.>"
}

Score guide:
9-10: Actively looking for exactly what this product offers
7-8: Strong signal — related pain point
5-6: Weak signal — tangentially related
1-4: Not a lead',
  'https://fluentaspeech.com/',
  'https://plausible.io/share/fluentaspeech.com?auth=f5SNg1FO936U9l7x-Wrb1'
),
(
  'comadrelab',
  'ComadreLab',
  '#fdf2f8',
  '#db2777',
  'A bilingual web development studio for small businesses.',
  'You are evaluating whether a social media post represents a potential lead for ComadreLab.

ComadreLab is: A bilingual web development studio that builds websites and digital presence for small businesses, with a focus on Latina entrepreneurs.

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "score": <integer 1-10>,
  "reason": "<one sentence explaining why>",
  "suggested_reply": "<natural, non-spammy reply — add value first, mention product only if it genuinely fits. When mentioning the product, include the link: https://www.comadrelab.dev/ — Match the language of the post.>"
}

Score guide:
9-10: Actively looking for exactly what this product offers
7-8: Strong signal — related pain point
5-6: Weak signal — tangentially related
1-4: Not a lead',
  'https://www.comadrelab.dev/',
  'https://plausible.io/share/comadrelab.dev?auth=BkkiJFEUSELsrQ1ccWFLu'
)
on conflict (slug) do nothing;

-- ============================================================
-- 3. Ignored authors table
-- ============================================================

create table if not exists ignored_authors (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  author text not null,
  platform text,
  reason text,
  created_at timestamptz default now(),
  unique(brand, author)
);

create index if not exists ignored_authors_brand_author_idx on ignored_authors (brand, author);

alter table ignored_authors enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'ignored_authors' and policyname = 'public read ignored') then
    create policy "public read ignored" on ignored_authors for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'ignored_authors' and policyname = 'public insert ignored') then
    create policy "public insert ignored" on ignored_authors for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'ignored_authors' and policyname = 'public delete ignored') then
    create policy "public delete ignored" on ignored_authors for delete using (true);
  end if;
end $$;
