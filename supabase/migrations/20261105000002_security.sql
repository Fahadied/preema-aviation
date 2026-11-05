-- Preema Aviation — row level security, inquiry submission RPCs, storage.

-- ---------------------------------------------------------------------------
-- Server secret used by the website to submit inquiries.
-- Set it once in the SQL editor:  select private.set_app_secret('inquiry_submit', '<long random value>');
-- and put the same value in INQUIRY_SUBMIT_SECRET on the server.
-- ---------------------------------------------------------------------------
create or replace function private.set_app_secret(p_name text, p_value text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if char_length(p_value) < 32 then
    raise exception 'Secret must be at least 32 characters';
  end if;
  insert into private.app_secrets (name, secret_hash)
  values (p_name, encode(extensions.digest(p_value, 'sha256'), 'hex'))
  on conflict (name) do update set secret_hash = excluded.secret_hash, updated_at = now();
end $$;
revoke all on function private.set_app_secret(text, text) from public, anon, authenticated;

create or replace function private.check_app_secret(p_name text, p_value text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.app_secrets
    where name = p_name
      and p_value is not null
      and secret_hash = encode(extensions.digest(p_value, 'sha256'), 'hex')
  );
$$;
revoke all on function private.check_app_secret(text, text) from public, anon, authenticated;

create or replace function private.new_reference()
returns text language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  bytes bytea := extensions.gen_random_bytes(8);
  out text := 'PA-';
  i int;
begin
  for i in 0..7 loop
    if i = 4 then out := out || '-'; end if;
    out := out || substr(alphabet, (get_byte(bytes, i) % 31) + 1, 1);
  end loop;
  return out;
end $$;

-- ---------------------------------------------------------------------------
-- submit_inquiry: called only by the website server (holds the secret).
-- Returns { ok, reference, duplicate, notify_enabled, notify_emails } or { ok:false, error }.
-- ---------------------------------------------------------------------------
create or replace function public.submit_inquiry(p_secret text, p_payload jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_key uuid;
  v_existing public.inquiries;
  v_type public.inquiry_type;
  v_ip text := nullif(p_payload->>'ip_hash', '');
  v_phone text := btrim(coalesce(p_payload->>'customer_phone', ''));
  v_package public.packages;
  v_destination public.destinations;
  v_label text;
  v_ref text;
  v_id uuid;
  v_priv public.private_settings;
begin
  if not private.check_app_secret('inquiry_submit', p_secret) then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  begin
    v_key := (p_payload->>'idempotency_key')::uuid;
    v_type := (p_payload->>'type')::public.inquiry_type;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end;
  if v_key is null then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  -- Idempotency: the same form submission returns the original reference.
  select * into v_existing from public.inquiries where idempotency_key = v_key;
  if found then
    return jsonb_build_object('ok', true, 'reference', v_existing.reference, 'duplicate', true,
                              'notify_enabled', false, 'notify_emails', '[]'::jsonb);
  end if;

  -- Rate limits
  if v_ip is not null and (
      select count(*) from public.inquiries
      where ip_hash = v_ip and created_at > now() - interval '10 minutes') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  if (select count(*) from public.inquiries
      where customer_phone = v_phone and created_at > now() - interval '1 hour') >= 6 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  if (select count(*) from public.inquiries
      where created_at > now() - interval '10 minutes') >= 200 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  -- Context: only published records can be referenced.
  if nullif(p_payload->>'package_slug', '') is not null then
    select * into v_package from public.packages
     where slug = p_payload->>'package_slug' and status = 'published' limit 1;
    if found then
      v_label := v_package.title;
      if v_package.destination_id is not null then
        select * into v_destination from public.destinations where id = v_package.destination_id;
      end if;
    end if;
  end if;
  if v_destination.id is null and nullif(p_payload->>'destination_slug', '') is not null then
    select * into v_destination from public.destinations
     where slug = p_payload->>'destination_slug' and status = 'published' limit 1;
    if found and v_label is null then
      v_label := v_destination.name;
    end if;
  end if;

  loop
    v_ref := private.new_reference();
    exit when not exists (select 1 from public.inquiries where reference = v_ref);
  end loop;

  select * into v_priv from public.private_settings where id = 1;

  insert into public.inquiries (
    reference, type, customer_name, customer_phone, customer_email, organization,
    details, package_id, destination_id, context_label, source_path,
    idempotency_key, ip_hash, privacy_ack, notification_status
  ) values (
    v_ref, v_type,
    btrim(p_payload->>'customer_name'),
    v_phone,
    nullif(btrim(coalesce(p_payload->>'customer_email', '')), ''),
    nullif(btrim(coalesce(p_payload->>'organization', '')), ''),
    coalesce(p_payload->'details', '{}'::jsonb),
    v_package.id, v_destination.id, v_label,
    left(p_payload->>'source_path', 300),
    v_key, v_ip,
    coalesce((p_payload->>'privacy_ack')::boolean, false),
    case when coalesce(v_priv.email_notifications_enabled, false)
              and coalesce(array_length(v_priv.notify_emails, 1), 0) > 0
         then 'pending' else 'not_configured' end
  ) returning id into v_id;

  insert into public.inquiry_events (inquiry_id, event_type, to_value)
  values (v_id, 'created', 'new');

  return jsonb_build_object(
    'ok', true,
    'reference', v_ref,
    'duplicate', false,
    'notify_enabled', coalesce(v_priv.email_notifications_enabled, false)
                      and coalesce(array_length(v_priv.notify_emails, 1), 0) > 0,
    'notify_emails', to_jsonb(coalesce(v_priv.notify_emails, '{}'))
  );
exception
  when unique_violation then
    -- Concurrent duplicate submission with the same idempotency key.
    select * into v_existing from public.inquiries where idempotency_key = v_key;
    if found then
      return jsonb_build_object('ok', true, 'reference', v_existing.reference, 'duplicate', true,
                                'notify_enabled', false, 'notify_emails', '[]'::jsonb);
    end if;
    return jsonb_build_object('ok', false, 'error', 'conflict');
  when check_violation or not_null_violation then
    return jsonb_build_object('ok', false, 'error', 'invalid');
end $$;
revoke all on function public.submit_inquiry(text, jsonb) from public;
grant execute on function public.submit_inquiry(text, jsonb) to anon, authenticated;

create or replace function public.record_inquiry_notification(
  p_secret text, p_reference text, p_status text, p_error text default null)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if not private.check_app_secret('inquiry_submit', p_secret) then
    raise exception 'unauthorized';
  end if;
  if p_status not in ('sent', 'failed') then
    raise exception 'invalid status';
  end if;
  update public.inquiries
     set notification_status = p_status, notification_error = left(p_error, 500)
   where reference = p_reference
   returning id into v_id;
  if v_id is not null then
    insert into public.inquiry_events (inquiry_id, event_type, to_value)
    values (v_id, 'notification',
            case when p_status = 'sent' then 'Staff e-mail notification sent'
                 else 'Staff e-mail notification failed' end);
  end if;
end $$;
revoke all on function public.record_inquiry_notification(text, text, text, text) from public;
grant execute on function public.record_inquiry_notification(text, text, text, text) to anon, authenticated;

-- Dashboard counts (computed from real records).
create or replace function public.inquiry_stats()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'total', count(*),
    'new', count(*) filter (where status = 'new'),
    'open', count(*) filter (where status not in ('confirmed', 'closed', 'lost')),
    'last_7_days', count(*) filter (where created_at > now() - interval '7 days'),
    'unassigned_open', count(*) filter (where assigned_to is null and status not in ('confirmed', 'closed', 'lost')),
    'notification_failed', count(*) filter (where notification_status = 'failed'),
    'by_type', coalesce((select jsonb_object_agg(type, c) from (
        select type, count(*) c from public.inquiries group by type) t), '{}'::jsonb),
    'by_status', coalesce((select jsonb_object_agg(status, c) from (
        select status, count(*) c from public.inquiries group by status) s), '{}'::jsonb)
  ) from public.inquiries;
$$;
grant execute on function public.inquiry_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.staff_profiles enable row level security;
alter table public.staff_invitations enable row level security;
alter table public.site_settings enable row level security;
alter table public.private_settings enable row level security;
alter table public.services enable row level security;
alter table public.destinations enable row level security;
alter table public.packages enable row level security;
alter table public.faqs enable row level security;
alter table public.pages enable row level security;
alter table public.media enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.inquiry_events enable row level security;
alter table private.app_secrets enable row level security;

-- Staff
create policy "staff read staff" on public.staff_profiles
  for select to authenticated using (public.is_staff() or id = auth.uid());
create policy "admin update staff" on public.staff_profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "self update name" on public.staff_profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid());

-- Prevent non-admins from changing their own role/active flag.
create or replace function private.guard_staff_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if current_user = 'authenticated' and not public.is_admin() then
    if new.role is distinct from old.role or new.active is distinct from old.active
       or new.email is distinct from old.email then
      raise exception 'Not allowed';
    end if;
  end if;
  -- Never leave the business without an active administrator.
  if (old.role = 'admin' and old.active) and (new.role <> 'admin' or not new.active) then
    if (select count(*) from public.staff_profiles where role = 'admin' and active and id <> old.id) = 0 then
      raise exception 'At least one active administrator is required';
    end if;
  end if;
  return new;
end $$;
create trigger staff_profiles_guard before update on public.staff_profiles
  for each row execute function private.guard_staff_update();

create policy "admin manage invitations" on public.staff_invitations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Settings
create policy "public read site settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admin update site settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin read private settings" on public.private_settings
  for select to authenticated using (public.is_admin());
create policy "admin update private settings" on public.private_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Content: public sees published only; staff see all; admins write.
do $$
declare t text;
begin
  foreach t in array array['services', 'destinations', 'packages', 'faqs', 'pages'] loop
    execute format('create policy "public read published %1$s" on public.%1$I
      for select to anon, authenticated using (status = ''published'' or public.is_staff())', t);
    execute format('create policy "admin insert %1$s" on public.%1$I
      for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update %1$s" on public.%1$I
      for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete %1$s" on public.%1$I
      for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

create policy "public read media" on public.media
  for select to anon, authenticated using (true);
create policy "admin manage media" on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Inquiries: no public access at all. Inserts go through submit_inquiry().
create policy "staff read inquiries" on public.inquiries
  for select to authenticated using (public.is_staff());
create policy "staff update inquiries" on public.inquiries
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "admin delete inquiries" on public.inquiries
  for delete to authenticated using (public.is_admin());

create policy "staff read notes" on public.inquiry_notes
  for select to authenticated using (public.is_staff());
create policy "staff add notes" on public.inquiry_notes
  for insert to authenticated with check (public.is_staff() and author_id = auth.uid());

create policy "staff read events" on public.inquiry_events
  for select to authenticated using (public.is_staff());

-- Column-level hardening: the public roles never touch inquiry tables directly.
revoke all on public.inquiries, public.inquiry_notes, public.inquiry_events,
              public.staff_invitations, public.private_settings from anon;
revoke insert on public.inquiries from authenticated;
revoke insert, update, delete on public.inquiry_events from authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public "media" bucket, admin-only writes.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "admin upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admin update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admin delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
