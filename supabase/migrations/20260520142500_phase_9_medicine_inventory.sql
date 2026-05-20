-- Migration for Phase 9 - Medicine Master and Batch Inventory

begin;

-- Create medicine_master table
create table if not exists public.medicine_master (
  id uuid primary key default gen_random_uuid(),
  generic_name text not null,
  brand_name text,
  strength text not null,
  dosage_form text not null,
  category text,
  description text,
  prescription_required boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  -- Prevent duplicates with exact same generic, brand, strength, and dosage
  constraint medicine_master_uniq unique (generic_name, brand_name, strength, dosage_form)
);

-- Create medicine_batches table
create table if not exists public.medicine_batches (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicine_master (id) on delete cascade,
  health_center_id uuid not null references public.health_centers (id) on delete cascade,
  batch_number text not null,
  quantity integer not null default 0 check (quantity >= 0),
  unit text not null default 'pcs',
  expiry_date date not null,
  status text not null default 'active',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  -- Prevent duplicates for the same batch number at the same center for the same medicine
  constraint medicine_batches_uniq unique (medicine_id, health_center_id, batch_number)
);

-- Create indexes
create index if not exists medicine_master_names_idx on public.medicine_master (generic_name, brand_name);
create index if not exists medicine_batches_medicine_id_idx on public.medicine_batches (medicine_id);
create index if not exists medicine_batches_health_center_id_idx on public.medicine_batches (health_center_id);
create index if not exists medicine_batches_expiry_date_idx on public.medicine_batches (expiry_date);

-- Trigger to set updated_at on medicine_master
drop trigger if exists set_medicine_master_updated_at on public.medicine_master;
create trigger set_medicine_master_updated_at
before update on public.medicine_master
for each row
execute function private.set_updated_at();

-- Trigger to set updated_at on medicine_batches
drop trigger if exists set_medicine_batches_updated_at on public.medicine_batches;
create trigger set_medicine_batches_updated_at
before update on public.medicine_batches
for each row
execute function private.set_updated_at();

-- Enable RLS
alter table public.medicine_master enable row level security;
alter table public.medicine_batches enable row level security;

-- Grant permissions to authenticated users and service_role
grant select, insert, update on public.medicine_master to authenticated;
grant select, insert, update, delete on public.medicine_master to service_role;

grant select, insert, update, delete on public.medicine_batches to authenticated;
grant select, insert, update, delete on public.medicine_batches to service_role;

-- RLS Policies for medicine_master
drop policy if exists "medicine_master_select_all" on public.medicine_master;
create policy "medicine_master_select_all"
on public.medicine_master
for select
to authenticated
using (true);

drop policy if exists "medicine_master_insert_approved" on public.medicine_master;
create policy "medicine_master_insert_approved"
on public.medicine_master
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
);

drop policy if exists "medicine_master_update_approved" on public.medicine_master;
create policy "medicine_master_update_approved"
on public.medicine_master
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
);

-- RLS Policies for medicine_batches
drop policy if exists "medicine_batches_select_all" on public.medicine_batches;
create policy "medicine_batches_select_all"
on public.medicine_batches
for select
to authenticated
using (true);

drop policy if exists "medicine_batches_insert_own_center" on public.medicine_batches;
create policy "medicine_batches_insert_own_center"
on public.medicine_batches
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
  and (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
    or
    health_center_id in (
      select id from public.health_centers
      where health_centers.profile_id = auth.uid()
    )
  )
);

drop policy if exists "medicine_batches_update_own_center" on public.medicine_batches;
create policy "medicine_batches_update_own_center"
on public.medicine_batches
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
  and (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
    or
    health_center_id in (
      select id from public.health_centers
      where health_centers.profile_id = auth.uid()
    )
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
  and (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
    or
    health_center_id in (
      select id from public.health_centers
      where health_centers.profile_id = auth.uid()
    )
  )
);

drop policy if exists "medicine_batches_delete_own_center" on public.medicine_batches;
create policy "medicine_batches_delete_own_center"
on public.medicine_batches
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
  and (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
    or
    health_center_id in (
      select id from public.health_centers
      where health_centers.profile_id = auth.uid()
    )
  )
);

-- Add comments for documentation
comment on table public.medicine_master is
  'Phase 9 medicine definition directory specifying generic and brand names, dosage form, and strength.';

comment on table public.medicine_batches is
  'Phase 9 medicine batch inventory entries stored per barangay health center cabinet, specifying quantities and expiration dates.';

commit;
