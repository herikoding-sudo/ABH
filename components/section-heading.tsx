import type { LucideIcon } from 'lucide-react'

export function SectionHeading({
  eyebrow,
  icon: Icon,
  title,
  desc,
}: {
  eyebrow: string
  icon: LucideIcon
  title: string
  desc?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/15">
        <Icon className="size-4" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-balance text-3xl font-extrabold text-foreground md:text-4xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          {desc}
        </p>
      )}
    </div>
  )
}
