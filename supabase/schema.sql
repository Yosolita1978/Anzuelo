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

-- RLS
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
