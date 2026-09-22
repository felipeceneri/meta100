import { useEffect, useMemo, useState } from 'react'
import type { BonusActivity, CheckIn, Habit } from '../types'
import { getBonusActivities, getCheckins, getHabits } from '../lib/store'
import { BONUS_POINTS, HABIT_POINTS, todayISO } from '../lib/scoring'
import {
  average,
  buildDailyEntries,
  currentStreak,
  habitCompletionRates,
  type DailyEntry,
} from '../lib/stats'

const CHART_DAYS = 14
const CHART_HEIGHT = 100

export function StatsView() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [bonuses, setBonuses] = useState<BonusActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    const [h, c, b] = await Promise.all([getHabits(), getCheckins(), getBonusActivities()])
    setHabits(h)
    setCheckins(c)
    setBonuses(b)
    setLoading(false)
  }

  const entries30 = useMemo(
    () => buildDailyEntries(habits, checkins, bonuses, 30),
    [habits, checkins, bonuses],
  )
  const entries7 = entries30.slice(-7)
  const entriesChart = entries30.slice(-CHART_DAYS)
  const streak = useMemo(() => currentStreak(entries30), [entries30])
  const bonusTotal = bonuses.length * BONUS_POINTS
  const hasAnyData = checkins.length > 0 || bonuses.length > 0
  const completion = useMemo(
    () => habitCompletionRates(habits, checkins, entries30[0]?.date ?? todayISO()),
    [habits, checkins, entries30],
  )
  const activeHabitCount = habits.filter((h) => h.active).length

  if (loading) return <p className="text-slate-500">Carregando...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Média 7 dias" value={`${average(entries7).toFixed(0)} pts`} />
        <StatTile label="Média 30 dias" value={`${average(entries30).toFixed(0)} pts`} />
        <StatTile label="Sequência atual" value={`${streak} ${streak === 1 ? 'dia' : 'dias'}`} />
        <StatTile label="Bônus acumulado" value={`+${bonusTotal}`} accent="amber" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Últimos {CHART_DAYS} dias</h2>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> dia perfeito
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> abaixo de zero
            </span>
          </div>
        </div>

        <DailyBarChart entries={entriesChart} perfectDay={activeHabitCount * HABIT_POINTS} />

        {!hasAnyData && (
          <p className="mt-3 text-center text-sm text-slate-500">
            Ainda sem check-ins — comece marcando hoje na aba "Hoje".
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">Cumprimento por hábito (30 dias)</h2>
        {completion.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum hábito ativo ainda.</p>
        ) : (
          <div className="space-y-3">
            {completion.map((c) => (
              <div key={c.habit.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{c.habit.name}</span>
                  <span className="text-slate-500">{c.rate === null ? 'sem dados' : `${c.rate}%`}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-sky-500" style={{ width: `${c.rate ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  accent = 'sky',
}: {
  label: string
  value: string
  accent?: 'sky' | 'amber'
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${accent === 'amber' ? 'text-amber-400' : 'text-sky-400'}`}
      >
        {value}
      </p>
    </div>
  )
}

function DailyBarChart({ entries, perfectDay }: { entries: DailyEntry[]; perfectDay: number }) {
  const [selected, setSelected] = useState<number | null>(null)

  const floor = Math.max(perfectDay, 10)
  const posMax = Math.max(floor, ...entries.map((e) => Math.max(0, e.score.total)))
  const negMax = Math.max(0, ...entries.map((e) => Math.max(0, -e.score.total)))
  const totalRange = posMax + negMax
  const baselineY = (posMax / totalRange) * CHART_HEIGHT
  const goalY = baselineY - perfectDay * (CHART_HEIGHT / totalRange)

  const slotWidth = 100 / entries.length
  const activeIndex = selected ?? entries.length - 1
  const active = entries[activeIndex]

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-slate-500">{formatDate(active.date)}</span>
        <span
          className={`text-sm font-semibold tabular-nums ${
            perfectDay > 0 && active.score.total >= perfectDay
              ? 'text-sky-400'
              : active.score.total >= 0
                ? 'text-slate-300'
                : 'text-rose-400'
          }`}
        >
          {active.score.total} pts
        </span>
      </div>

      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-36 w-full overflow-visible"
      >
        {perfectDay > 0 && (
          <line
            x1={0}
            y1={goalY}
            x2={100}
            y2={goalY}
            stroke="#475569"
            strokeWidth={0.5}
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <line
          x1={0}
          y1={baselineY}
          x2={100}
          y2={baselineY}
          stroke="#334155"
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
        {entries.map((entry, i) => {
          const x = i * slotWidth
          const barWidth = slotWidth * 0.6
          const isPositive = entry.score.total >= 0
          const barHeight = Math.max((Math.abs(entry.score.total) / totalRange) * CHART_HEIGHT, 0.8)
          const y = isPositive ? baselineY - barHeight : baselineY
          const isActive = i === activeIndex
          return (
            <rect
              key={entry.date}
              x={x + (slotWidth - barWidth) / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={1}
              fill={isPositive ? '#38bdf8' : '#f43f5e'}
              opacity={isActive ? 1 : 0.55}
              className="cursor-pointer"
              onMouseEnter={() => setSelected(i)}
              onClick={() => setSelected(i)}
            />
          )
        })}
      </svg>

      <div className="mt-1 flex justify-between text-[10px] text-slate-600">
        <span>{formatDate(entries[0].date)}</span>
        <span>{formatDate(entries[entries.length - 1].date)}</span>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
