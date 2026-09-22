import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Login } from './components/Login'
import { CheckInView } from './components/CheckInView'
import { HabitsView } from './components/HabitsView'
import { StatsView } from './components/StatsView'

type Tab = 'hoje' | 'habitos' | 'estatisticas'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('hoje')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-500">Carregando...</p>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-white">meta100</h1>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            sair
          </button>
        </header>

        {tab === 'hoje' && <CheckInView />}
        {tab === 'habitos' && <HabitsView />}
        {tab === 'estatisticas' && <StatsView />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          <TabButton label="Hoje" active={tab === 'hoje'} onClick={() => setTab('hoje')} />
          <TabButton label="Hábitos" active={tab === 'habitos'} onClick={() => setTab('habitos')} />
          <TabButton
            label="Estatísticas"
            active={tab === 'estatisticas'}
            onClick={() => setTab('estatisticas')}
          />
        </div>
      </nav>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        active ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  )
}

export default App
