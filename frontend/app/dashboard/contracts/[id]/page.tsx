"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, Lock, CheckCircle2, AlertTriangle, DollarSign, Truck, Shield, Bell, ExternalLink } from "lucide-react"
import { supabase, type SessionRow, type OfferRow } from "@/lib/supabase"

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  negotiating: { label: "Negotiating", icon: Clock, className: "bg-accent/20 text-accent" },
  accepted: { label: "Accepted", icon: CheckCircle2, className: "bg-primary/20 text-primary" },
  escrow_locked: { label: "Escrow Locked", icon: Lock, className: "bg-primary/20 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-green-500/20 text-green-400" },
  penalized: { label: "Penalized", icon: AlertTriangle, className: "bg-destructive/20 text-destructive" },
}

export default function ContractViewerPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [session, setSession] = useState<SessionRow | null>(null)
  const [lastOffer, setLastOffer] = useState<OfferRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [sRes, oRes] = await Promise.all([
        supabase.from("sessions").select("*").eq("id", sessionId).single(),
        supabase.from("offers").select("*").eq("session_id", sessionId).eq("accepted", true).order("created_at", { ascending: false }).limit(1),
      ])
      setSession(sRes.data as SessionRow | null)
      const offers = (oRes.data ?? []) as OfferRow[]
      setLastOffer(offers[0] ?? null)
      setLoading(false)
    }
    fetchData()
  }, [sessionId])

  useEffect(() => {
    const ch = supabase.channel(`contract-${sessionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` }, (p) => setSession(p.new as SessionRow))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [sessionId])

  const triggerSettlementNotification = async () => {
    if (!session || !lastOffer) return
    setNotifying(true)
    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/contract-settlement-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth?.access_token ?? ""}` },
        body: JSON.stringify({ session_id: session.id, final_price: lastOffer.price, settlement_tx: session.contract_tx_hash }),
      })
      if (res.ok) setNotified(true)
    } finally { setNotifying(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!session) return <div className="py-20 text-center"><p className="text-muted-foreground">Contract not found.</p></div>

  const status = statusConfig[session.status] ?? statusConfig.negotiating

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Contract Scroll: {session.id}</h1>
          <p className="text-muted-foreground">Binding agreement artifact</p>
        </div>
        <Badge className={`text-sm px-4 py-1.5 ${status.className}`}><status.icon className="mr-1.5 h-4 w-4" />{status.label}</Badge>
      </div>

      <Card className="glass-panel border-border/50">
        <CardHeader><CardTitle className="text-foreground">Agreement Terms</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Buyer</p><p className="font-medium text-foreground">{session.buyer_agent}</p></div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Seller</p><p className="font-medium text-foreground">{session.seller_agent}</p></div>
          </div>
          {lastOffer && (<><Separator /><div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4"><DollarSign className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Price</p><p className="text-lg font-bold text-foreground">${lastOffer.price}</p></div></div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4"><Truck className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Delivery</p><p className="text-lg font-bold text-foreground">{lastOffer.delivery_days} days</p></div></div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4"><Shield className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Penalty</p><p className="text-lg font-bold text-foreground">${lastOffer.penalty ?? 0}</p></div></div>
          </div></>)}
        </CardContent>
      </Card>

      <Card className="glass-panel border-border/50">
        <CardHeader><CardTitle className="text-foreground">Hedera Proof</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3"><span className="text-sm text-muted-foreground">Contract Address</span><span className="font-mono text-sm text-foreground">{session.contract_tx_hash ?? "Not deployed"}</span></div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3"><span className="text-sm text-muted-foreground">Status</span><Badge className={status.className}>{status.label}</Badge></div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3"><span className="text-sm text-muted-foreground">Created</span><span className="text-sm text-foreground">{new Date(session.created_at).toLocaleString()}</span></div>
          {session.contract_tx_hash && <a href={`https://hashscan.io/testnet/transaction/${session.contract_tx_hash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" />View on HashScan</a>}
        </CardContent>
      </Card>

      {session.status === "completed" && (
        <Button onClick={triggerSettlementNotification} disabled={notifying || notified} className="w-full" size="lg">
          <Bell className="mr-2 h-4 w-4" />{notified ? "Notification Sent" : notifying ? "Sending..." : "Trigger Settlement Notification"}
        </Button>
      )}
    </div>
  )
}
