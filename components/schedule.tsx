'use client'

import { useState, useEffect } from 'react'
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Plane,
  MapPin,
  Train,
  MessageCircle,
} from 'lucide-react'
import { SectionHeading } from './section-heading'
import { type Schedule } from '@/lib/data'
import { getSavedSchedules, getSavedWhatsappUrl, fetchSchedulesAsync, fetchSettingsAsync } from '@/lib/data-store'

function ScheduleCard({ s, whatsappUrl }: { s: Schedule; whatsappUrl: string }) {
  const full = s.status === 'full'
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:ring-primary/20">
      <div className="relative h-40 overflow-hidden">
        <img
          src={s.image || '/placeholder.svg'}
          alt={s.name}
          className="size-full object-cover"
        />
        {s.allIn && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-foreground shadow">
            ALL IN
          </span>
        )}
        {full && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="-rotate-12 rounded-lg border-2 border-destructive px-4 py-1 text-lg font-extrabold uppercase tracking-wide text-destructive">
              Fully Booked
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <CalendarDays className="size-4" />
          {s.date}
        </div>
        <h3 className="mt-2 text-lg font-bold text-foreground">{s.name}</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {s.tags?.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
            >
              <Train className="size-3" />
              {t}
            </span>
          ))}
        </div>

        <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground shrink-0 mt-0.5">
              <Clock className="size-4" /> Durasi
            </dt>
            <dd className="font-semibold text-foreground text-right">{s.duration}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground shrink-0 mt-0.5">
              <Plane className="size-4" /> Flight
            </dt>
            <dd className="font-semibold text-foreground text-right text-xs leading-normal max-w-[65%] break-words">
              {s.flight}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground shrink-0 mt-0.5">
              <MapPin className="size-4" /> Landing
            </dt>
            <dd className="font-semibold text-foreground text-right">{s.landing}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Harga Mulai</p>
            <p className="text-lg font-extrabold text-primary">{s.price}</p>
          </div>
          {full ? (
            <span className="cursor-not-allowed rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-white">
              Penuh
            </span>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#10854c] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6e3e]"
            >
              <MessageCircle className="size-4" />
              Booking
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export function Schedule() {
  const [schedulesList, setSchedulesList] = useState<Schedule[]>([])
  const [whatsappUrl, setWhatsappUrl] = useState('')

  useEffect(() => {
    // 1. Initial load from local storage
    setSchedulesList(getSavedSchedules())
    setWhatsappUrl(getSavedWhatsappUrl())

    // 2. Fetch revalidated fresh data
    fetchSchedulesAsync().then((list) => setSchedulesList(list))
    fetchSettingsAsync().then(() => setWhatsappUrl(getSavedWhatsappUrl()))
  }, [])

  if (schedulesList.length === 0) return null

  return (
    <section id="jadwal" className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Seat Confirm"
          icon={CalendarCheck}
          title="Jadwal Keberangkatan Terdekat, Seat Sangat Terbatas!"
          desc="Jangan sampai kehabisan. Keberangkatan tersedia setiap bulan dengan berbagai pilihan paket. Amankan seat Anda sekarang sebelum terlambat."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {schedulesList.map((s, i) => (
            <ScheduleCard key={`${s.name}-${i}`} s={s} whatsappUrl={whatsappUrl} />
          ))}
        </div>
      </div>
    </section>
  )
}
