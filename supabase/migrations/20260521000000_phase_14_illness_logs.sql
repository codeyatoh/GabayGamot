-- Phase 14: Common Illness Logging

create table public.illness_logs (
    id uuid default gen_random_uuid() primary key,
    health_center_id uuid not null references public.health_centers(id) on delete cascade,
    logged_by uuid not null references public.profiles(id),
    patient_code text not null,
    illness_category text not null,
    action_taken text not null,
    notes text,
    created_at timestamptz not null default now()
);

-- Indexes
create index illness_logs_health_center_id_idx on public.illness_logs(health_center_id);
create index illness_logs_created_at_idx on public.illness_logs(created_at);

-- Enable RLS
alter table public.illness_logs enable row level security;

-- Policies for BHW
create policy "BHWs can insert illness logs for their center"
    on public.illness_logs
    for insert
    to authenticated
    with check (
        health_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
    );

create policy "BHWs can view illness logs for their center"
    on public.illness_logs
    for select
    to authenticated
    using (
        health_center_id in (
            select id from public.health_centers where profile_id = auth.uid()
        )
    );

-- Policy for Super Admins
create policy "Super admins can view all illness logs"
    on public.illness_logs
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'super_admin'
        )
    );
