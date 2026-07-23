-- =========================================================
-- Excelente Solutions Recruitment System - Supabase Schema
-- =========================================================

create extension if not exists "pgcrypto";

-- =========================
-- ENUMS
-- =========================

DO $$ BEGIN
  create type app_role as enum (
    'admin',
    'salesperson',
    'agent',
    'employer',
    'lawyer'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type account_status as enum (
    'pending',
    'active',
    'suspended',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type candidate_status as enum (
    'available',
    'selected',
    'visa_processing',
    'approved',
    'rejected',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type job_offer_status as enum (
    'draft',
    'open',
    'completed',
    'closed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type slot_status as enum (
    'vacant',
    'reserved',
    'filled',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type visa_status as enum (
    'pending',
    'documents_requested',
    'documents_received',
    'documents_under_review',
    'ready_for_submission',
    'submitted',
    'appointment_scheduled',
    'biometrics_required',
    'under_immigration_review',
    'additional_documents_requested',
    'on_hold',
    'approved',
    'rejected',
    'closed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type document_type as enum (
    'cv',
    'passport_scan',
    'health_certificate',
    'experience_letter',
    'police_clearance',
    'education_document',
    'visa_application_slip',
    'approved_visa',
    'contract',
    'photo',
    'travel_insurance',
    'flight_ticket',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type document_status as enum (
    'pending',
    'uploaded',
    'verified',
    'rejected',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  create type notification_type as enum (
    'candidate_selected',
    'document_requested',
    'visa_approved',
    'visa_updated',
    'job_offer_created',
    'order_milestone',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =========================
-- SEQUENCES FOR PUBLIC CODES
-- =========================

create sequence if not exists candidate_code_seq start 2041;
create sequence if not exists employer_code_seq start 31;
create sequence if not exists job_offer_code_seq start 118;
create sequence if not exists visa_case_code_seq start 501;

-- =========================
-- CORE TABLES
-- =========================

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code char(2) not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  role app_role not null,
  country_id uuid references public.countries(id),
  status account_status not null default 'pending',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique default ('EMP-' || nextval('employer_code_seq')::text),
  name text not null,
  outlet_name text,
  country_id uuid not null references public.countries(id),
  assigned_salesperson_id uuid references public.profiles(id),
  contact_name text,
  contact_position text,
  email text,
  phone text,
  address text,
  city text,
  zip_code text,
  status account_status not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS outlet_name text;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS contact_position text;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS zip_code text;

create table if not exists public.employer_users (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  job_title text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (employer_id, profile_id)
);

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique default ('AGN-' || nextval('employer_code_seq')::text),
  name text not null,
  country_id uuid not null references public.countries(id),
  contact_name text,
  email text,
  phone text,
  address text,
  status account_status not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_users (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  job_title text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (agency_id, profile_id)
);

create table if not exists public.law_firms (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique default ('LWF-' || nextval('employer_code_seq')::text),
  name text not null,
  country_id uuid not null references public.countries(id),
  contact_name text,
  email text,
  phone text,
  address text,
  status account_status not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.law_firm_users (
  id uuid primary key default gen_random_uuid(),
  law_firm_id uuid not null references public.law_firms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  job_title text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (law_firm_id, profile_id)
);

create table if not exists public.lawyer_countries (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references public.profiles(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  unique (lawyer_id, country_id)
);

create table if not exists public.salesperson_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  address text,
  city text,
  zip_code text,
  country_id uuid not null references public.countries(id),
  phone text,
  tax_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id)
);

-- =========================
-- CANDIDATES
-- =========================

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique default ('CND-' || nextval('candidate_code_seq')::text),

  first_name text not null,
  last_name text not null,
  gender text,
  nationality text,
  city text,
  
  photo_url text,
  available_from date,
  available_until date,
  languages text[],
  work_experience_files text[],

  open_to_all_countries boolean not null default false,

  agent_id uuid not null references public.profiles(id),
  status candidate_status not null default 'available',

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS available_from date;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS available_until date;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS languages text[];
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS work_experience_files text[];
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS open_to_all_countries boolean not null default false;

-- Clean up old country_id column that is now replaced by candidate_countries
ALTER TABLE public.candidates DROP COLUMN IF EXISTS country_id CASCADE;

create table if not exists public.candidate_countries (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (candidate_id, country_id)
);

-- Private info separated so employers cannot directly access it
create table if not exists public.candidate_private_details (
  candidate_id uuid primary key references public.candidates(id) on delete cascade,
  date_of_birth date,
  passport_number text,
  passport_expiry date,
  contact_phone text,
  contact_email text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_positions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  position_id uuid not null references public.positions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (candidate_id, position_id)
);

create table if not exists public.candidate_documents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type document_type not null,
  status document_status not null default 'uploaded',

  file_path text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,

  uploaded_by uuid references public.profiles(id),
  verified_by uuid references public.profiles(id),
  expiry_date date,
  remarks text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- JOB OFFERS / ORDERS
-- =========================

create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique default ('JO-' || nextval('job_offer_code_seq')::text),

  employer_id uuid not null references public.employers(id),
  country_id uuid not null references public.countries(id),
  position_id uuid not null references public.positions(id),

  title text,
  staff_needed int not null check (staff_needed > 0),
  start_date date,
  end_date date,

  salary_amount numeric(12,2),
  salary_currency char(3) default 'USD',

  city_of_employment text,
  flight_ticket_provided boolean not null default false,
  pickup_at_airport boolean not null default false,
  accommodation_provided boolean not null default false,

  accommodation_photos text[],
  work_video text,
  workplace_photos text[],
  flight_ticket_pdf text,
  contract_with_excelente text,
  additional_pdfs text[],

  contract_signed boolean not null default false,
  contract_file_path text,

  status job_offer_status not null default 'open',
  created_by uuid references public.profiles(id),
  assigned_salesperson_id uuid references public.profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_offer_slots (
  id uuid primary key default gen_random_uuid(),
  job_offer_id uuid not null references public.job_offers(id) on delete cascade,
  slot_no int not null,
  candidate_id uuid references public.candidates(id),
  status slot_status not null default 'vacant',
  reserved_at timestamptz,
  filled_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_offer_id, slot_no)
);

-- One candidate cannot be actively reserved/filled in more than one slot
create unique index if not exists unique_active_candidate_assignment
on public.job_offer_slots(candidate_id)
where candidate_id is not null and status in ('reserved', 'filled');

create table if not exists public.job_offer_selections (
  id uuid primary key default gen_random_uuid(),
  job_offer_id uuid not null references public.job_offers(id) on delete cascade,
  slot_id uuid not null references public.job_offer_slots(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id),
  employer_id uuid not null references public.employers(id),
  selected_by uuid references public.profiles(id),
  status candidate_status not null default 'selected',
  selected_at timestamptz not null default now(),
  cancelled_at timestamptz,
  remarks text
);

-- =========================
-- VISA CASES
-- =========================

create table if not exists public.visa_cases (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique default ('VP-' || nextval('visa_case_code_seq')::text),

  selection_id uuid unique references public.job_offer_selections(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id),
  job_offer_id uuid not null references public.job_offers(id),
  employer_id uuid not null references public.employers(id),
  agent_id uuid not null references public.profiles(id),
  lawyer_id uuid references public.profiles(id),
  country_id uuid not null references public.countries(id),

  status visa_status not null default 'pending',
  remarks text,

  application_reference text,
  embassy_appointment_at timestamptz,
  expected_decision_date date,
  legal_notes text,
  rejection_reason text,

  opened_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.visa_case_events (
  id uuid primary key default gen_random_uuid(),
  visa_case_id uuid not null references public.visa_cases(id) on delete cascade,
  status visa_status not null,
  remarks text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.country_document_requirements (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  type document_type not null,
  is_required boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  unique (country_id, type)
);

-- =========================
-- NOTIFICATIONS
-- =========================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  type notification_type not null default 'system',
  title text not null,
  body text,
  entity_table text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================
-- AUDIT LOGS
-- =========================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger employers_updated_at
before update on public.employers
for each row execute function public.set_updated_at();

create or replace trigger candidates_updated_at
before update on public.candidates
for each row execute function public.set_updated_at();

create or replace trigger candidate_private_details_updated_at
before update on public.candidate_private_details
for each row execute function public.set_updated_at();

create or replace trigger candidate_documents_updated_at
before update on public.candidate_documents
for each row execute function public.set_updated_at();

create or replace trigger job_offers_updated_at
before update on public.job_offers
for each row execute function public.set_updated_at();

-- =========================
-- AUTO CREATE JOB OFFER SLOTS
-- =========================

create or replace function public.create_job_offer_slots()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  i int;
begin
  for i in 1..new.staff_needed loop
    insert into public.job_offer_slots(job_offer_id, slot_no)
    values (new.id, i);
  end loop;

  return new;
end;
$$;

create or replace trigger create_slots_after_job_offer_insert
after insert on public.job_offers
for each row execute function public.create_job_offer_slots();

-- =========================
-- AUTH PROFILE CREATION
-- =========================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
  v_employer_id uuid;
  v_country_id uuid;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::app_role, 'agent');

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    v_role,
    (case when new.email_confirmed_at is not null then 'active' else 'pending' end)::account_status
  );

  -- Employer self-registration also provisions the company record and links it
  if v_role = 'employer' and (new.raw_user_meta_data->>'company_name') is not null then
    select id into v_country_id
    from public.countries
    where name = new.raw_user_meta_data->>'country_name';

    insert into public.employers (name, country_id, created_by)
    values (new.raw_user_meta_data->>'company_name', v_country_id, new.id)
    returning id into v_employer_id;

    insert into public.employer_users (employer_id, profile_id, is_primary)
    values (v_employer_id, new.id, true);
  end if;

  -- Lawyer self-registration also assigns their country
  if v_role = 'lawyer' and (new.raw_user_meta_data->>'country_name') is not null then
    select id into v_country_id
    from public.countries
    where name = new.raw_user_meta_data->>'country_name';

    insert into public.lawyer_countries (lawyer_id, country_id, is_primary)
    values (new.id, v_country_id, true);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Activate the profile automatically once the user confirms their email
create or replace function public.handle_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
    set status = 'active'
    where id = new.id
    and status = 'pending';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;

create or replace trigger on_auth_user_email_confirmed
after update on auth.users
for each row execute function public.handle_email_confirmed();

-- =========================
-- HELPER FUNCTIONS FOR RLS
-- =========================

create or replace function public.current_user_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin'
$$;

create or replace function public.current_employer_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(employer_id), '{}') 
  from public.employer_users 
  where profile_id = auth.uid()
$$;

-- =========================
-- ATOMIC SELECTION FUNCTION
-- Employer selects available candidate
-- =========================

create or replace function public.select_candidate_for_job_offer(
  p_job_offer_id uuid,
  p_candidate_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot_id uuid;
  v_employer_id uuid;
  v_country_id uuid;
  v_agent_id uuid;
  v_admin_id uuid;
  v_selection_id uuid;
  v_visa_case_id uuid;
begin
  select employer_id, country_id
  into v_employer_id, v_country_id
  from public.job_offers
  where id = p_job_offer_id
  and status = 'open';

  if v_employer_id is null then
    raise exception 'Job offer not found or not open';
  end if;

  if public.current_user_role() not in ('admin', 'employer') then
    raise exception 'Only admin or employer can select candidates';
  end if;

  if public.current_user_role() = 'employer'
     and not (v_employer_id = any(public.current_employer_ids())) then
    raise exception 'You cannot select for this employer';
  end if;

  select agent_id
  into v_agent_id
  from public.candidates c
  where c.id = p_candidate_id
  and c.status = 'available'
  and (
    c.open_to_all_countries = true
    or exists (
      select 1 from public.candidate_countries cc
      where cc.candidate_id = c.id
      and cc.country_id = v_country_id
    )
  );

  if v_agent_id is null then
    raise exception 'Candidate is not available for this country';
  end if;

  select id
  into v_slot_id
  from public.job_offer_slots
  where job_offer_id = p_job_offer_id
  and status = 'vacant'
  order by slot_no
  limit 1
  for update;

  if v_slot_id is null then
    raise exception 'No vacant slots available';
  end if;

  update public.job_offer_slots
  set candidate_id = p_candidate_id,
      status = 'reserved',
      reserved_at = now()
  where id = v_slot_id;

  update public.candidates
  set status = 'selected'
  where id = p_candidate_id;

  insert into public.job_offer_selections (
    job_offer_id,
    slot_id,
    candidate_id,
    employer_id,
    selected_by,
    status
  )
  values (
    p_job_offer_id,
    v_slot_id,
    p_candidate_id,
    v_employer_id,
    auth.uid(),
    'selected'
  )
  returning id into v_selection_id;

  -- Visa case starts unassigned — admin picks the country-specific lawyer
  -- (see admin's "Reassign lawyer" control / reassignLawyer action).
  insert into public.visa_cases (
    selection_id,
    candidate_id,
    job_offer_id,
    employer_id,
    agent_id,
    lawyer_id,
    country_id,
    status,
    remarks
  )
  values (
    v_selection_id,
    p_candidate_id,
    p_job_offer_id,
    v_employer_id,
    v_agent_id,
    null,
    v_country_id,
    'pending',
    'Visa case opened after candidate selection'
  )
  returning id into v_visa_case_id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    entity_table,
    entity_id
  )
  values
  (
    v_agent_id,
    auth.uid(),
    'candidate_selected',
    'Candidate selected',
    'One of your candidates has been selected by an employer.',
    'job_offer_selections',
    v_selection_id
  );

  for v_admin_id in
    select id from public.profiles
    where role = 'admin'
    and status = 'active'
  loop
    insert into public.notifications (
      recipient_id,
      actor_id,
      type,
      title,
      body,
      entity_table,
      entity_id
    )
    values (
      v_admin_id,
      auth.uid(),
      'candidate_selected',
      'Visa case needs a lawyer',
      'A new candidate has been selected and needs a lawyer assigned for visa processing.',
      'visa_cases',
      v_visa_case_id
    );
  end loop;

  return v_selection_id;
end;
$$;

-- =========================
-- USEFUL VIEWS
-- =========================

drop view if exists public.job_offer_progress;
create view public.job_offer_progress with (security_invoker = true) as
select
  jo.id,
  jo.public_code,
  jo.employer_id,
  e.name as employer_name,
  jo.country_id,
  c.name as country_name,
  c.code as country_code,
  jo.position_id,
  p.name as position_name,
  jo.staff_needed,
  count(s.id) filter (where s.status in ('reserved', 'filled')) as selected_count,
  jo.status,
  jo.contract_signed,
  jo.start_date,
  jo.end_date,
  jo.created_at
from public.job_offers jo
join public.employers e on e.id = jo.employer_id
join public.countries c on c.id = jo.country_id
join public.positions p on p.id = jo.position_id
left join public.job_offer_slots s on s.job_offer_id = jo.id
group by jo.id, e.name, c.name, c.code, p.name;

drop view if exists public.candidate_public_view;
create view public.candidate_public_view with (security_invoker = true) as
select 
  cand.id,
  cand.public_code,
  cand.first_name,
  cand.last_name,
  cand.gender,
  cand.nationality,
  cand.city,
  cand.photo_url,
  cand.available_from,
  cand.available_until,
  cand.languages,
  cand.open_to_all_countries,
  array_agg(distinct c.id) filter (where c.id is not null) as country_ids,
  array_agg(distinct c.name) filter (where c.name is not null) as country_names,
  cand.status,
  cand.agent_id,
  array_agg(distinct p.name) filter (where p.name is not null) as positions,
  cand.created_at
from public.candidates cand
left join public.candidate_countries cc on cc.candidate_id = cand.id
left join public.countries c on c.id = cc.country_id
left join public.candidate_positions cp on cp.candidate_id = cand.id
left join public.positions p on p.id = cp.position_id
group by cand.id;

-- =========================
-- INDEXES
-- =========================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_employers_country on public.employers(country_id);
create index if not exists idx_employers_salesperson on public.employers(assigned_salesperson_id);
create index if not exists idx_candidates_agent on public.candidates(agent_id);
create index if not exists idx_candidates_status on public.candidates(status);
create index if not exists idx_candidate_positions_candidate on public.candidate_positions(candidate_id);
create index if not exists idx_job_offers_employer on public.job_offers(employer_id);
create index if not exists idx_job_offers_country_position on public.job_offers(country_id, position_id);
create index if not exists idx_job_offer_slots_offer_status on public.job_offer_slots(job_offer_id, status);
create index if not exists idx_visa_cases_lawyer on public.visa_cases(lawyer_id);
create index if not exists idx_visa_cases_agent on public.visa_cases(agent_id);
create index if not exists idx_visa_cases_candidate on public.visa_cases(candidate_id);
create index if not exists idx_notifications_recipient_read on public.notifications(recipient_id, read_at);

-- =========================
-- ROW LEVEL SECURITY
-- =========================

alter table public.countries enable row level security;
alter table public.positions enable row level security;
alter table public.profiles enable row level security;
alter table public.employers enable row level security;
alter table public.employer_users enable row level security;
alter table public.lawyer_countries enable row level security;
alter table public.candidates enable row level security;
alter table public.candidate_private_details enable row level security;
alter table public.candidate_positions enable row level security;
alter table public.candidate_documents enable row level security;
alter table public.job_offers enable row level security;
alter table public.job_offer_slots enable row level security;
alter table public.job_offer_selections enable row level security;
alter table public.visa_cases enable row level security;
alter table public.visa_case_events enable row level security;
alter table public.country_document_requirements enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Countries / positions readable by all authenticated users
drop policy if exists "countries readable" on public.countries;
create policy "countries readable"
  on public.countries for select
to authenticated
using (true);

drop policy if exists "positions readable" on public.positions;
create policy "positions readable"
  on public.positions for select
to authenticated
using (true);

drop policy if exists "admin manages countries" on public.countries;
create policy "admin manages countries"
  on public.countries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin manages positions" on public.positions;
create policy "admin manages positions"
  on public.positions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Profiles
drop policy if exists "users read own profile or admin reads all" on public.profiles;
create policy "users read own profile or admin reads all"
  on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "users update own profile or admin" on public.profiles;
create policy "users update own profile or admin"
  on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert
to authenticated
with check (id = auth.uid());

-- Employers
drop policy if exists "admin manages employers" on public.employers;
create policy "admin manages employers"
  on public.employers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "salesperson reads assigned employers" on public.employers;
create policy "salesperson reads assigned employers"
  on public.employers for select
to authenticated
using (assigned_salesperson_id = auth.uid());

drop policy if exists "employer users read own employer" on public.employers;
create policy "employer users read own employer"
  on public.employers for select
to authenticated
using (id = any(public.current_employer_ids()));

drop policy if exists "salesperson creates employers" on public.employers;
create policy "salesperson creates employers"
  on public.employers for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'salesperson')
);

-- Employer users
drop policy if exists "admin manages employer users" on public.employer_users;
create policy "admin manages employer users"
  on public.employer_users for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "employer users read own mapping" on public.employer_users;
create policy "employer users read own mapping"
  on public.employer_users for select
to authenticated
using (profile_id = auth.uid());

-- Lawyer countries
drop policy if exists "admin manages lawyer countries" on public.lawyer_countries;
create policy "admin manages lawyer countries"
  on public.lawyer_countries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lawyers read own countries" on public.lawyer_countries;
create policy "lawyers read own countries"
  on public.lawyer_countries for select
to authenticated
using (lawyer_id = auth.uid());

-- Candidates basic data
drop policy if exists "admin reads all candidates" on public.candidates;
create policy "admin reads all candidates"
  on public.candidates for select
to authenticated
using (public.is_admin());

drop policy if exists "agents manage own candidates" on public.candidates;
create policy "agents manage own candidates"
  on public.candidates for all
to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

drop policy if exists "employers read available candidates in their country" on public.candidates;
create policy "employers read available candidates in their country"
  on public.candidates for select
to authenticated
using (
  public.current_user_role() = 'employer'
  and status = 'available'
  and (
    open_to_all_countries = true
    or
    id in (
      select cc.candidate_id from public.candidate_countries cc
      where cc.country_id in (
        select e.country_id
        from public.employers e
        join public.employer_users eu on eu.employer_id = e.id
        where eu.profile_id = auth.uid()
      )
    )
  )
);

drop policy if exists "employers read selected candidates for own job offers" on public.candidates;
create policy "employers read selected candidates for own job offers"
  on public.candidates for select
to authenticated
using (
  public.current_user_role() = 'employer'
  and exists (
    select 1
    from public.job_offer_slots s
    join public.job_offers jo on jo.id = s.job_offer_id
    where s.candidate_id = candidates.id
    and jo.employer_id = any(public.current_employer_ids())
  )
);

drop policy if exists "lawyers read assigned visa candidates" on public.candidates;
create policy "lawyers read assigned visa candidates"
  on public.candidates for select
to authenticated
using (
  exists (
    select 1
    from public.visa_cases vc
    where vc.candidate_id = candidates.id
    and vc.lawyer_id = auth.uid()
  )
);

-- Candidate private details
drop policy if exists "admin reads private candidate details" on public.candidate_private_details;
create policy "admin reads private candidate details"
  on public.candidate_private_details for select
to authenticated
using (public.is_admin());

drop policy if exists "agent reads private details for own candidates" on public.candidate_private_details;
create policy "agent reads private details for own candidates"
  on public.candidate_private_details for select
to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_private_details.candidate_id
    and c.agent_id = auth.uid()
  )
);

drop policy if exists "lawyer reads private details for assigned visa cases" on public.candidate_private_details;
create policy "lawyer reads private details for assigned visa cases"
  on public.candidate_private_details for select
to authenticated
using (
  exists (
    select 1 from public.visa_cases vc
    where vc.candidate_id = candidate_private_details.candidate_id
    and vc.lawyer_id = auth.uid()
  )
);

drop policy if exists "agents manage private details for own candidates" on public.candidate_private_details;
create policy "agents manage private details for own candidates"
  on public.candidate_private_details for all
to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_private_details.candidate_id
    and c.agent_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_private_details.candidate_id
    and c.agent_id = auth.uid()
  )
);

drop policy if exists "employers read passport details for visible candidates" on public.candidate_private_details;
create policy "employers read passport details for visible candidates"
  on public.candidate_private_details for select
to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_private_details.candidate_id
    and public.current_user_role() = 'employer'
    and (
      (
        c.status = 'available'
        and (
          c.open_to_all_countries = true
          or
          c.id in (
            select cc.candidate_id from public.candidate_countries cc
            where cc.country_id in (
              select e.country_id from public.employers e
              where e.id = any(public.current_employer_ids())
            )
          )
        )
      )
      or exists (
        select 1
        from public.job_offer_slots s
        join public.job_offers jo on jo.id = s.job_offer_id
        where s.candidate_id = c.id
        and jo.employer_id = any(public.current_employer_ids())
      )
    )
  )
);

-- Candidate positions
drop policy if exists "candidate positions visible with candidate" on public.candidate_positions;
create policy "candidate positions visible with candidate"
  on public.candidate_positions for select
to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_positions.candidate_id
  )
);

drop policy if exists "agents manage own candidate positions" on public.candidate_positions;
create policy "agents manage own candidate positions"
  on public.candidate_positions for all
to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_positions.candidate_id
    and c.agent_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_positions.candidate_id
    and c.agent_id = auth.uid()
  )
);

-- Documents
drop policy if exists "admin reads all candidate documents" on public.candidate_documents;
create policy "admin reads all candidate documents"
  on public.candidate_documents for select
to authenticated
using (public.is_admin());

drop policy if exists "agents manage own candidate documents" on public.candidate_documents;
create policy "agents manage own candidate documents"
  on public.candidate_documents for all
to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_documents.candidate_id
    and c.agent_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_documents.candidate_id
    and c.agent_id = auth.uid()
  )
);

drop policy if exists "lawyers read assigned candidate documents" on public.candidate_documents;
create policy "lawyers read assigned candidate documents"
  on public.candidate_documents for select
to authenticated
using (
  exists (
    select 1 from public.visa_cases vc
    where vc.candidate_id = candidate_documents.candidate_id
    and vc.lawyer_id = auth.uid()
  )
);

drop policy if exists "lawyers upload documents for assigned cases" on public.candidate_documents;
create policy "lawyers upload documents for assigned cases"
  on public.candidate_documents for insert
to authenticated
with check (
  exists (
    select 1 from public.visa_cases vc
    where vc.candidate_id = candidate_documents.candidate_id
    and vc.lawyer_id = auth.uid()
  )
);

drop policy if exists "employers read documents for visible candidates" on public.candidate_documents;
create policy "employers read documents for visible candidates"
  on public.candidate_documents for select
to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_documents.candidate_id
    and public.current_user_role() = 'employer'
    and (
      (
        c.status = 'available'
        and (
          c.open_to_all_countries = true
          or c.id in (
            select cc.candidate_id from public.candidate_countries cc
            where cc.country_id in (
              select e.country_id from public.employers e
              where e.id = any(public.current_employer_ids())
            )
          )
        )
      )
      or exists (
        select 1
        from public.job_offer_slots s
        join public.job_offers jo on jo.id = s.job_offer_id
        where s.candidate_id = c.id
        and jo.employer_id = any(public.current_employer_ids())
      )
    )
  )
);

-- Job offers
drop policy if exists "admin reads all job offers" on public.job_offers;
create policy "admin reads all job offers"
  on public.job_offers for select
to authenticated
using (public.is_admin());

drop policy if exists "salesperson reads assigned job offers" on public.job_offers;
create policy "salesperson reads assigned job offers"
  on public.job_offers for select
to authenticated
using (assigned_salesperson_id = auth.uid() or created_by = auth.uid());

drop policy if exists "employers read own job offers" on public.job_offers;
create policy "employers read own job offers"
  on public.job_offers for select
to authenticated
using (employer_id = any(public.current_employer_ids()));

drop policy if exists "agent lawyer read open job offers" on public.job_offers;
create policy "agent lawyer read open job offers"
  on public.job_offers for select
to authenticated
using (
  status = 'open'
  and public.current_user_role() in ('agent', 'lawyer')
);

drop policy if exists "admin sales employer create job offers" on public.job_offers;
create policy "admin sales employer create job offers"
  on public.job_offers for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'salesperson')
  or employer_id = any(public.current_employer_ids())
);

drop policy if exists "admin sales employer update job offers" on public.job_offers;
create policy "admin sales employer update job offers"
  on public.job_offers for update
to authenticated
using (
  public.is_admin()
  or assigned_salesperson_id = auth.uid()
  or employer_id = any(public.current_employer_ids())
)
with check (
  public.is_admin()
  or assigned_salesperson_id = auth.uid()
  or employer_id = any(public.current_employer_ids())
);

-- Job offer slots
drop policy if exists "read slots with allowed job offer" on public.job_offer_slots;
create policy "read slots with allowed job offer"
  on public.job_offer_slots for select
to authenticated
using (
  exists (
    select 1 from public.job_offers jo
    where jo.id = job_offer_slots.job_offer_id
    and (
      public.is_admin()
      or jo.assigned_salesperson_id = auth.uid()
      or jo.employer_id = any(public.current_employer_ids())
    )
  )
);

-- Selections
drop policy if exists "read selections by related parties" on public.job_offer_selections;
create policy "read selections by related parties"
  on public.job_offer_selections for select
to authenticated
using (
  public.is_admin()
  or selected_by = auth.uid()
  or employer_id = any(public.current_employer_ids())
  or exists (
    select 1 from public.candidates c
    where c.id = job_offer_selections.candidate_id
    and c.agent_id = auth.uid()
  )
);

-- Visa cases
drop policy if exists "admin reads all visa cases" on public.visa_cases;
create policy "admin reads all visa cases"
  on public.visa_cases for select
to authenticated
using (public.is_admin());

drop policy if exists "lawyer reads assigned visa cases" on public.visa_cases;
create policy "lawyer reads assigned visa cases"
  on public.visa_cases for select
to authenticated
using (lawyer_id = auth.uid());

drop policy if exists "agent reads own candidate visa cases" on public.visa_cases;
create policy "agent reads own candidate visa cases"
  on public.visa_cases for select
to authenticated
using (agent_id = auth.uid());

drop policy if exists "employer reads own visa cases" on public.visa_cases;
create policy "employer reads own visa cases"
  on public.visa_cases for select
to authenticated
using (employer_id = any(public.current_employer_ids()));

drop policy if exists "salesperson reads assigned visa cases" on public.visa_cases;
create policy "salesperson reads assigned visa cases"
  on public.visa_cases for select
to authenticated
using (
  exists (
    select 1 from public.job_offers jo
    where jo.id = visa_cases.job_offer_id
    and jo.assigned_salesperson_id = auth.uid()
  )
);

drop policy if exists "lawyer updates assigned visa cases" on public.visa_cases;
create policy "lawyer updates assigned visa cases"
  on public.visa_cases for update
to authenticated
using (lawyer_id = auth.uid() or public.is_admin())
with check (lawyer_id = auth.uid() or public.is_admin());

-- Visa events
drop policy if exists "read visa events through case access" on public.visa_case_events;
create policy "read visa events through case access"
  on public.visa_case_events for select
to authenticated
using (
  exists (
    select 1 from public.visa_cases vc
    where vc.id = visa_case_events.visa_case_id
    and (
      public.is_admin()
      or vc.lawyer_id = auth.uid()
      or vc.agent_id = auth.uid()
      or vc.employer_id = any(public.current_employer_ids())
    )
  )
);

drop policy if exists "lawyer inserts visa events" on public.visa_case_events;
create policy "lawyer inserts visa events"
  on public.visa_case_events for insert
to authenticated
with check (
  exists (
    select 1 from public.visa_cases vc
    where vc.id = visa_case_events.visa_case_id
    and (vc.lawyer_id = auth.uid() or public.is_admin())
  )
);

-- Country document requirements
drop policy if exists "read document requirements" on public.country_document_requirements;
create policy "read document requirements"
  on public.country_document_requirements for select
to authenticated
using (true);

drop policy if exists "admin manages document requirements" on public.country_document_requirements;
create policy "admin manages document requirements"
  on public.country_document_requirements for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Notifications
drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications"
  on public.notifications for select
to authenticated
using (recipient_id = auth.uid());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
  on public.notifications for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

drop policy if exists "system/admin creates notifications" on public.notifications;
create policy "system/admin creates notifications"
  on public.notifications for insert
to authenticated
with check (public.is_admin() or actor_id = auth.uid());

-- Audit logs
drop policy if exists "admin reads audit logs" on public.audit_logs;
create policy "admin reads audit logs"
  on public.audit_logs for select
to authenticated
using (public.is_admin());

-- =========================
-- TRAVEL COORDINATION
-- =========================

create table if not exists public.visa_case_travel (
  id uuid primary key default gen_random_uuid(),
  visa_case_id uuid not null unique references public.visa_cases(id) on delete cascade,
  ticket_booked boolean not null default false,
  travel_date date,
  arrival_date date,
  employer_joining_date date,
  notes text,
  coordinated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger visa_case_travel_updated_at
before update on public.visa_case_travel
for each row execute function public.set_updated_at();

alter table public.visa_case_travel enable row level security;

drop policy if exists "admin manages travel coordination" on public.visa_case_travel;
create policy "admin manages travel coordination"
  on public.visa_case_travel for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "salesperson manages travel for own job offers" on public.visa_case_travel;
create policy "salesperson manages travel for own job offers"
  on public.visa_case_travel for all
to authenticated
using (
  exists (
    select 1 from public.visa_cases vc
    join public.job_offers jo on jo.id = vc.job_offer_id
    where vc.id = visa_case_travel.visa_case_id
    and jo.assigned_salesperson_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.visa_cases vc
    join public.job_offers jo on jo.id = vc.job_offer_id
    where vc.id = visa_case_travel.visa_case_id
    and jo.assigned_salesperson_id = auth.uid()
  )
);

drop policy if exists "read travel through case access" on public.visa_case_travel;
create policy "read travel through case access"
  on public.visa_case_travel for select
to authenticated
using (
  exists (
    select 1 from public.visa_cases vc
    where vc.id = visa_case_travel.visa_case_id
    and (
      public.is_admin()
      or vc.lawyer_id = auth.uid()
      or vc.agent_id = auth.uid()
      or vc.employer_id = any(public.current_employer_ids())
    )
  )
);

-- =========================
-- STORAGE BUCKETS
-- =========================

insert into storage.buckets (id, name, public)
values 
  ('candidate-documents', 'candidate-documents', false),
  ('contracts', 'contracts', false),
  ('visa-documents', 'visa-documents', false)
on conflict (id) do nothing;

-- =========================
-- SEED BASIC DATA
-- =========================

insert into public.countries (name, code) values
  ('Russia', 'RU'),
  ('Greece', 'GR'),
  ('Poland', 'PL'),
  ('Romania', 'RO')
on conflict (code) do nothing;

insert into public.positions (name) values
  ('Driver'),
  ('Cleaner'),
  ('Welder'),
  ('Electrician'),
  ('Chef'),
  ('Security Guard'),
  ('Mason'),
  ('Plumber')
on conflict (name) do nothing;

insert into public.country_document_requirements (country_id, type, description)
select id, 'passport_scan', 'Passport scan is required'
from public.countries
on conflict (country_id, type) do nothing;

insert into public.country_document_requirements (country_id, type, description)
select id, 'health_certificate', 'Health certificate is required'
from public.countries
on conflict (country_id, type) do nothing;

insert into public.country_document_requirements (country_id, type, description)
select id, 'visa_application_slip', 'Visa application slip is required'
from public.countries
on conflict (country_id, type) do nothing;

insert into public.country_document_requirements (country_id, type, description)
select id, 'approved_visa', 'Approved visa copy is required'
from public.countries
on conflict (country_id, type) do nothing;
