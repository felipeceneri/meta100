import type { BonusActivity, CheckIn, CheckInStatus, Habit } from '../types'

const KEYS = {
  habits: 'meta100:habits',
  checkins: 'meta100:checkins',
  bonuses: 'meta100:bonuses',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// Camada de dados local (Fase 1). A assinatura async já imita o formato que a
// integração com Supabase vai ter, pra trocar a implementação sem reescrever a UI.

export async function getHabits(): Promise<Habit[]> {
  return read<Habit[]>(KEYS.habits, [])
}

export async function saveHabit(habit: Habit): Promise<void> {
  const habits = read<Habit[]>(KEYS.habits, [])
  const idx = habits.findIndex((h) => h.id === habit.id)
  if (idx >= 0) habits[idx] = habit
  else habits.push(habit)
  write(KEYS.habits, habits)
}

export async function getCheckins(): Promise<CheckIn[]> {
  return read<CheckIn[]>(KEYS.checkins, [])
}

export async function setCheckin(
  habitId: string,
  date: string,
  status: CheckInStatus | null,
): Promise<void> {
  const checkins = read<CheckIn[]>(KEYS.checkins, [])
  const idx = checkins.findIndex((c) => c.habitId === habitId && c.date === date)
  if (status === null) {
    if (idx >= 0) checkins.splice(idx, 1)
  } else if (idx >= 0) {
    checkins[idx] = { ...checkins[idx], status }
  } else {
    checkins.push({ habitId, date, status })
  }
  write(KEYS.checkins, checkins)
}

export async function getBonusActivities(): Promise<BonusActivity[]> {
  return read<BonusActivity[]>(KEYS.bonuses, [])
}

export async function addBonusActivity(activity: BonusActivity): Promise<void> {
  const bonuses = read<BonusActivity[]>(KEYS.bonuses, [])
  bonuses.push(activity)
  write(KEYS.bonuses, bonuses)
}

export async function deleteBonusActivity(id: string): Promise<void> {
  const bonuses = read<BonusActivity[]>(KEYS.bonuses, [])
  write(
    KEYS.bonuses,
    bonuses.filter((b) => b.id !== id),
  )
}
