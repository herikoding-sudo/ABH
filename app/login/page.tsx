'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { MOCK_USERS, setSession } from '@/lib/data-store'
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )

      if (user) {
        setSession({
          email: user.email,
          role: user.role,
          name: user.name,
        })
        router.push('/dashboard')
      } else {
        setError('Email atau password salah.')
        setLoading(false)
      }
    }, 1000)
  }

  const handleQuickFill = (role: 'member' | 'admin' | 'superadmin') => {
    const creds = MOCK_USERS.find((u) => u.role === role)
    if (creds) {
      setEmail(creds.email)
      setPassword(creds.password)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_60%)]" />
      
      {/* Back button */}
      <a
        href="/"
        className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Beranda
      </a>

      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col items-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Login Konten Editor</h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Masuk untuk memperbarui konten paket, jadwal keberangkatan, dan pengaturan website.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive ring-1 ring-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="email">
              Email
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-2xl bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="password">
              Password
            </label>
            <div className="relative mt-2">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-2xl bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Quick login helper buttons */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Demo Login Cepat</p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleQuickFill('member')}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition-all hover:bg-slate-200 hover:text-slate-800"
            >
              Member
            </button>
            <button
              onClick={() => handleQuickFill('admin')}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition-all hover:bg-slate-200 hover:text-slate-800"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickFill('superadmin')}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 transition-all hover:bg-slate-200 hover:text-slate-800"
            >
              Superadmin
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
