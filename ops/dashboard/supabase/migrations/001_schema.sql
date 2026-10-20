-- OnlineHotelier admin: tables for the leads CRM and the page tracker.
-- Paste into the Supabase SQL editor and run. Safe to re-run: every statement
-- is idempotent. Run 002 and 003 after this one.

create schema if not exists site_admin;

-- ── Access ──────────────────────────────────────────────────────────────

-- Who may use /admin/. Being signed in to Supabase is not enough.
create table if not exists site_admin.admin_users (
  user_id  uuid primary key references auth.users on delete cascade,
  added_at timestamptz not null default now()
);

-- Hashes of the shared secrets used by the site's lead capture and by the
-- GitHub page-tracker job. Never readable through the API.
create table if not exists site_admin.app_secrets (
  name        text primary key,          -- 'lead_capture' | 'tracker'
  secret_hash text not null,             -- hex sha256 of the secret
  created_at  timestamptz not null default now()
);

-- ── Leads CRM ───────────────────────────────────────────────────────────

create table if not exists site_admin.leads (
  id             bigserial primary key,
  ref            text unique,            -- OH-7K2MX from the WhatsApp message; null for manual leads
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  source         text not null default 'other',
  page_path      text,
  referrer       text,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  -- as captured from the site form
  service        text,
  inventory      text,
  location       text,
  managed        text,
  message        text,
  -- added by the team once the chat arrives
  name           text,
  phone          text,
  email          text,
  hotel_name     text,
  city           text,
  rooms          int,
  status         text not null default 'new',
  value_inr      int,
  lost_reason    text,
  next_follow_up date,
  closed_at      timestamptz,            -- set when status becomes won or lost
  assigned_to    uuid references auth.users on delete set null,
  constraint leads_status_check check (status in
    ('new','contacted','qualified','proposal','won','lost','unresponsive')),
  constraint leads_source_check check (source in
    ('widget_form','contact_form','pms_direct','whatsapp_direct','phone','referral','other')),
  constraint leads_lost_reason_check check (status <> 'lost' or coalesce(trim(lost_reason), '') <> '')
);
create index if not exists leads_status_idx    on site_admin.leads (status);
create index if not exists leads_follow_up_idx on site_admin.leads (next_follow_up);
create index if not exists leads_page_idx      on site_admin.leads (page_path);

create table if not exists site_admin.lead_activities (
  id         bigserial primary key,
  lead_id    bigint not null references site_admin.leads on delete cascade,
  at         timestamptz not null default now(),
  user_id    uuid default auth.uid(),
  user_email text default (auth.jwt() ->> 'email'),
  type       text not null default 'note',
  body       text,
  constraint lead_activities_type_check check (type in
    ('note','call','whatsapp','email','proposal','status_change'))
);
create index if not exists lead_activities_lead_idx on site_admin.lead_activities (lead_id, at desc);

-- Rate limiting for public lead capture. Holds only a salted hash of the IP.
create table if not exists site_admin.lead_capture_log (
  ip_hash text not null,
  at      timestamptz not null default now()
);
create index if not exists lead_capture_log_idx on site_admin.lead_capture_log (ip_hash, at);

-- updated_at on every edit; closed_at when a lead is won or lost
create or replace function site_admin.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    new.closed_at := case when new.status in ('won', 'lost') then now() else null end;
  end if;
  return new;
end $$;

drop trigger if exists leads_touch on site_admin.leads;
create trigger leads_touch before update on site_admin.leads
  for each row execute function site_admin.touch_updated_at();

-- A status change is written to the lead's timeline automatically.
create or replace function site_admin.log_status_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into site_admin.lead_activities (lead_id, type, body)
    values (new.id, 'status_change', old.status || ' → ' || new.status
            || case when new.status = 'lost' then ' (' || new.lost_reason || ')' else '' end);
  end if;
  return new;
end $$;

drop trigger if exists leads_status_log on site_admin.leads;
create trigger leads_status_log after update on site_admin.leads
  for each row execute function site_admin.log_status_change();

-- ── Page tracker ────────────────────────────────────────────────────────

create table if not exists site_admin.pages (
  path               text primary key,   -- /guides/ota/what-is-ota.html, /tools/x/
  type               text,               -- guide | hub | tool | service | other
  category           text,
  title              text,
  title_len          int,
  meta_desc          text,
  meta_len           int,
  h1                 text,
  word_count         int,
  schema_types       jsonb,
  canonical          text,
  internal_links_out int,
  internal_links_in  int,
  in_sitemap         boolean,
  in_guide_nav       boolean,
  in_guides_index    boolean,
  noindex            boolean,
  checks             jsonb,              -- { key: { ok, label, detail } }
  checks_failed      int,
  repo_hash          text,               -- sha256 of the file at HEAD
  first_added        timestamptz,
  last_changed       timestamptz,
  last_commit        text,
  last_message       text,
  deleted_at         timestamptz,        -- file removed; the row is kept
  live_status        text,               -- live | stale | missing | redirect | error | gone | still_live
  live_http          int,
  live_redirect_to   text,
  live_checked_at    timestamptz,
  scanned_at         timestamptz
);

create table if not exists site_admin.changes (
  commit_sha        text not null,
  path              text not null,
  committed_at      timestamptz not null,
  author            text,
  message           text,
  change_type       text not null,       -- added | modified | deleted | renamed
  old_path          text,                -- for renames
  kinds             jsonb,               -- ["title","meta","body",…]
  lines_added       int,
  lines_removed     int,
  live_status       text,                -- live | not_live | redirect | superseded
  live_confirmed_at timestamptz,
  primary key (commit_sha, path)
);
create index if not exists changes_path_idx on site_admin.changes (path, committed_at desc);
create index if not exists changes_time_idx on site_admin.changes (committed_at desc);

create table if not exists site_admin.live_checks (
  path         text not null,
  checked_at   timestamptz not null,
  http_status  int,
  live_hash    text,
  matches_repo boolean,
  redirect_to  text,
  primary key (path, checked_at)
);

create table if not exists site_admin.redirects (
  from_path text primary key,
  to_path   text not null
);

create table if not exists site_admin.sync_runs (
  id          bigserial primary key,
  source      text,
  started_at  timestamptz,
  finished_at timestamptz,
  rows        int,
  status      text,
  error       text
);
