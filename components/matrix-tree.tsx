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
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 p-3 text-center transition-all duration-300 shadow-sm size-24 shrink-0"
        >
          <UserPlus className="size-5 text-slate-400 animate-pulse" />
          <span className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">KOSONG</span>
          <span className="text-[8px] text-slate-400">{levelName}</span>
        </div>
      )
    }

    const isUser = currentUserEmail 
      ? node.email?.toLowerCase() === currentUserEmail.toLowerCase()
      : !!node.isUser

    return (
      <div
        key={index}
        className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all duration-300 shadow-md size-24 shrink-0 ring-1 ring-black/5 ${
          isUser
            ? 'bg-primary text-primary-foreground font-extrabold border-2 border-primary animate-pulse'
            : 'bg-white text-slate-800 border border-slate-200'
        }`}
      >
        <User className={`size-5 ${isUser ? 'text-primary-foreground' : 'text-primary'}`} />
        <span className="mt-1 block max-w-full truncate text-[10px] font-bold" title={node.name}>
          {node.name}
        </span>
        <span className={`text-[8px] uppercase font-bold tracking-wider ${isUser ? 'text-primary-foreground/80' : 'text-slate-400'}`}>
          {levelName}
        </span>
      </div>
    )
  }

  if (type === 'fly1') {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center md:hidden mb-1.5 animate-pulse">
          <span>↔️ Geser layar untuk melihat seluruh matriks</span>
        </div>
        <div className="w-full overflow-x-auto py-6">
          <div className="min-w-[600px] flex flex-col items-center gap-12">
            {/* Row 1: Peak (Node 0) */}
            <div className="flex justify-center relative w-full">
              {renderNode(nodes[0], 0, 'Puncak (L1)')}
            </div>

            {/* Row 2: Mid (Nodes 1, 2) */}
            <div className="flex justify-between w-full max-w-[360px] relative px-4">
              {renderNode(nodes[1], 1, 'Sayap (L2)')}
              {renderNode(nodes[2], 2, 'Sayap (L2)')}
            </div>

            {/* Row 3: Base (Nodes 3, 4, 5, 6) */}
            <div className="flex justify-between w-full max-w-[560px] relative">
              {renderNode(nodes[3], 3, 'Dasar (L3)')}
              {renderNode(nodes[4], 4, 'Dasar (L3)')}
              {renderNode(nodes[5], 5, 'Dasar (L3)')}
              {renderNode(nodes[6], 6, 'Dasar (L3)')}
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
        <div className="min-w-[1000px] flex flex-col items-center gap-10">
          {/* Row 1: Peak (Node 0) */}
          <div className="flex justify-center relative w-full">
            {renderNode(nodes[0], 0, 'Puncak (L1)')}
          </div>

        {/* Row 2: Level 2 (Nodes 1, 2) */}
        <div className="flex justify-between w-full max-w-[480px] relative px-8">
          {renderNode(nodes[1], 1, 'Sayap (L2)')}
          {renderNode(nodes[2], 2, 'Sayap (L2)')}
        </div>

        {/* Row 3: Level 3 (Nodes 3, 4, 5, 6) */}
        <div className="flex justify-between w-full max-w-[720px] relative px-4">
          {renderNode(nodes[3], 3, 'Mitra (L3)')}
          {renderNode(nodes[4], 4, 'Mitra (L3)')}
          {renderNode(nodes[5], 5, 'Mitra (L3)')}
          {renderNode(nodes[6], 6, 'Mitra (L3)')}
        </div>

        {/* Row 4: Level 4 Base (Nodes 7 to 14) */}
        <div className="flex justify-between w-full max-w-[960px] relative">
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
  )
}
