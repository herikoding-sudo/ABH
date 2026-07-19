'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, MapPin, Phone, Mail } from 'lucide-react'
import { Logo } from './logo'
import { getSavedWhatsappUrl, getSavedPhone, fetchSettingsAsync } from '@/lib/data-store'

function IconInstagram({ className }: { className?: string }) {

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
    </svg>
  )
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  )
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
    </svg>
  )
}

export function SiteFooter() {
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    setWhatsappUrl(getSavedWhatsappUrl())
    setPhone(getSavedPhone())
    fetchSettingsAsync().then((settings) => {
      setWhatsappUrl(getSavedWhatsappUrl())
      setPhone(settings.phone)
    })
  }, [])

  return (
    <footer id="footer">
      {/* CTA banner */}
      <div className="bg-background px-4 pb-20 pt-4">
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-14 text-center"
          style={{
            background:
              'linear-gradient(120deg, oklch(0.4 0.13 250) 0%, oklch(0.58 0.16 235) 100%)',
          }}
        >
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold text-white md:text-4xl">
            Siap Berangkat ke Tanah Suci Bersama Amanah Berkah Haromain?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-white/85">
            Konsultasikan rencana ibadah Anda sekarang. Tim kami siap membantu
            memilih paket terbaik sesuai kebutuhan Anda.
          </p>
          <a
            href={whatsappUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#10854c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#0c6e3e] hover:scale-[1.03]"
          >
            <MessageCircle className="size-5" />
            Konsultasi Gratis Sekarang
          </a>
        </div>
      </div>

      {/* Footer content */}
      <div className="bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-background/70">
              Travel Umroh dan Haji terpercaya berizin resmi PPIU &amp; PIHK dari Kemenag RI. Menjamin kenyamanan dan kekhusyukan ibadah Anda.
            </p>
            <div className="mt-5 flex gap-3">
              {[IconInstagram, IconFacebook, IconYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Media sosial Amanah Berkah Haromain"
                  className="flex size-9 items-center justify-center rounded-lg bg-background/10 transition-colors hover:bg-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">Paket</h3>
            <ul className="mt-4 space-y-2 text-sm text-background/70">
              {['Umroh Reguler', 'Umroh Plus', 'Haji Khusus', 'Wisata Halal', 'Program Wakaf'].map(
                (l) => (
                  <li key={l}>
                    <a href="#paket" className="transition-colors hover:text-primary">
                      {l}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">
              Perusahaan
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-background/70">
              {['Tentang Kami', 'Legalitas', 'Jadwal Umroh', 'Testimoni', 'Blog & Artikel'].map(
                (l) => (
                  <li key={l}>
                    <a href="#beranda" className="transition-colors hover:text-primary">
                      {l}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">Kontak</h3>
            <ul className="mt-4 space-y-3 text-sm text-background/70">
              <li className="flex gap-3">
                <MapPin className="size-4 shrink-0 text-primary" />
                Jl. Terusan Kopo No. 100, Bandung, Jawa Barat, Indonesia
              </li>
              <li className="flex gap-3">
                <Phone className="size-4 shrink-0 text-primary" />
                {phone || '0895-1844-3354'}
              </li>
              <li className="flex gap-3">
                <Mail className="size-4 shrink-0 text-primary" />
                info@amanahberkahharomain.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-background/60 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Amanah Berkah Haromain. Seluruh hak cipta dilindungi.</p>
            <p>Izin Resmi PPIU &amp; PIHK &middot; Terintegrasi Siskopatuh Kemenag RI</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
