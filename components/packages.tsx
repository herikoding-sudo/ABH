'use client'

import { useState, useEffect } from 'react'
import { Package as PackageIcon, Plane, CalendarDays, MessageCircle, Building, Gift, Check, X } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { type Package } from '@/lib/data'
import { getSavedPackages, getSavedPhone, fetchPackagesAsync, fetchSettingsAsync, getSession } from '@/lib/data-store'

function PackageCard({ p, phone }: { p: Package; phone: string }) {
  const cleanNumber = phone.replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${cleanNumber}?text=Halo%20Amanah%20Berkah%20Haromain,%20saya%2520tertarik%20dengan%20${encodeURIComponent(p.name)}%20harga%20${encodeURIComponent(p.price)}.`

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const session = getSession()
    if (session) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = `/login?tab=register&package=${encodeURIComponent(p.name)}`
    }
  }

  return (
    <article className="relative flex flex-col rounded-3xl bg-card p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 hover:ring-primary/30">
      {p.isPromo && (
        <span className="absolute -top-3 left-6 rounded-full bg-destructive px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-destructive-foreground shadow-sm">
          Promo Khusus
        </span>
      )}
      {p.isVIP && (
        <span className="absolute -top-3 left-6 rounded-full bg-gold px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm">
          VIP Class
        </span>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <CalendarDays className="size-3.5" />
          {p.days}
        </span>
      </div>

      <div className="mt-4">
        <span className="text-2xl font-extrabold text-primary">{p.price}</span>
      </div>

      <div className="mt-6 flex-1 space-y-4 border-t border-border pt-4 text-sm">
        <div className="flex gap-2.5">
          <Plane className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-semibold text-foreground leading-none">Maskapai</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.flight}</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <Building className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-semibold text-foreground leading-none">Hotel Madinah</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.madinahHotel}</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <Building className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-semibold text-foreground leading-none">Hotel Makkah</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.makkahHotel}</p>
          </div>
        </div>

        {p.bonus && p.bonus.length > 0 && (
          <div className="rounded-2xl bg-primary/5 p-3 ring-1 ring-primary/10">
            <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Gift className="size-3.5" />
              Bonus &amp; Fasilitas Ekstra:
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-foreground/80">
              {p.bonus.map((b) => (
                <li key={b} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <button
          onClick={handleRegisterClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 cursor-pointer"
        >
          <MessageCircle className="size-4" />
          Daftar Sekarang
        </button>
      </div>
    </article>
  )
}

export function Packages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [phone, setPhone] = useState('')

  useEffect(() => {
    // 1. Initial load from local storage
    setPackages(getSavedPackages())
    setPhone(getSavedPhone())

    // 2. Fetch revalidated fresh data
    fetchPackagesAsync().then((list) => setPackages(list))
    fetchSettingsAsync().then((settings) => setPhone(settings.phone))
  }, [])

  const includes = [
    'Akomodasi dari Daerah - jakarta',
    'Visa umroh',
    'Pembimbing ibadah .TL dari indonesia',
    'Guide / mutowif berpengalaman',
    'Ziaroh makkah madinah',
    'Free zam zam 5 liter',
    'Handling Bandara',
  ]

  const excludes = [
    'Pembuatan pasport',
    'Vaksin mininghitis & polio',
    'Keperluan pribadi (Loundry dll)',
  ]

  if (packages.length === 0) return null

  return (
    <section id="paket" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Layanan Terbaik"
          icon={PackageIcon}
          title="Pilihan Paket Umroh"
          desc="Tersedia berbagai pilihan paket terbaik yang dirancang untuk kenyamanan ibadah Anda dan keluarga menuju Baitullah."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard key={p.name} p={p} phone={phone} />
          ))}
        </div>

        {/* Include & Exclude Section */}
        <div className="mt-20 rounded-3xl bg-card p-8 ring-1 ring-border shadow-sm">
          <h3 className="text-center text-xl font-bold text-foreground md:text-2xl">
            Fasilitas Perjalanan (Include &amp; Exclude)
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
            Mohon perhatikan hal-hal yang sudah termasuk (include) dan belum termasuk (exclude) dalam harga paket.
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Include Card */}
            <div className="rounded-2xl bg-secondary/30 p-6 ring-1 ring-primary/5">
              <h4 className="flex items-center gap-2 text-base font-bold text-primary">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" />
                </span>
                Sudah Termasuk (Include)
              </h4>
              <ul className="mt-4 space-y-3">
                {includes.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclude Card */}
            <div className="rounded-2xl bg-secondary/30 p-6 ring-1 ring-destructive/5">
              <h4 className="flex items-center gap-2 text-base font-bold text-destructive">
                <span className="flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <X className="size-4" />
                </span>
                Belum Termasuk (Exclude)
              </h4>
              <ul className="mt-4 space-y-3">
                {excludes.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
