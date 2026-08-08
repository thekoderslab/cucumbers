-- Cucumber Hood allowlist table.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

create table if not exists public.allowlist (
  id          bigint generated always as identity primary key,
  wallet      text        not null,
  quote_url   text        not null,
  handle      text,
  followed    boolean     not null default false,
  reposted    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per wallet. Re-submitting the same address updates it rather than
-- creating a duplicate (the API route upserts on this constraint).
create unique index if not exists allowlist_wallet_key
  on public.allowlist (lower(wallet));

-- Handy for spotting people farming spots with many wallets off one account.
create index if not exists allowlist_handle_idx
  on public.allowlist (lower(handle));

-- Lock the table down. No policies are defined, so the anon/public key can
-- neither read nor write it — only the service role key (used server-side in
-- the API route, never shipped to the browser) can touch it.
alter table public.allowlist enable row level security;
