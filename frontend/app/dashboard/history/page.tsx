"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, Clock, CheckCircle2, Lock, AlertTriangle, ArrowRight, Calendar } from "lucide-react"
import { supabase, type SessionRow } from "@/lib/supabase"

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
    negotiating: { label: "Negotiating", icon: Clock, className: "bg-accent/20 text-accent" },
    accepted: { label: "Accepted", icon: CheckCircle2, className: "bg-primary/20 text-primary" },
    escrow_locked: { label: "Escrow Locked", icon: Lock, className: "bg-primary/20 text-primary" },
    completed: { label: "Completed", icon: CheckCircle2, className: "bg-green-500/20 text-green-400" },
    penalized: { label: "Penalized", icon: AlertTriangle, className: "bg-destructive/20 text-destructive" },
}

export default function HistoryPage() {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Session History</h1>
                <p className="text-muted-foreground">All your past negotiation sessions (RLS-scoped)</p>
            </div>

            <Card className="glass-panel border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <History className="h-5 w-5 text-primary" />
                        All Sessions
                    </CardTitle>
                    <CardDescription>{sessions.length} sessions total</CardDescription>
                </CardHeader>
                <CardContent>
                    {sessions.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">No sessions yet. Start a negotiation from the Dashboard.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Session ID</th>
                                        <th className="pb-3 pr-4 font-medium">Parties</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
                                        <th className="pb-3 pr-4 font-medium">Created</th>
                                        <th className="pb-3 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {sessions.map((s) => {
                                        const status = statusConfig[s.status] ?? statusConfig.negotiating
                                        return (
                                            <tr key={s.id} className="border-b border-border/30 transition-colors hover:bg-card/50">
                                                <td className="py-3 pr-4 font-mono font-medium text-foreground">{s.id}</td>
                                                <td className="py-3 pr-4 text-muted-foreground">{s.buyer_agent} vs {s.seller_agent}</td>
                                                <td className="py-3 pr-4">
                                                    <Badge className={status.className}><status.icon className="mr-1 h-3 w-3" />{status.label}</Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(s.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="py-3">
                                                    <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/contracts/${s.id}`}><ArrowRight className="h-4 w-4" /></Link></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
