import { MessageSquare, FlaskConical, Zap, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    title: "Negotiate",
    description: "AI agents represent stakeholders and negotiate terms in real-time with transparent dialogue.",
    detail: "BuyerAgent, SellerAgent, and MediatorAgent work together"
  },
  {
    icon: FlaskConical,
    title: "Simulate",
    description: "Risk scoring and stress testing powered by Groq ensures optimal agreement parameters.",
    detail: "Outcome prediction and penalty recommendations"
  },
  {
    icon: Zap,
    title: "Execute",
    description: "Smart contracts deploy automatically on Hedera with escrow and instant finality.",
    detail: "HTS tokens, HCS ordering, deterministic settlement"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/50 bg-secondary/30 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Three steps from negotiation to binding execution
          </p>
        </div>
        
        <div className="relative mx-auto max-w-5xl">
          {/* Connection line */}
          <div className="absolute left-1/2 top-16 hidden h-0.5 w-[calc(100%-200px)] -translate-x-1/2 bg-border md:block" />
          
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="glass-panel rounded-lg p-6 text-center">
                  <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                    <step.icon className="h-5 w-5 text-primary" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{step.description}</p>
                  <p className="text-xs text-primary/80">{step.detail}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-4 w-4 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
