-- LinkedIn review deck: run once in the Supabase SQL editor (BUENO project zwdkmqzlrhwihijgqgzl).
-- Table for team LinkedIn posts reviewed at /internal-linkedin.
create table if not exists linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  language text not null default 'en',
  member text not null default '',          -- '' = English master; later: monique, izahbel, petter, yenna, amina, felix
  batch int not null default 1,
  day int,                                  -- posting order within the batch
  title text,
  post_text text not null,
  edited_text text,                         -- reviewer's edited version; wins over post_text everywhere
  status text not null default 'pending',   -- pending | approved | rejected
  reject_comment text,
  decided_at timestamptz,
  posted_at timestamptz,                    -- set later when a member marks it posted
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, language, member)
);

-- Migration 19 Aug 2026: three content streams. Run this line in the SQL editor
-- (safe on a fresh table too; existing rows become 'owners').
alter table linkedin_posts add column if not exists audience text not null default 'owners';

-- Migration 20 Aug 2026: post images (served from /photos/ on the site).
alter table linkedin_posts add column if not exists image_url text;

-- Migration 20 Aug 2026 (phase 2): team roster, email log, dispatch tracking.
alter table linkedin_posts add column if not exists sent_at timestamptz;

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  email text,                               -- fill in; members without email are skipped
  language text not null default 'en',
  stream text not null default 'owners',    -- which content stream this member posts: owners | agents | attorneys
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into team_members (name, language) values
  ('Monique','nl'), ('Izahbel','sv'), ('Petter','no'), ('Yenna','es'), ('Amina','fr'), ('Felix','en')
on conflict (name) do nothing;

create table if not exists linkedin_emails (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references linkedin_posts(id) on delete set null,
  post_slug text,
  post_title text,
  member_name text,
  member_email text,
  status text not null default 'sent',      -- sent | failed
  error text,
  resend_id text,
  sent_at timestamptz not null default now()
);
