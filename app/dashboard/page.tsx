'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import {
  getSession,
  clearSession,
  getSavedPackages,
  getSavedSchedules,
  getSavedServices,
  getSavedPhone,
  MOCK_USERS,
  type User,
  fetchPackagesAsync,
  savePackagesAsync,
  fetchSchedulesAsync,
  saveSchedulesAsync,
  fetchServicesAsync,
  saveServicesAsync,
  fetchSettingsAsync,
  saveSettingsAsync,
} from '@/lib/data-store'
import {
  getMatrixState,
  fetchMatrixStateAsync,
  saveMatrixSettingsAsync,
  submitDepositRequestAsync,
  approveDepositRequestAsync,
  rejectDepositRequestAsync,
  resetMatrixSimulationAsync,
  fetchPackageBookingsAsync,
  submitPackageBookingAsync,
  approvePackageBookingAsync,
  rejectPackageBookingAsync,
  type MatrixState,
  type DepositRequest,
  type PackageBooking,
} from '@/lib/matrix-store'
import { isSupabaseConfigured } from '@/lib/supabase'
import { MatrixTree } from '@/components/matrix-tree'
import {
  Home,
  Package as PackageIcon,
  Calendar,
  Sparkles,
  Settings,
  Users,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  User as UserIcon,
  Menu,
  ChevronLeft,
  Network,
  CreditCard,
  UserPlus,
  RefreshCw,
  Gift,
  HelpCircle,
  FileText,
  FileImage,
  Eye,
  Check,
  X,
  Database,
  ShoppingBag,
  Info,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { type Package, type Schedule, type Service } from '@/lib/data'

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  // Tab states for ADMIN/SUPERADMIN
  const [adminTab, setAdminTab] = useState<'overview' | 'packages' | 'schedules' | 'services' | 'settings' | 'deposits' | 'users'>('overview')
  
  // Tab states for MEMBER (Matrix Simulation)
  const [memberTab, setMemberTab] = useState<'overview' | 'fly1' | 'fly2' | 'register' | 'history'>('overview')
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Sub-tabs
  const [bookingSubTab, setBookingSubTab] = useState<'matrix' | 'personal'>('matrix')
  const [verifySubTab, setVerifySubTab] = useState<'matrix' | 'package'>('matrix')

  // Dropdown States
  const [isDaftarDropdownOpen, setIsDaftarDropdownOpen] = useState(false)
  const [isVerifyDropdownOpen, setIsVerifyDropdownOpen] = useState(false)

  // CMS Data States (Admin only)
  const [packagesList, setPackagesList] = useState<Package[]>([])
  const [schedulesList, setSchedulesList] = useState<Schedule[]>([])
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [phone, setPhone] = useState('')

  // Member Matrix Simulation States
  const [matrixState, setMatrixState] = useState<MatrixState | null>(null)
  const [newRecruitName, setNewRecruitName] = useState('')
  const [newRecruitEmail, setNewRecruitEmail] = useState('')
  const [mockFileName, setMockFileName] = useState('Pilih bukti transfer (struk)...')

  // Personal Package Booking Form States
  const [bookPassengerName, setBookPassengerName] = useState('')
  const [bookPassengerPhone, setBookPassengerPhone] = useState('')
  const [bookSelectedPkg, setBookSelectedPkg] = useState('')
  const [bookSelectedSch, setBookSelectedSch] = useState('')
  const [bookFileName, setBookFileName] = useState('Pilih bukti transfer (struk)...')
  const [packageBookings, setPackageBookings] = useState<PackageBooking[]>([])

  // Matrix Settings State (Superadmin editable)
  const [depositAmount, setDepositAmount] = useState(2500000)
  const [sponsorReward, setSponsorReward] = useState(250000)
  const [fly1Reward, setFly1Reward] = useState(3500000)
  const [fly2Reward, setFly2Reward] = useState(30000000)

  // Form indices
  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(0)
  const [selectedSchIndex, setSelectedSchIndex] = useState<number>(0)
  const [selectedSvcIndex, setSelectedSvcIndex] = useState<number>(0)

  // Notification State
  const [toastMessage, setToastMessage] = useState('')

  // Split Modal Success Notification
  const [splitModalData, setSplitModalData] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' })

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const loadData = () => {
    const session = getSession()
    if (!session) {
      router.push('/login')
      return
    }
    
    // Auto-collapse sidebar on mobile screen size
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
    
    setCurrentUser(session)
    setBookPassengerName(session.name)

    // Parse URL params for preselection
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get('mode')
    const pkgParam = params.get('package')
    
    if (modeParam === 'booking') {
      setMemberTab('register')
      setBookingSubTab('personal')
      setIsDaftarDropdownOpen(true)
    }
    if (pkgParam) {
      setBookSelectedPkg(pkgParam)
    }

    // 1. Load client-side caches instantly (synchronous)
    const mState = getMatrixState()
    setMatrixState(mState)
    setDepositAmount(mState.settings.depositAmount)
    setSponsorReward(mState.settings.sponsorReward)
    setFly1Reward(mState.settings.fly1Reward)
    setFly2Reward(mState.settings.fly2Reward)

    setPackagesList(getSavedPackages())
    setSchedulesList(getSavedSchedules())
    setServicesList(getSavedServices())
    setPhone(getSavedPhone())

    // Load package bookings
    if (session.role === 'member') {
      setPackageBookings(fetchPackageBookingsAsync(session.email) as any || [])
    } else {
      setPackageBookings(fetchPackageBookingsAsync() as any || [])
    }

    // 2. Fetch fresh data from Supabase asynchronously (SWR Revalidation)
    fetchMatrixStateAsync().then((freshState) => {
      setMatrixState(freshState)
      setDepositAmount(freshState.settings.depositAmount)
      setSponsorReward(freshState.settings.sponsorReward)
      setFly1Reward(freshState.settings.fly1Reward)
      setFly2Reward(freshState.settings.fly2Reward)
    })

    fetchPackagesAsync().then((list) => setPackagesList(list))
    fetchSchedulesAsync().then((list) => setSchedulesList(list))
    fetchServicesAsync().then((list) => setServicesList(list))
    fetchSettingsAsync().then((settings) => setPhone(settings.phone))

    // Revalidate package bookings
    if (session.role === 'member') {
      fetchPackageBookingsAsync(session.email).then((list) => setPackageBookings(list))
    } else {
      fetchPackageBookingsAsync().then((list) => setPackageBookings(list))
    }
  }

  useEffect(() => {
    loadData()

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [router])

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  const isEditable = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  // Admin Save Operations (Async Supabase)
  const handleSavePackages = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditable) return
    const res = await savePackagesAsync(packagesList)
    if (res) showToast('Konten Paket Umroh berhasil diperbarui!')
  }

  const handleSaveSchedules = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditable) return
    const res = await saveSchedulesAsync(schedulesList)
    if (res) showToast('Jadwal Keberangkatan berhasil diperbarui!')
  }

  const handleSaveServices = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditable) return
    const res = await saveServicesAsync(servicesList)
    if (res) showToast('Layanan Banner berhasil diperbarui!')
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditable) return

    const resPhone = await saveSettingsAsync(phone)

    if (currentUser?.role === 'superadmin') {
      await saveMatrixSettingsAsync({
        depositAmount,
        sponsorReward,
        fly1Reward,
        fly2Reward,
      })
    }

    if (resPhone) {
      showToast('Seluruh Pengaturan Situs berhasil diperbarui!')
      loadData() // Reload states from database
    }
  }

  // Member Downline Deposit Request Submission (Async Supabase)
  const handleRegisterRecruit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !newRecruitName || !newRecruitEmail) return

    const res = await submitDepositRequestAsync(newRecruitName, newRecruitEmail, currentUser.email, '/images/proof-mock.png')
    if (res) {
      setNewRecruitName('')
      setNewRecruitEmail('')
      setMockFileName('Pilih bukti transfer (struk)...')
      const freshState = await fetchMatrixStateAsync()
      setMatrixState(freshState)
      showToast('Pengajuan berhasil! Menunggu verifikasi Bukti Transfer oleh Admin.')
    }
  }

  // Member Personal Package Booking Submission (Async Supabase)
  const handleBookPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !bookSelectedPkg || !bookSelectedSch || !bookPassengerName || !bookPassengerPhone) return

    // Find price of chosen package
    const matched = packagesList.find((p) => p.name === bookSelectedPkg)
    const priceStr = matched ? matched.price : '35 Juta'
    const priceNumber = parseFloat(priceStr.replace(/[^0-9.]/g, '')) * 1000000 || 35000000

    const res = await submitPackageBookingAsync(
      bookSelectedPkg,
      bookSelectedSch,
      bookPassengerName,
      bookPassengerPhone,
      priceNumber,
      '/images/proof-mock.png',
      currentUser.email
    )

    if (res) {
      setBookPassengerPhone('')
      setBookFileName('Pilih bukti transfer (struk)...')
      showToast('Pesanan Paket Berhasil Diajukan! Menunggu persetujuan Admin.')
      
      // Reload bookings
      const list = await fetchPackageBookingsAsync(currentUser.email)
      setPackageBookings(list)
    }
  }

  // Admin approve/reject request (Async Supabase)
  const handleApproveRequest = async (requestId: string) => {
    const res = await approveDepositRequestAsync(requestId)
    const freshState = await fetchMatrixStateAsync()
    setMatrixState(freshState)
    if (res.success) {
      if (res.splitOccurred) {
        setSplitModalData({ isOpen: true, message: res.message })
      } else {
        showToast(res.message)
      }
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const res = await rejectDepositRequestAsync(requestId)
    const freshState = await fetchMatrixStateAsync()
    setMatrixState(freshState)
    if (res.success) {
      showToast(res.message)
    }
  }

  // Admin approve/reject package booking (Async Supabase)
  const handleApproveBooking = async (bookingId: string) => {
    const res = await approvePackageBookingAsync(bookingId)
    if (res.success) {
      showToast(res.message)
      const list = await fetchPackageBookingsAsync(currentUser?.role === 'member' ? currentUser?.email : undefined)
      setPackageBookings(list)
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    const res = await rejectPackageBookingAsync(bookingId)
    if (res.success) {
      showToast(res.message)
      const list = await fetchPackageBookingsAsync(currentUser?.role === 'member' ? currentUser?.email : undefined)
      setPackageBookings(list)
    }
  }

  // Reset Simulation helper (Async Supabase)
  const handleResetSimulation = async () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data simulasi matriks kemitraan Anda?')) {
      await resetMatrixSimulationAsync()
      loadData()
      showToast('Data simulasi matriks berhasil direset!')
    }
  }

  // Helper updates
  const updatePackageField = (index: number, field: keyof Package, value: any) => {
    const updated = [...packagesList]
    updated[index] = { ...updated[index], [field]: value }
    setPackagesList(updated)
  }

  const updateScheduleField = (index: number, field: keyof Schedule, value: any) => {
    const updated = [...schedulesList]
    updated[index] = { ...updated[index], [field]: value }
    setSchedulesList(updated)
  }

  const updateServiceField = (index: number, field: keyof Service, value: any) => {
    const updated = [...servicesList]
    updated[index] = { ...updated[index], [field]: value }
    setServicesList(updated)
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        Loading Session...
      </div>
    )
  }

  const isMember = currentUser.role === 'member'

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-bounce">
          <CheckCircle2 className="size-5" />
          {toastMessage}
        </div>
      )}

      {/* Split Modal Notification */}
      {splitModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Gift className="size-8" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">Selamat! Belah Semangka Aktif!</h3>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">{splitModalData.message}</p>
            <button
              onClick={() => setSplitModalData({ isOpen: false, message: '' })}
              className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* Mock Bank Receipt Viewer Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-850 flex items-center gap-2">
                <FileImage className="size-4.5 text-primary" /> Struk Bukti Transfer
              </h4>
              <button
                onClick={() => {
                  setShowReceiptModal(false)
                  setSelectedReceipt(null)
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-5 border border-slate-200 text-left space-y-3 font-mono text-[11px] text-slate-600 shadow-inner">
              <div className="text-center font-bold text-slate-800 text-xs border-b border-dashed border-slate-300 pb-2">STRUK TRANSFER M-BANKING</div>
              <div className="flex justify-between"><span>TANGGAL:</span> <span className="font-semibold">{selectedReceipt.date}</span></div>
              <div className="flex justify-between"><span>PENGIRIM:</span> <span className="font-semibold truncate max-w-[160px]">{selectedReceipt.sponsorEmail || selectedReceipt.memberEmail}</span></div>
              <div className="flex justify-between"><span>PENERIMA:</span> <span className="font-bold text-slate-700">ABH UMROH (BSI)</span></div>
              <div className="flex justify-between"><span>BERITA/MITRA:</span> <span className="font-semibold text-slate-700">{selectedReceipt.recruitName || selectedReceipt.passengerName}</span></div>
              <div className="flex justify-between"><span>JUMLAH:</span> <span className="font-extrabold text-emerald-600 text-xs">Rp {selectedReceipt.amount.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>STATUS:</span> <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[9px]">TRANSFER BERHASIL</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-slate-200 bg-white p-6 shadow-md transition-all duration-300 md:static ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 md:p-0 overflow-hidden'
        }`}
      >
        <div className="space-y-8 min-w-[208px]">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
              aria-label="Tutup sidebar"
            >
              <ChevronLeft className="size-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {isMember ? (
              // MEMBER SIDEBAR NAVIGATION
              <>
                <a
                  href="/"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 bg-slate-50/50 mb-2 transition-all"
                >
                  <Globe className="size-4.5 text-primary animate-pulse" />
                  Lihat Website Utama
                </a>

                <button
                  onClick={() => {
                    setMemberTab('overview')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    memberTab === 'overview'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Home className="size-4.5" />
                  Ikhtisar Matriks
                </button>

                <button
                  onClick={() => {
                    setMemberTab('fly1')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    memberTab === 'fly1'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Network className="size-4.5" />
                  Papan Fly I
                </button>

                <button
                  onClick={() => {
                    setMemberTab('fly2')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    memberTab === 'fly2'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Network className="size-4.5" />
                  Papan Fly II
                </button>

                {/* Dropdown Pendaftaran & Booking */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsDaftarDropdownOpen(!isDaftarDropdownOpen)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      memberTab === 'register'
                        ? 'bg-primary/5 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="size-4.5" />
                      Pendaftaran &amp; Booking
                    </div>
                    {isDaftarDropdownOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isDaftarDropdownOpen && (
                    <div className="pl-6 space-y-1 border-l border-slate-200 ml-6 animate-in slide-in-from-top-1 duration-150">
                      <button
                        onClick={() => {
                          setMemberTab('register')
                          setBookingSubTab('matrix')
                          if (window.innerWidth < 768) setIsSidebarOpen(false)
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all text-left ${
                          memberTab === 'register' && bookingSubTab === 'matrix'
                            ? 'text-primary bg-primary/5 font-bold font-semibold'
                            : 'text-slate-550 hover:text-slate-800'
                        }`}
                      >
                        Pendaftaran Mitra
                      </button>
                      <button
                        onClick={() => {
                          setMemberTab('register')
                          setBookingSubTab('personal')
                          if (window.innerWidth < 768) setIsSidebarOpen(false)
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all text-left ${
                          memberTab === 'register' && bookingSubTab === 'personal'
                            ? 'text-primary bg-primary/5 font-bold font-semibold'
                            : 'text-slate-550 hover:text-slate-800'
                        }`}
                      >
                        Booking Paket Pribadi
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setMemberTab('history')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    memberTab === 'history'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="size-4.5" />
                  Komisi (Ujroh)
                </button>
              </>
            ) : (
              // ADMIN SIDEBAR NAVIGATION
              <>
                <button
                  onClick={() => {
                    setAdminTab('overview')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    adminTab === 'overview'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Home className="size-4.5" />
                  Ringkasan
                </button>

                <button
                  onClick={() => {
                    setAdminTab('packages')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    adminTab === 'packages'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <PackageIcon className="size-4.5" />
                  Paket Umroh
                </button>

                <button
                  onClick={() => {
                    setAdminTab('schedules')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    adminTab === 'schedules'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="size-4.5" />
                  Jadwal Umroh
                </button>

                <button
                  onClick={() => {
                    setAdminTab('services')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    adminTab === 'services'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="size-4.5" />
                  Layanan Slide
                </button>

                {/* Dropdown Verifikasi Setoran */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsVerifyDropdownOpen(!isVerifyDropdownOpen)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all relative ${
                      adminTab === 'deposits'
                        ? 'bg-primary/5 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-4.5" />
                      Verifikasi Setoran
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(matrixState && matrixState.depositRequests.filter((r) => r.status === 'pending').length > 0 ||
                        packageBookings.filter((b) => b.status === 'pending').length > 0) && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white mr-1">
                          {matrixState!.depositRequests.filter((r) => r.status === 'pending').length + packageBookings.filter((b) => b.status === 'pending').length}
                        </span>
                      )}
                      {isVerifyDropdownOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                  </button>

                  {isVerifyDropdownOpen && (
                    <div className="pl-6 space-y-1 border-l border-slate-200 ml-6 animate-in slide-in-from-top-1 duration-150">
                      <button
                        onClick={() => {
                          setAdminTab('deposits')
                          setVerifySubTab('matrix')
                          if (window.innerWidth < 768) setIsSidebarOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs font-semibold transition-all text-left ${
                          adminTab === 'deposits' && verifySubTab === 'matrix'
                            ? 'text-primary bg-primary/5 font-bold font-semibold'
                            : 'text-slate-550 hover:text-slate-800'
                        }`}
                      >
                        Setoran Kemitraan
                        {matrixState && matrixState.depositRequests.filter((r) => r.status === 'pending').length > 0 && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                            {matrixState.depositRequests.filter((r) => r.status === 'pending').length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setAdminTab('deposits')
                          setVerifySubTab('package')
                          if (window.innerWidth < 768) setIsSidebarOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs font-semibold transition-all text-left ${
                          adminTab === 'deposits' && verifySubTab === 'package'
                            ? 'text-primary bg-primary/5 font-bold font-semibold'
                            : 'text-slate-550 hover:text-slate-800'
                        }`}
                      >
                        Pemesanan Paket
                        {packageBookings.filter((b) => b.status === 'pending').length > 0 && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                            {packageBookings.filter((b) => b.status === 'pending').length}
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setAdminTab('settings')
                    if (window.innerWidth < 768) setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    adminTab === 'settings'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings className="size-4.5" />
                  Pengaturan Situs
                </button>

                {currentUser.role === 'superadmin' && (
                  <button
                    onClick={() => {
                      setAdminTab('users')
                      if (window.innerWidth < 768) setIsSidebarOpen(false)
                    }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      adminTab === 'users'
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Users className="size-4.5" />
                    Manajemen User
                  </button>
                )}
              </>
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-rose-200 bg-rose-50/30 min-w-[208px]"
        >
          <LogOut className="size-4.5" />
          Log Out
        </button>
      </aside>

      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm md:hidden animate-in fade-in duration-250"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
              aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
            >
              <Menu className="size-5.5" />
            </button>
            <h2 className="text-md font-bold text-slate-800 capitalize hidden sm:block">
              Peran: {currentUser.role} {isMember ? `- Tab: ${memberTab}` : `- Tab: ${adminTab}`}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Supabase connection indicator */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <Database className="size-3.5" />
              {isSupabaseConfigured ? 'Database Supabase Aktif' : 'Simulasi Local Storage'}
            </span>

            {/* User Profile Info */}
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">{currentUser.email}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  currentUser.role === 'superadmin'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : currentUser.role === 'admin'
                    ? 'bg-sky-100 text-sky-700 border border-sky-200'
                    : 'bg-slate-100 text-slate-650 border border-slate-200'
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center rounded-lg bg-rose-50 p-2 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 transition-all"
              aria-label="Logout"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl w-full mx-auto">
          {isMember ? (
            /* =========================================================================
               MEMBER MATRIX SYSTEM & BOOKINGS VIEWS
               ========================================================================= */
            matrixState && (
              <div className="space-y-6">
                
                {/* MEMBER TAB 1: OVERVIEW */}
                {memberTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900">Simulasi Matriks Umroh ("Belah Semangka")</h1>
                        <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-2xl">
                          Sistem kemitraan matriks berjenjang untuk mendanai Umroh Anda. Penuhi setoran awal Rp {matrixState.settings.depositAmount.toLocaleString('id-ID')} dan dapatkan komisi sponsor serta bonus Fly I &amp; II.
                        </p>
                      </div>
                      <button
                        onClick={handleResetSimulation}
                        className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 px-4 py-2.5 text-xs font-bold transition-all shadow-sm shrink-0"
                      >
                        <RefreshCw className="size-3.5" />
                        Reset Simulasi
                      </button>
                    </div>

                    {/* Stats widgets */}
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Saldo Ujroh</h3>
                        <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                          Rp {matrixState.balance.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Kemitraan Aktif</h3>
                        <p className="mt-2 text-3xl font-extrabold text-slate-900">
                          {matrixState.fly1Board.filter((n) => n !== null && !n.isUser).length + (matrixState.hasCompletedFly1 ? 12 : 0)} Orang
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Matriks Aktif</h3>
                        <p className="mt-2 text-3xl font-extrabold text-primary">
                          {matrixState.hasCompletedFly1 ? 'Fly II (Utama)' : 'Fly I (Dasar)'}
                        </p>
                      </div>
                    </div>

                    {/* Booking Status Card */}
                    {packageBookings.length > 0 && (
                      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-slate-850 font-bold flex items-center gap-2">
                          <ShoppingBag className="size-5 text-primary" /> Pesanan Paket Umroh Saya
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-left text-xs text-slate-650">
                            <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                              <tr>
                                <th className="px-4 py-2.5">Tanggal</th>
                                <th className="px-4 py-2.5">Nama Jamaah</th>
                                <th className="px-4 py-2.5">Paket Umroh</th>
                                <th className="px-4 py-2.5">Jadwal</th>
                                <th className="px-4 py-2.5 text-right">Harga</th>
                                <th className="px-4 py-2.5 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {packageBookings.map((b) => (
                                <tr key={b.id}>
                                  <td className="px-4 py-3">{b.date}</td>
                                  <td className="px-4 py-3 font-semibold text-slate-800">{b.passengerName}</td>
                                  <td className="px-4 py-3 text-slate-500">{b.packageName}</td>
                                  <td className="px-4 py-3">{b.scheduleDate}</td>
                                  <td className="px-4 py-3 text-right font-bold text-slate-700">Rp {b.amount.toLocaleString('id-ID')}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                        b.status === 'approved'
                                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-250'
                                          : b.status === 'rejected'
                                          ? 'bg-rose-100 text-rose-700 border border-rose-250'
                                          : 'bg-amber-100 text-amber-700 border border-amber-250 animate-pulse'
                                      }`}
                                    >
                                      {b.status === 'approved'
                                        ? 'Terkonfirmasi'
                                        : b.status === 'rejected'
                                        ? 'Ditolak'
                                        : 'Menunggu Review'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Matrix Parameter descriptions */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-slate-850 font-bold flex items-center gap-2">
                          <HelpCircle className="size-5 text-primary" /> Aturan Komitmen & Kemitraan
                        </h3>
                        <dl className="space-y-2.5 text-sm">
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <dt className="text-slate-500 font-medium">Setoran Awal Registrasi</dt>
                            <dd className="font-bold text-slate-800">Rp {matrixState.settings.depositAmount.toLocaleString('id-ID')}</dd>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <dt className="text-slate-500 font-medium">Ujroh Sponsor (Referral)</dt>
                            <dd className="font-bold text-emerald-600">Rp {matrixState.settings.sponsorReward.toLocaleString('id-ID')}</dd>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <dt className="text-slate-500 font-medium">Kemitraan Wajib Aktivasi</dt>
                            <dd className="font-bold text-slate-850">2 Orang</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-slate-850 font-bold flex items-center gap-2">
                          <Gift className="size-5 text-primary" /> Target Eskalasi & Payout
                        </h3>
                        <dl className="space-y-2.5 text-sm">
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <dt className="text-slate-500 font-medium">Payout Fly I (Pecah 7 Node)</dt>
                            <dd className="font-bold text-emerald-600">Rp {matrixState.settings.fly1Reward.toLocaleString('id-ID')}</dd>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <dt className="text-slate-500 font-medium">Payout Fly II (Pecah 15 Node)</dt>
                            <dd className="font-bold text-emerald-600">Rp {matrixState.settings.fly2Reward.toLocaleString('id-ID')}</dd>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <dt className="text-slate-500 font-medium">Mekanika Pembelahan</dt>
                            <dd className="font-bold text-slate-850">Skema Belah Semangka</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                )}

                {/* MEMBER TAB 2: FLY 1 BOARD */}
                {memberTab === 'fly1' && (
                  <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Papan Matriks Kemitraan: Fly I</h3>
                        <p className="text-sm text-slate-500 mt-1">Papan 3 Tingkat (Total 7 Titik). Puncak papan adalah penerima dana.</p>
                      </div>
                      <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase">
                        {matrixState.hasCompletedFly1 ? 'SELESAI (Pecah)' : 'AKTIF'}
                      </span>
                    </div>

                    <MatrixTree nodes={matrixState.fly1Board} type="fly1" />

                    {!matrixState.hasCompletedFly1 && (
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-center text-sm text-slate-500">
                        Papan membutuhkan <strong>{matrixState.fly1Board.filter((n) => n === null).length} kemitraan dasar baru</strong> untuk terisi penuh dan memicu pembelahan **"Belah Semangka"**.
                      </div>
                    )}
                  </div>
                )}

                {/* MEMBER TAB 3: FLY 2 BOARD */}
                {memberTab === 'fly2' && (
                  <div className="relative">
                    {!matrixState.hasCompletedFly1 && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-slate-100/80 p-6 text-center backdrop-blur-[2px] border border-slate-200">
                        <Lock className="size-12 text-slate-400" />
                        <h3 className="mt-4 text-lg font-bold text-slate-855">Matriks Fly II Terkunci</h3>
                        <p className="mt-1 text-sm text-slate-500 max-w-sm">
                          Selesaikan dan penuhi Papan Fly I terlebih dahulu untuk naik tingkat dan membuka Matriks Fly II.
                        </p>
                      </div>
                    )}

                    <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Papan Matriks Kemitraan: Fly II</h3>
                          <p className="text-sm text-slate-500 mt-1">Papan Utama 4 Tingkat (Total 15 Titik) dengan payout Rp {matrixState.settings.fly2Reward.toLocaleString('id-ID')}.</p>
                        </div>
                        <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase">
                          {matrixState.hasCompletedFly2 ? 'SELESAI' : 'AKTIF'}
                        </span>
                      </div>

                      <MatrixTree nodes={matrixState.fly2Board} type="fly2" />

                      {matrixState.hasCompletedFly1 && !matrixState.hasCompletedFly2 && (
                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-center text-sm text-slate-500">
                          Papan membutuhkan <strong>{matrixState.fly2Board.filter((n) => n === null).length} kemitraan dasar baru</strong> untuk terisi penuh.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MEMBER TAB 4: REGISTER DOWNLINE OR ORDER PACKAGE FOR SELF */}
                {memberTab === 'register' && (
                  <div className="space-y-6">
                    {/* Matriks Kemitraan or Booking Paket Pribadi (switched via sidebar dropdown) */}

                    {/* DOWNLINE REGISTRATION SUBTAB */}
                    {bookingSubTab === 'matrix' && (
                      <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Registrasi Kemitraan Baru</h3>
                          <p className="text-sm text-slate-500 mt-2">Daftarkan mitra/downline baru di bawah sponsor Anda. Unggah Bukti Transfer setoran komitmen untuk diajukan ke Admin.</p>
                        </div>

                        <form onSubmit={handleRegisterRecruit} className="space-y-4 max-w-xl">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Lengkap Mitra</label>
                              <input
                                type="text"
                                required
                                value={newRecruitName}
                                onChange={(e) => setNewRecruitName(e.target.value)}
                                placeholder="Contoh: Rian Hidayat"
                                className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Alamat Email Mitra</label>
                              <input
                                type="email"
                                required
                                value={newRecruitEmail}
                                onChange={(e) => setNewRecruitEmail(e.target.value)}
                                placeholder="Contoh: rian@email.com"
                                className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Setoran Komitmen Awal</label>
                              <input
                                type="text"
                                disabled
                                value={`Rp ${matrixState.settings.depositAmount.toLocaleString('id-ID')}`}
                                className="mt-2 w-full rounded-xl bg-slate-100 py-3 px-4 text-sm text-slate-500 ring-1 ring-slate-200"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bukti Transfer (Struk Bank)</label>
                              <div className="relative mt-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setMockFileName(e.target.files[0].name)
                                    }
                                  }}
                                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                                />
                                <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-655 ring-1 ring-slate-200 focus:bg-white">
                                  <FileImage className="size-4 shrink-0 text-slate-400" />
                                  <span className="truncate">{mockFileName}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#10854c] hover:bg-[#0c6e3e] text-white px-5 py-3.5 text-sm font-semibold transition-all mt-4 w-full sm:w-auto animate-pulse"
                          >
                            <UserPlus className="size-4.5" />
                            Ajukan Registrasi Kemitraan
                          </button>
                        </form>
                      </div>
                    )}

                    {/* PERSONAL PACKAGE BOOKING SUBTAB */}
                    {bookingSubTab === 'personal' && (
                      <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Booking Paket Umroh Anda</h3>
                          <p className="text-sm text-slate-500 mt-2">Pesan keberangkatan Umroh reguler/VIP secara resmi untuk Anda atau keluarga. Lengkapi data dan struk pembayaran awal (DP).</p>
                        </div>

                        <form onSubmit={handleBookPackage} className="space-y-4 max-w-xl">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Lengkap Jamaah</label>
                              <input
                                type="text"
                                required
                                value={bookPassengerName}
                                onChange={(e) => setBookPassengerName(e.target.value)}
                                placeholder="Nama sesuai paspor"
                                className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Telepon Kontak</label>
                              <input
                                type="text"
                                required
                                value={bookPassengerPhone}
                                onChange={(e) => setBookPassengerPhone(e.target.value)}
                                placeholder="Contoh: 0812-xxxx-xxxx"
                                className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Paket Umroh</label>
                              <select
                                value={bookSelectedPkg}
                                onChange={(e) => setBookSelectedPkg(e.target.value)}
                                required
                                className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white"
                              >
                                <option value="">-- Pilih Paket --</option>
                                {packagesList.map((pkg) => (
                                  <option key={pkg.name} value={pkg.name}>
                                    {pkg.name} ({pkg.price})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Jadwal Keberangkatan</label>
                              <select
                                value={bookSelectedSch}
                                onChange={(e) => setBookSelectedSch(e.target.value)}
                                required
                                className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white"
                              >
                                <option value="">-- Pilih Jadwal --</option>
                                {schedulesList.map((s, idx) => (
                                  <option key={idx} value={s.date}>
                                    {s.date} - {s.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bukti Transfer (Struk Bank)</label>
                            <div className="relative mt-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setBookFileName(e.target.files[0].name)
                                  }
                                }}
                                required
                                className="absolute inset-0 size-full cursor-pointer opacity-0"
                              />
                              <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-655 ring-1 ring-slate-200 focus:bg-white">
                                <FileImage className="size-4 shrink-0 text-slate-400" />
                                <span className="truncate">{bookFileName}</span>
                              </div>
                            </div>
                            <p className="mt-1.5 text-[10px] text-slate-550 flex items-center gap-1">
                              <Info className="size-3 text-primary" /> Transfer ke rekening resmi Bank Syariah Indonesia (BSI) BSM: 123-456-7890.
                            </p>
                          </div>

                          <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-3.5 text-sm font-semibold transition-all mt-4 w-full sm:w-auto"
                          >
                            <ShoppingBag className="size-4.5" />
                            Kirim Pemesanan Paket
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Active Requests List */}
                    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-850 border-b border-slate-100 pb-2">
                        {bookingSubTab === 'matrix' ? 'Status Pengajuan Kemitraan' : 'Daftar Pemesanan Paket Pribadi Saya'}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            {bookingSubTab === 'matrix' ? (
                              <tr>
                                <th className="px-4 py-2.5">Tanggal</th>
                                <th className="px-4 py-2.5">Mitra Baru</th>
                                <th className="px-4 py-2.5">Email</th>
                                <th className="px-4 py-2.5">Setoran</th>
                                <th className="px-4 py-2.5">Status Verifikasi</th>
                              </tr>
                            ) : (
                              <tr>
                                <th className="px-4 py-2.5">Tanggal</th>
                                <th className="px-4 py-2.5">Nama Jamaah</th>
                                <th className="px-4 py-2.5">Paket</th>
                                <th className="px-4 py-2.5">Jadwal Keberangkatan</th>
                                <th className="px-4 py-2.5">Nominal</th>
                                <th className="px-4 py-2.5 text-center">Status Pemesanan</th>
                              </tr>
                            )}
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {bookingSubTab === 'matrix' ? (
                              matrixState.depositRequests.filter((r) => r.sponsorEmail === currentUser.email).length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-6 text-slate-400">Belum ada pengajuan kemitraan.</td>
                                </tr>
                              ) : (
                                matrixState.depositRequests
                                  .filter((r) => r.sponsorEmail === currentUser.email)
                                  .map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-4 py-3">{req.date}</td>
                                      <td className="px-4 py-3 font-semibold text-slate-800">{req.recruitName}</td>
                                      <td className="px-4 py-3 text-slate-400">{req.recruitEmail}</td>
                                      <td className="px-4 py-3 font-bold text-slate-700">Rp {req.amount.toLocaleString('id-ID')}</td>
                                      <td className="px-4 py-3">
                                        <span
                                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                            req.status === 'approved'
                                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-250'
                                              : req.status === 'rejected'
                                              ? 'bg-rose-100 text-rose-700 border border-rose-250'
                                              : 'bg-amber-100 text-amber-700 border border-amber-250 animate-pulse'
                                          }`}
                                        >
                                          {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                              )
                            ) : (
                              packageBookings.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="text-center py-6 text-slate-400">Belum ada pemesanan paket umroh.</td>
                                </tr>
                              ) : (
                                packageBookings.map((b) => (
                                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">{b.date}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">{b.passengerName}</td>
                                    <td className="px-4 py-3 text-slate-500 font-medium">{b.packageName}</td>
                                    <td className="px-4 py-3">{b.scheduleDate}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">Rp {b.amount.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-3 text-center">
                                      <span
                                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                          b.status === 'approved'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-250'
                                            : b.status === 'rejected'
                                            ? 'bg-rose-100 text-rose-700 border border-rose-250'
                                            : 'bg-amber-100 text-amber-700 border border-amber-250 animate-pulse'
                                        }`}
                                      >
                                        {b.status === 'approved' ? 'Terkonfirmasi' : b.status === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* MEMBER TAB 5: TRANSACTION LEDGER */}
                {memberTab === 'history' && (
                  <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Riwayat Mutasi Saldo Ujroh</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Tanggal</th>
                            <th className="px-4 py-3">Tipe</th>
                            <th className="px-4 py-3">Deskripsi Transaksi</th>
                            <th className="px-4 py-3 text-right">Jumlah (Ujroh)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {matrixState.transactions.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-slate-400">Belum ada mutasi transaksi.</td>
                            </tr>
                          ) : (
                            matrixState.transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-4">{tx.date}</td>
                                <td className="px-4 py-4">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      tx.type === 'sponsor'
                                        ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                        : tx.type === 'fly1' || tx.type === 'fly2'
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-650 border border-slate-200'
                                    }`}
                                  >
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-slate-800 font-semibold">{tx.description}</td>
                                <td
                                  className={`px-4 py-4 text-right font-extrabold ${
                                    tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {tx.amount > 0 ? '+' : ''}
                                  Rp {tx.amount.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )
          ) : (
            /* =========================================================================
               ADMIN & SUPERADMIN CMS & VERIFICATION VIEWS
               ========================================================================= */
            <div className="space-y-6">
              
              {/* ADMIN TAB 1: OVERVIEW */}
              {adminTab === 'overview' && (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">Selamat Datang, {currentUser.name}!</h1>
                    <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                      Di dashboard CMS Amanah Berkah Haromain ini, Anda dapat memperbarui seluruh paket, jadwal, layanan banner, verifikasi transfer deposit kemitraan, dan setelan kontak.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Paket</h3>
                      <p className="mt-2 text-3xl font-extrabold text-slate-900">{packagesList.length} Paket</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Jadwal Aktif</h3>
                      <p className="mt-2 text-3xl font-extrabold text-slate-900">{schedulesList.length} Keberangkatan</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Nomor WA</h3>
                      <p className="mt-2 text-3xl font-extrabold text-emerald-600">{phone}</p>
                    </div>
                  </div>

                  {/* Quick instructions */}
                  <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-slate-800 font-bold">Langkah Cepat Update Konten:</h3>
                    <ul className="mt-3 space-y-2.5 text-sm text-slate-500 list-disc list-inside">
                      <li>Pilih menu editor (Paket Umroh, Jadwal Umroh, dll.) di sidebar.</li>
                      <li>Ubah detail harga, maskapai penerbangan, nama hotel Madinah / Makkah.</li>
                      <li>Periksa menu **"Verifikasi Setoran"** untuk memvalidasi bukti struk pembayaran pendaftaran mitra baru dari member.</li>
                      <li>Klik tombol <strong>"Simpan Perubahan"</strong> di bagian bawah form.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 2: PACKAGES EDITOR */}
              {adminTab === 'packages' && packagesList.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {packagesList.map((pkg, idx) => (
                      <button
                        key={pkg.name}
                        onClick={() => setSelectedPkgIndex(idx)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all border ${
                          selectedPkgIndex === idx
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-655 border-slate-200 hover:text-slate-955 hover:bg-slate-50'
                        }`}
                      >
                        {pkg.name}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSavePackages} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Ubah Konten: {packagesList[selectedPkgIndex].name}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Harga Paket</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].price}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'price', e.target.value)}
                          placeholder="Contoh: 28,5 Juta"
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Durasi Perjalanan</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].days}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'days', e.target.value)}
                          placeholder="Contoh: 9 Hari"
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Maskapai Penerbangan (Flight)</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].flight}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'flight', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hotel Madinah</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].madinahHotel}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'madinahHotel', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hotel Makkah</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].makkahHotel}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'makkahHotel', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {isEditable && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all mt-4"
                      >
                        <Save className="size-4" />
                        Simpan Perubahan Paket
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* ADMIN TAB 3: SCHEDULES EDITOR */}
              {adminTab === 'schedules' && schedulesList.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {schedulesList.map((sch, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSchIndex(idx)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all border ${
                          selectedSchIndex === idx
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-655 border-slate-200 hover:text-slate-955 hover:bg-slate-50'
                        }`}
                      >
                        {sch.date} - {sch.name}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSaveSchedules} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Ubah Konten Keberangkatan: {schedulesList[selectedSchIndex].date}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal Keberangkatan</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].date}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'date', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Paket</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].name}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'name', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Harga Seat</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].price}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'price', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Seat</label>
                        <select
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].status}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'status', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        >
                          <option value="open">Tersedia (Open)</option>
                          <option value="full">Penuh (Full Booked)</option>
                        </select>
                      </div>
                    </div>

                    {isEditable && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all mt-4"
                      >
                        <Save className="size-4" />
                        Simpan Perubahan Jadwal
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* ADMIN TAB 4: SERVICES EDITOR */}
              {adminTab === 'services' && servicesList.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {servicesList.map((svc, idx) => (
                      <button
                        key={svc.title}
                        onClick={() => setSelectedSvcIndex(idx)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all border ${
                          selectedSvcIndex === idx
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-655 border-slate-200 hover:text-slate-955 hover:bg-slate-50'
                        }`}
                      >
                        {svc.title}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSaveServices} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Ubah Konten Layanan Banner: {servicesList[selectedSvcIndex].title}
                    </h3>

                    <div className="grid gap-6">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Judul Layanan</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={servicesList[selectedSvcIndex].title}
                          onChange={(e) => updateServiceField(selectedSvcIndex, 'title', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi Ringkas</label>
                        <textarea
                          rows={3}
                          disabled={!isEditable}
                          value={servicesList[selectedSvcIndex].desc}
                          onChange={(e) => updateServiceField(selectedSvcIndex, 'desc', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">URL Gambar Banner</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={servicesList[selectedSvcIndex].image}
                          onChange={(e) => updateServiceField(selectedSvcIndex, 'image', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {isEditable && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all mt-4"
                      >
                        <Save className="size-4" />
                        Simpan Perubahan Layanan
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* ADMIN TAB 5: DEPOSIT VERIFICATIONS PANEL */}
              {adminTab === 'deposits' && matrixState && (
                <div className="space-y-6">
                  {/* Verifikasi Setoran Kemitraan / Pemesanan Paket (switched via sidebar dropdown) */}

                  {/* MATRIX DEPOSITS VERIFICATION */}
                  {verifySubTab === 'matrix' && (
                    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-md font-bold text-slate-900">Verifikasi Setoran Registrasi Kemitraan</h3>
                        <p className="text-xs text-slate-500">Mempengaruhi komisi sponsor dan penempatan titik di pohon matriks Fly I / Fly II.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-slate-600">
                          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">Tanggal</th>
                              <th className="px-4 py-3">Sponsor (Member)</th>
                              <th className="px-4 py-3">Mitra Baru</th>
                              <th className="px-4 py-3 text-right">Jumlah Setoran</th>
                              <th className="px-4 py-3 text-center">Struk</th>
                              <th className="px-4 py-3 text-center">Tindakan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {matrixState.depositRequests.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-slate-400">Tidak ada pengajuan transfer setoran kemitraan.</td>
                              </tr>
                            ) : (
                              matrixState.depositRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3.5">{req.date}</td>
                                  <td className="px-4 py-3.5 text-slate-500 truncate max-w-[150px]">{req.sponsorEmail}</td>
                                  <td className="px-4 py-3.5 font-bold text-slate-800">{req.recruitName}</td>
                                  <td className="px-4 py-3.5 text-right font-extrabold text-slate-700">Rp {req.amount.toLocaleString('id-ID')}</td>
                                  <td className="px-4 py-3.5 text-center">
                                    <button
                                      onClick={() => {
                                        setSelectedReceipt(req)
                                        setShowReceiptModal(true)
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 bg-primary/5 border border-primary/20 px-2.5 py-1.5 rounded-lg shadow-sm"
                                    >
                                      <Eye className="size-3.5" /> Lihat Struk
                                    </button>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {req.status === 'pending' ? (
                                        <>
                                          <button
                                            onClick={() => handleApproveRequest(req.id)}
                                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm"
                                          >
                                            <Check className="size-3.5" /> Setuju
                                          </button>
                                          <button
                                            onClick={() => handleRejectRequest(req.id)}
                                            className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm"
                                          >
                                            <X className="size-3.5" /> Tolak
                                          </button>
                                        </>
                                      ) : (
                                        <span
                                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                                          }`}
                                        >
                                          {req.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* REGULAR PACKAGE BOOKINGS VERIFICATION */}
                  {verifySubTab === 'package' && (
                    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-md font-bold text-slate-900">Verifikasi Pemesanan Paket Umroh Reguler/VIP</h3>
                        <p className="text-xs text-slate-500">Review transfer cicilan/DP pendaftaran paket perjalanan mandiri milik jamaah.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-slate-600">
                          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">Tanggal</th>
                              <th className="px-4 py-3">Email Pemesan</th>
                              <th className="px-4 py-3">Nama Jamaah</th>
                              <th className="px-4 py-3">Paket &amp; Jadwal</th>
                              <th className="px-4 py-3 text-right">Nominal</th>
                              <th className="px-4 py-3 text-center">Struk</th>
                              <th className="px-4 py-3 text-center">Tindakan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {packageBookings.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-6 text-slate-400">Tidak ada pengajuan pemesanan paket.</td>
                              </tr>
                            ) : (
                              packageBookings.map((book) => (
                                <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3.5">{book.date}</td>
                                  <td className="px-4 py-3.5 text-slate-500 truncate max-w-[120px]">{book.memberEmail}</td>
                                  <td className="px-4 py-3.5 font-bold text-slate-800">{book.passengerName}</td>
                                  <td className="px-4 py-3.5 text-xs">
                                    <span className="font-semibold block">{book.packageName}</span>
                                    <span className="text-slate-400">{book.scheduleDate}</span>
                                  </td>
                                  <td className="px-4 py-3.5 text-right font-extrabold text-slate-700">Rp {book.amount.toLocaleString('id-ID')}</td>
                                  <td className="px-4 py-3.5 text-center">
                                    <button
                                      onClick={() => {
                                        setSelectedReceipt(book)
                                        setShowReceiptModal(true)
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 bg-primary/5 border border-primary/20 px-2.5 py-1.5 rounded-lg shadow-sm"
                                    >
                                      <Eye className="size-3.5" /> Lihat Struk
                                    </button>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {book.status === 'pending' ? (
                                        <>
                                          <button
                                            onClick={() => handleApproveBooking(book.id)}
                                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm"
                                          >
                                            <Check className="size-3.5" /> Setuju
                                          </button>
                                          <button
                                            onClick={() => handleRejectBooking(book.id)}
                                            className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm"
                                          >
                                            <X className="size-3.5" /> Tolak
                                          </button>
                                        </>
                                      ) : (
                                        <span
                                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            book.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                                          }`}
                                        >
                                          {book.status === 'approved' ? 'Terkonfirmasi' : 'Ditolak'}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ADMIN TAB 2: PACKAGES EDITOR */}
              {adminTab === 'packages' && packagesList.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {packagesList.map((pkg, idx) => (
                      <button
                        key={pkg.name}
                        onClick={() => setSelectedPkgIndex(idx)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all border ${
                          selectedPkgIndex === idx
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-655 border-slate-200 hover:text-slate-955 hover:bg-slate-50'
                        }`}
                      >
                        {pkg.name}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSavePackages} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Ubah Konten: {packagesList[selectedPkgIndex].name}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Harga Paket</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].price}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'price', e.target.value)}
                          placeholder="Contoh: 28,5 Juta"
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Durasi Perjalanan</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].days}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'days', e.target.value)}
                          placeholder="Contoh: 9 Hari"
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Maskapai Penerbangan (Flight)</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].flight}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'flight', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hotel Madinah</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].madinahHotel}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'madinahHotel', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hotel Makkah</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={packagesList[selectedPkgIndex].makkahHotel}
                          onChange={(e) => updatePackageField(selectedPkgIndex, 'makkahHotel', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {isEditable && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all mt-4"
                      >
                        <Save className="size-4" />
                        Simpan Perubahan Paket
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* ADMIN TAB 3: SCHEDULES EDITOR */}
              {adminTab === 'schedules' && schedulesList.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {schedulesList.map((sch, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSchIndex(idx)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all border ${
                          selectedSchIndex === idx
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-655 border-slate-200 hover:text-slate-955 hover:bg-slate-50'
                        }`}
                      >
                        {sch.date} - {sch.name}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSaveSchedules} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Ubah Konten Keberangkatan: {schedulesList[selectedSchIndex].date}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal Keberangkatan</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].date}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'date', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Paket</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].name}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'name', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Harga Seat</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].price}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'price', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Seat</label>
                        <select
                          disabled={!isEditable}
                          value={schedulesList[selectedSchIndex].status}
                          onChange={(e) => updateScheduleField(selectedSchIndex, 'status', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-905 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        >
                          <option value="open">Tersedia (Open)</option>
                          <option value="full">Penuh (Full Booked)</option>
                        </select>
                      </div>
                    </div>

                    {isEditable && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all mt-4"
                      >
                        <Save className="size-4" />
                        Simpan Perubahan Jadwal
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* ADMIN TAB 4: SERVICES EDITOR */}
              {adminTab === 'services' && servicesList.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {servicesList.map((svc, idx) => (
                      <button
                        key={svc.title}
                        onClick={() => setSelectedSvcIndex(idx)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all border ${
                          selectedSvcIndex === idx
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-655 border-slate-200 hover:text-slate-955 hover:bg-slate-50'
                        }`}
                      >
                        {svc.title}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSaveServices} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Ubah Konten Layanan Banner: {servicesList[selectedSvcIndex].title}
                    </h3>

                    <div className="grid gap-6">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Judul Layanan</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={servicesList[selectedSvcIndex].title}
                          onChange={(e) => updateServiceField(selectedSvcIndex, 'title', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi Ringkas</label>
                        <textarea
                          rows={3}
                          disabled={!isEditable}
                          value={servicesList[selectedSvcIndex].desc}
                          onChange={(e) => updateServiceField(selectedSvcIndex, 'desc', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">URL Gambar Banner</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={servicesList[selectedSvcIndex].image}
                          onChange={(e) => updateServiceField(selectedSvcIndex, 'image', e.target.value)}
                          className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {isEditable && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all mt-4"
                      >
                        <Save className="size-4" />
                        Simpan Perubahan Layanan
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* ADMIN TAB 6: SITE SETTINGS (Including Superadmin parameters) */}
              {adminTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Pengaturan Umum Website
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nomor WhatsApp Kontak Utama</label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 0895-1844-3354"
                        className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Semua link tombol "Konsultasi" dan "Booking" di website akan otomatis beralih ke nomor WhatsApp ini saat diklik.
                      </p>
                    </div>
                  </div>

                  {currentUser.role === 'superadmin' && (
                    <div className="border-t border-slate-100 pt-6 space-y-5">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <Lock className="size-4 text-rose-500" /> Parameter Komisi & Kemitraan Matriks (Superadmin Only)
                      </h4>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Setoran Awal Registrasi (Rp)</label>
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(Number(e.target.value))}
                            className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ujroh Sponsor Referral (Rp)</label>
                          <input
                            type="number"
                            value={sponsorReward}
                            onChange={(e) => setSponsorReward(Number(e.target.value))}
                            className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pencairan Papan Fly I (Rp)</label>
                          <input
                            type="number"
                            value={fly1Reward}
                            onChange={(e) => setFly1Reward(Number(e.target.value))}
                            className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pencairan Papan Fly II (Rp)</label>
                          <input
                            type="number"
                            value={fly2Reward}
                            onChange={(e) => setFly2Reward(Number(e.target.value))}
                            className="mt-2 w-full rounded-xl bg-slate-50/50 py-3 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-primary focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditable && (
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all mt-4"
                    >
                      <Save className="size-4" />
                      Simpan Seluruh Pengaturan
                    </button>
                  )}
                </form>
              )}

              {/* ADMIN TAB 7: MANAGE USERS (Superadmin only) */}
              {adminTab === 'users' && currentUser.role === 'superadmin' && (
                <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Daftar Pengguna Sistem CMS</h3>
                    <span className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 uppercase">Superadmin Only Access</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Nama Pengguna</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Peran (Role)</th>
                          <th className="px-4 py-3">Status Izin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MOCK_USERS.map((user) => (
                          <tr key={user.email} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-4.5 font-bold text-slate-800">{user.name}</td>
                            <td className="px-4 py-4.5 text-slate-500">{user.email}</td>
                            <td className="px-4 py-4.5">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  user.role === 'superadmin'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : user.role === 'admin'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-4.5 text-xs">
                              {user.role === 'member' ? (
                                <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                                  <Lock className="size-3.5 text-amber-500" /> Read-Only
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Full Access
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  )
}
