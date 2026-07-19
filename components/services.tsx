'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { type Service } from '@/lib/data'
import { getSavedServices, fetchServicesAsync } from '@/lib/data-store'

export function Services() {
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(4)

  useEffect(() => {
    // 1. Initial load from local storage
    setServicesList(getSavedServices())

    // 2. Fetch revalidated fresh data
    fetchServicesAsync().then((list) => setServicesList(list))

    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1)
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2)
      } else {
        setItemsToShow(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, servicesList.length - itemsToShow)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
  }

  if (servicesList.length === 0) return null

  return (
    <section id="layanan" className="bg-background py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Layanan"
          icon={Sparkles}
          title="Banyak Layanan yang Kami Berikan"
          desc="Wujudkan impian ibadah Haji, Umroh, dan Wisata Halal Anda dengan layanan profesional, aman, dan penuh keberkahan."
        />

        <div className="relative mt-12 px-2 sm:px-6">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute -left-2 sm:left-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Slider Container */}
          <div className="overflow-hidden rounded-3xl px-1">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              }}
            >
              {servicesList.map((s) => (
                <div
                  key={s.title}
                  className="shrink-0 px-2 select-none"
                  style={{
                    width: `${100 / itemsToShow}%`,
                  }}
                >
                  <div className="overflow-hidden rounded-3xl ring-1 ring-border shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl aspect-[16/10] sm:aspect-[16/9]">
                    <img
                      src={s.image || '/placeholder.svg'}
                      alt={s.title}
                      className="size-full object-cover pointer-events-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute -right-2 sm:right-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Dots Indicator */}
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === i ? 'w-6 bg-primary' : 'w-2 bg-primary/30'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
