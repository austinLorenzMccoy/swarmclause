# 🧠 SWARMCLAUSE — MVP PRD v2.0

**Autonomous AI Negotiation + Simulation + Settlement Infrastructure**

---

## 1. Product Overview

### Product Name
## SWARMCLAUSE

### Tagline
**Autonomous Contracts Negotiated by AI, Settled by Hedera**

### One-Liner
SWARMCLAUSE is a multi-agent contract negotiation system where autonomous AI agents negotiate terms, simulate outcomes, and execute binding agreements instantly on Hedera — with real-time visibility powered by Supabase.

---

## 2. Problem Statement

Contracts today are:
- Written manually
- Slow to negotiate
- Expensive to enforce
- Static even when conditions change
- Reliant on legal intermediaries

In the AI economy, agents need:
- Real-time agreement formation
- Programmable enforcement
- Transparent negotiation history
- Instant settlement

---

## 3. Solution

SWARMCLAUSE enables:

### 🤝 Agent-to-Agent Negotiation
Multiple agents represent parties and negotiate terms dynamically.

### 🧪 Simulation Before Signing
A simulation agent stress-tests contract outcomes.

### ⚡ Auto-Execution
Once agreement is reached, Hedera smart contracts execute escrow + settlement.

### 📜 Immutable Transcript
Negotiation dialogue is logged on Hedera Consensus Service (HCS).

### 👁 Real-Time Human Observation
Supabase Realtime streams live agent activity to the observer dashboard — no polling needed.

---

## 4. Target Users

| User Type           | Use Case                         |
|---------------------|----------------------------------|
| AI marketplaces     | Agents negotiating service terms |
| DeFi protocols      | Autonomous agreement execution   |
| Supply chain actors | Delivery/payment contracts       |
| Enterprises         | Smart procurement negotiation    |
| Hackathon Judges    | Observing autonomous agent flows |

---

## 5. MVP Scope (4 Weeks)

### MVP Goal
Deliver a working demo where:
1. Two agents negotiate price + delivery terms
2. Simulation agent evaluates risk
3. Agreement is finalized
4. Smart contract escrows payment
5. Settlement executes automatically
6. Transcript is verifiable via HCS
7. Human observers watch everything live via Supabase Realtime

---

# 6. Core Features (MVP)

---

## Feature 1 — Authentication with OAuth (Supabase Auth)

### Description
Human observers (judges, operators, enterprise users) authenticate via Google OAuth before accessing the negotiation dashboard. This creates a secure, multi-tenant environment where each user sees only their own negotiation sessions.

### Supabase Integration
- **Google OAuth** via `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Session management with real-time auth state using `supabase.auth.onAuthStateChange()`
- User context propagated throughout the app via `AuthContext`

### Code Locations
- `src/contexts/AuthContext.tsx` — global auth state provider
- `src/components/LoginForm.tsx` — Google OAuth trigger
- `src/lib/supabase.ts` — Supabase client initialization

### User Flow
1. Visitor lands on SwarmClause
2. Clicks "Sign in with Google"
3. Redirected to dashboard scoped to their sessions

---

## Feature 2 — Contract Negotiation Room

### Description
A live environment where:
- BuyerAgent proposes terms
- SellerAgent counters
- MediatorAgent guides convergence

### Output
Final contract terms JSON:
```json
{
  "price": 250,
  "delivery_days": 5,
  "penalty": 20,
  "escrow": true
}
```

### Groq Role
Groq powers negotiation reasoning + counteroffers.

### Supabase Integration
- Each negotiation round is written to the `offers` table via auto-generated REST APIs
- No custom backend endpoint needed for CRUD — Supabase handles it
- TypeScript types auto-generated from schema

### Code Locations
- `src/lib/supabase.ts` — typed Supabase client
- `src/components/NegotiationRoom.tsx` — reads/writes offers table

---

## Feature 3 — Real-Time Negotiation Feed (Supabase Realtime)

### Description
Every offer, counteroffer, and acceptance is streamed live to the observer dashboard the moment it happens. Multiple human observers (judges) can watch simultaneously without any page refresh.

### Supabase Integration
- **Real-time subscriptions** on the `offers` table using `supabase.channel()`
- WebSocket-based — zero polling
- Supports multiple concurrent observers with live sync

### Code Location
- `src/components/NegotiationRoom.tsx` — `setupRealtimeSubscriptions()` function

### Example Subscription
```typescript
supabase
  .channel('negotiation-room')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'offers',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    setOffers(prev => [...prev, payload.new])
  })
  .subscribe()
```

---

## Feature 4 — Negotiation Transcript Logging (HCS + Supabase)

### Description
Every negotiation step is dual-logged:
- **Hedera HCS** — immutable, fair-ordered, tamper-proof
- **Supabase** — queryable, human-readable, real-time

### HCS Message Format
```json
{
  "sessionId": "NEG-101",
  "speaker": "SellerAgent",
  "proposal": "Price = 280, Delivery = 4 days",
  "timestamp": "..."
}
```

### Supabase Integration
- `transcripts` table stores every HCS message with its topic ID and sequence number
- Auto-generated REST API for querying transcript history
- Database triggers auto-update `updated_at` timestamps on every insert

### Code Locations
- `database.sql` — `update_updated_at_column` trigger function
- `src/lib/supabase.ts` — transcript insert helpers

---

## Feature 5 — Row Level Security (Multi-Tenant Sessions)

### Description
Each authenticated user can only view and modify their own negotiation sessions. Database-level security enforces this — no application-layer filtering needed.

### Supabase Integration
- **RLS policies** on `sessions`, `offers`, and `transcripts` tables
- Policies tied to `auth.uid()` — server enforced, not client enforced
- Multi-tenant architecture: enterprises can run private negotiations

### Code Location
- `database.sql` — RLS policy definitions

### RLS Policy Examples
```sql
-- Users see only their own sessions
CREATE POLICY "Users see own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = owner_id);

-- Users can only insert offers into their own sessions
CREATE POLICY "Users insert own offers"
  ON offers FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE owner_id = auth.uid()
    )
  );
```

---

## Feature 6 — Simulation Agent (Outcome Stress Test)

### Description
Before execution, simulation agent runs:
- Failure scenarios
- Delivery delay risk
- Dispute likelihood
- Payoff fairness

### Output Example
```json
{
  "risk_score": 0.18,
  "recommended_penalty": 25,
  "confidence": "HIGH"
}
```

### Groq Role
Groq generates reasoning + risk explanation.

### Supabase Integration
- Simulation results stored in `simulations` table
- Real-time subscription pushes results to dashboard the moment Groq responds
- Database function validates risk score range at insert time

---

## Feature 7 — Settlement Notifications (Supabase Edge Functions)

### Description
When a contract is finalized and escrow is settled on Hedera, a Supabase Edge Function fires automatically — notifying relevant parties via webhook, email, or Slack without any server management.

### Supabase Integration
- **Edge Function** `contract-settlement-notification` triggers on `status = 'COMPLETED'` in the `sessions` table
- Calls external webhook / sends email confirmation
- Can integrate with Slack for enterprise operator alerts

### Code Locations
- `supabase/functions/contract-settlement-notification/index.ts` — serverless handler
- `src/components/ContractViewer.tsx` — `triggerSettlementNotification()` caller

### Edge Function Logic
```typescript
// supabase/functions/contract-settlement-notification/index.ts
Deno.serve(async (req) => {
  const { session_id, final_price, settlement_tx } = await req.json()
  
  // Notify external systems
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      message: `Contract ${session_id} settled at $${final_price}`,
      hedera_tx: settlement_tx
    })
  })
  
  return new Response('Notified', { status: 200 })
})
```

---

## Feature 8 — Binding Agreement Smart Contract (Hedera)

### Description
Once both agents accept:
- Contract is deployed
- Escrow is locked
- Settlement conditions activate

### Hedera Integration
Smart Contract handles:
- Escrow holding
- Milestone completion
- Penalties
- Payout execution

### Supabase Integration
- Contract deployment tx hash stored in `sessions` table
- Contract state changes trigger real-time dashboard updates

---

## Feature 9 — Escrow + Settlement Token Flow (HTS)

### Description
Payments happen through HTS tokens:
- Buyer deposits escrow
- Seller receives payout
- Penalty applied if breach

### MVP Simplification
Use testnet token transfers only. All transfer records mirrored to Supabase for dashboard display.

---

## Feature 10 — Agreement Dashboard (Judge-Friendly)

### Pages
| Page                  | Purpose                          |
|-----------------------|----------------------------------|
| Landing               | Explain SwarmClause + Sign In    |
| Negotiation Room      | Live agent dialogue (Realtime)   |
| Simulation Report     | Risk + recommendation            |
| Contract Viewer       | Final terms + status             |
| Hedera Transcript Feed| HCS log explorer                 |
| Session History       | Past negotiations (RLS-scoped)   |

---

# 7. MVP User Stories

### Buyer Agent
- I want to negotiate the lowest price with safe delivery guarantees

### Seller Agent
- I want fair compensation and clear penalty rules

### Mediator Agent
- I want both parties to converge quickly

### Human Observer / Judge
- I want to sign in and watch live agent negotiations in real-time
- I want to verify the Hedera transcript independently
- I want to be notified when settlement completes

---

# 8. Tech Stack

| Layer                 | Technology                       |
|-----------------------|----------------------------------|
| Frontend              | Next.js + Tailwind               |
| Auth                  | Supabase Auth (Google OAuth)     |
| Real-time             | Supabase Realtime (WebSockets)   |
| Database              | Supabase (PostgreSQL + RLS)      |
| REST APIs             | Supabase Auto-generated          |
| Serverless Functions  | Supabase Edge Functions          |
| AI Reasoning          | Groq API                         |
| Negotiation Ordering  | Hedera HCS                       |
| Escrow + Enforcement  | Hedera Smart Contracts           |
| Payments              | Hedera HTS                       |
| Deployment            | Vercel + Supabase Cloud          |

> **Note:** SQLite is replaced entirely by Supabase (PostgreSQL). Supabase provides persistence, real-time, auth, RLS, and serverless functions — eliminating the need for a separate backend API server for most operations.

---

# 9. Database Schema (Supabase / PostgreSQL)

```sql
-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  buyer_agent TEXT NOT NULL,
  seller_agent TEXT NOT NULL,
  status TEXT DEFAULT 'negotiating'
    CHECK (status IN ('negotiating','accepted','escrow_locked','completed','penalized')),
  contract_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers
CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  agent TEXT NOT NULL,
  price INTEGER NOT NULL,
  delivery_days INTEGER NOT NULL,
  penalty INTEGER,
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcripts (mirrors HCS)
CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  speaker TEXT NOT NULL,
  message JSONB NOT NULL,
  hcs_topic_id TEXT,
  hcs_sequence_number BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulations
CREATE TABLE simulations (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  risk_score NUMERIC(4,2),
  recommended_penalty INTEGER,
  confidence TEXT,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_transcript_updated_at
  BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sessions" ON sessions
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users see own offers" ON offers
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users see own transcripts" ON transcripts
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users see own simulations" ON simulations
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );
```

---

# 🏗 System Design (MVP Architecture)

```
 ┌──────────────────────────────────────────┐
 │              Frontend UI                  │
 │  Next.js + Tailwind                       │
 │  Negotiation Room | Dashboard | Explorer  │
 └───────────────────┬──────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   Supabase Platform  │
          │                     │
          │ ┌─────────────────┐ │
          │ │  Auth (OAuth)   │ │  ← Google sign-in
          │ └─────────────────┘ │
          │ ┌─────────────────┐ │
          │ │  PostgreSQL DB  │ │  ← sessions, offers, transcripts
          │ │  + RLS Policies │ │
          │ └─────────────────┘ │
          │ ┌─────────────────┐ │
          │ │   Realtime      │ │  ← WebSocket live feed
          │ │   Subscriptions │ │
          │ └─────────────────┘ │
          │ ┌─────────────────┐ │
          │ │  Edge Functions │ │  ← Settlement notifications
          │ └─────────────────┘ │
          └──────────┬──────────┘
                     │
     ┌───────────────▼───────────────┐
     │         Groq Agents           │
     │  BuyerAgent | SellerAgent     │
     │  MediatorAgent | SimAgent     │
     └───────────────┬───────────────┘
                     │
     ┌───────────────▼───────────────────────┐
     │         Hedera Network Layer           │
     │                                       │
     │  HCS → Transcript Ordering + Proof    │
     │  SC  → Agreement Enforcement          │
     │  HTS → Escrow + Settlement Tokens     │
     └───────────────────────────────────────┘
```

---

# 🔥 Perfect MVP Demo Flow (Judges Will Love)

1. Judge opens SwarmClause → signs in with Google (Supabase Auth)
2. Creates a new negotiation session → stored in Supabase with RLS
3. BuyerAgent proposes: $200, 7 days → real-time update fires to dashboard
4. SellerAgent counters: $280, 4 days → real-time update fires to dashboard
5. MediatorAgent converges: $240, 5 days → HCS message published
6. SimulationAgent: "Risk low, penalty should be $25" → simulation stored
7. Both agents accept → contract deploys on Hedera, escrow locks
8. Settlement executes → Edge Function fires, webhook notified
9. Transcript visible in Hedera HCS feed + mirrored in Supabase
10. Judge sees full history scoped to their session via RLS

Judges see:
- ✅ AI agents negotiating autonomously
- ✅ HCS transcript ordering + proof
- ✅ Smart contract enforcement
- ✅ HTS settlement
- ✅ Google OAuth + secure sessions
- ✅ Live real-time feed (no refresh)
- ✅ Serverless settlement notifications
- ✅ Multi-tenant security via RLS

---

# 🏆 Why SwarmClause Scores 10/10

| Criterion   | Why It Wins                                             |
|-------------|---------------------------------------------------------|
| Innovation  | Negotiation + simulation + execution is rare            |
| Integration | HCS + SC + HTS + Supabase deeply used                  |
| Execution   | MVP is small but powerful, no backend server needed     |
| Realtime    | Judges observe live agent behaviour without polling     |
| Security    | RLS + OAuth — enterprise-grade from day one             |
| Success     | Foundation for agent marketplaces + agentic economy    |
| Validation  | Demo is instantly understandable                        |