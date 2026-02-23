"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Scale, Wallet, ChevronDown, LogOut, Copy, ExternalLink, KeyRound } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"

export function LandingNav() {
  const { walletAddress, connectManual, connectHashPack, disconnectWallet, isConnecting } = useAuth()
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
      // Fall back to manual if HashPack fails
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

  const copyAddress = () => {
    if (walletAddress) navigator.clipboard.writeText(walletAddress)
  }

  const truncateAddress = (address: string) =>
    address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">SWARMCLAUSE</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How It Works</Link>
          <Link href="#transcript" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Live Transcript</Link>
          <Link href="#why-hedera" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Why Hedera</Link>
          <Link href="/agents" className="text-sm text-muted-foreground transition-colors hover:text-foreground">🤖 Agents</Link>
        </nav>

        <div className="flex items-center gap-3">
          {walletAddress ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                      <Wallet className="h-3 w-3 text-primary" />
                    </div>
                    <span className="hidden sm:inline">{truncateAddress(walletAddress)}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">Connected Account</p>
                    <p className="font-mono text-sm text-foreground">{walletAddress}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard" className="gap-2 cursor-pointer">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer"><Copy className="h-4 w-4" />Copy Address</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`https://hashscan.io/testnet/account/${walletAddress}`} target="_blank" rel="noopener noreferrer" className="gap-2 cursor-pointer">
                      <ExternalLink className="h-4 w-4" />View on HashScan
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnectWallet} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setMode("choose"); setError(""); } }}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={isConnecting}>
                  <Wallet className="h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect Wallet</DialogTitle>
                  <DialogDescription>Choose how to connect your Hedera account</DialogDescription>
                </DialogHeader>

                {mode === "choose" ? (
                  <div className="space-y-3 py-4">
                    {/* HashPack option */}
                    <button
                      onClick={handleHashPack}
                      disabled={isConnecting}
                      className="flex w-full items-center gap-4 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-card hover:border-primary/30 disabled:opacity-50"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                        <span className="text-2xl">🟣</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">HashPack</p>
                        <p className="text-xs text-muted-foreground">Connect via WalletConnect</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Recommended</span>
                    </button>

                    <Separator className="my-2" />

                    {/* Manual option */}
                    <button
                      onClick={() => setMode("manual")}
                      className="flex w-full items-center gap-4 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-card hover:border-primary/30"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <KeyRound className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Account ID</p>
                        <p className="text-xs text-muted-foreground">Enter your Hedera account manually</p>
                      </div>
                    </button>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-id">Hedera Account ID</Label>
                      <Input
                        id="account-id"
                        placeholder="0.0.1234567"
                        value={accountInput}
                        onChange={(e) => { setAccountInput(e.target.value); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleManualConnect()}
                        autoFocus
                      />
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get a testnet account from the{" "}
                      <a href="https://portal.hedera.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Hedera Portal</a>
                    </p>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" className="bg-transparent" onClick={() => { setMode("choose"); setError(""); }}>Back</Button>
                      <Button onClick={handleManualConnect} disabled={isConnecting || !accountInput.trim()}>
                        <Wallet className="mr-2 h-4 w-4" />{isConnecting ? "Connecting..." : "Connect"}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  )
}
