-- Run in the Supabase SQL Editor as project owner. Passwords belong to Supabase Auth.
begin;
create table if not exists public.admin_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  role text not null default 'admin' check (role = 'admin'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admin_accounts enable row level security;
revoke all on table public.admin_accounts from public, anon, authenticated;
grant select on table public.admin_accounts to authenticated;
drop policy if exists admin_read_self on public.admin_accounts;
create policy admin_read_self on public.admin_accounts for select to authenticated
  using ((select auth.uid()) = user_id and active = true);
-- No INSERT/UPDATE/DELETE grants or policies for browser users.
-- Account provisioning and revocation happen in SQL Editor as project owner only.
commit;
