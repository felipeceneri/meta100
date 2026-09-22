import type { BonusActivity, CheckIn, DayScore, Habit } from '../types'

export function todayISO(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Usa só os hábitos ativos AGORA — arquivar um hábito recalcula o peso total
// também pros dias passados no histórico. Aceitável enquanto não houver
// necessidade real de congelar o conjunto de hábitos por dia.
export function computeDayScore(
  habits: Habit[],
  checkins: CheckIn[],
  bonuses: BonusActivity[],
  date: string,
): DayScore {
  const activeHabits = habits.filter((h) => h.active)
  const totalWeight = activeHabits.reduce((sum, h) => sum + h.weight, 0)
  const statusByHabit = new Map(
    checkins.filter((c) => c.date === date).map((c) => [c.habitId, c.status]),
  )

  let weightedSum = 0
  for (const habit of activeHabits) {
    const status = statusByHabit.get(habit.id)
    if (status === 'sim') weightedSum += habit.weight
    else if (status === 'nao') weightedSum -= habit.weight
  }

  const habitScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0
  const bonusPoints = bonuses
    .filter((b) => b.date === date)
    .reduce((sum, b) => sum + b.points, 0)

  return {
    habitScore: round1(habitScore),
    bonusPoints: round1(bonusPoints),
    total: round1(habitScore + bonusPoints),
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
