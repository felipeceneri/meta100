export type CheckInStatus = 'sim' | 'nao'

export interface Habit {
  id: string
  name: string
  /** Peso relativo entre os hábitos ativos. Não precisa somar 100. */
  weight: number
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
  points: number
  createdAt: string
}

export interface DayScore {
  /** -100..100, soma ponderada dos hábitos do dia */
  habitScore: number
  bonusPoints: number
  total: number
}
