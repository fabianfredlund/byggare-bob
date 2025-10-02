create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'new',
  description text,
  created_at timestamptz not null default now()
);

-- calls storage (basic)
create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  from_number text,
  to_number text,
  recording_url text,
  transcript text,
  intent text,
  created_project_id uuid,
  proposed_appointment jsonb,
  created_at timestamptz not null default now()
);
