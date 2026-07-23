import { supabase, isSupabaseConfigured } from './supabase'
import { paketUmroh, schedules, services, WHATSAPP_URL, type Package, type Schedule, type Service } from './data'

export type Role = 'member' | 'admin' | 'superadmin'

export type User = {
  email: string
  role: Role
  name: string
  status?: 'pending' | 'active'
}

export type DynamicUser = User & {
  password?: string
}

export const MOCK_USERS: DynamicUser[] = [
  { email: 'member@abh.com', password: 'member123', role: 'member' as Role, name: 'Ahmad (Member)', status: 'active' },
  { email: 'admin@abh.com', password: 'admin123', role: 'admin' as Role, name: 'Budi (Admin)', status: 'active' },
  { email: 'superadmin@abh.com', password: 'super123', role: 'superadmin' as Role, name: 'Siti (Superadmin)', status: 'active' },
]

export function getSession(): User | null {
  if (typeof window === 'undefined') return null
  const session = sessionStorage.getItem('abh_session')
  return session ? JSON.parse(session) : null
}

export function setSession(user: User) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('abh_session', JSON.stringify(user))
    localStorage.removeItem(`abh_matrix_state_${user.email.toLowerCase()}`)
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('abh_session')
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('abh_matrix_state_')) {
        localStorage.removeItem(key)
      }
    }
  }
}

// ----------------------------------------------------
// Dynamic User Management & Registration
// ----------------------------------------------------
export function getSavedLocalUsers(): DynamicUser[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem('abh_registered_users')
  return saved ? JSON.parse(saved) : []
}

export function saveLocalUsers(users: DynamicUser[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('abh_registered_users', JSON.stringify(users))
  }
}

export async function getUsersAsync(): Promise<DynamicUser[]> {
  const localUsers = getSavedLocalUsers()
  const combined = [...MOCK_USERS, ...localUsers]

  if (!isSupabaseConfigured || !supabase) {
    return combined
  }

  try {
    const { data, error } = await supabase.from('user_accounts').select('*')
    if (error) throw error

    if (data && data.length > 0) {
      const dbUsers: DynamicUser[] = data.map((item) => ({
        email: item.email,
        password: item.password,
        role: item.role as Role,
        name: item.name,
        status: item.status as 'pending' | 'active',
      }))
      // Sync local cache
      const nonMock = dbUsers.filter((u) => !MOCK_USERS.some((m) => m.email.toLowerCase() === u.email.toLowerCase()))
      saveLocalUsers(nonMock)
      // Ensure default mock users (admin/superadmin) are always included as a fallback
      const missingMocks = MOCK_USERS.filter(
        (m) => !dbUsers.some((u) => u.email.toLowerCase() === m.email.toLowerCase())
      )
      return [...dbUsers, ...missingMocks];
    } else {
      // Seed DB with MOCK_USERS
      const payload = MOCK_USERS.map((m) => ({
        email: m.email,
        password: m.password,
        role: m.role,
        name: m.name,
        status: m.status,
      }))
      await supabase.from('user_accounts').insert(payload)
    }
  } catch (err) {
    console.error('Error fetching users from Supabase:', err)
  }
  return combined
}

export async function registerUserAsync(name: string, email: string, password: string, sponsorEmail?: string): Promise<{ success: boolean; message: string }> {
  const allUsers = await getUsersAsync()
  const exists = allUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())
  if (exists) {
    return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' }
  }

  const newUser: DynamicUser = {
    email,
    password,
    role: 'member' as Role,
    name,
    status: isSupabaseConfigured ? 'pending' : 'active',
  }

  // 1. Save to local storage
  const localUsers = getSavedLocalUsers()
  localUsers.push(newUser)
  saveLocalUsers(localUsers)

  // 2. Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('user_accounts').insert({
        email,
        password,
        role: 'member',
        name,
        status: 'pending',
      })
      if (error) throw error

      // Automatically create a pending deposit request
      const { error: depErr } = await supabase.from('deposit_requests').insert({
        sponsor_email: sponsorEmail || 'member@abh.com',
        recruit_name: name,
        recruit_email: email,
        amount: 2500000,
        status: 'pending',
        proof_image: '/images/proof-mock.png',
        date_text: new Date().toLocaleDateString('id-ID'),
      })
      if (depErr) throw depErr

    } catch (err) {
      console.error('Error saving new user to Supabase:', err)
      return { success: false, message: 'Gagal mendaftarkan user di database.' }
    }
  }

  // 3. Initialize and place member in the matrix tree dynamically
  try {
    const { initializeAndPlaceMemberAsync } = await import('./matrix-store')
    const placementRes = await initializeAndPlaceMemberAsync(name, email, sponsorEmail || 'member@abh.com')
    if (!placementRes.success) {
      return { success: false, message: placementRes.message }
    }
  } catch (err) {
    console.error('Error placing member during sign up:', err)
  }

  return {
    success: true,
    message: isSupabaseConfigured
      ? 'Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi setoran oleh admin.'
      : 'Pendaftaran berhasil! Silakan langsung masuk ke tab Login untuk masuk ke akun Anda.',
  }
}

// ----------------------------------------------------
// Packages Operations
// ----------------------------------------------------
export function getSavedPackages(): Package[] {
  if (isSupabaseConfigured && supabase) return paketUmroh
  if (typeof window === 'undefined') return paketUmroh
  const saved = localStorage.getItem('abh_paketUmroh')
  return saved ? JSON.parse(saved) : paketUmroh
}

export function savePackages(data: Package[]) {
  if (isSupabaseConfigured && supabase) return
  if (typeof window !== 'undefined') {
    localStorage.setItem('abh_paketUmroh', JSON.stringify(data))
  }
}

export async function fetchPackagesAsync(): Promise<Package[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getSavedPackages()
  }

  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error

    if (data && data.length > 0) {
      const mapped: Package[] = data.map((item) => ({
        name: item.name,
        price: item.price,
        days: item.days,
        flight: item.flight,
        madinahHotel: item.madinah_hotel,
        makkahHotel: item.makkah_hotel,
        bonus: item.bonus || [],
        isPromo: item.is_promo,
        isVIP: item.is_vip,
      }))
      savePackages(mapped)
      return mapped
    }
  } catch (err) {
    console.error('Error fetching packages from Supabase:', err)
  }
  return getSavedPackages()
}

export async function savePackagesAsync(list: Package[]): Promise<boolean> {
  savePackages(list)

  if (!isSupabaseConfigured || !supabase) return true

  try {
    await supabase.from('packages').delete().neq('name', '')

    const payload = list.map((item, idx) => ({
      name: item.name,
      price: item.price,
      days: item.days,
      flight: item.flight,
      madinah_hotel: item.madinahHotel,
      makkah_hotel: item.makkahHotel,
      bonus: item.bonus,
      is_promo: !!item.isPromo,
      is_vip: !!item.isVIP,
      order_index: idx,
    }))

    const { error } = await supabase.from('packages').insert(payload)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Error saving packages to Supabase:', err)
    return false
  }
}

// ----------------------------------------------------
// Schedules Operations
// ----------------------------------------------------
export function getSavedSchedules(): Schedule[] {
  if (isSupabaseConfigured && supabase) return schedules
  if (typeof window === 'undefined') return schedules
  const saved = localStorage.getItem('abh_schedules')
  return saved ? JSON.parse(saved) : schedules
}

export function saveSchedules(data: Schedule[]) {
  if (isSupabaseConfigured && supabase) return
  if (typeof window !== 'undefined') {
    localStorage.setItem('abh_schedules', JSON.stringify(data))
  }
}

export async function fetchSchedulesAsync(): Promise<Schedule[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getSavedSchedules()
  }

  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error

    if (data && data.length > 0) {
      const mapped: Schedule[] = data.map((item) => ({
        name: item.name,
        date: item.date,
        price: item.price,
        status: item.status as 'open' | 'full',
        duration: item.duration,
        flight: item.flight,
        landing: item.landing,
        image: item.image,
        allIn: item.all_in,
      }))
      saveSchedules(mapped)
      return mapped
    }
  } catch (err) {
    console.error('Error fetching schedules from Supabase:', err)
  }
  return getSavedSchedules()
}

export async function saveSchedulesAsync(list: Schedule[]): Promise<boolean> {
  saveSchedules(list)

  if (!isSupabaseConfigured || !supabase) return true

  try {
    await supabase.from('schedules').delete().neq('name', '')

    const payload = list.map((item, idx) => ({
      name: item.name,
      date: item.date,
      price: item.price,
      status: item.status,
      duration: item.duration,
      flight: item.flight,
      landing: item.landing,
      image: item.image,
      all_in: !!item.allIn,
      order_index: idx,
    }))

    const { error } = await supabase.from('schedules').insert(payload)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Error saving schedules to Supabase:', err)
    return false
  }
}

// ----------------------------------------------------
// Services Operations
// ----------------------------------------------------
export function getSavedServices(): Service[] {
  if (isSupabaseConfigured && supabase) return services
  if (typeof window === 'undefined') return services
  const saved = localStorage.getItem('abh_services')
  return saved ? JSON.parse(saved) : services
}

export function saveServices(data: Service[]) {
  if (isSupabaseConfigured && supabase) return
  if (typeof window !== 'undefined') {
    localStorage.setItem('abh_services', JSON.stringify(data))
  }
}

export async function fetchServicesAsync(): Promise<Service[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getSavedServices()
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error

    if (data && data.length > 0) {
      const mapped: Service[] = data.map((item) => ({
        title: item.title,
        desc: item.desc_text,
        image: item.image,
      }))
      saveServices(mapped)
      return mapped
    }
  } catch (err) {
    console.error('Error fetching services from Supabase:', err)
  }
  return getSavedServices()
}

export async function saveServicesAsync(list: Service[]): Promise<boolean> {
  saveServices(list)

  if (!isSupabaseConfigured || !supabase) return true

  try {
    await supabase.from('services').delete().neq('title', '')

    const payload = list.map((item, idx) => ({
      title: item.title,
      desc_text: item.desc,
      image: item.image,
      order_index: idx,
    }))

    const { error } = await supabase.from('services').insert(payload)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Error saving services to Supabase:', err)
    return false
  }
}

// ----------------------------------------------------
// Settings & Phone Operations
// ----------------------------------------------------
export function getSavedPhone(): string {
  if (isSupabaseConfigured && supabase) return '0895-1844-3354'
  if (typeof window === 'undefined') return '0895-1844-3354'
  return localStorage.getItem('abh_phone') || '0895-1844-3354'
}

export function savePhone(phone: string) {
  if (isSupabaseConfigured && supabase) return
  if (typeof window !== 'undefined') {
    localStorage.setItem('abh_phone', phone)
    let cleanNumber = phone.replace(/[^0-9]/g, '')
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.substring(1)
    }
    const dynamicUrl = `https://wa.me/${cleanNumber}?text=Halo%20Amanah%20Berkah%20Haromain,%20saya%20ingin%20konsultasi%20gratis%20paket%20umroh.`
    localStorage.setItem('abh_whatsappUrl', dynamicUrl)
  }
}

export function getSavedWhatsappUrl(): string {
  const phone = getSavedPhone()
  let cleanNumber = phone.replace(/[^0-9]/g, '')
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1)
  }
  return `https://wa.me/${cleanNumber}?text=Halo%20Amanah%20Berkah%20Haromain,%20saya%20ingin%20konsultasi%20gratis%20paket%20umroh.`
}

export async function fetchSettingsAsync(): Promise<{ phone: string }> {
  const localPhone = getSavedPhone()
  if (!isSupabaseConfigured || !supabase) {
    return { phone: localPhone }
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('phone')
      .eq('id', 'global')
      .single()

    if (error) throw error
    if (data) {
      savePhone(data.phone)
      return { phone: data.phone }
    }
  } catch (err) {
    console.error('Error fetching settings from Supabase:', err)
  }
  return { phone: localPhone }
}

export async function saveSettingsAsync(phoneNum: string): Promise<boolean> {
  savePhone(phoneNum)

  if (!isSupabaseConfigured || !supabase) return true

  try {
    const { error } = await supabase
      .from('site_settings')
      .update({ phone: phoneNum })
      .eq('id', 'global')

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error saving settings to Supabase:', err)
    return false
  }
}

export async function updateUserPasswordAsync(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  // Update in default mock accounts locally if they match
  const mockMatch = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (mockMatch) {
    mockMatch.password = newPassword
  }

  // 1. Update in local storage
  const localUsers = getSavedLocalUsers()
  const match = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (match) {
    match.password = newPassword
    saveLocalUsers(localUsers)
  }

  // 2. Update in Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({ password: newPassword })
        .eq('email', email)
      if (error) throw error
    } catch (err) {
      console.error('Error updating user password in Supabase:', err)
      return { success: false, message: 'Gagal memperbarui password di database.' }
    }
  }

  return { success: true, message: 'Password berhasil diperbarui!' }
}

export async function deleteUserAsync(email: string): Promise<{ success: boolean; message: string }> {
  // 1. Delete from default mock accounts locally if they match
  const idx = MOCK_USERS.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
  if (idx !== -1) {
    MOCK_USERS.splice(idx, 1)
  }

  // 2. Delete from local storage
  const localUsers = getSavedLocalUsers()
  const filtered = localUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase())
  saveLocalUsers(filtered)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`abh_matrix_state_${email}`)
  }

  // 3. Delete from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      // Clean up all related matrix tables to ensure clean re-tests
      await supabase.from('matrix_nodes').delete().eq('email', email)
      await supabase.from('matrix_nodes').delete().eq('member_email', email)
      await supabase.from('member_matrix').delete().eq('email', email)
      await supabase.from('transactions').delete().eq('member_email', email)
      await supabase.from('deposit_requests').delete().eq('recruit_email', email)
      await supabase.from('deposit_requests').delete().eq('sponsor_email', email)

      const { error } = await supabase
        .from('user_accounts')
        .delete()
        .eq('email', email)
      if (error) throw error
    } catch (err) {
      console.error('Error deleting user from Supabase:', err)
      return { success: false, message: 'Gagal menghapus user dari database.' }
    }
  }

  return { success: true, message: 'User berhasil dihapus!' }
}
