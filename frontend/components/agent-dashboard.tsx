"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  Shield, 
  Zap,
  Eye,
  Bot,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'

interface Agent {
  id: string
  openclaw_id: string
  service_type: string
  reputation_score: number
  trust_tier: 'BRONZE' | 'SILVER' | 'GOLD'
  status: 'active' | 'inactive' | 'suspended'
  last_seen: string
  capabilities: any
}

interface Session {
  id: string
  buyer_agent_id: string
  seller_agent_id: string
  mediator_agent_id?: string
  status: string
  ucp_version: string
  escrow_amount?: number
  final_terms?: any
  created_at: string
  updated_at: string
}

interface Transcript {
  id: number
  session_id: string
  speaker_agent_id: string
  ucp_message: any
  created_at: string
}

interface Simulation {
  id: number
  session_id: string
  risk_score: number
  recommended_penalty: number
  delivery_failure_prob: number
  dispute_likelihood: number
  confidence: string
  recommendation: string
  reasoning?: string
  created_at: string
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  useEffect(() => {
    // Real-time subscriptions for agent activity
    const channels = [
      // Agents
      supabase
        .channel('agents-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'agents' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setAgents(prev => [...prev, payload.new as Agent])
            } else if (payload.eventType === 'UPDATE') {
              setAgents(prev => 
                prev.map(agent => 
                  agent.id === payload.new.id ? payload.new as Agent : agent
                )
              )
            }
          }
        )
        .subscribe(),

      // Sessions
      supabase
        .channel('sessions-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'sessions' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSessions(prev => [...prev, payload.new as Session])
            } else if (payload.eventType === 'UPDATE') {
              setSessions(prev =>
                prev.map(session =>
                  session.id === payload.new.id ? payload.new as Session : session
                )
              )
            }
          }
        )
        .subscribe(),

      // Transcripts
      supabase
        .channel('transcripts-changes')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'transcripts' },
          (payload) => {
            setTranscripts(prev => [payload.new as Transcript, ...prev.slice(0, 49)])
          }
        )
        .subscribe(),

      // Simulations
      supabase
        .channel('simulations-changes')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'simulations' },
          (payload) => {
            setSimulations(prev => [payload.new as Simulation, ...prev.slice(0, 19)])
          }
        )
        .subscribe()
    ]

    // Initial data fetch
    const fetchInitialData = async () => {
      const [agentsRes, sessionsRes, transcriptsRes, simulationsRes] = await Promise.all([
        supabase.from('agents').select('*').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('updated_at', { ascending: false }).limit(20),
        supabase.from('transcripts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('simulations').select('*').order('created_at', { ascending: false }).limit(20)
      ])

      if (agentsRes.data) setAgents(agentsRes.data)
      if (sessionsRes.data) setSessions(sessionsRes.data)
      if (transcriptsRes.data) setTranscripts(transcriptsRes.data)
      if (simulationsRes.data) setSimulations(simulationsRes.data)
    }

    fetchInitialData()

    return () => {
      channels.forEach(channel => channel.unsubscribe())
    }
  }, [])

  const getTrustTierColor = (tier: string) => {
    switch (tier) {
      case 'GOLD': return 'bg-yellow-500'
      case 'SILVER': return 'bg-gray-500'
      case 'BRONZE': return 'bg-orange-600'
      default: return 'bg-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'accepted': case 'completed': return 'text-green-600'
      case 'negotiating': case 'simulating': case 'mediating': return 'text-blue-600'
      case 'escrow_locked': return 'text-yellow-600'
      case 'failed': case 'penalized': case 'rejected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'negotiating': return <MessageSquare className="h-4 w-4" />
      case 'simulating': return <TrendingUp className="h-4 w-4" />
      case 'mediating': return <Users className="h-4 w-4" />
      case 'accepted': return <Zap className="h-4 w-4" />
      case 'escrow_locked': return <Shield className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': case 'penalized': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getSessionTranscripts = (sessionId: string) => {
    return transcripts.filter(t => t.session_id === sessionId).slice(0, 10)
  }

  const getSessionSimulation = (sessionId: string) => {
    return simulations.find(s => s.session_id === sessionId)
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🤖 SWARMCLAUSE Agent Observer</h1>
          <p className="text-muted-foreground">Real-time OpenClaw Agent Activity Monitor</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Bot className="h-3 w-3" />
            {agents.length} Active Agents
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            {sessions.length} Live Sessions
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">🤖 Agents</TabsTrigger>
          <TabsTrigger value="sessions">🤝 Sessions</TabsTrigger>
          <TabsTrigger value="transcripts">📝 Transcripts</TabsTrigger>
          <TabsTrigger value="simulations">🔬 Simulations</TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono">{agent.id}</CardTitle>
                  <Badge 
                    className={`${getTrustTierColor(agent.trust_tier)} text-white`}
                    variant="secondary"
                  >
                    {agent.trust_tier}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Service</span>
                      <span className="text-sm font-medium">{agent.service_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reputation</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{agent.reputation_score}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getTrustTierColor(agent.trust_tier)}`}
                            style={{ width: `${agent.reputation_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(agent.status)}
                        <span className={`text-sm ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Seen</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(agent.last_seen).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => (
              <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedSession(session.id)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono">{session.id}</CardTitle>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(session.status)}
                    <span className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                      {session.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Buyer:</span>
                        <span className="font-medium">{session.buyer_agent_id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Seller:</span>
                        <span className="font-medium">{session.seller_agent_id}</span>
                      </div>
                      {session.mediator_agent_id && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Mediator:</span>
                          <span className="font-medium">{session.mediator_agent_id}</span>
                        </div>
                      )}
                    </div>
                    {session.escrow_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Escrow</span>
                        <span className="text-sm font-medium">${session.escrow_amount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Updated</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.updated_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transcripts Tab */}
        <TabsContent value="transcripts" className="space-y-4">
          <div className="space-y-3">
            {transcripts.map((transcript) => (
              <Card key={transcript.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">
                          {transcript.ucp_message.message_type}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          {transcript.speaker_agent_id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(transcript.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                        {JSON.stringify(transcript.ucp_message.payload, null, 2)}
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Simulations Tab */}
        <TabsContent value="simulations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {simulations.map((simulation) => (
              <Card key={simulation.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono">{simulation.session_id}</CardTitle>
                  <Badge variant={simulation.recommendation === 'PROCEED' ? 'default' : 
                                simulation.recommendation === 'CAUTION' ? 'secondary' : 'destructive'}>
                    {simulation.recommendation}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Risk Score</span>
                        <span className="font-medium">{simulation.risk_score}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{simulation.confidence}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failure Prob</span>
                        <span className="font-medium">{(simulation.delivery_failure_prob * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dispute Prob</span>
                        <span className="font-medium">{(simulation.dispute_likelihood * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded text-sm">
                      <p className="font-medium mb-1">Recommended Penalty: ${simulation.recommended_penalty}/day</p>
                      <p className="text-xs text-muted-foreground">{simulation.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={() => setSelectedSession(null)}>
          <div className="bg-background rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto m-4"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Session Detail: {selectedSession}</h2>
              <button onClick={() => setSelectedSession(null)}
                      className="text-muted-foreground hover:text-foreground">
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Session Info */}
              <Card>
                <CardHeader><CardTitle>Session Info</CardTitle></CardHeader>
                <CardContent>
                  {(() => {
                    const session = sessions.find(s => s.id === selectedSession)
                    return session ? (
                      <div className="space-y-2 text-sm">
                        <div><strong>Status:</strong> {session.status}</div>
                        <div><strong>Buyer:</strong> {session.buyer_agent_id}</div>
                        <div><strong>Seller:</strong> {session.seller_agent_id}</div>
                        {session.mediator_agent_id && (
                          <div><strong>Mediator:</strong> {session.mediator_agent_id}</div>
                        )}
                        <div><strong>Created:</strong> {new Date(session.created_at).toLocaleString()}</div>
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>

              {/* Recent Transcripts */}
              <Card>
                <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getSessionTranscripts(selectedSession).map((transcript) => (
                      <div key={transcript.id} className="border-b pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{transcript.speaker_agent_id}</span>
                          <Badge variant="outline" className="text-xs">
                            {transcript.ucp_message.message_type}
                          </Badge>
                        </div>
                        <div className="text-xs bg-muted p-2 rounded">
                          {JSON.stringify(transcript.ucp_message.payload, null, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Simulation Result */}
              {(() => {
                const simulation = getSessionSimulation(selectedSession)
                return simulation ? (
                  <Card className="col-span-2">
                    <CardHeader><CardTitle>Simulation Result</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Risk Score</span>
                          <span className="text-lg font-bold">{simulation.risk_score}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recommendation</span>
                          <span className={`text-lg font-bold ${
                            simulation.recommendation === 'PROCEED' ? 'text-green-600' :
                            simulation.recommendation === 'CAUTION' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {simulation.recommendation}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Penalty</span>
                          <span className="text-lg font-bold">${simulation.recommended_penalty}/day</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded text-sm">
                        <p className="font-medium mb-2">Reasoning:</p>
                        <p>{simulation.reasoning || 'No reasoning provided'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
