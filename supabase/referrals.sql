-- Referral system — run this once in the Supabase SQL Editor, after schema.sql.
-- Safe to re-run.

alter table public.allowlist
  add column if not exists referral_code text,
  add column if not exists referred_by   text,
  add column if not exists points        integer not null default 0;

-- Each signup owns exactly one code, and codes are what ?ref= looks up.
create unique index if not exists allowlist_referral_code_key
  on public.allowlist (referral_code);

create index if not exists allowlist_referred_by_idx
  on public.allowlist (referred_by);

-- Leaderboard ordering.
create index if not exists allowlist_points_idx
  on public.allowlist (points desc);

/*
 * Awarding points has to happen inside the database. Reading points, adding
 * ten, and writing them back from the API would drop awards whenever two
 * referrals land at once — both reads would see the same starting value and
 * the second write would overwrite the first. A single UPDATE that increments
 * in place can't interleave like that.
 */
create or replace function public.award_referral_point(
  code   text,
  amount integer default 10
)
returns integer
language sql
as $$
  update public.allowlist
     set points = points + amount,
         updated_at = now()
   where referral_code = code
  returning points;
$$;
