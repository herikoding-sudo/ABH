import { supabase, isSupabaseConfigured } from './supabase'

export type MatrixNode = {
  name: string
  email: string
  role: string
  isUser?: boolean
} | null

export type Transaction = {
  id: string
  date: string
  type: 'sponsor' | 'fly1' | 'fly2' | 'deposit'
  amount: number
  description: string
}

export type MatrixSettings = {
  depositAmount: number
  sponsorReward: number
  fly1Reward: number
  fly2Reward: number
}

export type DepositRequest = {
  id: string
  date: string
  sponsorEmail: string
  recruitName: string
  recruitEmail: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  proofImage: string
}

export type MatrixState = {
  balance: number
  downlinesCount: number
  fly1Board: MatrixNode[]
  fly2Board: MatrixNode[]
  transactions: Transaction[]
  hasCompletedFly1: boolean
  hasCompletedFly2: boolean
  settings: MatrixSettings
  depositRequests: DepositRequest[]
}

const DEFAULT_SETTINGS: MatrixSettings = {
  depositAmount: 2500000,
  sponsorReward: 250000,
  fly1Reward: 3500000,
  fly2Reward: 30000000,
}

const INITIAL_FLY1_BOARD: MatrixNode[] = [
  { name: 'Ahmad (Member)', email: 'member@abh.com', role: 'member', isUser: true },
  { name: 'Farhan', email: 'farhan@email.com', role: 'member' },
  { name: 'Diana', email: 'diana@email.com', role: 'member' },
  { name: 'Eko', email: 'eko@email.com', role: 'member' },
  { name: 'Fitri', email: 'fitri@email.com', role: 'member' },
  null,
  null,
]

const INITIAL_FLY2_BOARD: MatrixNode[] = [
  { name: 'Ahmad (Member)', email: 'member@abh.com', role: 'member', isUser: true },
  { name: 'Sponsor A', email: 'sp_a@email.com', role: 'member' },
  { name: 'Sponsor B', email: 'sp_b@email.com', role: 'member' },
  { name: 'Mitra C', email: 'm_c@email.com', role: 'member' },
  { name: 'Mitra D', email: 'm_d@email.com', role: 'member' },
  { name: 'Mitra E', email: 'm_e@email.com', role: 'member' },
  { name: 'Mitra F', email: 'm_f@email.com', role: 'member' },
  { name: 'Mitra G', email: 'm_g@email.com', role: 'member' },
  { name: 'Mitra H', email: 'm_h@email.com', role: 'member' },
  { name: 'Mitra I', email: 'm_i@email.com', role: 'member' },
  { name: 'Mitra J', email: 'm_j@email.com', role: 'member' },
  { name: 'Mitra K', email: 'm_k@email.com', role: 'member' },
  { name: 'Mitra L', email: 'm_l@email.com', role: 'member' },
  null,
  null,
]

const INITIAL_DEPOSIT_REQUESTS: DepositRequest[] = [
  {
    id: 'req_demo_1',
    date: '19/07/2026',
    sponsorEmail: 'member@abh.com',
    recruitName: 'Gita Hermawan',
    recruitEmail: 'gita@email.com',
    amount: 2500000,
    status: 'pending',
    proofImage: '/images/proof-mock.png',
  },
]

// Local Fallback Helpers
export function getActiveUserEmail(): string {
  if (typeof window === 'undefined') return 'member@abh.com'
  const saved = sessionStorage.getItem('abh_session')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.email) {
        return parsed.email
      }
    } catch (e) {
      console.error(e)
    }
  }
  return 'member@abh.com'
}

export function getMatrixStateForEmail(email: string): MatrixState {
  if (typeof window === 'undefined') {
    return {
      balance: 0,
      downlinesCount: 0,
      fly1Board: INITIAL_FLY1_BOARD,
      fly2Board: INITIAL_FLY2_BOARD,
      transactions: [],
      hasCompletedFly1: false,
      hasCompletedFly2: false,
      settings: DEFAULT_SETTINGS,
      depositRequests: INITIAL_DEPOSIT_REQUESTS,
    }
  }

  const saved = localStorage.getItem(`abh_matrix_state_${email}`)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (!parsed.settings) parsed.settings = DEFAULT_SETTINGS
    if (!parsed.depositRequests) parsed.depositRequests = INITIAL_DEPOSIT_REQUESTS
    return parsed
  }

  const isHeri = email.toLowerCase() === 'heri@abh.com'
  const initialFly1 = isHeri
    ? [
        { name: 'Heri', email: 'heri@abh.com', role: 'member', isUser: true },
        null, null, null, null, null, null
      ]
    : INITIAL_FLY1_BOARD

  const initialFly2 = isHeri
    ? [
        { name: 'Heri', email: 'heri@abh.com', role: 'member', isUser: true },
        ...Array.from({ length: 14 }).map(() => null)
      ]
    : INITIAL_FLY2_BOARD

  const initialState: MatrixState = {
    balance: 0,
    downlinesCount: 0,
    fly1Board: initialFly1,
    fly2Board: initialFly2,
    transactions: [
      {
        id: 'tx_init',
        date: new Date().toLocaleDateString('id-ID'),
        type: 'deposit',
        amount: -2500000,
        description: 'Setoran Awal Registrasi Member Umroh',
      },
    ],
    hasCompletedFly1: false,
    hasCompletedFly2: false,
    settings: DEFAULT_SETTINGS,
    depositRequests: INITIAL_DEPOSIT_REQUESTS,
  }
  localStorage.setItem(`abh_matrix_state_${email}`, JSON.stringify(initialState))
  return initialState
}

export function getMatrixState(): MatrixState {
  const email = getActiveUserEmail()
  return getMatrixStateForEmail(email)
}

export function saveMatrixStateForEmail(email: string, state: MatrixState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`abh_matrix_state_${email}`, JSON.stringify(state))
  }
}

export function saveMatrixState(state: MatrixState) {
  if (typeof window !== 'undefined') {
    const email = getActiveUserEmail()
    saveMatrixStateForEmail(email, state)
  }
}

export function saveMatrixSettings(settings: MatrixSettings) {
  const state = getMatrixState()
  state.settings = settings
  saveMatrixState(state)
}

export function submitDepositRequest(name: string, email: string, sponsorEmail: string, proofImage: string) {
  const state = getMatrixState()
  const newRequest: DepositRequest = {
    id: `req_${Date.now()}`,
    date: new Date().toLocaleDateString('id-ID'),
    sponsorEmail,
    recruitName: name,
    recruitEmail: email,
    amount: state.settings.depositAmount,
    status: 'pending',
    proofImage,
  }
  state.depositRequests.unshift(newRequest)
  saveMatrixState(state)
}

// ----------------------------------------------------
// Supabase Async Operations with Local fallback
// ----------------------------------------------------

export async function fetchMatrixStateAsync(providedEmail?: string): Promise<MatrixState> {
  const localState = getMatrixState()
  if (!isSupabaseConfigured || !supabase) return localState

  try {
    // 1. Fetch settings
    let settings = DEFAULT_SETTINGS
    const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 'global').single()
    if (settingsData) {
      settings = {
        depositAmount: Number(settingsData.deposit_amount),
        sponsorReward: Number(settingsData.sponsor_reward),
        fly1Reward: Number(settingsData.fly1_reward),
        fly2Reward: Number(settingsData.fly2_reward),
      }
    }

    // 2. Fetch member matrix details
    const email = providedEmail || getActiveUserEmail()
    let balance = 0
    let downlinesCount = 0
    let hasCompletedFly1 = false
    let hasCompletedFly2 = false

    const { data: memberData } = await supabase.from('member_matrix').select('*').eq('email', email).single()
    if (memberData) {
      balance = Number(memberData.balance)
      downlinesCount = memberData.downlines_count
      hasCompletedFly1 = memberData.has_completed_fly1
      hasCompletedFly2 = memberData.has_completed_fly2
    } else {
      // Create record
      await supabase.from('member_matrix').insert({ email, balance: 0, downlines_count: 0 })
    }

    // 3. Fetch nodes
    let fly1Board = [...INITIAL_FLY1_BOARD]
    let fly2Board = [...INITIAL_FLY2_BOARD]

    const { data: nodesData } = await supabase.from('matrix_nodes').select('*').eq('member_email', email)
    if (nodesData && nodesData.length > 0) {
      // Initialize arrays
      const fly1Arr = Array(7).fill(null)
      const fly2Arr = Array(15).fill(null)

      nodesData.forEach((n) => {
        const mappedNode = n.name ? { name: n.name, email: n.email, role: 'member', isUser: n.is_user } : null
        if (n.board_type === 'fly1' && n.node_index < 7) {
          fly1Arr[n.node_index] = mappedNode
        } else if (n.board_type === 'fly2' && n.node_index < 15) {
          fly2Arr[n.node_index] = mappedNode
        }
      })
      fly1Board = fly1Arr
      fly2Board = fly2Arr
    } else {
      // Seed nodes
      const seedPayload = [
        ...INITIAL_FLY1_BOARD.map((item, idx) => ({
          member_email: email,
          board_type: 'fly1',
          node_index: idx,
          name: item?.name || null,
          email: item?.email || null,
          is_user: !!item?.isUser,
        })),
        ...INITIAL_FLY2_BOARD.map((item, idx) => ({
          member_email: email,
          board_type: 'fly2',
          node_index: idx,
          name: item?.name || null,
          email: item?.email || null,
          is_user: !!item?.isUser,
        })),
      ]
      await supabase.from('matrix_nodes').insert(seedPayload)
    }

    // 4. Fetch transactions
    let transactions: Transaction[] = []
    const { data: txsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('member_email', email)
      .order('created_at', { ascending: false })

    if (txsData) {
      transactions = txsData.map((item) => ({
        id: item.id,
        date: item.date_text,
        type: item.tx_type as any,
        amount: Number(item.amount),
        description: item.description,
      }))
    }

    // 5. Fetch deposit requests
    let depositRequests: DepositRequest[] = []
    const { data: reqsData } = await supabase
      .from('deposit_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (reqsData) {
      depositRequests = reqsData.map((item) => ({
        id: item.id,
        date: item.date_text,
        sponsorEmail: item.sponsor_email,
        recruitName: item.recruit_name,
        recruitEmail: item.recruit_email,
        amount: Number(item.amount),
        status: item.status as any,
        proofImage: item.proof_image,
      }))
    }

    const state: MatrixState = {
      balance,
      downlinesCount,
      fly1Board,
      fly2Board,
      transactions,
      hasCompletedFly1,
      hasCompletedFly2,
      settings,
      depositRequests,
    }

    saveMatrixState(state) // Sync to local storage cache
    return state
  } catch (err) {
    console.error('Error fetching matrix state from Supabase:', err)
  }
  return localState
}

export async function saveMatrixSettingsAsync(settings: MatrixSettings): Promise<boolean> {
  saveMatrixSettings(settings)

  if (!isSupabaseConfigured || !supabase) return true

  try {
    const { error } = await supabase
      .from('site_settings')
      .update({
        deposit_amount: settings.depositAmount,
        sponsor_reward: settings.sponsorReward,
        fly1_reward: settings.fly1Reward,
        fly2_reward: settings.fly2Reward,
      })
      .eq('id', 'global')

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error saving matrix settings to Supabase:', err)
    return false
  }
}

export async function submitDepositRequestAsync(name: string, email: string, sponsorEmail: string, proofImage: string): Promise<boolean> {
  submitDepositRequest(name, email, sponsorEmail, proofImage)

  if (!isSupabaseConfigured || !supabase) return true

  try {
    const state = getMatrixState()
    const { error } = await supabase.from('deposit_requests').insert({
      sponsor_email: sponsorEmail,
      recruit_name: name,
      recruit_email: email,
      amount: state.settings.depositAmount,
      status: 'pending',
      proof_image: proofImage,
      date_text: new Date().toLocaleDateString('id-ID'),
    })

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error submitting request to Supabase:', err)
    return false
  }
}

export async function approveDepositRequestAsync(requestId: string): Promise<{ success: boolean; message: string; splitOccurred: boolean }> {
  // 1. If not configured, fall back to local storage approval
  if (!isSupabaseConfigured || !supabase) {
    const state = getMatrixState()
    const req = state.depositRequests.find((r) => r.id === requestId)
    if (!req) return { success: false, message: 'Request not found.', splitOccurred: false }
    
    // Simulate locally
    req.status = 'approved'
    const sponsorTx: Transaction = {
      id: `tx_sp_${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID'),
      type: 'sponsor',
      amount: state.settings.sponsorReward,
      description: `Ujroh Sponsor Kemitraan: ${req.recruitName}`,
    }
    state.transactions.unshift(sponsorTx)
    state.balance += state.settings.sponsorReward
    state.downlinesCount += 1

    // Activate the user in local storage
    const usersSaved = localStorage.getItem('abh_registered_users')
    if (usersSaved) {
      const users = JSON.parse(usersSaved)
      const match = users.find((u: any) => u.email.toLowerCase() === req.recruitEmail.toLowerCase())
      if (match) {
        match.status = 'active'
        localStorage.setItem('abh_registered_users', JSON.stringify(users))
      }
    }

    let splitOccurred = false
    let placementMessage = `Pendaftaran disetujui!`

    if (!state.hasCompletedFly1) {
      const emptyIndex = state.fly1Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        state.fly1Board[emptyIndex] = { name: req.recruitName, email: req.recruitEmail, role: 'member' }
        const isFull = state.fly1Board.every((n) => n !== null)
        if (isFull) {
          splitOccurred = true
          state.hasCompletedFly1 = true
          state.balance += state.settings.fly1Reward
          state.transactions.unshift({
            id: `tx_fly1_${Date.now()}`,
            date: new Date().toLocaleDateString('id-ID'),
            type: 'fly1',
            amount: state.settings.fly1Reward,
            description: 'Bonus Pencairan Matriks Fly I (Pecah Belah Semangka)',
          })
          state.fly1Board = [
            { name: 'Diana', email: 'diana@email.com', role: 'member' },
            { name: 'Eko', email: 'eko@email.com', role: 'member' },
            { name: 'Fitri', email: 'fitri@email.com', role: 'member' },
            null, null, null, null
          ]
        }
      }
    } else if (!state.hasCompletedFly2) {
      const emptyIndex = state.fly2Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        state.fly2Board[emptyIndex] = { name: req.recruitName, email: req.recruitEmail, role: 'member' }
        const isFull = state.fly2Board.every((n) => n !== null)
        if (isFull) {
          splitOccurred = true
          state.hasCompletedFly2 = true
          state.balance += state.settings.fly2Reward
          state.transactions.unshift({
            id: `tx_fly2_${Date.now()}`,
            date: new Date().toLocaleDateString('id-ID'),
            type: 'fly2',
            amount: state.settings.fly2Reward,
            description: 'Bonus Pencairan Matriks Fly II (Fly Utama)',
          })
        }
      }
    }

    saveMatrixState(state)
    return { success: true, message: placementMessage, splitOccurred }
  }

  try {
    // 2. Real Supabase Approval Flow
    // Find request in Supabase
    const { data: requestData } = await supabase.from('deposit_requests').select('*').eq('id', requestId).single()
    if (!requestData) return { success: false, message: 'Request tidak ditemukan.', splitOccurred: false }

    const email = requestData.sponsor_email || getActiveUserEmail()
    const state = await fetchMatrixStateAsync(email)

    // Update status to approved
    await supabase.from('deposit_requests').update({ status: 'approved' }).eq('id', requestId)

    // Activate user account and pre-seed matrix boards
    await supabase.from('user_accounts').update({ status: 'active' }).eq('email', requestData.recruit_email)

    const { data: recruitMM } = await supabase.from('member_matrix').select('*').eq('email', requestData.recruit_email).maybeSingle()
    if (!recruitMM) {
      await supabase.from('member_matrix').insert({
        email: requestData.recruit_email,
        balance: 0,
        downlines_count: 0,
        has_completed_fly1: false,
        has_completed_fly2: false,
      })

      const recruitNodes = [
        { member_email: requestData.recruit_email, board_type: 'fly1', node_index: 0, name: requestData.recruit_name, email: requestData.recruit_email, is_user: true },
        { member_email: requestData.recruit_email, board_type: 'fly1', node_index: 1, name: null, email: null },
        { member_email: requestData.recruit_email, board_type: 'fly1', node_index: 2, name: null, email: null },
        { member_email: requestData.recruit_email, board_type: 'fly1', node_index: 3, name: null, email: null },
        { member_email: requestData.recruit_email, board_type: 'fly1', node_index: 4, name: null, email: null },
        { member_email: requestData.recruit_email, board_type: 'fly1', node_index: 5, name: null, email: null },
        { member_email: requestData.recruit_email, board_type: 'fly1', node_index: 6, name: null, email: null },
        { member_email: requestData.recruit_email, board_type: 'fly2', node_index: 0, name: requestData.recruit_name, email: requestData.recruit_email, is_user: true },
        ...Array.from({ length: 14 }).map((_, i) => ({
          member_email: requestData.recruit_email,
          board_type: 'fly2',
          node_index: i + 1,
          name: null,
          email: null,
          is_user: false,
        }))
      ]
      await supabase.from('matrix_nodes').insert(recruitNodes)
    }

    // Calculate payouts
    const newBalance = state.balance + state.settings.sponsorReward
    const newDownlines = state.downlinesCount + 1
    
    // Insert sponsor transaction record
    await supabase.from('transactions').insert({
      member_email: email,
      date_text: new Date().toLocaleDateString('id-ID'),
      tx_type: 'sponsor',
      amount: state.settings.sponsorReward,
      description: `Ujroh Sponsor Kemitraan: ${requestData.recruit_name}`,
    })

    let splitOccurred = false
    let placementMessage = `Pendaftaran ${requestData.recruit_name} disetujui!`

    if (!state.hasCompletedFly1) {
      const emptyIndex = state.fly1Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        // Place node in database
        await supabase
          .from('matrix_nodes')
          .update({ name: requestData.recruit_name, email: requestData.recruit_email })
          .eq('member_email', email)
          .eq('board_type', 'fly1')
          .eq('node_index', emptyIndex)

        state.fly1Board[emptyIndex] = { name: requestData.recruit_name, email: requestData.recruit_email, role: 'member' }
        const isFull = state.fly1Board.every((n) => n !== null)

        if (isFull) {
          splitOccurred = true
          const finalBalance = newBalance + state.settings.fly1Reward
          
          // Update matrix state
          await supabase
            .from('member_matrix')
            .update({
              balance: finalBalance,
              downlines_count: newDownlines,
              has_completed_fly1: true,
            })
            .eq('email', email)

          // Insert Fly I reward transaction
          await supabase.from('transactions').insert({
            member_email: email,
            date_text: new Date().toLocaleDateString('id-ID'),
            tx_type: 'fly1',
            amount: state.settings.fly1Reward,
            description: 'Bonus Pencairan Matriks Fly I (Pecah Belah Semangka)',
          })

          // Reset nodes in Fly I database
          await supabase.from('matrix_nodes').delete().eq('member_email', email).eq('board_type', 'fly1')
          const seedFly1 = [
            { member_email: email, board_type: 'fly1', node_index: 0, name: 'Diana', email: 'diana@email.com' },
            { member_email: email, board_type: 'fly1', node_index: 1, name: 'Eko', email: 'eko@email.com' },
            { member_email: email, board_type: 'fly1', node_index: 2, name: 'Fitri', email: 'fitri@email.com' },
            { member_email: email, board_type: 'fly1', node_index: 3, name: null, email: null },
            { member_email: email, board_type: 'fly1', node_index: 4, name: null, email: null },
            { member_email: email, board_type: 'fly1', node_index: 5, name: null, email: null },
            { member_email: email, board_type: 'fly1', node_index: 6, name: null, email: null },
          ]
          await supabase.from('matrix_nodes').insert(seedFly1)

          placementMessage += ` Papan Fly I Penuh! Ujroh Fly I Rp ${state.settings.fly1Reward.toLocaleString('id-ID')} cair.`
        } else {
          // Just update balance and downlines normally
          await supabase
            .from('member_matrix')
            .update({ balance: newBalance, downlines_count: newDownlines })
            .eq('email', email)
        }
      }
    } else if (!state.hasCompletedFly2) {
      const emptyIndex = state.fly2Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        await supabase
          .from('matrix_nodes')
          .update({ name: requestData.recruit_name, email: requestData.recruit_email })
          .eq('member_email', email)
          .eq('board_type', 'fly2')
          .eq('node_index', emptyIndex)

        state.fly2Board[emptyIndex] = { name: requestData.recruit_name, email: requestData.recruit_email, role: 'member' }
        const isFull = state.fly2Board.every((n) => n !== null)

        if (isFull) {
          splitOccurred = true
          const finalBalance = newBalance + state.settings.fly2Reward

          await supabase
            .from('member_matrix')
            .update({
              balance: finalBalance,
              downlines_count: newDownlines,
              has_completed_fly2: true,
            })
            .eq('email', email)

          await supabase.from('transactions').insert({
            member_email: email,
            date_text: new Date().toLocaleDateString('id-ID'),
            tx_type: 'fly2',
            amount: state.settings.fly2Reward,
            description: 'Bonus Pencairan Matriks Fly II (Fly Utama)',
          })

          placementMessage += ` Papan Fly II Penuh! Ujroh Fly II Rp ${state.settings.fly2Reward.toLocaleString('id-ID')} cair!`
        } else {
          await supabase
            .from('member_matrix')
            .update({ balance: newBalance, downlines_count: newDownlines })
            .eq('email', email)
        }
      }
    }

    // Refresh state
    await fetchMatrixStateAsync()
    return { success: true, message: placementMessage, splitOccurred }
  } catch (err) {
    console.error('Error approving request in Supabase:', err)
    return { success: false, message: 'Terjadi kesalahan sistem.', splitOccurred: false }
  }
}

export async function rejectDepositRequestAsync(requestId: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const res = rejectDepositRequest(requestId)
    return res
  }

  try {
    await supabase.from('deposit_requests').update({ status: 'rejected' }).eq('id', requestId)
    await fetchMatrixStateAsync()
    return { success: true, message: 'Pengajuan ditolak.' }
  } catch (err) {
    console.error('Error rejecting request in Supabase:', err)
    return { success: false, message: 'Gagal menolak pengajuan.' }
  }
}

export async function resetMatrixSimulationAsync(): Promise<boolean> {
  resetMatrixSimulation()

  if (!isSupabaseConfigured || !supabase) return true

  try {
    const email = getActiveUserEmail()
    // Reset member matrix balance
    await supabase.from('member_matrix').delete().eq('email', email)
    // Delete nodes
    await supabase.from('matrix_nodes').delete().eq('member_email', email)
    // Delete transactions
    await supabase.from('transactions').delete().eq('member_email', email)
    // Delete deposit requests
    await supabase.from('deposit_requests').delete().eq('sponsor_email', email)
    // Delete package bookings
    await supabase.from('package_bookings').delete().eq('member_email', email)

    // Re-initialize state
    await fetchMatrixStateAsync()
    return true
  } catch (err) {
    console.error('Error resetting database in Supabase:', err)
    return false
  }
}

// ----------------------------------------------------
// Package Bookings (Direct Sales) Operations
// ----------------------------------------------------
export type PackageBooking = {
  id: string
  memberEmail: string
  packageName: string
  scheduleDate: string
  passengerName: string
  passengerPhone: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  proofImage: string
  date: string
}

const INITIAL_BOOKINGS: PackageBooking[] = [
  {
    id: 'book_demo_1',
    memberEmail: 'member@abh.com',
    packageName: 'Paket VIP 9 D',
    scheduleDate: '25 Sep 2026',
    passengerName: 'Ahmad (Member)',
    passengerPhone: '0812-3456-7890',
    amount: 37500000,
    status: 'pending',
    proofImage: '/images/proof-mock.png',
    date: '19/07/2026',
  },
]

export function getSavedPackageBookings(): PackageBooking[] {
  if (typeof window === 'undefined') return INITIAL_BOOKINGS
  const saved = localStorage.getItem('abh_package_bookings')
  return saved ? JSON.parse(saved) : INITIAL_BOOKINGS
}

export function savePackageBookings(bookings: PackageBooking[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('abh_package_bookings', JSON.stringify(bookings))
  }
}

export async function fetchPackageBookingsAsync(email?: string): Promise<PackageBooking[]> {
  const localBookings = getSavedPackageBookings()
  const filteredLocal = email ? localBookings.filter((b) => b.memberEmail.toLowerCase() === email.toLowerCase()) : localBookings

  if (!isSupabaseConfigured || !supabase) return filteredLocal

  try {
    let query = supabase.from('package_bookings').select('*').order('created_at', { ascending: false })
    if (email) {
      query = query.eq('member_email', email)
    }

    const { data, error } = await query
    if (error) throw error

    if (data) {
      const mapped: PackageBooking[] = data.map((item) => ({
        id: item.id,
        memberEmail: item.member_email,
        packageName: item.package_name,
        scheduleDate: item.schedule_date,
        passengerName: item.passenger_name,
        passengerPhone: item.passenger_phone,
        amount: Number(item.amount),
        status: item.status as 'pending' | 'approved' | 'rejected',
        proofImage: item.proof_image,
        date: item.date_text,
      }))
      // Sync local cache
      if (!email) {
        savePackageBookings(mapped)
      }
      return mapped
    }
  } catch (err) {
    console.error('Error fetching bookings from Supabase:', err)
  }
  return filteredLocal
}

export async function submitPackageBookingAsync(
  packageName: string,
  scheduleDate: string,
  passengerName: string,
  passengerPhone: string,
  amount: number,
  proofImage: string,
  memberEmail: string
): Promise<boolean> {
  const newBooking: PackageBooking = {
    id: `book_${Date.now()}`,
    memberEmail,
    packageName,
    scheduleDate,
    passengerName,
    passengerPhone,
    amount,
    status: 'pending',
    proofImage,
    date: new Date().toLocaleDateString('id-ID'),
  }

  // 1. Local storage update
  const localList = getSavedPackageBookings()
  localList.unshift(newBooking)
  savePackageBookings(localList)

  // 2. Supabase insert
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('package_bookings').insert({
        member_email: memberEmail,
        package_name: packageName,
        schedule_date: scheduleDate,
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        amount,
        status: 'pending',
        proof_image: proofImage,
        date_text: newBooking.date,
      })
      if (error) throw error
    } catch (err) {
      console.error('Error submitting package booking to Supabase:', err)
      return false
    }
  }

  return true
}

export async function approvePackageBookingAsync(bookingId: string): Promise<{ success: boolean; message: string }> {
  // 1. Local fallback
  const localList = getSavedPackageBookings()
  const match = localList.find((b) => b.id === bookingId)
  if (match) {
    match.status = 'approved'
    savePackageBookings(localList)
  }

  // 2. Supabase update
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('package_bookings').update({ status: 'approved' }).eq('id', bookingId)
      if (error) throw error
    } catch (err) {
      console.error('Error approving booking in Supabase:', err)
      return { success: false, message: 'Gagal menyetujui pesanan.' }
    }
  }

  return { success: true, message: 'Pemesanan paket berhasil disetujui!' }
}

export async function rejectPackageBookingAsync(bookingId: string): Promise<{ success: boolean; message: string }> {
  // 1. Local fallback
  const localList = getSavedPackageBookings()
  const match = localList.find((b) => b.id === bookingId)
  if (match) {
    match.status = 'rejected'
    savePackageBookings(localList)
  }

  // 2. Supabase update
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('package_bookings').update({ status: 'rejected' }).eq('id', bookingId)
      if (error) throw error
    } catch (err) {
      console.error('Error rejecting booking in Supabase:', err)
      return { success: false, message: 'Gagal menolak pesanan.' }
    }
  }

  return { success: true, message: 'Pemesanan paket telah ditolak.' }
}

export async function initializeAndPlaceMemberAsync(recruitName: string, recruitEmail: string, sponsorEmail: string = 'member@abh.com'): Promise<{ success: boolean; message: string }> {
  // 1. Local fallback
  if (!isSupabaseConfigured || !supabase) {
    const state = getMatrixStateForEmail(sponsorEmail)
    
    // Create approved deposit request for record
    const newReq: DepositRequest = {
      id: `dep_${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID'),
      sponsorEmail,
      recruitName,
      recruitEmail,
      amount: state.settings.depositAmount,
      status: 'approved' as const,
      proofImage: '/images/proof-mock.png',
    }
    state.depositRequests.unshift(newReq)

    // Add sponsor reward transaction
    const sponsorTx: Transaction = {
      id: `tx_sp_${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID'),
      type: 'sponsor',
      amount: state.settings.sponsorReward,
      description: `Ujroh Sponsor Kemitraan: ${recruitName}`,
    }
    state.transactions.unshift(sponsorTx)
    state.balance += state.settings.sponsorReward
    state.downlinesCount += 1

    // Place on sponsor board
    if (!state.hasCompletedFly1) {
      const emptyIndex = state.fly1Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        state.fly1Board[emptyIndex] = { name: recruitName, email: recruitEmail, role: 'member' }
        const isFull = state.fly1Board.every((n) => n !== null)
        if (isFull) {
          state.hasCompletedFly1 = true
          state.balance += state.settings.fly1Reward
          state.transactions.unshift({
            id: `tx_fly1_${Date.now()}`,
            date: new Date().toLocaleDateString('id-ID'),
            type: 'fly1',
            amount: state.settings.fly1Reward,
            description: 'Bonus Pencairan Matriks Fly I (Pecah Belah Semangka)',
          })
          state.fly1Board = [
            { name: 'Diana', email: 'diana@email.com', role: 'member' },
            { name: 'Eko', email: 'eko@email.com', role: 'member' },
            { name: 'Fitri', email: 'fitri@email.com', role: 'member' },
            null, null, null, null
          ]
        }
      }
    } else if (!state.hasCompletedFly2) {
      const emptyIndex = state.fly2Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        state.fly2Board[emptyIndex] = { name: recruitName, email: recruitEmail, role: 'member' }
        const isFull = state.fly2Board.every((n) => n !== null)
        if (isFull) {
          state.hasCompletedFly2 = true
          state.balance += state.settings.fly2Reward
          state.transactions.unshift({
            id: `tx_fly2_${Date.now()}`,
            date: new Date().toLocaleDateString('id-ID'),
            type: 'fly2',
            amount: state.settings.fly2Reward,
            description: 'Bonus Pencairan Matriks Fly II (Fly Utama)',
          })
        }
      }
    }
    
    saveMatrixStateForEmail(sponsorEmail, state)
    return { success: true, message: 'Registrasi berhasil!' }
  }

  // 2. Real Supabase Implementation
  try {
    const state = await fetchMatrixStateAsync(sponsorEmail)
    const depositAmount = state.settings.depositAmount

    // Create approved deposit request for record
    await supabase.from('deposit_requests').insert({
      sponsor_email: sponsorEmail,
      recruit_name: recruitName,
      recruit_email: recruitEmail,
      amount: depositAmount,
      status: 'approved',
      proof_image: '/images/proof-mock.png',
    })

    // Seed matrix for new recruit
    const { data: recruitMM } = await supabase.from('member_matrix').select('*').eq('email', recruitEmail).maybeSingle()
    if (!recruitMM) {
      await supabase.from('member_matrix').insert({
        email: recruitEmail,
        balance: 0,
        downlines_count: 0,
        has_completed_fly1: false,
        has_completed_fly2: false,
      })

      const recruitNodes = [
        { member_email: recruitEmail, board_type: 'fly1', node_index: 0, name: recruitName, email: recruitEmail, is_user: true },
        ...Array.from({ length: 6 }).map((_, i) => ({
          member_email: recruitEmail,
          board_type: 'fly1',
          node_index: i + 1,
          name: null,
          email: null,
          is_user: false,
        })),
        { member_email: recruitEmail, board_type: 'fly2', node_index: 0, name: recruitName, email: recruitEmail, is_user: true },
        ...Array.from({ length: 14 }).map((_, i) => ({
          member_email: recruitEmail,
          board_type: 'fly2',
          node_index: i + 1,
          name: null,
          email: null,
          is_user: false,
        }))
      ]
      await supabase.from('matrix_nodes').insert(recruitNodes)
    }

    // Place recruit on sponsor's matrix
    const newBalance = state.balance + state.settings.sponsorReward
    const newDownlines = state.downlinesCount + 1

    await supabase.from('transactions').insert({
      member_email: sponsorEmail,
      date_text: new Date().toLocaleDateString('id-ID'),
      tx_type: 'sponsor',
      amount: state.settings.sponsorReward,
      description: `Ujroh Sponsor Kemitraan: ${recruitName}`,
    })

    if (!state.hasCompletedFly1) {
      const emptyIndex = state.fly1Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        await supabase
          .from('matrix_nodes')
          .update({ name: recruitName, email: recruitEmail })
          .eq('member_email', sponsorEmail)
          .eq('board_type', 'fly1')
          .eq('node_index', emptyIndex)

        state.fly1Board[emptyIndex] = { name: recruitName, email: recruitEmail, role: 'member' }
        const isFull = state.fly1Board.every((n) => n !== null)

        if (isFull) {
          const finalBalance = newBalance + state.settings.fly1Reward
          await supabase
            .from('member_matrix')
            .update({ balance: finalBalance, downlines_count: newDownlines, has_completed_fly1: true })
            .eq('email', sponsorEmail)

          await supabase.from('transactions').insert({
            member_email: sponsorEmail,
            date_text: new Date().toLocaleDateString('id-ID'),
            tx_type: 'fly1',
            amount: state.settings.fly1Reward,
            description: 'Bonus Pencairan Matriks Fly I (Pecah Belah Semangka)',
          })

          // Reset nodes in Fly I database
          await supabase.from('matrix_nodes').delete().eq('member_email', sponsorEmail).eq('board_type', 'fly1')
          const seedFly1 = [
            { member_email: sponsorEmail, board_type: 'fly1', node_index: 0, name: 'Diana', email: 'diana@email.com' },
            { member_email: sponsorEmail, board_type: 'fly1', node_index: 1, name: 'Eko', email: 'eko@email.com' },
            { member_email: sponsorEmail, board_type: 'fly1', node_index: 2, name: 'Fitri', email: 'fitri@email.com' },
            { member_email: sponsorEmail, board_type: 'fly1', node_index: 3, name: null, email: null },
            { member_email: sponsorEmail, board_type: 'fly1', node_index: 4, name: null, email: null },
            { member_email: sponsorEmail, board_type: 'fly1', node_index: 5, name: null, email: null },
            { member_email: sponsorEmail, board_type: 'fly1', node_index: 6, name: null, email: null },
          ]
          await supabase.from('matrix_nodes').insert(seedFly1)
        } else {
          await supabase
            .from('member_matrix')
            .update({ balance: newBalance, downlines_count: newDownlines })
            .eq('email', sponsorEmail)
        }
      }
    } else if (!state.hasCompletedFly2) {
      const emptyIndex = state.fly2Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        await supabase
          .from('matrix_nodes')
          .update({ name: recruitName, email: recruitEmail })
          .eq('member_email', sponsorEmail)
          .eq('board_type', 'fly2')
          .eq('node_index', emptyIndex)

        state.fly2Board[emptyIndex] = { name: recruitName, email: recruitEmail, role: 'member' }
        const isFull = state.fly2Board.every((n) => n !== null)

        if (isFull) {
          const finalBalance = newBalance + state.settings.fly2Reward
          await supabase
            .from('member_matrix')
            .update({ balance: finalBalance, downlines_count: newDownlines, has_completed_fly2: true })
            .eq('email', sponsorEmail)

          await supabase.from('transactions').insert({
            member_email: sponsorEmail,
            date_text: new Date().toLocaleDateString('id-ID'),
            tx_type: 'fly2',
            amount: state.settings.fly2Reward,
            description: 'Bonus Pencairan Matriks Fly II (Fly Utama)',
          })
        } else {
          await supabase
            .from('member_matrix')
            .update({ balance: newBalance, downlines_count: newDownlines })
            .eq('email', sponsorEmail)
        }
      }
    }

    return { success: true, message: 'Registrasi berhasil!' }
  } catch (err) {
    console.error('Error placing member:', err)
    return { success: false, message: 'Gagal menempatkan member di matriks.' }
  }
}

