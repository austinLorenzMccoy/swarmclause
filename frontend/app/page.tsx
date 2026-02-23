import { LandingHero } from "@/components/landing/landing-hero"
import { LandingNav } from "@/components/landing/landing-nav"
import { HowItWorks } from "@/components/landing/how-it-works"
import { LiveTranscript } from "@/components/landing/live-transcript"
import { WhyHedera } from "@/components/landing/why-hedera"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <HowItWorks />
      <LiveTranscript />
      <WhyHedera />
      <LandingFooter />
    </main>
  )
}
