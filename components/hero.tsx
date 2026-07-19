import { MessageCircle } from 'lucide-react'
import { WHATSAPP_URL } from '@/lib/data'

export function Hero() {
  return (
    <section
      id="beranda"
      className="relative flex min-h-[92vh] items-center overflow-hidden"
    >
      <img
        src="/images/hero-kaaba.png"
        alt="Ka'bah di Masjidil Haram dikelilingi para jamaah"
        className="absolute inset-0 size-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, oklch(0.42 0.13 250 / 0.92) 0%, oklch(0.52 0.15 240 / 0.82) 45%, oklch(0.60 0.16 230 / 0.55) 100%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 pt-28 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur">
          Travel Berizin Resmi PPIU &amp; PIHK
        </span>
        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
          Travel Umroh, Haji dan Wisata Halal Terbaik di Indonesia
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/90 md:text-lg">
          Wujudkan niat suci Anda bersama pembimbing berpengalaman dan fasilitas
          bintang lima. Berangkat dengan tenang, beribadah dengan khusyuk bersama
          travel berizin resmi PPIU.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#10854c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-[#0c6e3e] hover:scale-[1.03]"
          >
            <MessageCircle className="size-5" />
            Konsultasi Gratis
          </a>
          <a
            href="#paket"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur transition-colors hover:bg-white/20"
          >
            Lihat Paket Umroh
          </a>
        </div>

        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { n: '25.000+', l: 'Jamaah Berangkat' },
            { n: 'Sejak 1996', l: 'Berpengalaman' },
            { n: 'PPIU & PIHK', l: 'Izin Resmi Kemenag' },
            { n: '4.9/5', l: 'Rating Jamaah' },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/20 backdrop-blur"
            >
              <dt className="text-xl font-extrabold text-white md:text-2xl">
                {s.n}
              </dt>
              <dd className="mt-1 text-xs text-white/80">{s.l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
