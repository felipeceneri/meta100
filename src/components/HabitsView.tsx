import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Habit } from '../types'
import { getHabits, saveHabit } from '../lib/store'

export function HabitsView() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [weight, setWeight] = useState(1)

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
  const totalWeight = useMemo(() => activeHabits.reduce((s, h) => s + h.weight, 0), [activeHabits])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await saveHabit({
      id: crypto.randomUUID(),
      name: name.trim(),
      weight,
      active: true,
      createdAt: new Date().toISOString(),
    })
    setName('')
    setWeight(1)
    await load()
  }

  async function handleWeightChange(habit: Habit, newWeight: number) {
    await saveHabit({ ...habit, weight: newWeight })
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
          <input
            type="number"
            min={1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-sky-950 hover:bg-sky-400"
          >
            Criar
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          O peso é relativo entre os hábitos ativos — não precisa somar 100.
        </p>
      </form>

      <div className="space-y-2">
        {activeHabits.map((habit) => {
          const pct = totalWeight > 0 ? (habit.weight / totalWeight) * 100 : 0
          return (
            <div
              key={habit.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div>
                <p className="font-medium text-slate-100">{habit.name}</p>
                <p className="text-xs text-slate-500">{pct.toFixed(0)}% da meta diária</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={habit.weight}
                  onChange={(e) => handleWeightChange(habit, Number(e.target.value))}
                  className="w-14 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleArchive(habit)}
                  className="text-xs text-slate-600 hover:text-rose-400"
                >
                  arquivar
                </button>
              </div>
            </div>
          )
        })}
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
