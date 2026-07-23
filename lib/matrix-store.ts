import { supabase, isSupabaseConfigured } from './supabase'

export type MatrixNode = {
  name: string
  email: string
  role: string
  isUser?: boolean
  stars?: number
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
  let state: MatrixState
  if (saved) {
    state = JSON.parse(saved)
    if (!state.settings) state.settings = DEFAULT_SETTINGS
    if (!state.depositRequests) state.depositRequests = INITIAL_DEPOSIT_REQUESTS
  } else {
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

    state = {
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
    localStorage.setItem(`abh_matrix_state_${email}`, JSON.stringify(state))
  }

  // Local display sharing logic: Check if they are on any other active board
  let parentFly1Board = null
  let parentFly2Board = null

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('abh_matrix_state_')) {
      const parentEmail = key.replace('abh_matrix_state_', '')
      if (parentEmail.toLowerCase() !== email.toLowerCase()) {
        const parentStateStr = localStorage.getItem(key)
        if (parentStateStr) {
          const parentState = JSON.parse(parentStateStr) as MatrixState
          
          if (!parentState.hasCompletedFly1) {
            const isOnParentFly1 = parentState.fly1Board.some(n => n && n.email.toLowerCase() === email.toLowerCase())
            if (isOnParentFly1) {
              parentFly1Board = parentState.fly1Board
            }
          }
          
          if (!parentState.hasCompletedFly2) {
            const isOnParentFly2 = parentState.fly2Board.some(n => n && n.email.toLowerCase() === email.toLowerCase())
            if (isOnParentFly2) {
              parentFly2Board = parentState.fly2Board
            }
          }
        }
      }
    }
  }

  if (parentFly1Board) state.fly1Board = parentFly1Board
  if (parentFly2Board) state.fly2Board = parentFly2Board

  // Populate stars from local states
  const populateStarsForBoard = (board: MatrixNode[]) => {
    return board.map(n => {
      if (n && n.email) {
        const memberSaved = localStorage.getItem(`abh_matrix_state_${n.email}`)
        if (memberSaved) {
          const mState = JSON.parse(memberSaved) as MatrixState
          return { ...n, stars: mState.downlinesCount || 0 }
        }
        // Fallback for mock users
        if (n.email === 'member@abh.com') return { ...n, stars: 2 }
      }
      return n
    })
  }

  state.fly1Board = populateStarsForBoard(state.fly1Board)
  state.fly2Board = populateStarsForBoard(state.fly2Board)

  return state
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
export async function getActiveBoardOwnerAsync(email: string, boardType: 'fly1' | 'fly2'): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    // Local storage fallback
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('abh_matrix_state_')) {
        const parentEmail = key.replace('abh_matrix_state_', '')
        if (parentEmail.toLowerCase() !== email.toLowerCase()) {
          const parentStateStr = localStorage.getItem(key)
          if (parentStateStr) {
            const parentState = JSON.parse(parentStateStr) as MatrixState
            const isCompleted = boardType === 'fly1' ? parentState.hasCompletedFly1 : parentState.hasCompletedFly2
            if (!isCompleted) {
              const isOnParent = boardType === 'fly1'
                ? parentState.fly1Board.some(n => n && n.email.toLowerCase() === email.toLowerCase())
                : parentState.fly2Board.some(n => n && n.email.toLowerCase() === email.toLowerCase())
              if (isOnParent) {
                return parentEmail
              }
            }
          }
        }
      }
    }
    return email
  }

  try {
    const { data: parentNodes } = await supabase
      .from('matrix_nodes')
      .select('member_email')
      .eq('email', email)
      .eq('board_type', boardType)
      .neq('member_email', email)

    if (parentNodes && parentNodes.length > 0) {
      const ownerEmails = parentNodes.map(p => p.member_email)
      const { data: ownersStatus } = await supabase
        .from('member_matrix')
        .select('email, has_completed_fly1, has_completed_fly2')
        .in('email', ownerEmails)

      if (ownersStatus) {
        const activeOwner = parentNodes.find(p => {
          const status = ownersStatus.find(s => s.email.toLowerCase() === p.member_email.toLowerCase())
          if (!status) return false
          return boardType === 'fly1' ? !status.has_completed_fly1 : !status.has_completed_fly2
        })
        if (activeOwner) {
          return activeOwner.member_email
        }
      }
    }
  } catch (err) {
    console.error('Error finding active board owner:', err)
  }
  return email
}

export async function performFly1SplitAsync(boardOwnerEmail: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return

  try {
    // 1. Fetch all nodes of the board being split
    const { data: nodes } = await supabase
      .from('matrix_nodes')
      .select('*')
      .eq('member_email', boardOwnerEmail)
      .eq('board_type', 'fly1')
      .order('node_index')

    if (!nodes || nodes.length < 7) return

    // 2. Identify the 6 non-owner nodes (indices 1 to 6)
    const candidateNodes = nodes.filter(n => n.node_index > 0 && n.email)
    const candidateEmails = candidateNodes.map(n => n.email)

    // 3. Fetch downline counts (stars) for these 6 candidates
    const { data: candidatesDetails } = await supabase
      .from('member_matrix')
      .select('email, downlines_count')
      .in('email', candidateEmails)

    // Map candidate emails to stars & names
    const emailToNode = new Map<string, typeof candidateNodes[0]>()
    candidateNodes.forEach(n => {
      if (n.email) emailToNode.set(n.email.toLowerCase(), n)
    })

    const candidatesWithStars = candidateEmails.map(email => {
      const details = candidatesDetails?.find(c => c.email.toLowerCase() === email.toLowerCase())
      const stars = details ? details.downlines_count : 0
      const node = emailToNode.get(email.toLowerCase())
      return {
        email,
        name: node ? node.name : '',
        stars,
      }
    })

    // Sort by stars descending
    candidatesWithStars.sort((a, b) => b.stars - a.stars)

    // Top 2 become the new board owners (leaders)
    const leaderA = candidatesWithStars[0] || null
    const leaderB = candidatesWithStars[1] || null

    // Remaining 4 become the wings
    const wing1 = candidatesWithStars[2] || null
    const wing2 = candidatesWithStars[3] || null
    const wing3 = candidatesWithStars[4] || null
    const wing4 = candidatesWithStars[5] || null

    // 4. Reset/delete old board nodes for boardOwnerEmail
    await supabase
      .from('matrix_nodes')
      .delete()
      .eq('member_email', boardOwnerEmail)
      .eq('board_type', 'fly1')

    // 5. Seed Leader A's board
    if (leaderA) {
      // Delete any existing fly1 nodes for Leader A to avoid duplicate key conflicts
      await supabase.from('matrix_nodes').delete().eq('member_email', leaderA.email).eq('board_type', 'fly1')
      
      const seedA = [
        { member_email: leaderA.email, board_type: 'fly1', node_index: 0, name: leaderA.name, email: leaderA.email, is_user: true },
        { member_email: leaderA.email, board_type: 'fly1', node_index: 1, name: wing1 ? wing1.name : null, email: wing1 ? wing1.email : null, is_user: false },
        { member_email: leaderA.email, board_type: 'fly1', node_index: 2, name: wing2 ? wing2.name : null, email: wing2 ? wing2.email : null, is_user: false },
        { member_email: leaderA.email, board_type: 'fly1', node_index: 3, name: null, email: null, is_user: false },
        { member_email: leaderA.email, board_type: 'fly1', node_index: 4, name: null, email: null, is_user: false },
        { member_email: leaderA.email, board_type: 'fly1', node_index: 5, name: null, email: null, is_user: false },
        { member_email: leaderA.email, board_type: 'fly1', node_index: 6, name: null, email: null, is_user: false },
      ]
      await supabase.from('matrix_nodes').insert(seedA)
    }

    // 6. Seed Leader B's board
    if (leaderB) {
      // Delete any existing fly1 nodes for Leader B to avoid duplicate key conflicts
      await supabase.from('matrix_nodes').delete().eq('member_email', leaderB.email).eq('board_type', 'fly1')
      
      const seedB = [
        { member_email: leaderB.email, board_type: 'fly1', node_index: 0, name: leaderB.name, email: leaderB.email, is_user: true },
        { member_email: leaderB.email, board_type: 'fly1', node_index: 1, name: wing3 ? wing3.name : null, email: wing3 ? wing3.email : null, is_user: false },
        { member_email: leaderB.email, board_type: 'fly1', node_index: 2, name: wing4 ? wing4.name : null, email: wing4 ? wing4.email : null, is_user: false },
        { member_email: leaderB.email, board_type: 'fly1', node_index: 3, name: null, email: null, is_user: false },
        { member_email: leaderB.email, board_type: 'fly1', node_index: 4, name: null, email: null, is_user: false },
        { member_email: leaderB.email, board_type: 'fly1', node_index: 5, name: null, email: null, is_user: false },
        { member_email: leaderB.email, board_type: 'fly1', node_index: 6, name: null, email: null, is_user: false },
      ]
      await supabase.from('matrix_nodes').insert(seedB)
    }
  } catch (err) {
    console.error('Error splitting Fly I board:', err)
  }
}

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
    const activeEmail = providedEmail || getActiveUserEmail()
    let balance = 0
    let downlinesCount = 0
    let hasCompletedFly1 = false
    let hasCompletedFly2 = false

    const { data: memberData } = await supabase.from('member_matrix').select('*').eq('email', activeEmail).single()
    if (memberData) {
      balance = Number(memberData.balance)
      downlinesCount = memberData.downlines_count
      hasCompletedFly1 = memberData.has_completed_fly1
      hasCompletedFly2 = memberData.has_completed_fly2
    } else {
      // Create record
      await supabase.from('member_matrix').insert({ email: activeEmail, balance: 0, downlines_count: 0 })
    }

    // Determine shared board owners dynamically for Fly 1 and Fly 2 boards:
    const boardEmailFly1 = await getActiveBoardOwnerAsync(activeEmail, 'fly1')
    const boardEmailFly2 = await getActiveBoardOwnerAsync(activeEmail, 'fly2')

    // 3. Fetch nodes
    let fly1Board = [...INITIAL_FLY1_BOARD]
    let fly2Board = [...INITIAL_FLY2_BOARD]

    // Fetch Fly 1 nodes using boardEmailFly1
    const { data: nodesDataFly1 } = await supabase
      .from('matrix_nodes')
      .select('*')
      .eq('member_email', boardEmailFly1)
      .eq('board_type', 'fly1')

    if (nodesDataFly1 && nodesDataFly1.length > 0) {
      const fly1Arr = Array(7).fill(null)
      nodesDataFly1.forEach((n) => {
        if (n.node_index < 7) {
          fly1Arr[n.node_index] = n.name ? { name: n.name, email: n.email, role: 'member', isUser: n.is_user } : null
        }
      })
      fly1Board = fly1Arr
    } else {
      // Seed Fly 1 nodes
      const seedPayloadFly1 = INITIAL_FLY1_BOARD.map((item, idx) => ({
        member_email: boardEmailFly1,
        board_type: 'fly1',
        node_index: idx,
        name: item?.name || null,
        email: item?.email || null,
        is_user: !!item?.isUser,
      }))
      await supabase.from('matrix_nodes').insert(seedPayloadFly1)
    }

    // Fetch Fly 2 nodes using boardEmailFly2
    const { data: nodesDataFly2 } = await supabase
      .from('matrix_nodes')
      .select('*')
      .eq('member_email', boardEmailFly2)
      .eq('board_type', 'fly2')

    if (nodesDataFly2 && nodesDataFly2.length > 0) {
      const fly2Arr = Array(15).fill(null)
      nodesDataFly2.forEach((n) => {
        if (n.node_index < 15) {
          fly2Arr[n.node_index] = n.name ? { name: n.name, email: n.email, role: 'member', isUser: n.is_user } : null
        }
      })
      fly2Board = fly2Arr
    } else {
      // Seed Fly 2 nodes
      const seedPayloadFly2 = INITIAL_FLY2_BOARD.map((item, idx) => ({
        member_email: boardEmailFly2,
        board_type: 'fly2',
        node_index: idx,
        name: item?.name || null,
        email: item?.email || null,
        is_user: !!item?.isUser,
      }))
      await supabase.from('matrix_nodes').insert(seedPayloadFly2)
    }

    // Fetch and populate stars (downlines_count) for all node emails
    const allNodeEmails: string[] = []
    fly1Board.forEach(n => { if (n && n.email) allNodeEmails.push(n.email) })
    fly2Board.forEach(n => { if (n && n.email) allNodeEmails.push(n.email) })

    if (allNodeEmails.length > 0) {
      const { data: membersDetails } = await supabase
        .from('member_matrix')
        .select('email, downlines_count')
        .in('email', allNodeEmails)

      if (membersDetails) {
        const emailToStars = new Map<string, number>()
        membersDetails.forEach(m => {
          emailToStars.set(m.email.toLowerCase(), m.downlines_count)
        })

        fly1Board = fly1Board.map(n => {
          if (n && n.email) {
            return { ...n, stars: emailToStars.get(n.email.toLowerCase()) || 0 }
          }
          return n
        })

        fly2Board = fly2Board.map(n => {
          if (n && n.email) {
            return { ...n, stars: emailToStars.get(n.email.toLowerCase()) || 0 }
          }
          return n
        })
      }
    }

    // 4. Fetch transactions for activeEmail
    let transactions: Transaction[] = []
    const { data: txsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('member_email', activeEmail)
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

    const activeBoardOwnerFly1 = await getActiveBoardOwnerAsync(email, 'fly1')
    const activeBoardOwnerFly2 = await getActiveBoardOwnerAsync(email, 'fly2')

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
          .eq('member_email', activeBoardOwnerFly1)
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

          // Perform real matrix split for Fly I
          await performFly1SplitAsync(activeBoardOwnerFly1)

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
          .eq('member_email', activeBoardOwnerFly2)
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
    const isAdmin = email.toLowerCase() === 'admin@abh.com' || email.toLowerCase() === 'superadmin@abh.com'

    if (isAdmin) {
      // 1. Wipe all test users and data except default accounts
      const defaultEmails = ['member@abh.com', 'admin@abh.com', 'superadmin@abh.com']
      
      await supabase.from('matrix_nodes').delete().not('member_email', 'in', `(${defaultEmails.join(',')})`)
      await supabase.from('member_matrix').delete().not('email', 'in', `(${defaultEmails.join(',')})`)
      await supabase.from('transactions').delete().not('member_email', 'in', `(${defaultEmails.join(',')})`)
      await supabase.from('deposit_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000') // delete all
      await supabase.from('user_accounts').delete().not('email', 'in', `(${defaultEmails.join(',')})`)

      // 2. Restore default member@abh.com stats
      await supabase.from('member_matrix')
        .update({ balance: 1250000, downlines_count: 5, has_completed_fly1: false, has_completed_fly2: false })
        .eq('email', 'member@abh.com')

      // 3. Restore default member@abh.com Fly 1 and Fly 2 nodes
      await supabase.from('matrix_nodes').delete().eq('member_email', 'member@abh.com')
      
      const defaultNodesFly1 = [
        { member_email: 'member@abh.com', board_type: 'fly1', node_index: 0, name: 'Ahmad (Member)', email: 'member@abh.com', is_user: true },
        { member_email: 'member@abh.com', board_type: 'fly1', node_index: 1, name: 'Farhan', email: 'farhan@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly1', node_index: 2, name: 'Diana', email: 'diana@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly1', node_index: 3, name: 'Eko', email: 'eko@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly1', node_index: 4, name: 'Fitri', email: 'fitri@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly1', node_index: 5, name: null, email: null, is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly1', node_index: 6, name: null, email: null, is_user: false },
      ]
      const defaultNodesFly2 = [
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 0, name: 'Ahmad (Member)', email: 'member@abh.com', is_user: true },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 1, name: 'Sponsor A', email: 'sp_a@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 2, name: 'Sponsor B', email: 'sp_b@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 3, name: 'Mitra C', email: 'm_c@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 4, name: 'Mitra D', email: 'm_d@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 5, name: 'Mitra E', email: 'm_e@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 6, name: 'Mitra F', email: 'm_f@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 7, name: 'Mitra G', email: 'm_g@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 8, name: 'Mitra H', email: 'm_h@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 9, name: 'Mitra I', email: 'm_i@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 10, name: 'Mitra J', email: 'm_j@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 11, name: 'Mitra K', email: 'm_k@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 12, name: 'Mitra L', email: 'm_l@email.com', is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 13, name: null, email: null, is_user: false },
        { member_email: 'member@abh.com', board_type: 'fly2', node_index: 14, name: null, email: null, is_user: false },
      ]
      await supabase.from('matrix_nodes').insert([...defaultNodesFly1, ...defaultNodesFly2])
    } else {
      // Normal single user reset
      await supabase.from('member_matrix').delete().eq('email', email)
      await supabase.from('matrix_nodes').delete().eq('member_email', email)
      await supabase.from('transactions').delete().eq('member_email', email)
      await supabase.from('deposit_requests').delete().eq('sponsor_email', email)
      await supabase.from('package_bookings').delete().eq('member_email', email)
    }

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

    const activeBoardOwnerFly1 = await getActiveBoardOwnerAsync(sponsorEmail, 'fly1')
    const activeBoardOwnerFly2 = await getActiveBoardOwnerAsync(sponsorEmail, 'fly2')

    if (!state.hasCompletedFly1) {
      const emptyIndex = state.fly1Board.findIndex((n) => n === null)
      if (emptyIndex !== -1) {
        await supabase
          .from('matrix_nodes')
          .update({ name: recruitName, email: recruitEmail })
          .eq('member_email', activeBoardOwnerFly1)
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

          // Perform real matrix split for Fly I
          await performFly1SplitAsync(activeBoardOwnerFly1)
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
          .eq('member_email', activeBoardOwnerFly2)
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

