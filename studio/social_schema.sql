-- Social posting tool (/internal-social). Two new tables, nothing existing is touched.
-- Safe to run more than once.

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'facebook', 'linkedin')),
  external_id text not null,
  username text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'paused', 'needs_reconnect', 'removed')),
  last_error text,
  alerted_at timestamptz,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, external_id)
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.social_accounts(id),
  caption text not null default '',
  media jsonb not null default '[]'::jsonb,
  scheduled_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'publishing', 'published', 'failed', 'check')),
  attempts integer not null default 0,
  error text,
  container_id text,
  external_post_id text,
  permalink text,
  published_at timestamptz,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_posts_due_idx on public.social_posts (status, scheduled_at);
create index if not exists social_posts_account_idx on public.social_posts (account_id);

-- Server only: row level security on with no policies, so only the service key can read or
-- write. The access tokens in social_accounts are never reachable from the browser.
alter table public.social_accounts enable row level security;
alter table public.social_posts enable row level security;
revoke all on public.social_accounts from anon, authenticated;
revoke all on public.social_posts from anon, authenticated;
grant select, insert, update, delete on public.social_accounts to service_role;
grant select, insert, update, delete on public.social_posts to service_role;
