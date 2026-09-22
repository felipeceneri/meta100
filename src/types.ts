export type CheckInStatus = 'sim' | 'nao'

export interface Habit {
  id: string
  name: string
  active: boolean
  createdAt: string
}

export interface CheckIn {
  habitId: string
  /** YYYY-MM-DD, sempre na data local */
  date: string
  status: CheckInStatus
}

export interface BonusActivity {
  id: string
  date: string
  description: string
  createdAt: string
}

export interface DayScore {
  /** soma de +10/-10 por hábito marcado no dia */
  habitPoints: number
  /** contagem de bônus do dia × 50 */
  bonusPoints: number
  total: number
  /** pontos possíveis no dia se todo hábito ativo for marcado "sim" */
  perfectDayPoints: number
}

export interface Profile {
  id: string
  displayName: string
}

export interface LeaderboardEntry {
  displayName: string
  totalPoints: number
}
