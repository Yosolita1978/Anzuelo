-- Migration: Add brand_searches table (search config per brand+platform)
-- Safe to run multiple times

-- ============================================================
-- 1. Brand searches table
-- ============================================================

create table if not exists brand_searches (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null,
  platform text not null,
  config_key text not null,  -- 'queries', 'keywords', or 'hashtags'
  terms text[] not null default '{}',
  active boolean default true,
  created_at timestamptz default now(),
  unique(brand_slug, platform)
);

create index if not exists brand_searches_brand_idx on brand_searches (brand_slug, active);

alter table brand_searches enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'brand_searches' and policyname = 'public read brand_searches') then
    create policy "public read brand_searches" on brand_searches for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'brand_searches' and policyname = 'public insert brand_searches') then
    create policy "public insert brand_searches" on brand_searches for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'brand_searches' and policyname = 'public update brand_searches') then
    create policy "public update brand_searches" on brand_searches for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'brand_searches' and policyname = 'public delete brand_searches') then
    create policy "public delete brand_searches" on brand_searches for delete using (true);
  end if;
end $$;

-- ============================================================
-- 2. Seed from existing YAML config
-- ============================================================

-- picasyfijas
insert into brand_searches (brand_slug, platform, config_key, terms) values
  ('picasyfijas', 'reddit', 'queries', ARRAY['bulls and cows game', 'mastermind number guessing game', 'logic puzzle deduction game']),
  ('picasyfijas', 'hackernews', 'keywords', ARRAY['bulls and cows', 'mastermind game', 'logic puzzle', 'number guessing', 'deduction game']),
  ('picasyfijas', 'bluesky', 'hashtags', ARRAY['puzzlegame', 'logicpuzzle', 'mathgames', 'indiegame', 'braingames']),
  ('picasyfijas', 'mastodon', 'hashtags', ARRAY['puzzlegame', 'mathpuzzle', 'indiegame', 'braingames']),
  ('picasyfijas', 'youtube', 'queries', ARRAY['bulls and cows game', 'mastermind number game', 'logic puzzle app']),
  ('picasyfijas', 'threads', 'queries', ARRAY['bulls and cows game', 'mastermind number game', 'logic puzzle app']),
  ('picasyfijas', 'linkedin', 'queries', ARRAY['logic puzzle game', 'math puzzle app'])
on conflict (brand_slug, platform) do nothing;

-- fluentaspeech
insert into brand_searches (brand_slug, platform, config_key, terms) values
  ('fluentaspeech', 'reddit', 'queries', ARRAY['pronunciation practice app english', 'IELTS speaking practice tool', 'reduce accent english feedback']),
  ('fluentaspeech', 'hackernews', 'keywords', ARRAY['pronunciation practice', 'language learning app', 'speech feedback', 'english accent']),
  ('fluentaspeech', 'bluesky', 'hashtags', ARRAY['languagelearning', 'ESL', 'pronunciation', 'IELTS', 'englishlearning']),
  ('fluentaspeech', 'mastodon', 'hashtags', ARRAY['languagelearning', 'english', 'pronunciation']),
  ('fluentaspeech', 'youtube', 'queries', ARRAY['improve english pronunciation app', 'pronunciation feedback AI', 'IELTS speaking practice tool']),
  ('fluentaspeech', 'threads', 'queries', ARRAY['pronunciation practice app', 'english accent improvement', 'IELTS speaking practice']),
  ('fluentaspeech', 'linkedin', 'queries', ARRAY['pronunciation practice english', 'language learning app review'])
on conflict (brand_slug, platform) do nothing;

-- comadrelab
insert into brand_searches (brand_slug, platform, config_key, terms) values
  ('comadrelab', 'reddit', 'queries', ARRAY['small business web design developer', 'latina entrepreneur website', 'necesito pagina web negocio']),
  ('comadrelab', 'hackernews', 'keywords', ARRAY['small business website', 'web studio freelance', 'looking for web developer']),
  ('comadrelab', 'bluesky', 'hashtags', ARRAY['smallbusiness', 'latina', 'emprendedora', 'webdev', 'freelance']),
  ('comadrelab', 'mastodon', 'hashtags', ARRAY['smallbusiness', 'webdesign', 'latina', 'emprendedora']),
  ('comadrelab', 'youtube', 'queries', ARRAY['small business website tips', 'latina entrepreneur online presence', 'web developer for small business']),
  ('comadrelab', 'threads', 'queries', ARRAY['small business web design', 'latina entrepreneur website', 'necesito pagina web']),
  ('comadrelab', 'linkedin', 'queries', ARRAY['looking for web developer small business', 'necesito desarrollador web'])
on conflict (brand_slug, platform) do nothing;
