"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Clock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Calendar
} from "lucide-react"
import { supabase, type SessionRow } from "@/lib/supabase"

const statusConfig = {
  negotiating: {
    label: "Negotiating",
    icon: Clock,
    className: "bg-accent/20 text-accent"
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "bg-primary/20 text-primary"
  },
  escrow_locked: {
    label: "Escrow Locked",
    icon: Lock,
    className: "bg-primary/20 text-primary"
  },
  completed: {
    label: "Executed",
    icon: CheckCircle2,
    className: "bg-green-500/20 text-green-400"
  },
  penalized: {
    label: "Penalized",
    icon: AlertTriangle,
    className: "bg-destructive/20 text-destructive"
  }
}

export default function ContractsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false })
      setSessions((data ?? []) as SessionRow[])
      setLoading(false)
    }
    fetch()
  }, [])

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("contracts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => {
        supabase
          .from("sessions")
          .select("*")
          .order("created_at", { ascending: false })
          .then(({ data }) => setSessions((data ?? []) as SessionRow[]))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const countByStatus = (status: string) => sessions.filter(s => s.status === status).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Contract Scrolls</h1>
          <p className="text-muted-foreground">View and manage your treaty agreements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="glass-panel border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total Contracts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{countByStatus("completed")}</p>
              <p className="text-xs text-muted-foreground">Executed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{countByStatus("escrow_locked")}</p>
              <p className="text-xs text-muted-foreground">Escrow Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{countByStatus("penalized")}</p>
              <p className="text-xs text-muted-foreground">Penalized</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">All Agreements</CardTitle>
          <CardDescription>Click to view full contract details</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No contracts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const status = statusConfig[session.status as keyof typeof statusConfig] ?? statusConfig.negotiating
                return (
                  <Link
                    key={session.id}
                    href={`/dashboard/contracts/${session.id}`}
                    className="block"
                  >
                    <div className="treaty-scroll group rounded-lg border border-border/50 p-4 transition-all hover:border-primary/30 hover:bg-card/80">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-semibold text-foreground">
                              {session.id}
                            </span>
                            <Badge className={status.className}>
                              <status.icon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.buyer_agent} & {session.seller_agent}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(session.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                            {session.contract_tx_hash ?? "pending"}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
