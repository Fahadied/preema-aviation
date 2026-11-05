-- Preema Aviation — core schema
-- Content tables, inquiries, staff, private configuration.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.content_status as enum ('draft', 'published');
create type public.staff_role as enum ('admin', 'consultant');
create type public.inquiry_type as enum (
  'flight', 'holiday', 'visa', 'hotel', 'package', 'destination', 'corporate', 'contact'
);
create type public.inquiry_status as enum (
  'new', 'contacted', 'options_shared', 'awaiting_customer', 'confirmed', 'closed', 'lost'
);
create type public.price_mode as enum ('on_request', 'fixed', 'starting_from');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------------
create table public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role public.staff_role not null default 'consultant',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger staff_profiles_touch before update on public.staff_profiles
  for each row execute function public.touch_updated_at();

-- Only invited e-mail addresses may create staff accounts.
create table public.staff_invitations (
  email text primary key check (email = lower(email)),
  full_name text not null default '',
  role public.staff_role not null default 'consultant',
  invited_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_profiles
    where id = auth.uid() and active
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_profiles
    where id = auth.uid() and active and role = 'admin'
  );
$$;

-- Block sign-ups that were not invited, and create the staff profile for invited ones.
create or replace function private.handle_auth_user_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  inv public.staff_invitations;
begin
  select * into inv from public.staff_invitations
   where email = lower(new.email) and accepted_at is null;
  if not found then
    raise exception 'Sign-up is by invitation only';
  end if;
  return new;
end $$;

create or replace function private.handle_auth_user_created()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  inv public.staff_invitations;
begin
  select * into inv from public.staff_invitations where email = lower(new.email);
  if found then
    insert into public.staff_profiles (id, email, full_name, role)
    values (new.id, lower(new.email), inv.full_name, inv.role)
    on conflict (id) do nothing;
    update public.staff_invitations set accepted_at = now() where email = inv.email;
  end if;
  return new;
end $$;

create trigger preema_before_auth_user_insert before insert on auth.users
  for each row execute function private.handle_auth_user_insert();
create trigger preema_after_auth_user_insert after insert on auth.users
  for each row execute function private.handle_auth_user_created();

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  business_name text not null default 'Preema Aviation',
  tagline text,
  phones text[] not null default '{}',
  whatsapp text,             -- digits with country code, e.g. 8801XXXXXXXXX
  whatsapp_verified boolean not null default false,
  email text,
  office_hours text,
  address text,
  map_url text,
  facebook_url text,
  instagram_url text,
  other_links jsonb not null default '[]'::jsonb,   -- [{label,url}]
  established_year smallint,
  show_established_year boolean not null default false,
  logo_url text,
  seo_title text,
  seo_description text,
  og_image_url text,
  updated_at timestamptz not null default now()
);
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- Not readable by the public.
create table public.private_settings (
  id smallint primary key default 1 check (id = 1),
  notify_emails text[] not null default '{}',
  email_notifications_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger private_settings_touch before update on public.private_settings
  for each row execute function public.touch_updated_at();

create table private.app_secrets (
  name text primary key,
  secret_hash text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en',
  slug text not null,
  title text not null,
  summary text not null default '',
  body text not null default '',
  highlights text[] not null default '{}',
  inquiry_type public.inquiry_type not null default 'contact',
  image_url text,
  image_alt text,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en',
  slug text not null,
  name text not null,
  country text not null default '',
  region text not null default '',
  is_domestic boolean not null default false,
  summary text not null default '',
  overview text not null default '',
  travel_styles text[] not null default '{}',
  experiences text[] not null default '{}',
  planning_notes text not null default '',
  visa_notes text,
  visa_source text,
  visa_reviewed_at date,
  hero_image_url text,
  hero_image_alt text,
  image_credit text,
  image_source_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  is_demo boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);
create trigger destinations_touch before update on public.destinations
  for each row execute function public.touch_updated_at();

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en',
  slug text not null,
  title text not null,
  destination_id uuid references public.destinations(id) on delete set null,
  summary text not null default '',
  overview text not null default '',
  duration_days int check (duration_days is null or duration_days > 0),
  duration_nights int check (duration_nights is null or duration_nights >= 0),
  travel_styles text[] not null default '{}',
  audiences text[] not null default '{}',   -- family, couple, group, corporate
  gallery jsonb not null default '[]'::jsonb,  -- [{url,alt,credit}]
  itinerary jsonb not null default '[]'::jsonb, -- [{day,title,description}]
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  hotel_category text,
  transport text,
  meals text,
  visa_notes text,
  valid_from date,
  valid_until date,
  cancellation_conditions text,
  price_mode public.price_mode not null default 'on_request',
  price_amount numeric(12,2) check (price_amount is null or price_amount >= 0),
  price_currency text not null default 'BDT',
  price_basis text,          -- e.g. "per person, twin sharing"
  price_conditions text,
  price_updated_at date,
  min_travellers int check (min_travellers is null or min_travellers > 0),
  featured boolean not null default false,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  is_demo boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug),
  constraint price_requires_amount check (
    price_mode = 'on_request' or price_amount is not null
  )
);
create trigger packages_touch before update on public.packages
  for each row execute function public.touch_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en',
  question text not null,
  answer text not null,
  category text not null default 'General',
  show_on_home boolean not null default false,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger faqs_touch before update on public.faqs
  for each row execute function public.touch_updated_at();

-- Editable long-form pages: privacy policy, terms, about.
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en',
  slug text not null,
  title text not null,
  body text not null default '',
  needs_owner_review boolean not null default true,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);
create trigger pages_touch before update on public.pages
  for each row execute function public.touch_updated_at();

create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text,
  alt text not null default '',
  credit text,
  source_url text,
  license text,
  uploaded_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inquiries
-- ---------------------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  type public.inquiry_type not null,
  status public.inquiry_status not null default 'new',
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null check (char_length(customer_phone) between 6 and 30),
  customer_email text check (customer_email is null or char_length(customer_email) <= 200),
  organization text,
  details jsonb not null default '{}'::jsonb,
  package_id uuid references public.packages(id) on delete set null,
  destination_id uuid references public.destinations(id) on delete set null,
  context_label text,             -- human-readable package/destination title at time of inquiry
  source_path text,
  assigned_to uuid references public.staff_profiles(id) on delete set null,
  idempotency_key uuid not null unique,
  ip_hash text,
  privacy_ack boolean not null default false,
  notification_status text not null default 'not_configured'
    check (notification_status in ('not_configured', 'pending', 'sent', 'failed')),
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_created_idx on public.inquiries (created_at desc);
create index inquiries_status_idx on public.inquiries (status);
create index inquiries_assigned_idx on public.inquiries (assigned_to);
create index inquiries_ip_idx on public.inquiries (ip_hash, created_at desc);
create trigger inquiries_touch before update on public.inquiries
  for each row execute function public.touch_updated_at();

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid references public.staff_profiles(id) on delete set null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id, created_at);

create table public.inquiry_events (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  actor_id uuid references public.staff_profiles(id) on delete set null,
  event_type text not null,  -- created, status_changed, assigned, note_added, notification
  from_value text,
  to_value text,
  created_at timestamptz not null default now()
);
create index inquiry_events_inquiry_idx on public.inquiry_events (inquiry_id, created_at);

-- Record status / assignment changes automatically, with the acting staff member.
create or replace function private.log_inquiry_changes()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.inquiry_events (inquiry_id, actor_id, event_type, from_value, to_value)
    values (new.id, auth.uid(), 'status_changed', old.status::text, new.status::text);
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    insert into public.inquiry_events (inquiry_id, actor_id, event_type, from_value, to_value)
    values (new.id, auth.uid(), 'assigned',
      (select coalesce(nullif(full_name, ''), email) from public.staff_profiles where id = old.assigned_to),
      (select coalesce(nullif(full_name, ''), email) from public.staff_profiles where id = new.assigned_to));
  end if;
  return new;
end $$;
create trigger inquiries_log_changes after update on public.inquiries
  for each row execute function private.log_inquiry_changes();

create or replace function private.log_inquiry_note()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.inquiry_events (inquiry_id, actor_id, event_type, to_value)
  values (new.inquiry_id, new.author_id, 'note_added', left(new.body, 80));
  return new;
end $$;
create trigger inquiry_notes_log after insert on public.inquiry_notes
  for each row execute function private.log_inquiry_note();

-- Staff may only change workflow fields on an inquiry, never the customer's submission.
create or replace function private.guard_inquiry_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.reference is distinct from old.reference
       or new.type is distinct from old.type
       or new.customer_name is distinct from old.customer_name
       or new.customer_phone is distinct from old.customer_phone
       or new.customer_email is distinct from old.customer_email
       or new.details is distinct from old.details
       or new.idempotency_key is distinct from old.idempotency_key
       or new.created_at is distinct from old.created_at then
      raise exception 'Only status and assignment can be changed';
    end if;
  end if;
  return new;
end $$;
create trigger inquiries_guard before update on public.inquiries
  for each row execute function private.guard_inquiry_update();
