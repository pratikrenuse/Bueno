-- Spain 24/7 trade directory: cache table.
-- Run once in the Supabase SQL editor (BUENO project). Safe to re-run.
--
-- One row per (locality, trade). `results` holds the shaped Google Places response for
-- that pair. Nothing else is stored, and nothing is stored for longer than 30 days:
-- api/directory.js refuses to serve a row older than that and overwrites it on the next
-- request, which is what Google's caching terms require. The purge job at the bottom is
-- belt and braces for localities that stop getting traffic and would otherwise sit with
-- stale content in the table forever.

create table if not exists public.directory_cells (
  locality_slug text not null,
  category      text not null,
  results       jsonb not null default '[]'::jsonb,
  fetched_at    timestamptz not null default now(),
  constraint directory_cells_pkey primary key (locality_slug, category)
);

create index if not exists directory_cells_fetched_at_idx
  on public.directory_cells (fetched_at desc);

-- The table is read and written only by api/directory.js using the service key, which
-- bypasses RLS. Enabling RLS with no policy means the anon key cannot reach it, so the
-- cache can never be read or poisoned from a browser.
alter table public.directory_cells enable row level security;

-- Housekeeping. Google's terms cap caching of their content at 30 days; the API already
-- refuses to serve anything older, this clears it out so nothing expired sits at rest.
-- Run it from the Supabase dashboard on a schedule, or call it by hand now and then.
create or replace function public.purge_expired_directory_cells()
returns integer
language plpgsql
as $$
declare
  removed integer;
begin
  delete from public.directory_cells
   where fetched_at < now() - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;
