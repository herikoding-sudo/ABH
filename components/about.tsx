import { ThumbsUp, MessageCircle } from 'lucide-react'
import { WHATSAPP_URL } from '@/lib/data'

export function About() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/15">
            <ThumbsUp className="size-4" />
            Amanah Berkah Haromain
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Travel Umroh, Haji dan Wisata Halal Terbaik, Aman dan Nyaman
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Travel Umroh resmi dan terpercaya yang bermitra dengan maskapai ternama dan jaringan hotel terbaik di Arab Saudi untuk kenyamanan ibadah Anda.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            <span className="font-semibold text-primary">Amanah Berkah Haromain</span> berkomitmen memberikan pelayanan prima bagi jamaah ke Tanah Suci dengan fasilitas terbaik demi Keamanan &amp; Kenyamanan ibadah Anda.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#10854c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c6e3e]"
            >
              <MessageCircle className="size-4" />
              Konsultasi Gratis
            </a>
            <a
              href="#paket"
              className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-secondary"
            >
              Selengkapnya
            </a>
          </div>
        </div>

        <div className="relative">
          <div
            className="overflow-hidden rounded-[2rem] p-2"
            style={{
              background:
                'linear-gradient(135deg, oklch(0.45 0.13 250) 0%, oklch(0.7 0.16 230) 100%)',
            }}
          >
            <img
              src="/images/mou-saudi.png"
              alt="Amanah Berkah Haromain Travel"
              className="h-[420px] w-full rounded-[1.6rem] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
