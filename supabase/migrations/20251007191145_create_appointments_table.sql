create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  builder_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text default 'pending'
);
