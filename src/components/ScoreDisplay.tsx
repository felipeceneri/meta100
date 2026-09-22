import type { DayScore } from '../types'

export function ScoreDisplay({ score }: { score: DayScore }) {
  const { habitPoints, bonusPoints, total, perfectDayPoints } = score
  const color =
    perfectDayPoints > 0 && habitPoints >= perfectDayPoints
      ? 'text-sky-400'
      : habitPoints >= 0
        ? 'text-emerald-400'
        : 'text-rose-500'

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
      <p className="text-sm text-slate-500">Pontuação de hoje</p>
      <p className={`text-5xl font-bold tabular-nums ${color}`}>{total}</p>
      <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
        <span>
          hábitos: {habitPoints}
          {perfectDayPoints > 0 ? ` / ${perfectDayPoints}` : ''}
        </span>
        {bonusPoints > 0 && <span className="text-amber-400">bônus: +{bonusPoints}</span>}
      </div>
    </div>
  )
}
