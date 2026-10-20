-- OnlineHotelier admin: who can read and write what. Run after 001.
-- Safe to re-run.
--
-- The model:
--   * The browser uses the public anon key. anon gets NO table access at all,
--     only EXECUTE on the two secret-checked functions in 003.
--   * Signed-in users get table access, and RLS lets a request through only if
--     the user is listed in site_admin.admin_users.
--   * app_secrets, lead_capture_log and admin_users have RLS on and no policy,
--     so they are unreachable through the API.

-- ── Who is an admin ─────────────────────────────────────────────────────

create or replace function site_admin.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from site_admin.admin_users where user_id = (select auth.uid())
  )
$$;
revoke all on function site_admin.is_admin() from public, anon;
grant execute on function site_admin.is_admin() to authenticated;

-- Trigger helpers are not callable through the API.
revoke all on function site_admin.touch_updated_at()  from public, anon, authenticated;
revoke all on function site_admin.log_status_change() from public, anon, authenticated;

-- ── Grants ──────────────────────────────────────────────────────────────

grant usage on schema site_admin to anon, authenticated;

revoke all on all tables    in schema site_admin from anon, authenticated;
revoke all on all sequences in schema site_admin from anon, authenticated;

grant select, insert, update, delete on site_admin.leads           to authenticated;
grant select, insert, update, delete on site_admin.lead_activities to authenticated;
grant usage, select on sequence site_admin.leads_id_seq            to authenticated;
grant usage, select on sequence site_admin.lead_activities_id_seq  to authenticated;

grant select on site_admin.pages       to authenticated;
grant select on site_admin.changes     to authenticated;
grant select on site_admin.live_checks to authenticated;
grant select on site_admin.redirects   to authenticated;
grant select on site_admin.sync_runs   to authenticated;

-- ── Row Level Security ──────────────────────────────────────────────────

alter table site_admin.admin_users      enable row level security;
alter table site_admin.app_secrets      enable row level security;
alter table site_admin.leads            enable row level security;
alter table site_admin.lead_activities  enable row level security;
alter table site_admin.lead_capture_log enable row level security;
alter table site_admin.pages            enable row level security;
alter table site_admin.changes          enable row level security;
alter table site_admin.live_checks      enable row level security;
alter table site_admin.redirects        enable row level security;
alter table site_admin.sync_runs        enable row level security;

-- CRM: admins read and write.
drop policy if exists admin_all on site_admin.leads;
create policy admin_all on site_admin.leads
  for all to authenticated
  using ((select site_admin.is_admin())) with check ((select site_admin.is_admin()));

drop policy if exists admin_all on site_admin.lead_activities;
create policy admin_all on site_admin.lead_activities
  for all to authenticated
  using ((select site_admin.is_admin())) with check ((select site_admin.is_admin()));

-- Page tracker: admins read. Writes come only through the 003 functions.
drop policy if exists admin_read on site_admin.pages;
create policy admin_read on site_admin.pages
  for select to authenticated using ((select site_admin.is_admin()));

drop policy if exists admin_read on site_admin.changes;
create policy admin_read on site_admin.changes
  for select to authenticated using ((select site_admin.is_admin()));

drop policy if exists admin_read on site_admin.live_checks;
create policy admin_read on site_admin.live_checks
  for select to authenticated using ((select site_admin.is_admin()));

drop policy if exists admin_read on site_admin.redirects;
create policy admin_read on site_admin.redirects
  for select to authenticated using ((select site_admin.is_admin()));

drop policy if exists admin_read on site_admin.sync_runs;
create policy admin_read on site_admin.sync_runs
  for select to authenticated using ((select site_admin.is_admin()));

-- ── Guard: fail loudly if any table in the schema has RLS off ───────────

do $$
declare missing text;
begin
  select string_agg(c.relname, ', ') into missing
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'site_admin' and c.relkind = 'r' and not c.relrowsecurity;
  if missing is not null then
    raise exception 'RLS is off on site_admin tables: %', missing;
  end if;
end $$;
