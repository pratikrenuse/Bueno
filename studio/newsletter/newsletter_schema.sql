-- Bueno newsletter review table. Applied to the Bueno Supabase project on 1 Oct 2026.
-- Kept here as the record of what the table looks like. Safe to re-run.
create table if not exists public.newsletter_issues (
  id               bigserial primary key,
  issue_key        text not null unique,          -- 'nl-13'
  number           int,
  send_date        date,
  alert_date       date,                          -- the day Pratik and John get the review email
  status           text not null default 'pending'
                   check (status in ('pending','approved','rejected','scheduled')),
  news_status      text not null default 'researched'
                   check (news_status in ('researched','to_refresh')),
  guide            text,
  region           text,
  reader_topic     text,
  content          jsonb not null,                -- { en, no, sv } as written
  edited           jsonb,                         -- John's version, same shape; wins when set
  sources          jsonb,
  reject_note      text,
  approved_at      timestamptz,
  scheduled_at     timestamptz,
  news_refreshed_at timestamptz,
  alert_sent_at    timestamptz,
  approval_sent_at timestamptz,
  last_email       jsonb,                         -- result of the last email attempt
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.newsletter_issues enable row level security;
-- No policies on purpose: only the service key used by api/newsletter.js can read or write.
