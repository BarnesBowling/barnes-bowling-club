-- Barnes Bowling Club production schema. Run in Supabase SQL Editor.
create extension if not exists "pgcrypto";
create type app_role as enum ('member','admin');
create type membership_status as enum ('pending','active','expired','cancelled');
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade,email text unique,full_name text,role app_role default 'member',membership_type text,membership_status membership_status default 'pending',handicap numeric,joined_at timestamptz default now());
create table public.applications (id uuid primary key default gen_random_uuid(),name text not null,email text not null,phone text,membership_type text not null,message text,status text default 'new',created_at timestamptz default now());
create table public.events (id uuid primary key default gen_random_uuid(),title text not null,event_date timestamptz not null,location text,visibility text default 'public',capacity int,created_at timestamptz default now());
create table public.green_status (id uuid primary key default gen_random_uuid(),status text not null check (status in ('open_good','open_fair','closed')),message text not null,updated_at timestamptz default now(),updated_by uuid references auth.users(id));
create table public.gallery_images (id uuid primary key default gen_random_uuid(),image_url text not null,caption text,category text default 'club',featured boolean default false,uploaded_by uuid references auth.users(id),created_at timestamptz default now());
create table public.payments (id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),stripe_checkout_id text unique,amount int,status text not null,membership_type text,created_at timestamptz default now());
alter table public.profiles enable row level security;alter table public.applications enable row level security;alter table public.events enable row level security;alter table public.green_status enable row level security;alter table public.gallery_images enable row level security;alter table public.payments enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
create policy "profiles read self or admin" on public.profiles for select using (auth.uid()=id or public.is_admin());
create policy "profiles update self or admin" on public.profiles for update using (auth.uid()=id or public.is_admin());
create policy "applications insert public" on public.applications for insert with check (true);
create policy "applications admin read" on public.applications for select using (public.is_admin());
create policy "events public read" on public.events for select using (visibility='public' or auth.uid() is not null);
create policy "events admin write" on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy "green public read" on public.green_status for select using (true);
create policy "green admin write" on public.green_status for insert with check (public.is_admin());
create policy "gallery public read" on public.gallery_images for select using (true);
create policy "gallery admin write" on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());
create policy "payments admin read" on public.payments for select using (public.is_admin() or auth.uid()=user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$ begin insert into public.profiles (id,email,full_name) values (new.id,new.email,new.raw_user_meta_data->>'full_name') on conflict (id) do nothing; return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.green_status(status,message) values ('open_good','Green open. Please check conditions before play.');

-- Handicap leaderboard
create table public.handicaps (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  handicap numeric not null default 0,
  trend text check (trend in ('up','down','same')) default 'same',
  played int not null default 0,
  season_year int not null default extract(year from now())::int,
  updated_at timestamptz default now()
);
alter table public.handicaps enable row level security;
create policy "handicaps public read" on public.handicaps for select using (true);
create policy "handicaps admin write" on public.handicaps for all using (public.is_admin()) with check (public.is_admin());

-- Club notices / news
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author text not null,
  published_at timestamptz default now()
);
alter table public.notices enable row level security;
create policy "notices public read" on public.notices for select using (true);
create policy "notices admin write" on public.notices for all using (public.is_admin()) with check (public.is_admin());

-- Committee officers
create table public.officers (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  role text not null,
  name text not null,
  sort_order int not null default 0
);
alter table public.officers enable row level security;
create policy "officers public read" on public.officers for select using (true);
create policy "officers admin write" on public.officers for all using (public.is_admin()) with check (public.is_admin());

-- How to play content (editable by admin)
create table public.how_to_play (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  sort_order int not null default 0
);
alter table public.how_to_play enable row level security;
create policy "how_to_play public read" on public.how_to_play for select using (true);
create policy "how_to_play admin write" on public.how_to_play for all using (public.is_admin()) with check (public.is_admin());
