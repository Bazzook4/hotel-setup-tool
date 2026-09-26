-- OnlineHotelier software marketplace: schema, row-level security, storage.
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.
--
-- Security model. The browser holds only the publishable key, so RLS is the
-- whole access-control layer:
--   anon        reads approved listings only, and never owner_email/admin_note
--   vendor      (signed-in user) reads and edits the companies they own
--   admin       (email listed in marketplace_admins) reads and edits everything
-- A vendor can never change status, slug, owner or admin_note. The guard
-- trigger below enforces that, because RLS alone cannot restrict columns
-- on UPDATE.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------

create table if not exists public.marketplace_admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.marketplace_admins enable row level security;
-- No policies: invisible to the API. Manage it from the SQL editor.

create or replace function public.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.marketplace_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- Categories (what a vendor can say they provide). Admin-managed.
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);

insert into public.categories (slug, name, sort_order) values
  ('property-management-system', 'Property Management System (PMS)', 10),
  ('channel-manager',            'Channel Manager',                  20),
  ('booking-engine',             'Booking Engine',                   30),
  ('revenue-management',         'Revenue Management (RMS)',         40),
  ('rate-shopper',               'Rate Shopper',                     50),
  ('reputation-management',      'Reputation Management',            60),
  ('guest-messaging',            'Guest Messaging & CRM',            70),
  ('hotel-website-builder',      'Hotel Website Builder',            80),
  ('payment-gateway',            'Payment Gateway',                  90),
  ('pos',                        'Restaurant & POS',                100),
  ('housekeeping',               'Housekeeping & Operations',       110),
  ('gst-accounting',             'GST & Accounting',                120)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Companies
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.listing_status as enum
    ('draft', 'pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  tagline text check (char_length(tagline) <= 140),
  description text check (char_length(description) <= 5000),
  website_url text check (website_url ~* '^https?://'),
  headquarters text check (char_length(headquarters) <= 80),
  founded_year int check (founded_year between 1950 and 2100),
  logo_path text,
  status public.listing_status not null default 'draft',
  owner_id uuid references auth.users (id) on delete set null,
  -- Lets an admin create a listing before the vendor has an account. The
  -- vendor signs in with this email and claim_my_companies() links it.
  owner_email text check (owner_email = lower(owner_email)),
  admin_note text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_owner_id_idx on public.companies (owner_id);
create index if not exists companies_owner_email_idx on public.companies (owner_email);
create index if not exists companies_status_idx on public.companies (status);

-- Services: one row per category the company provides, with its own blurb.
create table if not exists public.company_services (
  company_id uuid not null references public.companies (id) on delete cascade,
  category_id bigint not null references public.categories (id) on delete cascade,
  description text check (char_length(description) <= 500),
  primary key (company_id, category_id)
);

create table if not exists public.company_screenshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  path text not null,
  caption text check (char_length(caption) <= 140),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists company_screenshots_company_idx
  on public.company_screenshots (company_id, sort_order);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

-- True when the caller owns the company, or is an admin.
create or replace function public.can_edit_company(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_marketplace_admin()
      or exists (select 1 from public.companies
                 where id = cid and owner_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Guard trigger: what a vendor may and may not change
-- ---------------------------------------------------------------------------

-- Next free slug. Definer so it sees every company, not just the caller's.
create or replace function public.unique_company_slug(name text, cid uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base text := coalesce(nullif(public.slugify(name), ''), 'company');
  candidate text := base;
  n int := 1;
begin
  while exists (select 1 from public.companies where slug = candidate and id <> cid) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

-- Deliberately NOT security definer: it reads current_user to tell an API
-- caller from the table owner, and a definer function would always see the
-- owner.
create or replace function public.companies_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.owner_email is not null then
    new.owner_email := lower(trim(new.owner_email));
  end if;

  -- Only API callers are restricted. claim_my_companies() and the SQL editor
  -- run as the table owner and pass straight through.
  if current_user in ('anon', 'authenticated') and not public.is_marketplace_admin() then
    if tg_op = 'INSERT' then
      new.status := 'draft';
      new.owner_id := auth.uid();
      new.owner_email := lower(auth.jwt() ->> 'email');
      new.admin_note := null;
      new.slug := null;             -- generated below
      new.submitted_at := null;
      new.approved_at := null;
    else
      new.owner_id := old.owner_id;
      new.owner_email := old.owner_email;
      new.admin_note := old.admin_note;
      new.slug := old.slug;
      new.approved_at := old.approved_at;
      -- The one status move a vendor may make: submit a draft or a rejected
      -- listing for review. Edits to an approved listing stay live.
      if new.status is distinct from old.status then
        if new.status = 'pending' and old.status in ('draft', 'rejected') then
          new.submitted_at := now();
        else
          new.status := old.status;
        end if;
      end if;
      if new.status = old.status then
        new.submitted_at := old.submitted_at;
      end if;
    end if;
  end if;

  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    new.approved_at := now();
  end if;

  if new.slug is null or new.slug = '' then
    new.slug := public.unique_company_slug(new.name, new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists companies_guard on public.companies;
create trigger companies_guard
  before insert or update on public.companies
  for each row execute function public.companies_guard();

-- Cap screenshots per company.
create or replace function public.screenshots_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.company_screenshots where company_id = new.company_id) >= 10 then
    raise exception 'A listing can have at most 10 screenshots';
  end if;
  return new;
end;
$$;

drop trigger if exists screenshots_limit on public.company_screenshots;
create trigger screenshots_limit
  before insert on public.company_screenshots
  for each row execute function public.screenshots_limit();

-- Link admin-created listings to the vendor who signs in with that email.
create or replace function public.claim_my_companies()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed int;
begin
  if auth.uid() is null then
    return 0;
  end if;
  update public.companies
     set owner_id = auth.uid()
   where owner_id is null
     and owner_email = lower(auth.jwt() ->> 'email');
  get diagnostics claimed = row_count;
  return claimed;
end;
$$;

revoke all on function public.claim_my_companies() from public, anon;
grant execute on function public.claim_my_companies() to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.companies enable row level security;
alter table public.company_services enable row level security;
alter table public.company_screenshots enable row level security;

-- Categories: everyone reads, admins write.
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories
  for select using (true);

drop policy if exists categories_admin on public.categories;
create policy categories_admin on public.categories
  for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

-- Companies.
drop policy if exists companies_public_read on public.companies;
create policy companies_public_read on public.companies
  for select to anon
  using (status = 'approved');

drop policy if exists companies_owner_read on public.companies;
create policy companies_owner_read on public.companies
  for select to authenticated
  using (owner_id = auth.uid() or public.is_marketplace_admin());

drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies
  for insert to authenticated
  with check (true);  -- the guard trigger forces owner and status

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies
  for update to authenticated
  using (owner_id = auth.uid() or public.is_marketplace_admin())
  with check (owner_id = auth.uid() or public.is_marketplace_admin());

drop policy if exists companies_delete on public.companies;
create policy companies_delete on public.companies
  for delete to authenticated
  using (public.is_marketplace_admin());

-- anon must not see who owns a listing or what the admin wrote about it.
revoke select on public.companies from anon;
grant select (id, slug, name, tagline, description, website_url, headquarters,
              founded_year, logo_path, status, approved_at, updated_at)
  on public.companies to anon;

-- Services and screenshots follow their company.
drop policy if exists services_public_read on public.company_services;
create policy services_public_read on public.company_services
  for select to anon
  using (exists (select 1 from public.companies c
                 where c.id = company_id and c.status = 'approved'));

drop policy if exists services_owner on public.company_services;
create policy services_owner on public.company_services
  for all to authenticated
  using (public.can_edit_company(company_id))
  with check (public.can_edit_company(company_id));

drop policy if exists screenshots_public_read on public.company_screenshots;
create policy screenshots_public_read on public.company_screenshots
  for select to anon
  using (exists (select 1 from public.companies c
                 where c.id = company_id and c.status = 'approved'));

drop policy if exists screenshots_owner on public.company_screenshots;
create policy screenshots_owner on public.company_screenshots
  for all to authenticated
  using (public.can_edit_company(company_id))
  with check (public.can_edit_company(company_id));

-- ---------------------------------------------------------------------------
-- Storage: logos and screenshots, one folder per company id
--   marketplace/<company_id>/logo-<ts>.<ext>
--   marketplace/<company_id>/shots/<uuid>.<ext>
-- Public read (the directory needs the images), writes only by owner/admin.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketplace', 'marketplace', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists marketplace_write on storage.objects;
create policy marketplace_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'marketplace'
              and public.can_edit_company(((storage.foldername(name))[1])::uuid));

drop policy if exists marketplace_update on storage.objects;
create policy marketplace_update on storage.objects
  for update to authenticated
  using (bucket_id = 'marketplace'
         and public.can_edit_company(((storage.foldername(name))[1])::uuid));

drop policy if exists marketplace_delete on storage.objects;
create policy marketplace_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'marketplace'
         and public.can_edit_company(((storage.foldername(name))[1])::uuid));

-- ---------------------------------------------------------------------------
-- Bootstrap: add the OnlineHotelier team as admins (lowercase emails).
-- Uncomment, edit, run. Add more rows the same way later.
-- ---------------------------------------------------------------------------
-- insert into public.marketplace_admins (email) values ('you@example.com')
--   on conflict do nothing;
