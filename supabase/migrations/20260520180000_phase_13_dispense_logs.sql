-- Phase 13: Dispensing Logs and Stock Deduction

create table public.dispense_logs (
    id uuid default gen_random_uuid() primary key,
    health_center_id uuid not null references public.health_centers(id) on delete cascade,
    batch_id uuid not null references public.medicine_batches(id) on delete cascade,
    dispensed_by uuid not null references public.profiles(id),
    patient_code text not null,
    illness_category text not null,
    quantity_dispensed integer not null check (quantity_dispensed > 0),
    unit text not null,
    dispensed_at timestamptz not null default now()
);

-- Indexes for efficient querying by center and time
create index dispense_logs_health_center_id_idx on public.dispense_logs(health_center_id);
create index dispense_logs_dispensed_at_idx on public.dispense_logs(dispensed_at);

-- Enable RLS
alter table public.dispense_logs enable row level security;

-- Policies for BHW
create policy "BHWs can insert dispense logs for their center"
    on public.dispense_logs
    for insert
    to authenticated
    with check (
        health_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
    );

create policy "BHWs can view dispense logs for their center"
    on public.dispense_logs
    for select
    to authenticated
    using (
        health_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
    );

-- Policy for Super Admins
create policy "Super admins can view all dispense logs"
    on public.dispense_logs
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'super_admin'
        )
    );
