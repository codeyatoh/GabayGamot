begin;

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
where id = 'bhw-proof-documents';

grant select, insert on public.dispense_logs to authenticated;
grant select, insert, update, delete on public.dispense_logs to service_role;

grant select, insert on public.illness_logs to authenticated;
grant select, insert, update, delete on public.illness_logs to service_role;

grant select, insert, update on public.referrals to authenticated;
grant select, insert, update, delete on public.referrals to service_role;

drop policy if exists "BHWs can insert dispense logs for their center" on public.dispense_logs;
drop policy if exists "BHWs can view dispense logs for their center" on public.dispense_logs;
drop policy if exists "Super admins can view all dispense logs" on public.dispense_logs;

create policy "dispense_logs_insert_approved_center"
on public.dispense_logs
for insert
to authenticated
with check (
  dispensed_by = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.dispense_logs.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
);

create policy "dispense_logs_select_relevant"
on public.dispense_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.dispense_logs.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "BHWs can insert illness logs for their center" on public.illness_logs;
drop policy if exists "BHWs can view illness logs for their center" on public.illness_logs;
drop policy if exists "Super admins can view all illness logs" on public.illness_logs;

create policy "illness_logs_insert_approved_center"
on public.illness_logs
for insert
to authenticated
with check (
  logged_by = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.illness_logs.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
);

create policy "illness_logs_select_relevant"
on public.illness_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.illness_logs.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "BHWs can insert referrals if they are referring" on public.referrals;
drop policy if exists "BHWs can view relevant referrals" on public.referrals;
drop policy if exists "BHWs can update relevant referrals" on public.referrals;
drop policy if exists "Super admins can view all referrals" on public.referrals;

create policy "referrals_insert_approved_referring_center"
on public.referrals
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.referrals.referring_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
);

create policy "referrals_select_relevant_approved"
on public.referrals
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.referrals.referring_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
        or public.referrals.receiving_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
);

create policy "referrals_update_relevant_approved"
on public.referrals
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.referrals.referring_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
        or public.referrals.receiving_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or public.referrals.referring_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
        or public.referrals.receiving_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = (select auth.uid())
        )
      )
  )
);

commit;
