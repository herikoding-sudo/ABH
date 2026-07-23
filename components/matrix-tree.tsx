import { type MatrixNode } from '@/lib/matrix-store'
import { User, UserPlus } from 'lucide-react'

type TreeProps = {
  nodes: MatrixNode[]
  type: 'fly1' | 'fly2'
  currentUserEmail?: string
}

export function MatrixTree({ nodes, type, currentUserEmail }: TreeProps) {
  // Helper to render a single node
  const renderNode = (node: MatrixNode, index: number, levelName: string) => {
    if (!node) {
      return (
        <div
          key={index}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-250 bg-slate-50/50 p-3 text-center transition-all duration-300 shadow-sm hover:bg-slate-50 hover:border-primary/40 size-24 shrink-0 z-10"
        >
          <div className="p-2.5 rounded-full bg-slate-100 text-slate-400">
            <UserPlus className="size-4 animate-pulse" />
          </div>
          <span className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">KOSONG</span>
          <span className="text-[7px] text-slate-400 font-medium">{levelName}</span>
        </div>
      )
    }

    const isUser = currentUserEmail 
      ? node.email?.toLowerCase() === currentUserEmail.toLowerCase()
      : !!node.isUser

    return (
      <div
        key={index}
        className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all duration-350 shadow-md size-24 shrink-0 ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-lg z-10 ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-primary-foreground font-extrabold border border-blue-400/30 ring-4 ring-blue-500/20 scale-105'
            : 'bg-gradient-to-br from-white to-slate-50 text-slate-800 border border-slate-200 hover:border-blue-400'
        }`}
      >
        <div className={`p-2 rounded-full ${isUser ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
          <User className="size-4.5" />
        </div>
        <span className="mt-1 block max-w-full truncate text-[9.5px] font-bold" title={node.name}>
          {node.name}
        </span>
        <span className={`text-[7.5px] uppercase font-bold tracking-wider ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
          {levelName}
        </span>
        {node.stars !== undefined && node.stars > 0 && (
          <div className={`mt-1 flex justify-center gap-0.5 rounded-full px-1.5 py-0.5 ${
            isUser ? 'bg-white/10' : 'bg-slate-100'
          }`}>
            {Array.from({ length: node.stars }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-[10px] leading-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]">★</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Fly I (7 Nodes)
  if (type === 'fly1') {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center md:hidden mb-1.5 animate-pulse">
          <span>↔️ Geser layar untuk melihat seluruh matriks</span>
        </div>
        <div className="w-full overflow-x-auto py-6">
          <div className="min-w-[600px] relative mx-auto" style={{ width: '600px', height: '420px' }}>
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-0" viewBox="0 0 600 420" fill="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Peak to Wings */}
              <path d="M 300 56 C 300 120, 184 120, 184 196" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5 4" />
              <path d="M 300 56 C 300 120, 416 120, 416 196" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5 4" />
              {/* Left Wing to Base 1 & 2 */}
              <path d="M 184 196 C 184 260, 68 260, 68 336" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 184 196 C 184 260, 222 260, 222 336" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              {/* Right Wing to Base 3 & 4 */}
              <path d="M 416 196 C 416 260, 378 260, 378 336" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 416 196 C 416 260, 532 260, 532 336" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Nodes Grid */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-2">
              {/* Row 1: Peak */}
              <div className="flex justify-center w-full">
                {renderNode(nodes[0], 0, 'Puncak (L1)')}
              </div>

              {/* Row 2: Wings */}
              <div className="flex justify-between w-full max-w-[360px] px-4">
                {renderNode(nodes[1], 1, 'Sayap (L2)')}
                {renderNode(nodes[2], 2, 'Sayap (L2)')}
              </div>

              {/* Row 3: Base */}
              <div className="flex justify-between w-full max-w-[560px]">
                {renderNode(nodes[3], 3, 'Dasar (L3)')}
                {renderNode(nodes[4], 4, 'Dasar (L3)')}
                {renderNode(nodes[5], 5, 'Dasar (L3)')}
                {renderNode(nodes[6], 6, 'Dasar (L3)')}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fly II (15 Nodes)
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center md:hidden mb-1.5 animate-pulse">
        <span>↔️ Geser layar untuk melihat seluruh matriks</span>
      </div>
      <div className="w-full overflow-x-auto py-6">
        <div className="min-w-[1000px] relative mx-auto" style={{ width: '1000px', height: '520px' }}>
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-0" viewBox="0 0 1000 520" fill="none">
            <defs>
              <linearGradient id="lineGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Peak to Wings */}
            <path d="M 500 56 C 500 120, 340 120, 340 200" stroke="url(#lineGrad2)" strokeWidth="2.5" strokeDasharray="5 4" />
            <path d="M 500 56 C 500 120, 660 120, 660 200" stroke="url(#lineGrad2)" strokeWidth="2.5" strokeDasharray="5 4" />
            
            {/* Left Wing to Level 3 */}
            <path d="M 340 200 C 340 270, 204 270, 204 344" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 340 200 C 340 270, 401 270, 401 344" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Right Wing to Level 3 */}
            <path d="M 660 200 C 660 270, 599 270, 599 344" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 660 200 C 660 270, 796 270, 796 344" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Level 3 to Base (Level 4) */}
            {/* Node 3 connections */}
            <path d="M 204 344 C 204 410, 68 410, 68 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 204 344 C 204 410, 191 410, 191 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Node 4 connections */}
            <path d="M 401 344 C 401 410, 315 410, 315 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 401 344 C 401 410, 438 410, 438 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Node 5 connections */}
            <path d="M 599 344 C 599 410, 562 410, 562 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 599 344 C 599 410, 685 410, 685 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Node 6 connections */}
            <path d="M 796 344 C 796 410, 808 410, 808 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 796 344 C 796 410, 932 410, 932 480" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>

          {/* Nodes Grid */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-2">
            {/* Row 1: Peak */}
            <div className="flex justify-center w-full">
              {renderNode(nodes[0], 0, 'Puncak (L1)')}
            </div>

            {/* Row 2: Wings */}
            <div className="flex justify-between w-full max-w-[480px] px-8">
              {renderNode(nodes[1], 1, 'Sayap (L2)')}
              {renderNode(nodes[2], 2, 'Sayap (L2)')}
            </div>

            {/* Row 3: Level 3 */}
            <div className="flex justify-between w-full max-w-[720px] px-4">
              {renderNode(nodes[3], 3, 'Mitra (L3)')}
              {renderNode(nodes[4], 4, 'Mitra (L3)')}
              {renderNode(nodes[5], 5, 'Mitra (L3)')}
              {renderNode(nodes[6], 6, 'Mitra (L3)')}
            </div>

            {/* Row 4: Base */}
            <div className="flex justify-between w-full max-w-[960px]">
              {renderNode(nodes[7], 7, 'Dasar (L4)')}
              {renderNode(nodes[8], 8, 'Dasar (L4)')}
              {renderNode(nodes[9], 9, 'Dasar (L4)')}
              {renderNode(nodes[10], 10, 'Dasar (L4)')}
              {renderNode(nodes[11], 11, 'Dasar (L4)')}
              {renderNode(nodes[12], 12, 'Dasar (L4)')}
              {renderNode(nodes[13], 13, 'Dasar (L4)')}
              {renderNode(nodes[14], 14, 'Dasar (L4)')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
