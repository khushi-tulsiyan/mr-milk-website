-- JFAM ghee shop: customer profiles, orders, and 90-day order retention.
-- Run once in Supabase → SQL Editor (safe to re-run).

-- ---------------------------------------------------------------
-- Profiles: one row per signed-in customer, saved checkout details.
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  address text,
  pincode text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------
-- Orders: written only by the server (service role) from /api.
-- Guests have user_id = null. Customers can read their own orders.
-- ---------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'created' check (status in ('created', 'paid')),
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  pincode text not null,
  items jsonb not null,
  subtotal integer not null,
  delivery integer not null,
  total integer not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);
create index if not exists orders_created_at_idx on public.orders (created_at);

alter table public.orders enable row level security;

drop policy if exists "orders: read own" on public.orders;
create policy "orders: read own" on public.orders
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 90-day retention: delete orders (and the customer details on them)
-- once they are older than 90 days. Runs daily at 02:00 IST.
-- ---------------------------------------------------------------
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'delete-orders-older-than-90-days';

select cron.schedule(
  'delete-orders-older-than-90-days',
  '30 20 * * *', -- 20:30 UTC = 02:00 IST
  $$ delete from public.orders where created_at < now() - interval '90 days' $$
);
