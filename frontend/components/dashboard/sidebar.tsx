"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Scale, LayoutDashboard, MessageSquare, FlaskConical, FileText, List,
  Settings, Home, ChevronLeft, ChevronRight, History, LogOut, Wallet,
} from "lucide-react"

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Treaty Chamber", href: "/dashboard/chamber", icon: MessageSquare },
  { title: "Simulation Room", href: "/dashboard/simulation", icon: FlaskConical },
  { title: "Contract Scrolls", href: "/dashboard/contracts", icon: FileText },
  { title: "Transcript Ledger", href: "/dashboard/ledger", icon: List },
  { title: "Session History", href: "/dashboard/history", icon: History },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

function SidebarContent() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const { walletAddress, disconnectWallet } = useAuth()

  const truncated = walletAddress && walletAddress.length > 12
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className={cn("text-lg font-semibold tracking-tight text-sidebar-foreground sidebar-transition", collapsed && "w-0 opacity-0")}>
            SWARMCLAUSE
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors", isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className={cn("sidebar-transition whitespace-nowrap", collapsed && "w-0 opacity-0 overflow-hidden")}>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {walletAddress && (
          <div className={cn("mb-2 flex items-center gap-3 rounded-md px-3 py-2", collapsed && "justify-center")}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className={cn("sidebar-transition flex-1 overflow-hidden", collapsed && "w-0 opacity-0")}>
              <p className="truncate font-mono text-xs font-medium text-sidebar-foreground">{truncated}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">Hedera Testnet</p>
            </div>
          </div>
        )}

        <button onClick={disconnectWallet} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={cn("sidebar-transition whitespace-nowrap", collapsed && "w-0 opacity-0 overflow-hidden")}>Disconnect</span>
        </button>

        <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Home className="h-4 w-4 shrink-0" />
          <span className={cn("sidebar-transition whitespace-nowrap", collapsed && "w-0 opacity-0 overflow-hidden")}>Back Home</span>
        </Link>

        <Button variant="ghost" size="sm" className="mt-2 w-full justify-center" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-2" /><span className="sidebar-transition">Collapse</span></>}
        </Button>
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar()
  return (
    <>
      <aside className={cn("hidden h-screen border-r border-sidebar-border bg-sidebar md:block sidebar-transition", collapsed ? "w-16" : "w-64")}>
        <SidebarContent />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0"><SidebarContent /></SheetContent>
      </Sheet>
    </>
  )
}
