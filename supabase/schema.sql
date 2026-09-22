-- meta100 — schema inicial (Fase 2)
-- Rodar no SQL Editor do projeto Supabase (https://supabase.com/dashboard/project/_/sql/new)

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  weight numeric not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists checkins (
  habit_id uuid not null references habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  status text not null check (status in ('sim', 'nao')),
  primary key (habit_id, date)
);

create table if not exists bonus_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  description text not null,
  points numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table habits enable row level security;
alter table checkins enable row level security;
alter table bonus_activities enable row level security;

create policy "habits: only owner" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "checkins: only owner" on checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bonus_activities: only owner" on bonus_activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
