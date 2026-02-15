-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. RELATIONSHIPS TABLE
create table relationships (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('pending', 'active')) default 'pending'
);

-- 2. PROFILES TABLE (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  invite_code text unique, -- Will be generated via application logic or trigger
  relationship_id uuid references relationships(id) on delete set null,
  theme_config jsonb default '{"primary": "hsl(var(--primary))", "secondary": "hsl(var(--secondary))", "radius": "0.5rem"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ENTRIES TABLE
create table entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  relationship_id uuid references relationships(id) on delete set null,
  content text not null,
  is_private boolean default false,
  word_count integer default 0,
  char_count integer default 0,
  mood text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ENABLE RLS
alter table profiles enable row level security;
alter table relationships enable row level security;
alter table entries enable row level security;

-- 5. RLS POLICIES

-- Profiles:
-- Everyone can read profiles (needed for invite lookup), but typically we might restrict this.
-- For now, allow read access to all authenticated users to facilitate invite lookups.
create policy "Profiles are viewable by authenticated users" 
  on profiles for select 
  to authenticated 
  using (true);

create policy "Users can update their own profile" 
  on profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on profiles for insert 
  with check (auth.uid() = id);

-- Relationships:
-- Viewable if you are part of the relationship.
-- Since relationship_id is on the profile, we check if the relationship_id matches the user's relationship_id.
create policy "Users can view their own relationship" 
  on relationships for select 
  using (
    id in (select relationship_id from profiles where id = auth.uid())
  );

-- Entries:
-- 1. Users can do everything with their own entries.
create policy "Users can CRUD their own entries" 
  on entries for all 
  using (auth.uid() = user_id);

-- 2. Users can read their partner's non-private entries.
-- We check if the entry's relationship_id matches the current user's relationship_id.
create policy "Users can read partner's shared entries" 
  on entries for select 
  using (
    relationship_id in (select relationship_id from profiles where id = auth.uid())
    and
    is_private = false
    and
    user_id != auth.uid()
  );

-- 6. INDEXES
create index idx_entries_user_id on entries(user_id);
create index idx_entries_relationship_id on entries(relationship_id);
create index idx_profiles_relationship_id on profiles(relationship_id);
create index idx_profiles_invite_code on profiles(invite_code);
