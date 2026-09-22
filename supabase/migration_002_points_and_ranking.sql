-- meta100 — migração 002: pontuação fixa + perfis públicos + ranking
-- Rodar no SQL Editor do projeto Supabase (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Pontuação deixa de ser configurável por linha (evita fraude via valores livres).
--    O valor em si nunca fica guardado: check-in vale 10 (calculado a partir do
--    status "sim"/"nao", que já tem CHECK constraint) e bônus vale 50 (calculado
--    por contagem de linhas, não por uma coluna que o cliente poderia adulterar).
alter table habits drop column if exists weight;
alter table bonus_activities drop column if exists points;

-- 2. Perfis — só o que pode ficar público: o apelido de cada participante.
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

-- 3. Cria o perfil automaticamente no cadastro — não depende do cliente terminar
--    a chamada com sucesso, então funciona mesmo com confirmação de e-mail pendente.
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

-- 4. Preenche o perfil de quem já tinha conta antes dessa migração
--    (o trigger acima só roda pra contas novas). Troque o apelido depois se quiser.
insert into profiles (id, display_name)
select id, split_part(email, '@', 1) from auth.users
where id not in (select id from profiles);

-- 5. Ranking: soma os pontos de todo mundo sem expor hábitos/check-ins de ninguém.
--    SECURITY DEFINER contorna a RLS das tabelas privadas só pra agregar — quem
--    chama essa função nunca lê uma linha de habits/checkins/bonus_activities
--    de outra pessoa diretamente, só o total já somado.
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

grant execute on function get_leaderboard() to authenticated;
