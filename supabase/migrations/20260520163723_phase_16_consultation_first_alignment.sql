-- Phase 16: Consultation-first patient flow alignment

begin;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  patient_code text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  suffix text,
  age integer not null check (age >= 0 and age <= 150),
  sex text not null,
  barangay text not null,
  city_municipality text not null,
  contact_number text,
  health_center_id uuid not null references public.health_centers (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint patients_health_center_patient_code_uniq unique (health_center_id, patient_code)
);

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  health_center_id uuid not null references public.health_centers (id) on delete cascade,
  consulted_by uuid not null references public.profiles (id),
  consultation_date timestamptz not null default timezone('utc', now()),
  chief_complaint text not null,
  illness_category text not null,
  consultation_notes text,
  prescription_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.consultation_medicine_requests (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  medicine_id uuid not null references public.medicine_master (id),
  requested_quantity integer not null check (requested_quantity > 0),
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.dispense_logs
  add column if not exists patient_id uuid references public.patients (id) on delete set null,
  add column if not exists consultation_id uuid references public.consultations (id) on delete set null;

alter table public.referrals
  add column if not exists patient_id uuid references public.patients (id) on delete set null,
  add column if not exists consultation_id uuid references public.consultations (id) on delete set null,
  add column if not exists chief_complaint text,
  add column if not exists illness_category text,
  add column if not exists consultation_notes text;

create index if not exists patients_health_center_id_idx on public.patients (health_center_id);
create index if not exists patients_last_name_idx on public.patients (last_name, first_name);
create index if not exists consultations_patient_id_idx on public.consultations (patient_id);
create index if not exists consultations_health_center_id_idx on public.consultations (health_center_id);
create index if not exists consultations_date_idx on public.consultations (consultation_date desc);
create index if not exists consultation_medicine_requests_consultation_id_idx on public.consultation_medicine_requests (consultation_id);
create index if not exists consultation_medicine_requests_patient_id_idx on public.consultation_medicine_requests (patient_id);
create index if not exists consultation_medicine_requests_medicine_id_idx on public.consultation_medicine_requests (medicine_id);
create index if not exists dispense_logs_patient_id_idx on public.dispense_logs (patient_id);
create index if not exists dispense_logs_consultation_id_idx on public.dispense_logs (consultation_id);
create index if not exists referrals_patient_id_idx on public.referrals (patient_id);
create index if not exists referrals_consultation_id_idx on public.referrals (consultation_id);

drop trigger if exists set_patients_updated_at on public.patients;
create trigger set_patients_updated_at
before update on public.patients
for each row
execute function private.set_updated_at();

drop trigger if exists set_consultations_updated_at on public.consultations;
create trigger set_consultations_updated_at
before update on public.consultations
for each row
execute function private.set_updated_at();

grant select, insert, update on public.patients to authenticated;
grant select, insert, update, delete on public.patients to service_role;

grant select, insert, update on public.consultations to authenticated;
grant select, insert, update, delete on public.consultations to service_role;

grant select, insert, update on public.consultation_medicine_requests to authenticated;
grant select, insert, update, delete on public.consultation_medicine_requests to service_role;

alter table public.patients enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_medicine_requests enable row level security;

drop policy if exists "patients_select_center" on public.patients;
create policy "patients_select_center"
on public.patients
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or patients.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "patients_insert_center" on public.patients;
create policy "patients_insert_center"
on public.patients
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or patients.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "patients_update_center" on public.patients;
create policy "patients_update_center"
on public.patients
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or patients.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or patients.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "consultations_select_center" on public.consultations;
create policy "consultations_select_center"
on public.consultations
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "consultations_insert_center" on public.consultations;
create policy "consultations_insert_center"
on public.consultations
for insert
to authenticated
with check (
  consulted_by = auth.uid()
  and exists (
    select 1
    from public.patients
    where patients.id = consultations.patient_id
      and patients.health_center_id = consultations.health_center_id
  )
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "consultations_update_center" on public.consultations;
create policy "consultations_update_center"
on public.consultations
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "consultation_requests_select_center" on public.consultation_medicine_requests;
create policy "consultation_requests_select_center"
on public.consultation_medicine_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.consultations
    join public.profiles on profiles.id = auth.uid()
    where consultations.id = consultation_medicine_requests.consultation_id
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "consultation_requests_insert_center" on public.consultation_medicine_requests;
create policy "consultation_requests_insert_center"
on public.consultation_medicine_requests
for insert
to authenticated
with check (
  exists (
    select 1
    from public.consultations
    join public.profiles on profiles.id = auth.uid()
    where consultations.id = consultation_medicine_requests.consultation_id
      and consultations.patient_id = consultation_medicine_requests.patient_id
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists "consultation_requests_update_center" on public.consultation_medicine_requests;
create policy "consultation_requests_update_center"
on public.consultation_medicine_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.consultations
    join public.profiles on profiles.id = auth.uid()
    where consultations.id = consultation_medicine_requests.consultation_id
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.consultations
    join public.profiles on profiles.id = auth.uid()
    where consultations.id = consultation_medicine_requests.consultation_id
      and consultations.patient_id = consultation_medicine_requests.patient_id
      and profiles.approval_status = 'approved'
      and (
        profiles.role = 'super_admin'
        or consultations.health_center_id in (
          select id
          from public.health_centers
          where health_centers.profile_id = auth.uid()
        )
      )
  )
);

comment on table public.patients is
  'Phase 16 minimal patient records for consultation-first barangay workflows without patient logins.';

comment on table public.consultations is
  'Phase 16 lightweight consultations linked to patients, illness trend logging, dispensing, and referrals.';

comment on table public.consultation_medicine_requests is
  'Phase 16 consultation-linked medicine requests used to bridge patient visits with dispense or referral handling.';

commit;
