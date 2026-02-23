import { Layers, Clock, Coins, Shield } from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Consensus Ordering",
    description: "HCS provides fair, timestamped ordering of all negotiation messages with cryptographic proof."
  },
  {
    icon: Clock,
    title: "Instant Finality",
    description: "Transactions achieve finality in 3-5 seconds with no possibility of reversal or fork."
  },
  {
    icon: Coins,
    title: "Micro-Settlement",
    description: "HTS enables fractional token transfers for precise escrow and penalty execution."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "aBFT consensus with governance by world-leading organizations ensures trust."
  }
]

export function WhyHedera() {
  return (
    <section id="why-hedera" className="border-t border-border/50 bg-secondary/30 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Why Hedera
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            The public ledger built for enterprise-grade autonomous agreements
          </p>
        </div>
        
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="glass-panel rounded-lg p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
