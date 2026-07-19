import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
import { WhyUs } from '@/components/why-us'
import { About } from '@/components/about'
import { Packages } from '@/components/packages'
import { Schedule } from '@/components/schedule'
import { Testimonials } from '@/components/testimonials'
import { AppDownload } from '@/components/app-download'
import { SiteFooter } from '@/components/site-footer'
import { WhatsappFab } from '@/components/whatsapp-fab'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Services />
      <WhyUs />
      <About />
      <Packages />
      <Schedule />
      <Testimonials />
      <AppDownload />
      <SiteFooter />
      <WhatsappFab />
    </main>
  )
}
