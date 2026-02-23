"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Hash,
  DollarSign,
  Truck,
  AlertTriangle,
  Shield,
  Send
} from "lucide-react"
import { supabase, type SessionRow, type OfferRow } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

const roleConfig = {
  buyer: {
    label: "BuyerAgent",
    color: "bg-accent text-accent-foreground",
    borderColor: "border-l-accent"
  },
  seller: {
    label: "SellerAgent",
    color: "bg-primary text-primary-foreground",
    borderColor: "border-l-primary"
  },
  mediator: {
    label: "MediatorAgent",
    color: "bg-muted text-muted-foreground",
    borderColor: "border-l-muted-foreground"
  }
}

function agentRole(agent: string): "buyer" | "seller" | "mediator" {
  const lower = agent.toLowerCase()
  if (lower.includes("buyer")) return "buyer"
  if (lower.includes("seller")) return "seller"
  return "mediator"
}

export default function ChamberPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [offers, setOffers] = useState<OfferRow[]>([])
  const [isNegotiating, setIsNegotiating] = useState(true)
  const [terms, setTerms] = useState({
    price: 0,
    delivery: 0,
    penalty: 0,
    escrow: true
  })
  const [hasConverged, setHasConverged] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  // Fetch sessions
  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("status", "negotiating")
        .order("created_at", { ascending: false })
      const s = (data ?? []) as SessionRow[]
      setSessions(s)
      if (s.length > 0 && !selectedSessionId) {
        setSelectedSessionId(s[0].id)
      }
      setLoading(false)
    }
    fetchSessions()
  }, [selectedSessionId])

  // Fetch offers for selected session
  const fetchOffers = useCallback(async () => {
    if (!selectedSessionId) return
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("session_id", selectedSessionId)
      .order("created_at", { ascending: true })
    const o = (data ?? []) as OfferRow[]
    setOffers(o)

    if (o.length > 0) {
      const last = o[o.length - 1]
      setTerms({
        price: last.price,
        delivery: last.delivery_days,
        penalty: last.penalty ?? 0,
        escrow: true
      })
      const accepted = o.some(offer => offer.accepted)
      setHasConverged(accepted)
      setIsNegotiating(!accepted)
    }
  }, [selectedSessionId])

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  // Realtime subscription for offers
  useEffect(() => {
    if (!selectedSessionId) return

    const channel = supabase
      .channel(`negotiation-${selectedSessionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "offers",
        filter: `session_id=eq.${selectedSessionId}`
      }, (payload) => {
        const newOffer = payload.new as OfferRow
        setOffers(prev => [...prev, newOffer])
        setTerms({
          price: newOffer.price,
          delivery: newOffer.delivery_days,
          penalty: newOffer.penalty ?? 0,
          escrow: true
        })
        if (newOffer.accepted) {
          setHasConverged(true)
          setIsNegotiating(false)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedSessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [offers])

  const handleAccept = async () => {
    if (!selectedSessionId) return
    // Insert an accepted offer
    await supabase.from("offers").insert({
      session_id: selectedSessionId,
      agent: "MediatorAgent",
      price: terms.price,
      delivery_days: terms.delivery,
      penalty: terms.penalty,
      accepted: true,
    })
    // Update session status
    await supabase
      .from("sessions")
      .update({ status: "accepted" })
      .eq("id", selectedSessionId)
    setIsNegotiating(false)
    setHasConverged(true)
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Treaty Chamber</h1>
          <p className="text-muted-foreground">
            {selectedSessionId
              ? `Session ${selectedSessionId} - Live negotiation in progress`
              : "Select or create a session to begin"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <Select value={selectedSessionId ?? ""} onValueChange={setSelectedSessionId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isNegotiating ? (
            <Badge className="bg-accent/20 text-accent">
              <Clock className="mr-1 h-3 w-3 animate-pulse" />
              Negotiating
            </Badge>
          ) : hasConverged ? (
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Converged
            </Badge>
          ) : null}
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="glass-panel border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No active negotiation sessions. Create one from the Dashboard.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Agent Dialogue - 2 columns */}
          <Card className="glass-panel border-border/50 lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Agent Dialogue
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  <Hash className="mr-1 h-3 w-3" />
                  {selectedSessionId}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="space-y-4">
                  {offers.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No offers yet. Agents are preparing…
                    </p>
                  ) : (
                    offers.map((offer) => {
                      const role = agentRole(offer.agent)
                      const config = roleConfig[role]
                      return (
                        <div
                          key={offer.id}
                          className={`animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border-l-4 bg-card/50 p-4 duration-300 ${config.borderColor}`}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge className={config.color}>{offer.agent}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(offer.created_at).toLocaleTimeString()}
                            </span>
                            {offer.accepted && (
                              <Badge className="bg-green-500/20 text-green-400">Accepted</Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-foreground">
                            {offer.accepted
                              ? `Terms accepted: $${offer.price}, ${offer.delivery_days} days delivery, $${offer.penalty ?? 0} penalty`
                              : `Proposal: $${offer.price} price, ${offer.delivery_days} days delivery, $${offer.penalty ?? 0} penalty`}
                          </p>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {isNegotiating && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Agents are negotiating...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Terms Panel - 1 column */}
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Current Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Price</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">${terms.price}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Delivery</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">{terms.delivery} days</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Penalty</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">${terms.penalty}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label htmlFor="escrow" className="text-sm text-muted-foreground cursor-pointer">
                      Escrow
                    </Label>
                  </div>
                  <Switch
                    id="escrow"
                    checked={terms.escrow}
                    onCheckedChange={(checked) => setTerms(prev => ({ ...prev, escrow: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {hasConverged ? (
                  <Button className="w-full" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Execute Contract
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-transparent"
                    size="lg"
                    variant="outline"
                    onClick={handleAccept}
                    disabled={!isNegotiating || offers.length === 0}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Agreement
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
