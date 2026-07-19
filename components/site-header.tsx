'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Menu, X, User } from 'lucide-react'
import { Logo } from './logo'
import { getSession } from '@/lib/data-store'

const navItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Jadwal Umroh', href: '#jadwal', hasDropdown: true },
  { label: 'Paket Umroh', href: '#paket', hasDropdown: true },
  { label: 'Wisata Halal', href: '#layanan' },
  { label: 'Haji Khusus', href: '#layanan' },
  { label: 'Info Lainnya', href: '#footer', hasDropdown: true },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const session = getSession()
    setIsLoggedIn(!!session)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-card px-5 py-3 shadow-lg shadow-black/5 ring-1 ring-border">
        <a href="#beranda" aria-label="Amanah Berkah Haromain beranda">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="size-3.5" />}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={isLoggedIn ? '/dashboard' : '/login'}
            className="hidden items-center gap-2 rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d97706] sm:flex"
          >
            <User className="size-4" />
            {isLoggedIn ? 'Dashboard' : 'Daftar / Login'}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary lg:hidden"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl bg-card p-3 shadow-lg ring-1 ring-border lg:hidden">
          <nav className="flex flex-col" aria-label="Navigasi seluler">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <a
              href={isLoggedIn ? '/dashboard' : '/login'}
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d97706]"
            >
              <User className="size-4" />
              {isLoggedIn ? 'Dashboard' : 'Daftar / Login'}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
