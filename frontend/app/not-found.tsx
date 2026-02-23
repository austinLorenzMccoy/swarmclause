import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale, Home, LayoutDashboard } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="mb-2 text-6xl font-bold tracking-tight text-foreground">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Treaty Route Not Found
        </h2>
        <p className="mb-8 text-muted-foreground">
          This negotiation chamber does not exist. The treaty you are looking for 
          may have been executed or never existed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-muted-foreground">
          SWARMCLAUSE - Autonomous Treaty Infrastructure
        </p>
      </div>
    </div>
  )
}
