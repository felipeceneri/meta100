import { useEffect, useState } from 'react'
import type { LeaderboardEntry } from '../types'
import { getLeaderboard, getProfile } from '../lib/store'
import { supabase } from '../lib/supabase'

export function RankingView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [myName, setMyName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.auth.getUser()
    const [leaderboard, profile] = await Promise.all([
      getLeaderboard(),
      data.user ? getProfile(data.user.id) : Promise.resolve(null),
    ])
    setEntries(leaderboard)
    setMyName(profile?.displayName ?? null)
    setLoading(false)
  }

  if (loading) return <p className="text-slate-500">Carregando...</p>

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        Ninguém pontuou ainda. Marca seus hábitos hoje pra abrir o placar.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const isMe = entry.displayName === myName
        return (
          <div
            key={entry.displayName}
            className={`flex items-center justify-between rounded-xl border p-4 ${
              isMe ? 'border-sky-500/50 bg-sky-500/10' : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 text-sm font-semibold text-slate-500">{i + 1}º</span>
              <span className="font-medium text-slate-100">
                {entry.displayName}
                {isMe && <span className="ml-2 text-xs text-sky-400">(você)</span>}
              </span>
            </div>
            <span className="text-lg font-semibold tabular-nums text-sky-400">
              {entry.totalPoints}
            </span>
          </div>
        )
      })}
    </div>
  )
}
