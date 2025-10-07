-- ==========================
-- Create builders table
-- ==========================
create table if not exists builders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text unique,
  specialization text,
  created_at timestamptz default now()
);

-- ==========================
-- Create customers table
-- ==========================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text unique,
  address text,
  created_at timestamptz default now()
);

-- ==========================
-- Create services table
-- ==========================
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  created_at timestamptz default now()
);

-- ==========================
-- Update appointments table to add relationships
-- ==========================
alter table appointments
  add column if not exists customer_id uuid references customers(id) on delete set null,
  add column if not exists builder_id uuid references builders(id) on delete set null,
  add column if not exists service_id uuid references services(id) on delete set null;
