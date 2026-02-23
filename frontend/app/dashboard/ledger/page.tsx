"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  List,
  Hash,
  Clock,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter
} from "lucide-react"
import { supabase, type TranscriptRow } from "@/lib/supabase"

const roleConfig: Record<string, { color: string; label: string }> = {
  buyer: { color: "bg-accent text-accent-foreground", label: "Buyer" },
  seller: { color: "bg-primary text-primary-foreground", label: "Seller" },
  mediator: { color: "bg-muted text-muted-foreground", label: "Mediator" },
  system: { color: "bg-secondary text-secondary-foreground", label: "System" },
}

function speakerRole(speaker: string): string {
  const lower = speaker.toLowerCase()
  if (lower.includes("buyer")) return "buyer"
  if (lower.includes("seller")) return "seller"
  if (lower.includes("mediator")) return "mediator"
  return "system"
}

export default function LedgerPage() {
  const [transcripts, setTranscripts] = useState<TranscriptRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("transcripts")
        .select("*")
        .order("created_at", { ascending: true })
      setTranscripts((data ?? []) as TranscriptRow[])
      setLoading(false)
    }
    fetch()
  }, [])

  // Realtime subscription for live HCS feed
  useEffect(() => {
    const channel = supabase
      .channel("transcript-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "transcripts",
      }, (payload) => {
        setTranscripts(prev => [...prev, payload.new as TranscriptRow])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredMessages = transcripts.filter((msg) => {
    const content = JSON.stringify(msg.message).toLowerCase()
    const matchesSearch =
      content.includes(searchQuery.toLowerCase()) ||
      msg.speaker.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || speakerRole(msg.speaker) === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Transcript Ledger</h1>
          <p className="text-muted-foreground">HCS-ordered negotiation history with cryptographic proof</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-panel border-border/50">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by content or speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="mediator">Mediator</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <List className="h-5 w-5 text-primary" />
                Consensus Timeline
              </CardTitle>
              <CardDescription>
                {filteredMessages.length} messages in sequence
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {transcripts.length === 0
                  ? "No transcript messages yet. Start a negotiation to see HCS activity."
                  : "No messages match your search criteria."
                }
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute bottom-0 left-6 top-0 w-px bg-border" />

              <div className="space-y-6">
                {filteredMessages.map((msg) => {
                  const role = roleConfig[speakerRole(msg.speaker)] ?? roleConfig.system

                  return (
                    <div key={msg.id} className="relative flex gap-4 pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-2 h-4 w-4 rounded-full border-2 border-background bg-primary" />

                      <div className="flex-1 rounded-lg border border-border/50 bg-card/50 p-4">
                        {/* Header */}
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge className={role.color}>{msg.speaker}</Badge>
                          {msg.hcs_sequence_number && (
                            <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
                              #{msg.hcs_sequence_number}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <p className="mb-3 text-sm leading-relaxed text-foreground">
                          {typeof msg.message === "object"
                            ? (msg.message as Record<string, unknown>).proposal as string ?? JSON.stringify(msg.message)
                            : String(msg.message)
                          }
                        </p>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </div>
                          {msg.hcs_topic_id && (
                            <div className="flex items-center gap-1.5 font-mono">
                              <Hash className="h-3 w-3" />
                              Topic: {msg.hcs_topic_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
