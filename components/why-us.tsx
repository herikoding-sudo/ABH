import {
  ThumbsUp,
  BadgeCheck,
  ShieldCheck,
  Star,
  Clock,
  GraduationCap,
  Heart,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeading } from './section-heading'
import { features } from '@/lib/data'

const iconMap: Record<string, LucideIcon> = {
  BadgeCheck,
  ShieldCheck,
  Star,
  Clock,
  GraduationCap,
  Heart,
}

export function WhyUs() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Mengapa Memilih Kami?"
          icon={ThumbsUp}
          title="Ribuan Jamaah Percaya, Ini Alasannya"
          desc="Tidak semua travel umroh sama. Amanah Berkah Haromain hadir dengan pelayanan amanah, izin lengkap, dan komitmen pelayanan terbaik untuk Anda."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = iconMap[f.icon] ?? BadgeCheck
            return (
              <div key={f.title} className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Icon className="size-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
