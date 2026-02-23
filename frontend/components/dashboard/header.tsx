"use client"

import { useSidebar } from "./sidebar-context"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Activity, Radio, LogOut, Wallet, ChevronDown, Copy, ExternalLink } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const { setMobileOpen } = useSidebar()
  const { walletAddress, disconnectWallet } = useAuth()

  const truncated = walletAddress && walletAddress.length > 12
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress

  const copyAddress = () => {
    if (walletAddress) navigator.clipboard.writeText(walletAddress)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" /><span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Active Negotiations</span>
            <Badge variant="secondary" className="text-xs">3</Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <Radio className="h-3 w-3 animate-pulse text-green-500" />
          <span className="text-xs text-muted-foreground">Hedera Testnet</span>
        </div>
        <Badge variant="outline" className="hidden text-xs sm:inline-flex">
          Topic: 0.0.8016595
        </Badge>

        {walletAddress && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Wallet className="h-3 w-3 text-primary" />
                </div>
                <span className="hidden text-sm font-mono sm:inline">{truncated}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">Connected Account</p>
                <p className="font-mono text-sm text-foreground">{walletAddress}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer">
                <Copy className="h-4 w-4" />Copy Address
              </DropdownMenuItem>
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
        )}
      </div>
    </header>
  )
}
