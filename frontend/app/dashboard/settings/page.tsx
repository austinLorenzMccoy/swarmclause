"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Settings, Key, Globe, Database, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const [groqKey, setGroqKey] = useState("")
  const [isTestnet, setIsTestnet] = useState(true)
  const [saved, setSaved] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Not configured"
  const supabaseKeyPreview = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 12)}...`
    : "Not configured"

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your SwarmClause environment</p>
      </div>

      {/* Supabase Config — read only */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Database className="h-5 w-5 text-primary" /> Supabase Connection
          </CardTitle>
          <CardDescription>Read-only — configured via environment variables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Supabase URL</Label>
            <Input value={supabaseUrl} readOnly className="font-mono text-sm bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Anon Key (preview)</Label>
            <Input value={supabaseKeyPreview} readOnly className="font-mono text-sm bg-secondary/50" />
          </div>
          <Badge variant="outline" className={supabaseUrl !== "Not configured" ? "border-green-500/50 text-green-400" : "border-destructive/50 text-destructive"}>
            {supabaseUrl !== "Not configured" ? <><CheckCircle2 className="mr-1 h-3 w-3" />Connected</> : <><AlertCircle className="mr-1 h-3 w-3" />Not configured</>}
          </Badge>
        </CardContent>
      </Card>

      {/* Groq API */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Key className="h-5 w-5 text-primary" /> Groq API
          </CardTitle>
          <CardDescription>Powers AI agent negotiation logic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groq">API Key</Label>
            <Input id="groq" type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..." />
          </div>
        </CardContent>
      </Card>

      {/* Network */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-primary" /> Hedera Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div><Label>Testnet Mode</Label><p className="text-xs text-muted-foreground">Uses Hedera testnet for development</p></div>
            <Switch checked={isTestnet} onCheckedChange={setIsTestnet} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">
          {saved ? <><CheckCircle2 className="mr-2 h-4 w-4" />Saved</> : "Save Settings"}
        </Button>
        <Button variant="outline" className="bg-transparent"><RefreshCw className="mr-2 h-4 w-4" />Reset</Button>
      </div>
    </div>
  )
}
