-- Cucumber Hood allowlist table.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

create table if not exists public.allowlist (
  id          bigint generated always as identity primary key,
  -- Stored lowercased by the API route. EVM addresses are case-insensitive
  -- (mixed case is only a checksum), so normalising is what makes the
  -- uniqueness below actually mean "one row per wallet".
  --
  -- This must be a plain column constraint, not a unique index on
  -- lower(wallet): the route upserts with ON CONFLICT (wallet), and Postgres
  -- requires the conflict target to match the index exactly.
  wallet      text        not null unique,
  quote_url   text        not null,
  handle      text,
  followed    boolean     not null default false,
  reposted    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Handy for spotting people farming spots with many wallets off one account.
-- Not a conflict target, so a functional index is fine here.
create index if not exists allowlist_handle_idx
  on public.allowlist (lower(handle));

-- Lock the table down. No policies are defined, so the anon/public key can
-- neither read nor write it — only the service role key (used server-side in
-- the API route, never shipped to the browser) can touch it.
alter table public.allowlist enable row level security;
