create table brands (
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

insert into brands (slug, display_name, color_bg, color_fg, description, scoring_prompt, website_url, plausible_link) values
('picasyfijas', 'Picas y Fijas', '#f3f0ff', '#7c3aed', 'A number/code-guessing logic game based on Bulls and Cows (Mastermind).', 'You are evaluating whether a social media post represents a potential lead for Picas y Fijas.

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
1-4: Not a lead', 'https://www.picasyfijas.com/', 'https://plausible.io/share/picasyfijas.com?auth=YAafqoFzHUj5ejoRtomWm'),

('fluentaspeech', 'Fluentaspeech', '#eff6ff', '#2563eb', 'An AI-powered pronunciation practice app for English learners.', 'You are evaluating whether a social media post represents a potential lead for Fluentaspeech.

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
1-4: Not a lead', 'https://fluentaspeech.com/', 'https://plausible.io/share/fluentaspeech.com?auth=f5SNg1FO936U9l7x-Wrb1'),

('comadrelab', 'ComadreLab', '#fdf2f8', '#db2777', 'A bilingual web development studio for small businesses.', 'You are evaluating whether a social media post represents a potential lead for ComadreLab.

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
1-4: Not a lead', 'https://www.comadrelab.dev/', 'https://plausible.io/share/comadrelab.dev?auth=BkkiJFEUSELsrQ1ccWFLu');

create table leads (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  platform text not null,
  post_id text unique not null,
  author text,
  content text,
  url text,
  score int,
  score_reason text,
  suggested_reply text,
  status text default 'new',
  found_at timestamptz default now()
);

create index on leads (brand, status, score desc, found_at desc);

create table content_opportunities (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  gap_summary text,
  suggested_content text,
  suggested_format text,
  source_platforms text[],
  status text default 'new',
  found_at timestamptz default now()
);

create index on content_opportunities (brand, status, found_at desc);

create table content_calendar (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  platform text not null,
  content text not null,
  content_type text,
  scheduled_for date,
  status text default 'draft',
  source_lead_id uuid references leads(id),
  source_gap_id uuid references content_opportunities(id),
  created_at timestamptz default now()
);

create index on content_calendar (brand, status, scheduled_for asc);

create table facebook_groups (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  group_name text not null,
  group_url text,
  notes text,
  last_checked date
);

create table ignored_authors (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  author text not null,
  platform text,
  reason text,
  created_at timestamptz default now(),
  unique(brand, author)
);

create index on ignored_authors (brand, author);

-- RLS
alter table brands enable row level security;
create policy "public read brands" on brands for select using (true);
create policy "public insert brands" on brands for insert with check (true);
create policy "public update brands" on brands for update using (true) with check (true);
create policy "public delete brands" on brands for delete using (true);

alter table leads enable row level security;
alter table content_opportunities enable row level security;
alter table content_calendar enable row level security;
alter table facebook_groups enable row level security;

create policy "public read leads" on leads for select using (true);
create policy "public update leads" on leads for update using (true) with check (true);

create policy "public read opportunities" on content_opportunities for select using (true);
create policy "public update opportunities" on content_opportunities for update using (true) with check (true);

create policy "public read calendar" on content_calendar for select using (true);
create policy "public insert calendar" on content_calendar for insert with check (true);
create policy "public update calendar" on content_calendar for update using (true) with check (true);

create policy "public read groups" on facebook_groups for select using (true);

alter table ignored_authors enable row level security;
create policy "public read ignored" on ignored_authors for select using (true);
create policy "public insert ignored" on ignored_authors for insert with check (true);
create policy "public delete ignored" on ignored_authors for delete using (true);
