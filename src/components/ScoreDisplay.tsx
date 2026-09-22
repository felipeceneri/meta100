import type { DayScore } from '../types'

export function ScoreDisplay({ score }: { score: DayScore }) {
  const { habitScore, bonusPoints, total } = score
  const color =
    total >= 100
      ? 'text-sky-400'
      : total >= 60
        ? 'text-emerald-400'
        : total >= 0
          ? 'text-amber-400'
          : 'text-rose-500'

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
      <p className="text-sm text-slate-500">Pontuação de hoje</p>
      <p className={`text-5xl font-bold tabular-nums ${color}`}>{total.toFixed(0)}%</p>
      <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
        <span>hábitos: {habitScore.toFixed(0)}%</span>
        {bonusPoints > 0 && <span className="text-amber-400">bônus: +{bonusPoints.toFixed(0)}</span>}
      </div>
    </div>
  )
}
