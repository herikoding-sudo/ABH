export function Logo({ className, light = false, size = 'md' }: { className?: string; light?: boolean; size?: 'md' | 'lg' }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <div className={`rounded-xl px-2 py-1 ${light ? 'bg-white' : ''}`}>
        <img
          src="/logo.png"
          alt="Amanah Berkah Haromain"
          className={`${size === 'lg' ? 'h-40' : 'h-20'} w-auto object-contain`}
        />
      </div>
    </div>
  )
}
