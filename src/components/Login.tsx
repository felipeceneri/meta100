import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() } },
      })
      if (error) {
        setError(error.message)
      } else if (!data.session) {
        setInfo('Conta criada! Confirma seu e-mail pra poder entrar.')
      }
    }
    setLoading(false)
  }

  function toggleMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setError(null)
    setInfo(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h1 className="mb-1 text-xl font-semibold text-white">meta100</h1>
        <p className="mb-5 text-sm text-slate-500">
          {mode === 'signin' ? 'Entre pra ver seu check-in.' : 'Crie sua conta e entra na disputa.'}
        </p>
        <div className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="apelido (aparece no ranking)"
              maxLength={30}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
          />
        </div>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        {info && <p className="mt-3 text-sm text-emerald-400">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-sky-950 hover:bg-sky-400 disabled:opacity-50"
        >
          {loading ? 'Aguarda...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </button>
        <button
          type="button"
          onClick={toggleMode}
          className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-300"
        >
          {mode === 'signin' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>
  )
}
