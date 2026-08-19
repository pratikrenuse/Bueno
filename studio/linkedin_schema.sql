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
