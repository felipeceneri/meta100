import type { BonusActivity, CheckIn, DayScore, Habit } from '../types'

export const HABIT_POINTS = 10
export const BONUS_POINTS = 50

export function todayISO(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Usa só os hábitos ativos AGORA — arquivar um hábito recalcula o total
// também pros dias passados no histórico. Aceitável enquanto não houver
// necessidade real de congelar o conjunto de hábitos por dia.
export function computeDayScore(
  habits: Habit[],
  checkins: CheckIn[],
  bonuses: BonusActivity[],
  date: string,
): DayScore {
  const activeHabits = habits.filter((h) => h.active)
  const statusByHabit = new Map(
    checkins.filter((c) => c.date === date).map((c) => [c.habitId, c.status]),
  )

  let habitPoints = 0
  for (const habit of activeHabits) {
    const status = statusByHabit.get(habit.id)
    if (status === 'sim') habitPoints += HABIT_POINTS
    else if (status === 'nao') habitPoints -= HABIT_POINTS
  }

  const bonusCount = bonuses.filter((b) => b.date === date).length
  const bonusPoints = bonusCount * BONUS_POINTS

  return {
    habitPoints,
    bonusPoints,
    total: habitPoints + bonusPoints,
    perfectDayPoints: activeHabits.length * HABIT_POINTS,
  }
}
