import { supabase, isSupabaseConfigured } from './supabase'
import { paketUmroh, schedules, services, WHATSAPP_URL, type Package, type Schedule, type Service } from './data'

export type Role = 'member' | 'admin' | 'superadmin'

export type User = {
  email: string
  role: Role
  name: string
}

export const MOCK_USERS = [
  { email: 'member@abh.com', password: 'member123', role: 'member' as Role, name: 'Ahmad (Member)' },
  { email: 'admin@abh.com', password: 'admin123', role: 'admin' as Role, name: 'Budi (Admin)' },
  { email: 'superadmin@abh.com', password: 'super123', role: 'superadmin' as Role, name: 'Siti (Superadmin)' },
]

export function getSession(): User | null {
  if (typeof window === 'undefined') return null
  const session = sessionStorage.getItem('abh_session')
  return session ? JSON.parse(session) : null
}

export function setSession(user: User) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('abh_session', JSON.stringify(user))
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('abh_session')
  }
}

// ----------------------------------------------------
// Packages Operations
// ----------------------------------------------------
export function getSavedPackages(): Package[] {
  if (typeof window === 'undefined') return paketUmroh
  const saved = localStorage.getItem('abh_paketUmroh')
  return saved ? JSON.parse(saved) : paketUmroh
}

export function savePackages(data: Package[]) {
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
      // Map snake_case database columns to camelCase package fields
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
  savePackages(list) // Always update local cache

  if (!isSupabaseConfigured || !supabase) return true

  try {
    // Drop all rows and re-insert to preserve order index easily
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
  if (typeof window === 'undefined') return schedules
  const saved = localStorage.getItem('abh_schedules')
  return saved ? JSON.parse(saved) : schedules
}

export function saveSchedules(data: Schedule[]) {
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
  if (typeof window === 'undefined') return services
  const saved = localStorage.getItem('abh_services')
  return saved ? JSON.parse(saved) : services
}

export function saveServices(data: Service[]) {
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
  if (typeof window === 'undefined') return '0895-1844-3354'
  return localStorage.getItem('abh_phone') || '0895-1844-3354'
}

export function savePhone(phone: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('abh_phone', phone)
    const cleanNumber = phone.replace(/[^0-9]/g, '')
    const dynamicUrl = `https://wa.me/${cleanNumber}?text=Halo%20Amanah%20Berkah%20Haromain,%20saya%20ingin%20konsultasi%20gratis%20paket%20umroh.`
    localStorage.setItem('abh_whatsappUrl', dynamicUrl)
  }
}

export function getSavedWhatsappUrl(): string {
  if (typeof window === 'undefined') return WHATSAPP_URL
  return localStorage.getItem('abh_whatsappUrl') || WHATSAPP_URL
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
