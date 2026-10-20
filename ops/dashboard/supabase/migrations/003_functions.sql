-- OnlineHotelier admin: the only ways in for callers that are not signed in.
-- Run after 002. Safe to re-run.
--
--   capture_lead   called by the public site's /api/leads (Vercel env holds the secret)
--   tracker_*      called by the GitHub page-tracker job (Actions secret)
--
-- Each takes a shared secret and checks it against site_admin.app_secrets,
-- which stores only its sha256. The anon key alone cannot do anything here.

create or replace function site_admin.check_secret(p_name text, p_secret text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from site_admin.app_secrets
    where name = p_name
      and p_secret is not null
      and secret_hash = encode(sha256(convert_to(p_secret, 'UTF8')), 'hex')
  )
$$;
revoke all on function site_admin.check_secret(text, text) from public, anon, authenticated;

-- ── Lead capture ────────────────────────────────────────────────────────

create or replace function site_admin.capture_lead(p_secret text, p_ip_hash text, p_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_ref    text;
  v_source text;
begin
  if not site_admin.check_secret('lead_capture', p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- 10 captures per visitor per hour, 300 across the whole site.
  if (select count(*) from site_admin.lead_capture_log
      where ip_hash = p_ip_hash and at > now() - interval '1 hour') >= 10
     or (select count(*) from site_admin.lead_capture_log
      where at > now() - interval '1 hour') >= 300 then
    return;
  end if;

  insert into site_admin.lead_capture_log (ip_hash) values (p_ip_hash);
  delete from site_admin.lead_capture_log where at < now() - interval '1 day';

  v_ref := upper(p_payload ->> 'ref');
  if v_ref !~ '^OH-[A-Z0-9]{5}$' then v_ref := null; end if;

  v_source := p_payload ->> 'source';
  if v_source not in ('widget_form', 'contact_form', 'pms_direct') then
    v_source := 'other';
  end if;

  insert into site_admin.leads (
    ref, source, page_path, referrer, utm_source, utm_medium, utm_campaign,
    service, inventory, location, managed, message
  ) values (
    v_ref, v_source,
    nullif(left(trim(p_payload ->> 'page_path'),    300), ''),
    nullif(left(trim(p_payload ->> 'referrer'),     500), ''),
    nullif(left(trim(p_payload ->> 'utm_source'),   100), ''),
    nullif(left(trim(p_payload ->> 'utm_medium'),   100), ''),
    nullif(left(trim(p_payload ->> 'utm_campaign'), 100), ''),
    nullif(left(trim(p_payload ->> 'service'),      120), ''),
    nullif(left(trim(p_payload ->> 'inventory'),     60), ''),
    nullif(left(trim(p_payload ->> 'location'),     120), ''),
    nullif(left(trim(p_payload ->> 'managed'),       60), ''),
    nullif(left(trim(p_payload ->> 'message'),     2000), '')
  )
  on conflict (ref) do nothing;
end $$;

-- ── Page tracker ────────────────────────────────────────────────────────

create or replace function site_admin.tracker_known_commits(p_secret text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not site_admin.check_secret('tracker', p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return (select coalesce(jsonb_agg(distinct commit_sha), '[]'::jsonb) from site_admin.changes);
end $$;

create or replace function site_admin.tracker_ingest(
  p_secret text, p_pages jsonb, p_changes jsonb, p_redirects jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  n_pages int; n_changes int;
begin
  if not site_admin.check_secret('tracker', p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into site_admin.pages as p (
    path, type, category, title, title_len, meta_desc, meta_len, h1, word_count,
    schema_types, canonical, internal_links_out, internal_links_in,
    in_sitemap, in_guide_nav, in_guides_index, noindex, checks, checks_failed,
    repo_hash, first_added, last_changed, last_commit, last_message, deleted_at, scanned_at)
  select
    x.path, x.type, x.category, x.title, x.title_len, x.meta_desc, x.meta_len, x.h1, x.word_count,
    x.schema_types, x.canonical, x.internal_links_out, x.internal_links_in,
    x.in_sitemap, x.in_guide_nav, x.in_guides_index, x.noindex, x.checks, x.checks_failed,
    x.repo_hash, x.first_added, x.last_changed, x.last_commit, x.last_message, x.deleted_at, now()
  from jsonb_to_recordset(p_pages) as x(
    path text, type text, category text, title text, title_len int, meta_desc text,
    meta_len int, h1 text, word_count int, schema_types jsonb, canonical text,
    internal_links_out int, internal_links_in int, in_sitemap boolean,
    in_guide_nav boolean, in_guides_index boolean, noindex boolean, checks jsonb,
    checks_failed int, repo_hash text, first_added timestamptz, last_changed timestamptz,
    last_commit text, last_message text, deleted_at timestamptz)
  on conflict (path) do update set
    type               = excluded.type,
    category           = excluded.category,
    -- a deleted page keeps the last details it had while it existed
    title              = coalesce(excluded.title,              p.title),
    title_len          = coalesce(excluded.title_len,          p.title_len),
    meta_desc          = coalesce(excluded.meta_desc,          p.meta_desc),
    meta_len           = coalesce(excluded.meta_len,           p.meta_len),
    h1                 = coalesce(excluded.h1,                 p.h1),
    word_count         = coalesce(excluded.word_count,         p.word_count),
    schema_types       = coalesce(excluded.schema_types,       p.schema_types),
    canonical          = coalesce(excluded.canonical,          p.canonical),
    internal_links_out = coalesce(excluded.internal_links_out, p.internal_links_out),
    internal_links_in  = excluded.internal_links_in,
    in_sitemap         = excluded.in_sitemap,
    in_guide_nav       = excluded.in_guide_nav,
    in_guides_index    = excluded.in_guides_index,
    noindex            = coalesce(excluded.noindex,            p.noindex),
    checks             = case when excluded.deleted_at is null then excluded.checks else p.checks end,
    checks_failed      = case when excluded.deleted_at is null then excluded.checks_failed else p.checks_failed end,
    repo_hash          = excluded.repo_hash,
    first_added        = excluded.first_added,
    last_changed       = excluded.last_changed,
    last_commit        = excluded.last_commit,
    last_message       = excluded.last_message,
    deleted_at         = excluded.deleted_at,
    scanned_at         = now();
  get diagnostics n_pages = row_count;

  insert into site_admin.changes as c (
    commit_sha, path, committed_at, author, message, change_type, old_path,
    kinds, lines_added, lines_removed)
  select x.commit_sha, x.path, x.committed_at, x.author, x.message, x.change_type,
         x.old_path, x.kinds, x.lines_added, x.lines_removed
  from jsonb_to_recordset(p_changes) as x(
    commit_sha text, path text, committed_at timestamptz, author text, message text,
    change_type text, old_path text, kinds jsonb, lines_added int, lines_removed int)
  on conflict (commit_sha, path) do update set
    committed_at  = excluded.committed_at,
    author        = excluded.author,
    message       = excluded.message,
    change_type   = excluded.change_type,
    old_path      = excluded.old_path,
    kinds         = coalesce(excluded.kinds, c.kinds),
    lines_added   = excluded.lines_added,
    lines_removed = excluded.lines_removed;
  get diagnostics n_changes = row_count;

  if p_redirects is not null then
    delete from site_admin.redirects where true;
    insert into site_admin.redirects (from_path, to_path)
    select x.from_path, x.to_path
    from jsonb_to_recordset(p_redirects) as x(from_path text, to_path text)
    on conflict (from_path) do update set to_path = excluded.to_path;
  end if;

  return jsonb_build_object('pages', n_pages, 'changes', n_changes);
end $$;

create or replace function site_admin.tracker_live(p_secret text, p_checks jsonb, p_statuses jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not site_admin.check_secret('tracker', p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into site_admin.live_checks (path, checked_at, http_status, live_hash, matches_repo, redirect_to)
  select x.path, x.checked_at, x.http_status, x.live_hash, x.matches_repo, x.redirect_to
  from jsonb_to_recordset(p_checks) as x(
    path text, checked_at timestamptz, http_status int, live_hash text,
    matches_repo boolean, redirect_to text, live_status text)
  on conflict do nothing;

  update site_admin.pages p set
    live_status      = x.live_status,
    live_http        = x.http_status,
    live_redirect_to = x.redirect_to,
    live_checked_at  = x.checked_at
  from jsonb_to_recordset(p_checks) as x(
    path text, checked_at timestamptz, http_status int, redirect_to text, live_status text)
  where p.path = x.path;

  -- The newest change to each page takes the page's live result...
  update site_admin.changes c set
    live_status       = s.live_status,
    live_confirmed_at = case when s.live_status in ('live', 'redirect')
                             then coalesce(c.live_confirmed_at, now())
                             else c.live_confirmed_at end
  from jsonb_to_recordset(p_statuses) as s(commit_sha text, path text, live_status text)
  where c.commit_sha = s.commit_sha and c.path = s.path;

  -- ...and every older change to that page is superseded.
  update site_admin.changes c set live_status = 'superseded'
  where c.live_status is distinct from 'superseded'
    and exists (select 1 from site_admin.changes d
                where d.path = c.path and d.committed_at > c.committed_at);

  delete from site_admin.live_checks where checked_at < now() - interval '30 days';
end $$;

create or replace function site_admin.tracker_log(
  p_secret text, p_source text, p_started timestamptz, p_finished timestamptz,
  p_rows int, p_status text, p_error text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not site_admin.check_secret('tracker', p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  insert into site_admin.sync_runs (source, started_at, finished_at, rows, status, error)
  values (p_source, p_started, p_finished, p_rows, p_status, left(p_error, 2000));
  delete from site_admin.sync_runs where started_at < now() - interval '90 days';
end $$;

-- ── Who may call what ───────────────────────────────────────────────────

revoke all on function site_admin.capture_lead(text, text, jsonb)                from public;
revoke all on function site_admin.tracker_known_commits(text)                    from public;
revoke all on function site_admin.tracker_ingest(text, jsonb, jsonb, jsonb)      from public;
revoke all on function site_admin.tracker_live(text, jsonb, jsonb)               from public;
revoke all on function site_admin.tracker_log(text, text, timestamptz, timestamptz, int, text, text) from public;

grant execute on function site_admin.capture_lead(text, text, jsonb)             to anon;
grant execute on function site_admin.tracker_known_commits(text)                 to anon;
grant execute on function site_admin.tracker_ingest(text, jsonb, jsonb, jsonb)   to anon;
grant execute on function site_admin.tracker_live(text, jsonb, jsonb)            to anon;
grant execute on function site_admin.tracker_log(text, text, timestamptz, timestamptz, int, text, text) to anon;
