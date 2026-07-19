import { Video, Star, Quote } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { testimonials } from '@/lib/data'

export function Testimonials() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Testimoni Jamaah"
          icon={Video}
          title="Review Jujur Jamaah Umroh"
          desc="Kami percaya, kepercayaan lahir dari pengalaman nyata. Itulah mengapa kami menampilkan review apa adanya dari jamaah."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-3xl bg-card p-6 ring-1 ring-border"
            >
              <Quote className="size-8 text-primary/25" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">
                {t.text}
              </blockquote>
              <div className="mt-4 flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <figcaption className="mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {t.name.split(' ').slice(-1)[0].charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
