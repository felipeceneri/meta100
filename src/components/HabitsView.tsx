import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Habit } from '../types'
import { getHabits, saveHabit } from '../lib/store'
import { HABIT_POINTS } from '../lib/scoring'

export function HabitsView() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setHabits(await getHabits())
    setLoading(false)
  }

  const activeHabits = useMemo(() => habits.filter((h) => h.active), [habits])
  const archivedHabits = useMemo(() => habits.filter((h) => !h.active), [habits])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await saveHabit({
      id: crypto.randomUUID(),
      name: name.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    })
    setName('')
    await load()
  }

  async function handleArchive(habit: Habit) {
    await saveHabit({ ...habit, active: false })
    await load()
  }

  async function handleRestore(habit: Habit) {
    await saveHabit({ ...habit, active: true })
    await load()
  }

  if (loading) return <p className="text-slate-500">Carregando...</p>

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">Novo hábito</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: treinar, beber água..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-sky-950 hover:bg-sky-400"
          >
            Criar
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Todo hábito vale {HABIT_POINTS} pontos por check-in — fixo, pra manter o ranking justo.
        </p>
      </form>

      <div className="space-y-2">
        {activeHabits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div>
              <p className="font-medium text-slate-100">{habit.name}</p>
              <p className="text-xs text-slate-500">{HABIT_POINTS} pontos por check-in</p>
            </div>
            <button
              type="button"
              onClick={() => handleArchive(habit)}
              className="text-xs text-slate-600 hover:text-rose-400"
            >
              arquivar
            </button>
          </div>
        ))}
        {activeHabits.length === 0 && (
          <p className="text-center text-sm text-slate-500">Nenhum hábito ativo ainda.</p>
        )}
      </div>

      {archivedHabits.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Arquivados</h2>
          <div className="space-y-2">
            {archivedHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-900/30 p-3 text-slate-500"
              >
                <span>{habit.name}</span>
                <button
                  type="button"
                  onClick={() => handleRestore(habit)}
                  className="text-xs text-sky-500 hover:text-sky-400"
                >
                  restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
