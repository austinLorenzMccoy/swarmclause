import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale, ArrowRight } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50">
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Open the Chamber
          </h2>
          <p className="mb-8 text-muted-foreground">
            Experience programmable trust infrastructure. 
            Start your first autonomous negotiation today.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard/chamber">
              Enter Treaty Chamber
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-border/50 bg-secondary/30">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Scale className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">SWARMCLAUSE</span>
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            Built on Hedera &bull; Powered by Groq &bull; Autonomous Treaty Infrastructure
          </p>
          
          <div className="flex gap-4">
            <Link 
              href="/dashboard" 
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/chamber" 
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Chamber
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
