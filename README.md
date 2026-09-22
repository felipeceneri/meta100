# meta100

App de check-in diário de saúde/esportes, com ranking entre participantes. Cada
hábito (dieta, água, treino...) vale pontos fixos por check-in; marcar "Sim" soma,
marcar "Não" penaliza, e atividades extras (corrida, yoga...) somam bônus por cima.
Painel de evolução mostra o histórico pessoal; o ranking mostra a disputa entre todo
mundo cadastrado.

## Decisões

1. **Hábitos customizáveis, pontuação fixa** — o usuário cadastra, edita e arquiva os
   próprios hábitos livremente, mas todos valem os mesmos pontos (não dá pra
   configurar peso por hábito) — é o que mantém o ranking justo entre participantes.
2. **Pontuação fixa, sem valor livre (anti-fraude)** — check-in "Sim" = **+10**,
   "Não" = **-10** (penalidade real, pendente = 0), bônus = **+50** por atividade
   extra. Nenhum desses valores é editável pelo usuário nem guardado como número
   solto no banco: pontos de check-in são calculados a partir do `status`
   (`sim`/`não`, com CHECK constraint) e pontos de bônus são calculados por
   contagem de linhas — não há coluna de pontos pra alguém adulterar via API direta.
3. **Bônus livre na descrição, fixo no valor** — atividades extras têm descrição em
   texto livre, mas o valor é sempre +50.
4. **Stack**: Vite + React + TypeScript + Tailwind no front, Supabase (Postgres +
   Auth) como backend.
5. **Cadastro aberto** — qualquer pessoa com o link cria a própria conta (com
   apelido pro ranking), sem aprovação manual. RLS garante que hábitos, check-ins e
   bônus de cada um continuam privados (`user_id = auth.uid()`) — só o apelido e a
   pontuação total ficam públicos pros outros participantes logados, via a função
   `get_leaderboard()` (`SECURITY DEFINER`, agrega sem expor as tabelas privadas).
6. **Ranking acumulado geral** — a pontuação soma desde o dia em que a pessoa entrou
   e nunca zera. Dá pra adicionar períodos (semanal/mensal) depois, se fizer falta.
7. **Hospedagem**: GitHub Pages, deploy automático via GitHub Actions a cada push
   em `main`. Repositório: https://github.com/felipeceneri/meta100. As variáveis
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a chave anon é pública por design)
   ficam como GitHub Actions secrets do repositório.
8. **Painel de estatísticas** usa sempre os hábitos ativos *atuais* pra recalcular
   dias passados (não existe um "arquivado em X data" ainda) — arquivar um hábito
   muda o histórico retroativamente. Limitação conhecida, ver comentário em
   `src/lib/scoring.ts`.

## Roadmap

- [x] Fase 1 — scaffold + check-in/hábitos com dados locais (`localStorage`)
- [x] Fase 2 — Supabase (schema em `supabase/schema.sql`, auth de usuário único, RLS)
- [x] Fase 3 — painel de estatísticas/evolução (histórico, streak, % por hábito)
- [x] Fase 4 — GitHub Actions + deploy no GitHub Pages
- [x] Fase 5 — pontuação fixa anti-fraude (10 por check-in, 50 por bônus)
- [x] Fase 6 — cadastro público (qualquer um cria conta e entra na disputa)
- [x] Fase 7 — ranking (apelido + pontuação total, hábitos de cada um continuam privados)

## Banco de dados

Projeto novo: rodar `supabase/schema.sql` inteiro no SQL Editor.
Projeto que já existia antes da Fase 5: rodar `supabase/migration_002_points_and_ranking.sql`.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local  # preencher com os dados do seu projeto Supabase
npm run dev
```
