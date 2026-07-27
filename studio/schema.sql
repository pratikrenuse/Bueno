-- 24/7 Spain Studio: run once in the Supabase SQL editor of the EXISTING project.
-- One table, nothing else. Also create a PUBLIC storage bucket named: studio-assets
create table if not exists studio_packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  language text not null default 'en',
  layout text,
  content jsonb,
  image_url text,
  video_url text,
  status text not null default 'pending', -- pending | approved | rejected | published
  reject_comment text,
  decided_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS on, no policies: only the service key (server-side) can touch it.
alter table studio_packages enable row level security;
