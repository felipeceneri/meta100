import { supabase } from './supabase'
import type { BonusActivity, CheckIn, CheckInStatus, Habit } from '../types'

interface HabitRow {
  id: string
  name: string
  weight: number | string
  active: boolean
  created_at: string
}

interface CheckInRow {
  habit_id: string
  date: string
  status: CheckInStatus
}

interface BonusRow {
  id: string
  date: string
  description: string
  points: number | string
  created_at: string
}

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Não autenticado')
  return data.user.id
}

function rowToHabit(r: HabitRow): Habit {
  return {
    id: r.id,
    name: r.name,
    weight: Number(r.weight),
    active: r.active,
    createdAt: r.created_at,
  }
}

function rowToBonus(r: BonusRow): BonusActivity {
  return {
    id: r.id,
    date: r.date,
    description: r.description,
    points: Number(r.points),
    createdAt: r.created_at,
  }
}

export async function getHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('id, name, weight, active, created_at')
    .order('created_at')
  if (error) throw error
  return (data as HabitRow[]).map(rowToHabit)
}

export async function saveHabit(habit: Habit): Promise<void> {
  const userId = await currentUserId()
  const { error } = await supabase.from('habits').upsert({
    id: habit.id,
    user_id: userId,
    name: habit.name,
    weight: habit.weight,
    active: habit.active,
    created_at: habit.createdAt,
  })
  if (error) throw error
}

export async function getCheckins(): Promise<CheckIn[]> {
  const { data, error } = await supabase.from('checkins').select('habit_id, date, status')
  if (error) throw error
  return (data as CheckInRow[]).map((r) => ({ habitId: r.habit_id, date: r.date, status: r.status }))
}

export async function setCheckin(
  habitId: string,
  date: string,
  status: CheckInStatus | null,
): Promise<void> {
  if (status === null) {
    const { error } = await supabase
      .from('checkins')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date)
    if (error) throw error
    return
  }

  const userId = await currentUserId()
  const { error } = await supabase
    .from('checkins')
    .upsert({ habit_id: habitId, date, status, user_id: userId }, { onConflict: 'habit_id,date' })
  if (error) throw error
}

export async function getBonusActivities(): Promise<BonusActivity[]> {
  const { data, error } = await supabase
    .from('bonus_activities')
    .select('id, date, description, points, created_at')
    .order('created_at')
  if (error) throw error
  return (data as BonusRow[]).map(rowToBonus)
}

export async function addBonusActivity(activity: BonusActivity): Promise<void> {
  const userId = await currentUserId()
  const { error } = await supabase.from('bonus_activities').insert({
    id: activity.id,
    user_id: userId,
    date: activity.date,
    description: activity.description,
    points: activity.points,
    created_at: activity.createdAt,
  })
  if (error) throw error
}

export async function deleteBonusActivity(id: string): Promise<void> {
  const { error } = await supabase.from('bonus_activities').delete().eq('id', id)
  if (error) throw error
}
