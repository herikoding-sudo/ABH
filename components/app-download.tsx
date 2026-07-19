import { Smartphone, Check, Play } from 'lucide-react'

const perks = ['Banyak Diskon', 'Pembayaran Lebih Mudah', 'Banyak Pilihan Paket', 'Fitur Lengkap']

export function AppDownload() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <div
          className="relative overflow-hidden rounded-[2rem]"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.42 0.13 250) 0%, oklch(0.72 0.16 230) 100%)',
          }}
        >
          <img
            src="/images/app-phone.png"
            alt="Aplikasi Amanah Berkah Haromain di smartphone"
            className="h-[420px] w-full object-cover"
          />
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/15">
            <Smartphone className="size-4" />
            ABH Mobile
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Rencanakan Ibadah &amp; Haji Anda Dengan Lebih Mudah!
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Kini Amanah Berkah Haromain hadir dalam genggaman Anda. Temukan paket umroh, haji
            plus, dan pelayanan terpercaya cukup dari satu aplikasi.
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-foreground/80">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <a
            href="#"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-90"
          >
            <Play className="size-6 fill-current" />
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase tracking-wide opacity-80">
                Get it on
              </span>
              <span className="text-base font-bold">Google Play</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
