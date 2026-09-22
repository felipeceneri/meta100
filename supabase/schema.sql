-- meta100 — schema completo e atual
-- Pra um projeto Supabase novo, roda só este arquivo (não precisa dos migration_*.sql,
-- que existem pra quem já tinha um projeto num estado anterior).
-- SQL Editor: https://supabase.com/dashboard/project/_/sql/new

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
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

-- Pontuação (calculada no código e nas queries, nunca guardada como valor solto):
--   check-in "sim" = +10 · check-in "nao" = -10 · bônus = +50 por linha.

-- Perfis: só o que pode ficar público (apelido) pro ranking.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null unique,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: visível pra quem está logado" on profiles
  for select using (auth.uid() is not null);

create policy "profiles: só o dono atualiza o próprio" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Ranking: agrega pontos de todo mundo sem expor hábitos/check-ins de ninguém.
create or replace function get_leaderboard()
returns table (display_name text, total_points bigint)
language sql
security definer
set search_path = public
as $$
  select
    p.display_name,
    coalesce(c.pts, 0) + coalesce(b.pts, 0) as total_points
  from profiles p
  left join (
    select user_id, sum(case status when 'sim' then 10 when 'nao' then -10 else 0 end)::bigint as pts
    from checkins
    group by user_id
  ) c on c.user_id = p.id
  left join (
    select user_id, (count(*) * 50)::bigint as pts
    from bonus_activities
    group by user_id
  ) b on b.user_id = p.id
  order by total_points desc;
$$;

-- Postgres concede EXECUTE a PUBLIC por padrão em toda função nova — sem este
-- revoke, qualquer pessoa com a anon key (que é pública por design) conseguiria
-- ler apelido + pontuação de todo mundo sem estar logada.
revoke execute on function get_leaderboard() from public, anon;
grant execute on function get_leaderboard() to authenticated;
