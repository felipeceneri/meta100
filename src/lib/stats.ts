import type { BonusActivity, CheckIn, Habit } from '../types'
import { computeDayScore, todayISO } from './scoring'

export interface DailyEntry {
  date: string
  score: ReturnType<typeof computeDayScore>
}

export function buildDailyEntries(
  habits: Habit[],
  checkins: CheckIn[],
  bonuses: BonusActivity[],
  days: number,
  end = new Date(),
): DailyEntry[] {
  const entries: DailyEntry[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    const date = todayISO(d)
    entries.push({ date, score: computeDayScore(habits, checkins, bonuses, date) })
  }
  return entries
}

export function average(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0
  const sum = entries.reduce((s, e) => s + e.score.total, 0)
  return Math.round((sum / entries.length) * 10) / 10
}

/** Dias consecutivos (a partir do mais recente) com pontuação >= 100%. */
export function currentStreak(entries: DailyEntry[]): number {
  let streak = 0
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].score.total >= 100) streak++
    else break
  }
  return streak
}

export interface HabitCompletion {
  habit: Habit
  simCount: number
  naoCount: number
  /** null = ainda sem nenhuma resposta no período */
  rate: number | null
}

export function habitCompletionRates(
  habits: Habit[],
  checkins: CheckIn[],
  sinceDate: string,
): HabitCompletion[] {
  return habits
    .filter((h) => h.active)
    .map((habit) => {
      const relevant = checkins.filter((c) => c.habitId === habit.id && c.date >= sinceDate)
      const simCount = relevant.filter((c) => c.status === 'sim').length
      const naoCount = relevant.filter((c) => c.status === 'nao').length
      const total = simCount + naoCount
      return {
        habit,
        simCount,
        naoCount,
        rate: total > 0 ? Math.round((simCount / total) * 100) : null,
      }
    })
}
