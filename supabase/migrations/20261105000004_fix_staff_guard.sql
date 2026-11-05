-- The staff guard runs as SECURITY DEFINER, so current_user is the owner role.
-- Use auth.uid() to detect requests from signed-in users instead.
create or replace function private.guard_staff_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role or new.active is distinct from old.active
       or new.email is distinct from old.email then
      raise exception 'Not allowed';
    end if;
  end if;
  if (old.role = 'admin' and old.active) and (new.role <> 'admin' or not new.active) then
    if (select count(*) from public.staff_profiles where role = 'admin' and active and id <> old.id) = 0 then
      raise exception 'At least one active administrator is required';
    end if;
  end if;
  return new;
end $$;
