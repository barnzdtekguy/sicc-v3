# Supabase Attendance Setup

Copy everything in the SQL block below, paste it into:

`Supabase Dashboard -> SQL Editor -> New Query -> Run`

This version is safe to run again. It creates missing tables first, then recreates the public app policies, then inserts the default programmes.

```sql
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  role text not null,
  department text,
  kdf_area text,
  avatar text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  address text,
  date_of_birth date,
  kdf_area text,
  kdf_coordinator text,
  department text,
  affinity_group text,
  status text default 'New Convert',
  spiritual_status text default 'Salvation',
  notes text,
  registered_by uuid,
  registered_by_name text,
  date_registered date default current_date,
  follow_up_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  member_name text,
  pastor_id uuid,
  pastor_name text,
  kdf_area text,
  date date default current_date,
  method text default 'Visit',
  notes text,
  outcome text,
  status text default 'In Progress',
  created_at timestamptz default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  service text not null,
  count integer not null,
  dept_name text,
  dept_count integer,
  recorded_by uuid,
  recorded_by_name text,
  created_at timestamptz default now()
);

create table if not exists greatness_attendees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  department text,
  created_at timestamptz default now()
);

create table if not exists greatness_attendance (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid references greatness_attendees(id) on delete cascade,
  day_number integer not null,
  status text not null default 'Present',
  marked_by text,
  marked_at timestamptz default now(),
  unique(attendee_id, day_number)
);

create table if not exists attendance_programmes (
  id text primary key,
  name text not null,
  programme_type text default 'custom',
  start_date date,
  end_date date,
  total_days integer,
  is_active boolean default true,
  created_by uuid,
  created_by_name text,
  created_at timestamptz default now()
);

create table if not exists programme_attendance_records (
  id uuid primary key default gen_random_uuid(),
  programme_id text not null,
  programme_name text not null,
  programme_type text default 'custom',
  attendance_date date not null,
  day_number integer,
  attendee_source text,
  attendee_source_id text,
  attendee_name text not null,
  phone text,
  phone_normalized text,
  salem_family text,
  date_of_birth date,
  email text,
  department text,
  church_position text,
  status text default 'Present',
  marked_by text,
  marked_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table programme_attendance_records
  add column if not exists salem_family text,
  add column if not exists date_of_birth date,
  add column if not exists email text;

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_name text,
  action text,
  detail text,
  created_at timestamptz default now()
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  assignee text not null,
  priority text default 'Normal',
  due_date date,
  status text default 'Active',
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists sms_config (
  id integer primary key default 1,
  api_key text,
  sender_id text default 'SICC',
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table members enable row level security;
alter table follow_ups enable row level security;
alter table attendance enable row level security;
alter table greatness_attendees enable row level security;
alter table greatness_attendance enable row level security;
alter table attendance_programmes enable row level security;
alter table programme_attendance_records enable row level security;
alter table activity_logs enable row level security;
alter table assignments enable row level security;
alter table sms_config enable row level security;

drop policy if exists "Allow all" on profiles;
drop policy if exists "Allow all" on members;
drop policy if exists "Allow all" on follow_ups;
drop policy if exists "Allow all" on attendance;
drop policy if exists "Allow all" on greatness_attendees;
drop policy if exists "Allow all" on greatness_attendance;
drop policy if exists "Allow all" on attendance_programmes;
drop policy if exists "Allow all" on programme_attendance_records;
drop policy if exists "Allow all" on activity_logs;
drop policy if exists "Allow all" on assignments;
drop policy if exists "Allow all" on sms_config;

create policy "Allow all" on profiles for all using (true) with check (true);
create policy "Allow all" on members for all using (true) with check (true);
create policy "Allow all" on follow_ups for all using (true) with check (true);
create policy "Allow all" on attendance for all using (true) with check (true);
create policy "Allow all" on greatness_attendees for all using (true) with check (true);
create policy "Allow all" on greatness_attendance for all using (true) with check (true);
create policy "Allow all" on attendance_programmes for all using (true) with check (true);
create policy "Allow all" on programme_attendance_records for all using (true) with check (true);
create policy "Allow all" on activity_logs for all using (true) with check (true);
create policy "Allow all" on assignments for all using (true) with check (true);
create policy "Allow all" on sms_config for all using (true) with check (true);

insert into profiles (name, email, role, avatar) values
  ('Bishop Enobong Etteh', 'bishop@sicc.org', 'bishop', 'BE'),
  ('SICC Admin', 'admin@sicc.org', 'admin', 'SA')
on conflict (email) do nothing;

insert into attendance_programmes (id, name, programme_type, total_days, is_active) values
  ('greatness-32-days', '32 Days of Greatness', '32_days', 32, true),
  ('sunday-service', 'Sunday Service', 'service', null, true),
  ('mid-week-service', 'Mid-Week Service', 'service', null, true),
  ('prayer-night', 'Prayer Night', 'service', null, true),
  ('special-programme', 'Special Programme', 'service', null, true),
  ('conference', 'Conference', 'service', null, true),
  ('department-meeting', 'Department Meeting', 'service', null, true)
on conflict (id) do nothing;
```

After it runs successfully, refresh the app and open `32 Days of Greatness -> QR Check-in`.
