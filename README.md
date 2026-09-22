# meta100

App pessoal de check-in diário de saúde/esportes. Cada hábito (dieta, água, treino...)
vale um peso relativo dentro da meta do dia; marcar "Sim" soma, marcar "Não" penaliza,
e atividades extras (corrida, yoga...) somam bônus por cima. Painel de evolução mostra
o histórico e as estatísticas ao longo do tempo.

## Decisões

1. **Hábitos totalmente customizáveis** — o usuário cadastra, edita e arquiva os
   próprios hábitos, cada um com um peso relativo (não precisa somar 100).
2. **Pontuação com penalidade real** — por hábito no dia: `Sim = +peso`,
   `Não = -peso`, pendente = 0. A pontuação do dia é a soma normalizada
   (`peso ponderado / peso total × 100`), podendo ir de -100% a +100%.
3. **Bônus livre** — atividades extras são um registro livre (descrição + pontos),
   somando por cima do resultado do dia sem limite superior.
4. **Stack**: Vite + React + TypeScript + Tailwind no front, Supabase (Postgres +
   Auth) como backend. Fase 1 roda só com `localStorage` pra validar a UX antes de
   plugar o Supabase.
5. **Hospedagem**: GitHub Pages, deploy automático via GitHub Actions a cada push
   em `main`. Repositório: https://github.com/felipeceneri/meta100.

## Roadmap

- [x] Fase 1 — scaffold + check-in/hábitos com dados locais (`localStorage`)
- [ ] Fase 2 — Supabase (schema em `supabase/schema.sql`, auth de usuário único, RLS)
- [ ] Fase 3 — painel de estatísticas/evolução (histórico, streak, % por hábito)
- [ ] Fase 4 — GitHub Actions + deploy no GitHub Pages

## Desenvolvimento

```bash
npm install
npm run dev
```
