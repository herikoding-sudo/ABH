'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { getUsersAsync, registerUserAsync, setSession, getSavedPackages } from '@/lib/data-store'
import { Lock, Mail, Loader2, ArrowLeft, User as UserIcon, FileImage, ShieldAlert, CheckCircle2, Package as PackageIcon, Gift } from 'lucide-react'
import { type Package } from '@/lib/data'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  
  // Login Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register Form States
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [selectedPkg, setSelectedPkg] = useState('')
  const [mockFileName, setMockFileName] = useState('Pilih struk transfer komitmen...')

  const [refSponsor, setRefSponsor] = useState('')

  const [packages, setPackages] = useState<Package[]>([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Parse URL params
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    const pkgParam = params.get('package')
    const referral = params.get('ref')
    
    if (tabParam === 'register') {
      setActiveTab('register')
    }
    if (referral) {
      setRefSponsor(referral)
      setActiveTab('register')
    }
    if (pkgParam) {
      setSelectedPkg(pkgParam)
    }

    setPackages(getSavedPackages())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const users = await getUsersAsync()
      const matched = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )

      if (matched) {
        if (matched.status === 'pending') {
          setError('Pendaftaran akun Anda masih ditangguhkan menunggu verifikasi Setoran Awal (Rp 2.500.000) oleh Admin.')
          setLoading(false)
          return
        }

        setSession({
          email: matched.email,
          role: matched.role,
          name: matched.name,
        })
        
        // Preserve redirect parameters for seamless booking
        const params = new URLSearchParams(window.location.search)
        const pkgParam = params.get('package')
        if (pkgParam) {
          router.push(`/dashboard?mode=booking&package=${encodeURIComponent(pkgParam)}`)
        } else {
          router.push('/dashboard')
        }
      } else {
        setError('Email atau password salah.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(`Terjadi kesalahan sistem: ${err?.message || err}`)
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const res = await registerUserAsync(regName, regEmail, regPassword, refSponsor)
      if (res.success) {
        setSuccessMessage(res.message)
        // Clear fields
        setRegName('')
        setRegEmail('')
        setRegPassword('')
      } else {
        setError(res.message)
      }
    } catch (err) {
      setError('Gagal memproses pendaftaran.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = async (role: 'member' | 'admin' | 'superadmin') => {
    try {
      const users = await getUsersAsync()
      const creds = users.find((u) => u.role === role)
      if (creds) {
        setEmail(creds.email)
        setPassword(creds.password || '')
        setActiveTab('login')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_60%)]" />
      
      {/* Back button */}
      <a
        href="/"
        className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 hover:text-slate-800 z-10"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Beranda
      </a>

      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col items-center">
          <Logo size="lg" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            {activeTab === 'login' ? 'Silahkan Login' : 'Registrasi Member Baru'}
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            {activeTab === 'login'
              ? 'Masuk untuk mengedit website atau memantau pohon matriks Anda.'
              : 'Daftarkan diri Anda untuk mengikuti program kemitraan matriks Umroh.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => {
              setActiveTab('login')
              setError('')
              setSuccessMessage('')
            }}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            Masuk / Login
          </button>
          <button
            onClick={() => {
              setActiveTab('register')
              setError('')
              setSuccessMessage('')
            }}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-medium text-rose-700 ring-1 ring-rose-250">
            <ShieldAlert className="size-4.5 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 ring-1 ring-emerald-250">
            <CheckCircle2 className="size-4.5 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
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
        )}

        {/* REGISTRATION FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            {refSponsor && (
              <div className="rounded-2xl bg-amber-50 p-4 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 flex items-center gap-2">
                <Gift className="size-4 shrink-0 text-amber-600 animate-pulse" />
                <span>Sponsor Kemitraan: <strong className="font-bold underline text-amber-950">{refSponsor}</strong></span>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Lengkap</label>
              <div className="relative mt-2">
                <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full rounded-2xl bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Utama</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className="w-full rounded-2xl bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
              <div className="relative mt-2">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Buat password baru"
                  className="w-full rounded-2xl bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                />
              </div>
            </div>

             {/* Registrasi langsung aktif tanpa pilih paket dan upload struk */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10854c] hover:bg-[#0c6e3e] py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/10 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftar Akun Baru'
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
