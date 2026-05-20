begin;

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.app_role as enum ('bhw', 'super_admin');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'approval_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text,
  contact_number text,
  barangay_name text,
  municipality text,
  province text,
  proof_document_path text,
  role public.app_role not null default 'bhw',
  approval_status public.approval_status not null default 'pending',
  is_super_admin_seeded boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.health_centers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  center_name text,
  barangay_name text not null,
  municipality text not null,
  province text not null,
  street_address text,
  mapbox_place_name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_approval_status_idx on public.profiles (approval_status);
create index if not exists health_centers_profile_id_idx on public.health_centers (profile_id);
create index if not exists health_centers_location_idx on public.health_centers (province, municipality, barangay_name);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function private.protect_profile_system_fields()
returns trigger
language plpgsql
as $$
begin
  if current_user <> 'service_role'
     and (
       new.role is distinct from old.role
       or new.approval_status is distinct from old.approval_status
       or new.is_super_admin_seeded is distinct from old.is_super_admin_seeded
     ) then
    raise exception 'Only service_role can change profile role, approval status, or seeded flags.';
  end if;

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

drop trigger if exists protect_profile_system_fields on public.profiles;
create trigger protect_profile_system_fields
before update on public.profiles
for each row
execute function private.protect_profile_system_fields();

drop trigger if exists set_health_centers_updated_at on public.health_centers;
create trigger set_health_centers_updated_at
before update on public.health_centers
for each row
execute function private.set_updated_at();

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.health_centers to authenticated;

grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.health_centers to service_role;

alter table public.profiles enable row level security;
alter table public.health_centers enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and role = 'bhw'
  and approval_status = 'pending'
);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "health_centers_select_own" on public.health_centers;
create policy "health_centers_select_own"
on public.health_centers
for select
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "health_centers_insert_own" on public.health_centers;
create policy "health_centers_insert_own"
on public.health_centers
for insert
to authenticated
with check ((select auth.uid()) = profile_id);

drop policy if exists "health_centers_update_own" on public.health_centers;
create policy "health_centers_update_own"
on public.health_centers
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

comment on table public.profiles is
  'Phase 3 profile foundation for roles, approval status, and proof-document metadata.';

comment on table public.health_centers is
  'Phase 3 health center foundation for barangay location and future referral matching.';

commit;
