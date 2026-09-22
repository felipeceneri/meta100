import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { BonusActivity, CheckIn, CheckInStatus, Habit } from '../types'
import {
  addBonusActivity,
  deleteBonusActivity,
  getBonusActivities,
  getCheckins,
  getHabits,
  setCheckin,
} from '../lib/store'
import { BONUS_POINTS, computeDayScore, todayISO } from '../lib/scoring'
import { ScoreDisplay } from './ScoreDisplay'

const date = todayISO()

export function CheckInView() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [bonuses, setBonuses] = useState<BonusActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [bonusDesc, setBonusDesc] = useState('')

  useEffect(() => {
    void loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [h, c, b] = await Promise.all([getHabits(), getCheckins(), getBonusActivities()])
    setHabits(h)
    setCheckins(c)
    setBonuses(b)
    setLoading(false)
  }

  const activeHabits = useMemo(() => habits.filter((h) => h.active), [habits])
  const todayCheckins = useMemo(() => checkins.filter((c) => c.date === date), [checkins])
  const todayBonuses = useMemo(() => bonuses.filter((b) => b.date === date), [bonuses])
  const score = useMemo(
    () => computeDayScore(habits, checkins, bonuses, date),
    [habits, checkins, bonuses],
  )

  async function handleMark(habitId: string, status: CheckInStatus) {
    const current = todayCheckins.find((c) => c.habitId === habitId)?.status
    const next = current === status ? null : status
    await setCheckin(habitId, date, next)
    setCheckins(await getCheckins())
  }

  async function handleAddBonus(e: FormEvent) {
    e.preventDefault()
    if (!bonusDesc.trim()) return
    await addBonusActivity({
      id: crypto.randomUUID(),
      date,
      description: bonusDesc.trim(),
      createdAt: new Date().toISOString(),
    })
    setBonuses(await getBonusActivities())
    setBonusDesc('')
  }

  async function handleRemoveBonus(id: string) {
    await deleteBonusActivity(id)
    setBonuses(await getBonusActivities())
  }

  if (loading) return <p className="text-slate-500">Carregando...</p>

  return (
    <div className="space-y-6">
      <ScoreDisplay score={score} />

      {activeHabits.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
          Nenhum hábito cadastrado ainda. Vá em "Hábitos" pra criar o primeiro.
        </div>
      ) : (
        <div className="space-y-2">
          {activeHabits.map((habit) => {
            const status = todayCheckins.find((c) => c.habitId === habit.id)?.status ?? null
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <p className="font-medium text-slate-100">{habit.name}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMark(habit.id, 'sim')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      status === 'sim'
                        ? 'bg-emerald-500 text-emerald-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMark(habit.id, 'nao')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      status === 'nao'
                        ? 'bg-rose-500 text-rose-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">Bônus de hoje</h2>
        {todayBonuses.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {todayBonuses.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{b.description}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-amber-400">+{BONUS_POINTS}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBonus(b.id)}
                    className="text-slate-600 hover:text-slate-400"
                    aria-label="Remover"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleAddBonus} className="flex gap-2">
          <input
            type="text"
            value={bonusDesc}
            onChange={(e) => setBonusDesc(e.target.value)}
            placeholder="ex: corrida 5km, yoga..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-sky-950 hover:bg-sky-400"
          >
            +{BONUS_POINTS}
          </button>
        </form>
      </div>
    </div>
  )
}
