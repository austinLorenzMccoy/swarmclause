"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, FileText, Shield, Wallet, KeyRound } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"

export function LandingHero() {
  const { walletAddress, connectManual, connectHashPack, isConnecting } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const [accountInput, setAccountInput] = useState("")
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"choose" | "manual">("choose")

  const handleHashPack = async () => {
    setError("")
    try {
      await connectHashPack()
      setShowDialog(false)
    } catch (e: any) {
      setError(e.message)
      setMode("manual")
    }
  }

  const handleManualConnect = async () => {
    setError("")
    try {
      await connectManual(accountInput.trim())
      setShowDialog(false)
      setAccountInput("")
      setMode("choose")
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <section className="container mx-auto px-4 py-24 md:px-6 md:py-32 lg:py-40">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Autonomous Treaty Infrastructure</span>
        </div>

        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          <span className="text-primary">SWARMCLAUSE</span>
        </h1>

        <p className="mb-4 text-xl font-medium text-foreground md:text-2xl lg:text-3xl">
          Autonomous Agreements Negotiated by AI.
          <br />
          <span className="text-muted-foreground">Settled by Hedera.</span>
        </p>

        <p className="mx-auto mb-10 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Multi-agent contracts with simulation, transparency, and instant execution.
          AI agents negotiate like real stakeholders. Hedera settles with finality.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {walletAddress ? (
            <>
              <Button size="lg" asChild className="min-w-[200px]">
                <Link href="/dashboard/chamber"><FileText className="mr-2 h-4 w-4" />Enter Treaty Chamber</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="min-w-[200px] bg-transparent">
                <Link href="/dashboard">Start New Negotiation<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </>
          ) : (
            <>
              <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setMode("choose"); setError(""); } }}>
                <DialogTrigger asChild>
                  <Button size="lg" className="min-w-[200px]" disabled={isConnecting}>
                    <Wallet className="mr-2 h-4 w-4" />{isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                    <DialogDescription>Choose how to connect your Hedera account</DialogDescription>
                  </DialogHeader>
                  {mode === "choose" ? (
                    <div className="space-y-3 py-4">
                      <button onClick={handleHashPack} disabled={isConnecting} className="flex w-full items-center gap-4 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-card hover:border-primary/30 disabled:opacity-50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10"><span className="text-2xl">🟣</span></div>
                        <div className="flex-1"><p className="font-medium text-foreground">HashPack</p><p className="text-xs text-muted-foreground">Connect via WalletConnect</p></div>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Recommended</span>
                      </button>
                      <Separator className="my-2" />
                      <button onClick={() => setMode("manual")} className="flex w-full items-center gap-4 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-card hover:border-primary/30">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><KeyRound className="h-6 w-6 text-primary" /></div>
                        <div className="flex-1"><p className="font-medium text-foreground">Account ID</p><p className="text-xs text-muted-foreground">Enter your Hedera account manually</p></div>
                      </button>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="hero-account-id">Hedera Account ID</Label>
                        <Input id="hero-account-id" placeholder="0.0.1234567" value={accountInput} onChange={(e) => { setAccountInput(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleManualConnect()} autoFocus />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                      </div>
                      <p className="text-xs text-muted-foreground">Get a testnet account from the <a href="https://portal.hedera.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Hedera Portal</a></p>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" className="bg-transparent" onClick={() => { setMode("choose"); setError(""); }}>Back</Button>
                        <Button onClick={handleManualConnect} disabled={isConnecting || !accountInput.trim()}><Wallet className="mr-2 h-4 w-4" />{isConnecting ? "Connecting..." : "Connect"}</Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" asChild className="min-w-[200px] bg-transparent">
                <Link href="#how-it-works">Learn More<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border/50 pt-10">
          <div className="text-center"><div className="text-2xl font-bold text-primary md:text-3xl">100%</div><div className="text-xs text-muted-foreground md:text-sm">Transparent</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-primary md:text-3xl">{"<"}3s</div><div className="text-xs text-muted-foreground md:text-sm">Settlement</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-primary md:text-3xl">HCS</div><div className="text-xs text-muted-foreground md:text-sm">Ordered</div></div>
        </div>
      </div>
    </section>
  )
}
