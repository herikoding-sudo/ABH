'use client'

import { useState, useEffect } from 'react'
import { getSavedWhatsappUrl, fetchSettingsAsync } from '@/lib/data-store'

export function WhatsappFab() {
  const [whatsappUrl, setWhatsappUrl] = useState('')

  useEffect(() => {
    // 1. Initial load from local storage
    setWhatsappUrl(getSavedWhatsappUrl())

    // 2. Fetch revalidated fresh data
    fetchSettingsAsync().then(() => {
      setWhatsappUrl(getSavedWhatsappUrl())
    })
  }, [])

  if (!whatsappUrl) return null

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 hover:scale-110 active:scale-95 animate-float"
    >
      <img
        src="/images/whatsapp-splat.png"
        alt="WhatsApp Konsultasi"
        className="size-24 md:size-32 object-contain drop-shadow-2xl"
      />
    </a>
  )
}
