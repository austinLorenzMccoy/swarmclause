"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  Clock,
  DollarSign,
} from "lucide-react"
import { supabase, type SimulationRow } from "@/lib/supabase"

const riskConfig = {
  HIGH: { color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/50", label: "LOW RISK" },
  MEDIUM: { color: "text-primary", bgColor: "bg-primary/20", borderColor: "border-primary/50", label: "MEDIUM RISK" },
  LOW: { color: "text-destructive", bgColor: "bg-destructive/20", borderColor: "border-destructive/50", label: "HIGH RISK" },
}

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<SimulationRow[]>([])
  const [selectedSim, setSelectedSim] = useState<SimulationRow | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("simulations")
        .select("*")
        .order("created_at", { ascending: false })
      const sims = (data ?? []) as SimulationRow[]
      setSimulations(sims)
      if (sims.length > 0) setSelectedSim(sims[0])
      setLoading(false)
    }
    fetch()
  }, [])

  // Realtime subscription for new simulation results
  useEffect(() => {
    const channel = supabase
      .channel("simulation-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "simulations",
      }, (payload) => {
        const newSim = payload.new as SimulationRow
        setSimulations(prev => [newSim, ...prev])
        setSelectedSim(newSim)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const runSimulation = () => {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2000)
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Simulation Room</h1>
          <p className="text-muted-foreground">AI-powered risk analysis and stress testing</p>
        </div>
        <Button onClick={runSimulation} disabled={isRunning}>
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <FlaskConical className="mr-2 h-4 w-4" />
              Run New Simulation
            </>
          )}
        </Button>
      </div>

      {simulations.length === 0 ? (
        <Card className="glass-panel border-border/50">
          <CardContent className="py-12 text-center">
            <FlaskConical className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No simulations yet. Run one to analyze risk.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Simulation List */}
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Simulations</CardTitle>
              <CardDescription>Select to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {simulations.map((sim) => {
                  const conf = sim.confidence as keyof typeof riskConfig
                  const risk = riskConfig[conf] ?? riskConfig.MEDIUM
                  const isSelected = selectedSim?.id === sim.id
                  return (
                    <button
                      key={sim.id}
                      onClick={() => setSelectedSim(sim)}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${isSelected
                          ? `${risk.borderColor} ${risk.bgColor}`
                          : "border-border/50 bg-card/50 hover:bg-card"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-medium text-foreground">SIM-{sim.id}</span>
                        <Badge className={`${risk.bgColor} ${risk.color}`}>
                          {conf}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Session: {sim.session_id}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-lg font-bold ${risk.color}`}>
                          {(Number(sim.risk_score) * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-muted-foreground">risk score</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          {selectedSim && (
            <Card className="glass-panel border-border/50 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Risk Analysis Report</CardTitle>
                    <CardDescription>SIM-{selectedSim.id} — {selectedSim.session_id}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-lg px-4 py-1 ${(riskConfig[selectedSim.confidence as keyof typeof riskConfig] ?? riskConfig.MEDIUM).color} ${(riskConfig[selectedSim.confidence as keyof typeof riskConfig] ?? riskConfig.MEDIUM).borderColor}`}
                  >
                    {selectedSim.confidence}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk Score */}
                <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Overall Risk Score</span>
                    <span className={`text-2xl font-bold ${(riskConfig[selectedSim.confidence as keyof typeof riskConfig] ?? riskConfig.MEDIUM).color}`}>
                      {(Number(selectedSim.risk_score) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={Number(selectedSim.risk_score) * 100}
                    className="h-2"
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Risk Score</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {(Number(selectedSim.risk_score) * 100).toFixed(0)}%
                      </span>
                      <TrendingDown className="h-4 w-4 text-green-400" />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Suggested Penalty</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        +${selectedSim.recommended_penalty}
                      </span>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* AI Reasoning */}
                {selectedSim.reasoning && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Zap className="h-4 w-4 text-primary" />
                      Groq Reasoning Panel
                    </h3>
                    <div className="rounded-lg border border-border/50 bg-secondary/50 p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedSim.reasoning}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
