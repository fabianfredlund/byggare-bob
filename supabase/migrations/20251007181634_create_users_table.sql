create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  created_at timestamp with time zone default now()
);
