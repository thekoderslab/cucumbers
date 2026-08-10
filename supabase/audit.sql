/*
 * Read-only audit of the allowlist. Nothing here deletes or modifies rows.
 *
 * How it works: X post ids are snowflakes, so they increase monotonically
 * with time. A genuine quote of a post must therefore have a LARGER id than
 * the post it quotes. Any stored quote_url whose id is smaller could not
 * possibly be a quote of the campaign post — no API call needed to prove it.
 *
 * The cutoff is the EARLIEST campaign post that was ever live, so that
 * people who quoted the original post before it was swapped are not flagged.
 */

-- ── 1. Summary ────────────────────────────────────────────────────────────
with parsed as (
  select
    id,
    wallet,
    handle,
    quote_url,
    created_at,
    nullif((regexp_match(quote_url, '/status/(\d+)'))[1], '')::bigint as post_id
  from public.allowlist
)
select
  count(*)                                                as total_rows,
  count(*) filter (where post_id is null)                 as unparseable,
  count(*) filter (where post_id < 2086223787532734812)   as impossible_predates_post,
  count(*) filter (where post_id >= 2086223787532734812)  as plausible
from parsed;

-- ── 2. The impossible rows, oldest first ──────────────────────────────────
with parsed as (
  select
    id, wallet, handle, quote_url, created_at, points,
    nullif((regexp_match(quote_url, '/status/(\d+)'))[1], '')::bigint as post_id
  from public.allowlist
)
select
  id, wallet, handle, points, created_at, quote_url,
  to_timestamp(((post_id >> 22) + 1288834974657) / 1000.0) as quote_claimed_at
from parsed
where post_id is null
   or post_id < 2086223787532734812
order by created_at;

-- ── 3. Recycled quote links (one post claiming many spots) ────────────────
select quote_url, count(*) as wallets, min(created_at) as first_seen
from public.allowlist
group by quote_url
having count(*) > 1
order by count(*) desc;

-- ── 4. One X account across many wallets ──────────────────────────────────
select handle, count(*) as wallets, sum(points) as total_points
from public.allowlist
where handle is not null
group by handle
having count(*) > 1
order by count(*) desc;

-- ── 5. Signup bursts (many rows in the same minute = scripted) ────────────
select date_trunc('minute', created_at) as minute, count(*) as signups
from public.allowlist
group by 1
having count(*) > 5
order by count(*) desc
limit 20;
