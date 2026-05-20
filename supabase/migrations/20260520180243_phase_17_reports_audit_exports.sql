-- Phase 17: Reports, Audit Trail, and Export Basics

begin;

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_role text not null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  health_center_id uuid references public.health_centers (id) on delete set null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists audit_events_actor_id_idx on public.audit_events (actor_id);
create index if not exists audit_events_health_center_id_idx on public.audit_events (health_center_id);
create index if not exists audit_events_created_at_idx on public.audit_events (created_at desc);
create index if not exists audit_events_event_type_idx on public.audit_events (event_type);
create index if not exists audit_events_entity_type_idx on public.audit_events (entity_type);

grant select, insert on public.audit_events to authenticated;
grant select, insert, update, delete on public.audit_events to service_role;

alter table public.audit_events enable row level security;

drop policy if exists "audit_events_insert_approved_actor" on public.audit_events;
create policy "audit_events_insert_approved_actor"
on public.audit_events
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
  )
  and (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
    or audit_events.health_center_id is null
    or audit_events.health_center_id in (
      select id
      from public.health_centers
      where health_centers.profile_id = auth.uid()
    )
  )
);

drop policy if exists "audit_events_select_relevant" on public.audit_events;
create policy "audit_events_select_relevant"
on public.audit_events
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or audit_events.actor_id = auth.uid()
        or audit_events.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

comment on table public.audit_events is
  'Phase 17 lightweight audit trail for report/export visibility. Existing operational records remain the source of truth.';

commit;
