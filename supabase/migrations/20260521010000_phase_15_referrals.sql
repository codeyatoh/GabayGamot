-- Phase 15: Nearby Barangay Medicine Referral

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'referral_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.referral_status as enum ('pending', 'completed', 'cancelled');
  end if;
end $$;

create table public.referrals (
    id uuid default gen_random_uuid() primary key,
    referring_center_id uuid not null references public.health_centers(id) on delete cascade,
    receiving_center_id uuid not null references public.health_centers(id) on delete cascade,
    created_by uuid not null references public.profiles(id),
    patient_code text not null,
    medicine_id uuid not null references public.medicine_master(id),
    quantity_requested integer not null check (quantity_requested > 0),
    status public.referral_status not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes
create index referrals_referring_center_id_idx on public.referrals(referring_center_id);
create index referrals_receiving_center_id_idx on public.referrals(receiving_center_id);
create index referrals_status_idx on public.referrals(status);

-- Enable RLS
alter table public.referrals enable row level security;

-- Policies for BHWs (can read/write if their center is either referring or receiving)
create policy "BHWs can insert referrals if they are referring"
    on public.referrals
    for insert
    to authenticated
    with check (
        referring_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
    );

create policy "BHWs can view relevant referrals"
    on public.referrals
    for select
    to authenticated
    using (
        referring_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
        or
        receiving_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
    );

create policy "BHWs can update relevant referrals"
    on public.referrals
    for update
    to authenticated
    using (
        referring_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
        or
        receiving_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
    );

-- Policy for Super Admins
create policy "Super admins can view all referrals"
    on public.referrals
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'super_admin'
        )
    );
