"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  FileText,
  Coins,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react"
import { supabase, type SessionRow, type OfferRow, type SimulationRow } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

const statusConfig = {
  negotiating: { label: "Negotiating", icon: Clock, className: "bg-accent text-accent-foreground" },
  accepted: { label: "Accepted", icon: CheckCircle2, className: "bg-primary/20 text-primary" },
  escrow_locked: { label: "Escrow Locked", icon: CheckCircle2, className: "bg-primary/20 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-green-500/20 text-green-400" },
  penalized: { label: "Penalized", icon: AlertCircle, className: "bg-destructive/20 text-destructive" },
}

export default function DashboardPage() {
  const { user, walletAddress } = useAuth()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    escrowTotal: 0,
    hcsMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!walletAddress) return

    const [sessionsRes, offersRes, simRes, transcriptsRes] = await Promise.all([
      supabase.from("sessions").select("*").order("created_at", { ascending: false }),
      supabase.from("offers").select("*"),
      supabase.from("simulations").select("*"),
      supabase.from("transcripts").select("id"),
    ])

    const allSessions = (sessionsRes.data ?? []) as SessionRow[]
    const allOffers = (offersRes.data ?? []) as OfferRow[]

    setSessions(allSessions.slice(0, 5))
    setStats({
      active: allSessions.filter((s) => s.status === "negotiating").length,
      completed: allSessions.filter((s) => s.status === "completed" || s.status === "escrow_locked").length,
      escrowTotal: allOffers
        .filter((o) => o.accepted)
        .reduce((sum, o) => sum + o.price, 0),
      hcsMessages: transcriptsRes.data?.length ?? 0,
    })
    setLoading(false)
  }, [walletAddress])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime subscription for live stat updates
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => {
        fetchData()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "offers" }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  const createNewSession = async () => {
    if (!walletAddress || !user) return
    const sessionId = `NEG-${Date.now().toString(36).toUpperCase()}`
    const { error } = await supabase.from("sessions").insert({
      id: sessionId,
      owner_id: user.id,
      buyer_agent: "BuyerAgent",
      seller_agent: "SellerAgent",
      status: "negotiating",
    })
    if (error) {
      console.error("Failed to create session:", error.message)
    }
    fetchData()
  }

  const statCards = [
    {
      title: "Negotiations in Progress",
      value: loading ? "—" : String(stats.active),
      description: "Active treaty sessions",
      icon: MessageSquare,
      trend: `${stats.active} active`,
    },
    {
      title: "Agreements Signed",
      value: loading ? "—" : String(stats.completed),
      description: "Completed contracts",
      icon: FileText,
      trend: "All time",
    },
    {
      title: "Escrow Locked",
      value: loading ? "—" : stats.escrowTotal.toLocaleString(),
      description: "HTS tokens in escrow",
      icon: Coins,
      trend: `Across ${stats.completed} contracts`,
    },
    {
      title: "Consensus Events",
      value: loading ? "—" : String(stats.hcsMessages),
      description: "HCS messages logged",
      icon: Activity,
      trend: "Total",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor your autonomous treaty negotiations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={createNewSession}>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/dashboard/chamber">
              Open Chamber
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="glass-panel border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Treaty Sessions */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Treaty Sessions</CardTitle>
            <CardDescription>Your latest negotiation activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No sessions yet.</p>
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={createNewSession}>
                    <Plus className="mr-2 h-3 w-3" />
                    Create First Session
                  </Button>
                </div>
              ) : (
                sessions.map((session) => {
                  const status = statusConfig[session.status as keyof typeof statusConfig] ?? statusConfig.negotiating
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-foreground">
                            {session.id}
                          </span>
                          <Badge className={status.className}>
                            <status.icon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.buyer_agent} vs {session.seller_agent}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simulation Alerts */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Simulation Alerts</CardTitle>
            <CardDescription>Risk assessments from recent simulations</CardDescription>
          </CardHeader>
          <CardContent>
            <SimulationAlerts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimulationAlerts() {
  const [simulations, setSimulations] = useState<SimulationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("simulations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
      setSimulations((data ?? []) as SimulationRow[])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground">Loading simulations...</p>
  if (simulations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">No simulations yet. Run one from the Simulation Room.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {simulations.map((sim) => {
        const riskColor =
          sim.confidence === "HIGH"
            ? "text-green-400 border-green-400/50"
            : sim.confidence === "MEDIUM"
              ? "text-primary border-primary/50"
              : "text-destructive border-destructive/50"
        return (
          <div key={sim.id} className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{sim.session_id} Risk Score</span>
              <Badge variant="outline" className={riskColor}>
                {sim.confidence}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Risk: {(Number(sim.risk_score) * 100).toFixed(0)}%. Recommended penalty: +${sim.recommended_penalty}
            </p>
          </div>
        )
      })}
    </div>
  )
}
