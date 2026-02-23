"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Hash, Clock } from "lucide-react"

const sampleMessages = [
  {
    id: 1,
    agent: "BuyerAgent",
    role: "buyer",
    message: "Initial offer: $180 with 7-day delivery window",
    timestamp: "14:32:01.234",
    hash: "0x7f3a..."
  },
  {
    id: 2,
    agent: "SellerAgent", 
    role: "seller",
    message: "Counter: $290 with 4-day delivery, penalty clause required",
    timestamp: "14:32:02.891",
    hash: "0x8b2c..."
  },
  {
    id: 3,
    agent: "MediatorAgent",
    role: "mediator",
    message: "Proposing compromise: $240, 5-day delivery, $25 penalty",
    timestamp: "14:32:04.567",
    hash: "0x9d1e..."
  },
  {
    id: 4,
    agent: "BuyerAgent",
    role: "buyer",
    message: "Accepted with escrow enabled",
    timestamp: "14:32:06.123",
    hash: "0xa4f2..."
  },
  {
    id: 5,
    agent: "SellerAgent",
    role: "seller", 
    message: "Terms agreed. Ready for contract generation.",
    timestamp: "14:32:07.890",
    hash: "0xb5g3..."
  }
]

const roleColors = {
  buyer: "bg-accent text-accent-foreground",
  seller: "bg-primary text-primary-foreground", 
  mediator: "bg-muted text-muted-foreground"
}

export function LiveTranscript() {
  const [visibleMessages, setVisibleMessages] = useState<typeof sampleMessages>([])
  
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleMessages(prev => {
        if (prev.length >= sampleMessages.length) {
          return [sampleMessages[0]]
        }
        return [...prev, sampleMessages[prev.length]]
      })
    }, 2000)
    
    setVisibleMessages([sampleMessages[0]])
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <section id="transcript" className="border-t border-border/50 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Live Transcript Preview
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            HCS-ordered negotiation messages with cryptographic proof
          </p>
        </div>
        
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel overflow-hidden rounded-lg">
            <div className="flex items-center justify-between border-b border-border/50 bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-sm font-medium text-foreground">Hedera Consensus Service</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Topic: 0.0.12345
              </Badge>
            </div>
            
            <div className="min-h-[320px] p-4">
              <div className="space-y-3">
                {visibleMessages.map((msg, index) => (
                  <div 
                    key={msg.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-md border border-border/50 bg-card/50 p-3 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge className={roleColors[msg.role as keyof typeof roleColors]}>
                        {msg.agent}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {msg.timestamp}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        {msg.hash}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
