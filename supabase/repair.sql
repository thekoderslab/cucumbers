-- Run this ONLY if you already created the allowlist table using the first
-- version of schema.sql (the one with a unique index on lower(wallet)).
--
-- Why it's needed: schema.sql uses `create table if not exists`, so re-running
-- the corrected version does nothing on a table that already exists — the
-- plain unique constraint on wallet never gets added, and every upsert keeps
-- failing with 42P10.

-- 1. Drop the old functional unique index. ON CONFLICT (wallet) can't use it.
drop index if exists public.allowlist_wallet_key;

-- 2. Normalise anything already stored, so the constraint below can be added
--    and dedupe works from here on.
update public.allowlist set wallet = lower(wallet) where wallet <> lower(wallet);

-- 3. Remove duplicates that differed only by casing, keeping the newest row.
delete from public.allowlist a
using public.allowlist b
where a.wallet = b.wallet
  and a.id < b.id;

-- 4. Add the plain unique constraint the upsert actually targets.
alter table public.allowlist
  drop constraint if exists allowlist_wallet_unique;
alter table public.allowlist
  add constraint allowlist_wallet_unique unique (wallet);

-- 5. Confirm it worked — you should see allowlist_wallet_unique listed.
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.allowlist'::regclass;
