import { useState } from 'react'
import { CheckInView } from './components/CheckInView'
import { HabitsView } from './components/HabitsView'

type Tab = 'hoje' | 'habitos' | 'estatisticas'

function App() {
  const [tab, setTab] = useState<Tab>('hoje')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        <header className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-white">meta100</h1>
        </header>

        {tab === 'hoje' && <CheckInView />}
        {tab === 'habitos' && <HabitsView />}
        {tab === 'estatisticas' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
            Estatísticas de evolução chegam na próxima fase.
          </div>
        )}
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
