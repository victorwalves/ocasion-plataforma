-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create type user_role as enum ('admin', 'host', 'client');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  cnpj text,
  role user_role default 'client',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- VENUES
create table public.venues (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  slug text unique not null,
  address_street text not null,
  address_neighborhood text not null,
  address_city text default 'São Paulo',
  max_capacity_seated int not null,
  max_capacity_standing int not null,
  amenities jsonb default '[]'::jsonb,
  images text[] default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.venues enable row level security;

create policy "Active venues are viewable by everyone." on public.venues
  for select using (is_active = true);

create policy "Hosts can insert their own venues." on public.venues
  for insert with check (auth.uid() = host_id);

create policy "Hosts can update their own venues." on public.venues
  for update using (auth.uid() = host_id);

-- PRICING RULES
create type pricing_model_type as enum ('hourly', 'daily', 'per_person');

create table public.pricing_rules (
  id uuid default uuid_generate_v4() primary key,
  venue_id uuid references public.venues(id) on delete cascade not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  pricing_model pricing_model_type not null,
  base_price numeric not null,
  minimum_spend numeric default 0,
  min_hours int default 4,
  unique(venue_id, day_of_week)
);

alter table public.pricing_rules enable row level security;

create policy "Pricing rules are viewable by everyone." on public.pricing_rules
  for select using (true);

create policy "Hosts can manage pricing rules." on public.pricing_rules
  for all using (exists (select 1 from public.venues where id = pricing_rules.venue_id and host_id = auth.uid()));

-- PACKAGES
create type package_price_type as enum ('fixed', 'per_person');
create type package_category as enum ('food', 'beverage', 'staff', 'equipment', 'photography', 'dj');

create table public.packages (
  id uuid default uuid_generate_v4() primary key,
  venue_id uuid references public.venues(id) on delete cascade, -- NULL means Global/Ocasion package
  name text not null,
  description text,
  price numeric not null,
  price_type package_price_type not null,
  category package_category not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.packages enable row level security;

create policy "Packages are viewable by everyone." on public.packages
  for select using (true);

create policy "Hosts can manage their packages." on public.packages
  for all using (venue_id is not null and exists (select 1 from public.venues where id = packages.venue_id and host_id = auth.uid()));

-- BOOKINGS
create type booking_status as enum ('draft', 'pending_payment', 'confirmed', 'completed', 'cancelled');

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  venue_id uuid references public.venues(id) not null,
  user_id uuid references public.profiles(id) not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  guest_count int not null,
  selected_packages jsonb default '[]'::jsonb,
  calculated_venue_cost numeric not null,
  calculated_min_spend_gap numeric default 0,
  calculated_extras_cost numeric default 0,
  total_amount numeric not null,
  stripe_session_id text,
  status booking_status default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

create policy "Users can view their own bookings." on public.bookings
  for select using (auth.uid() = user_id);

create policy "Hosts can view bookings for their venues." on public.bookings
  for select using (exists (select 1 from public.venues where id = bookings.venue_id and host_id = auth.uid()));

create policy "Users can insert bookings." on public.bookings
  for insert with check (auth.uid() = user_id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
