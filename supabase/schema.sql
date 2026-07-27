-- Run this once in the Supabase SQL editor (Project > SQL Editor).
-- auth.users already exists (managed by Supabase Auth) — these tables reference it.

create extension if not exists vector;

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  raw_text text not null,
  parsed_json jsonb,
  embedding vector(1536),
  uploaded_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references resumes (id) on delete cascade,
  target_role text not null,
  gap_report_json jsonb,
  ats_score int,
  created_at timestamptz not null default now()
);

create table if not exists job_matches (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references resumes (id) on delete cascade,
  job_title text not null,
  company text,
  url text,
  match_score numeric,
  source text default 'jsearch',
  created_at timestamptz not null default now()
);

-- Row Level Security: each user can only see their own resumes / analyses / matches.
alter table resumes enable row level security;
alter table analyses enable row level security;
alter table job_matches enable row level security;

create policy "Users manage their own resumes"
  on resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read analyses of their own resumes"
  on analyses for all
  using (
    exists (
      select 1 from resumes
      where resumes.id = analyses.resume_id
      and resumes.user_id = auth.uid()
    )
  );

create policy "Users read job matches of their own resumes"
  on job_matches for all
  using (
    exists (
      select 1 from resumes
      where resumes.id = job_matches.resume_id
      and resumes.user_id = auth.uid()
    )
  );

-- Speeds up nearest-neighbour keyword/embedding search for the job-matching feature.
create index if not exists resumes_embedding_idx
  on resumes using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
