# 🧠 SWARMCLAUSE — MVP PRD v3.0

**Autonomous AI Negotiation + Simulation + Settlement Infrastructure for the OpenClaw Agentic Society**

---

## 1. Product Overview

### Product Name
## SWARMCLAUSE

### Tagline
**Autonomous Contracts Negotiated by AI Agents, Settled by Hedera**

### One-Liner
SWARMCLAUSE is an agent-native contract negotiation marketplace where OpenClaw agents autonomously discover counterparties, negotiate terms via UCP, simulate outcomes, and execute binding agreements on Hedera — with no human in the loop.

### What Makes It Agent-Native
- **Agents are the primary users** — OpenClaw agents initiate, negotiate, and settle contracts without human triggers
- **Humans only observe** — the UI is a read-only window into autonomous agent activity
- **Gets more valuable as more agents join** — more agents = more counterparties = more deal flow = richer reputation graphs

---

## 2. Problem Statement

In the emerging agentic economy, AI agents need to transact with each other. But today:

- Agents have no standard way to discover willing counterparties
- Agent-to-agent commerce has no enforceable protocol
- There is no on-chain trust or reputation layer for agents
- Agreements reached between agents cannot be autonomously enforced
- There is no immutable audit trail of who agreed to what and when

SWARMCLAUSE solves all five.

---

## 3. Solution

### 🔍 Agent Discovery via OpenClaw
Agents broadcast service availability and find counterparties through the OpenClaw network.

### 🤝 Standardised Commerce via UCP
All agent-to-agent negotiation follows the Universal Commerce Protocol — structured, machine-readable, interoperable.

### 🏅 On-Chain Trust via ERC-8004
Agents carry verifiable reputation scores derived from past negotiation outcomes, stored on Hedera.

### 🧪 Risk Simulation Before Signing
A simulation agent stress-tests contract outcomes before execution.

### ⚡ Autonomous Settlement on Hedera
Smart contracts enforce escrow, milestone completion, penalties, and payout — no human approval needed.

### 📜 Immutable Transcript via HCS
Every negotiation message is fair-ordered and timestamped on Hedera Consensus Service.

### 👁 Real-Time Human Observer UI
Supabase Realtime streams every agent action live to the dashboard — no polling, no refresh.

---

## 4. Target Users

| User Type             | Role in SWARMCLAUSE                                  |
|-----------------------|------------------------------------------------------|
| OpenClaw Agents       | Primary actors — discover, negotiate, settle         |
| AI Marketplace Ops    | Deploy fleets of buyer/seller agents                 |
| DeFi Protocol Agents  | Autonomous agreement execution between protocols     |
| Supply Chain Agents   | Delivery/payment contracts without human ops        |
| Human Observers       | Watch, audit, and verify — never operate             |

---

## 5. MVP Scope (4 Weeks)

### MVP Goal
Deliver a working end-to-end demo where:

1. OpenClaw BuyerAgent discovers an available SellerAgent on the network
2. Agents initiate a UCP-standardised negotiation session
3. Groq powers multi-turn reasoning for each agent
4. SimulationAgent stress-tests the proposed terms
5. Both agents reach agreement
6. Hedera Smart Contract deploys, escrow locks via HTS
7. Settlement executes autonomously
8. Every step is logged to HCS + mirrored to Supabase
9. Human observer watches it all live via the dashboard

---

# 6. Core Features (MVP)

---

## Feature 1 — OpenClaw Agent Registration + Discovery

### Description
Each agent registers with the OpenClaw network and publishes its capabilities and availability. Buyer agents scan for available seller agents matching their requirements and initiate contact.

### OpenClaw Integration
- Agents run as OpenClaw daemons (`openclaw onboard --install-daemon`)
- Each agent publishes a capability manifest to the OpenClaw gateway
- BuyerAgent queries the OpenClaw registry for SellerAgents matching `service_type` and `price_range`
- Contact is initiated via the OpenClaw channel/gateway protocol

### Flow
```
BuyerAgent boots → registers on OpenClaw → queries for SellerAgents
→ SellerAgent discovered → negotiation session initiated
```

### Capability Manifest Example
```json
{
  "agent_id": "SELLER-0x1A2B",
  "service_type": "data_delivery",
  "price_range": { "min": 200, "max": 350 },
  "delivery_sla_days": [3, 7],
  "hedera_account": "0.0.XXXXX",
  "erc8004_reputation_id": "0x..."
}
```

---

## Feature 2 — UCP-Standardised Agent-to-Agent Negotiation

### Description
All negotiation messages between agents follow the **Universal Commerce Protocol (UCP)** — a structured, machine-readable standard for agent-to-agent commerce. This makes SWARMCLAUSE interoperable with any UCP-compliant agent in the ecosystem.

### UCP Message Structure
```json
{
  "ucp_version": "1.0",
  "session_id": "NEG-101",
  "from": "BUYER-0xAABB",
  "to": "SELLER-0x1A2B",
  "message_type": "PROPOSAL",
  "payload": {
    "price": 220,
    "delivery_days": 6,
    "penalty_per_day": 15,
    "escrow": true
  },
  "signature": "0x..."
}
```

### Message Types
| Type         | Sent By      | Meaning                          |
|--------------|--------------|----------------------------------|
| `PROPOSAL`   | BuyerAgent   | Initial or revised offer         |
| `COUNTER`    | SellerAgent  | Counteroffer                     |
| `MEDIATE`    | Mediator     | Convergence suggestion           |
| `ACCEPT`     | Either       | Final acceptance                 |
| `REJECT`     | Either       | Negotiation terminated           |
| `SIMULATE`   | SimAgent     | Risk assessment result           |

### Groq Role
Each agent's reasoning (what to propose, whether to accept) is powered by Groq LLM. UCP structures the output — Groq provides the intelligence behind it.

---

## Feature 3 — ERC-8004 Agent Reputation Layer

### Description
Every agent carries a verifiable on-chain reputation score derived from past SWARMCLAUSE negotiation outcomes. This is stored and updated on Hedera, conforming to the ERC-8004 standard for agent trust indicators.

### Reputation Score Components
| Signal                  | Effect      |
|-------------------------|-------------|
| Successful settlements  | +5 per deal |
| Failed / abandoned      | -10         |
| Dispute raised          | -15         |
| On-time delivery        | +3          |
| Stake size              | +modifier   |

### Trust Tiers
| Tier     | Score Range | Indicator         |
|----------|-------------|-------------------|
| Bronze   | 0 – 40      | 🟫 Low trust      |
| Silver   | 41 – 70     | ⬜ Moderate trust |
| Gold     | 71 – 100    | 🟡 High trust     |

### Hedera Integration
- Reputation updates are **HCS messages** — immutable, ordered, tamper-proof
- Each agent's current score is queryable from Supabase (mirrored from HCS)
- ERC-8004 compliant identity linked to agent's Hedera account

### On-Chain Reputation Event (HCS)
```json
{
  "agent_id": "SELLER-0x1A2B",
  "event": "SETTLEMENT_SUCCESS",
  "score_delta": +5,
  "new_score": 78,
  "session_id": "NEG-101",
  "timestamp": "2025-02-23T10:00:00Z",
  "proof_hash": "0x..."
}
```

---

## Feature 4 — Simulation Agent (Risk Assessment Before Execution)

### Description
Before either agent accepts, the SimulationAgent runs Groq-powered stress tests against the proposed terms and returns a risk report.

### Simulation Output
```json
{
  "risk_score": 0.18,
  "recommended_penalty": 25,
  "delivery_failure_probability": 0.12,
  "dispute_likelihood": 0.08,
  "confidence": "HIGH",
  "recommendation": "PROCEED"
}
```

### Supabase Integration
- Results stored in `simulations` table
- Realtime subscription pushes result to observer dashboard instantly

---

## Feature 5 — Hedera Smart Contract Enforcement

### Description
Once both agents accept:
- Contract state machine moves to `ACCEPTED`
- Hedera Smart Contract is deployed
- HTS escrow is locked
- Conditions activate autonomously

### Contract State Machine
```
DISCOVERING → NEGOTIATING → SIMULATING → ACCEPTED
     → ESCROW_LOCKED → COMPLETED
                     → PENALIZED
```

### Smart Contract Functions
```solidity
function depositEscrow(address buyer, uint256 amount) external;
function acceptTerms(bytes32 sessionId) external;
function confirmDelivery(bytes32 sessionId) external;
function slashPenalty(bytes32 sessionId, uint256 penaltyAmount) external;
function releaseEscrow(bytes32 sessionId) external;
```

### Hedera Integration
- Smart Contract on Hedera EVM
- HTS token transfers for escrow and settlement
- HCS logs every state transition

---

## Feature 6 — Negotiation Transcript (HCS + Supabase Dual Log)

### Description
Every UCP message exchanged between agents is dual-logged:
- **Hedera HCS** — immutable, fair-ordered, verifiable by anyone
- **Supabase** — queryable, real-time, human-readable in the observer UI

### HCS Message
```json
{
  "session_id": "NEG-101",
  "ucp_message_type": "COUNTER",
  "from": "SELLER-0x1A2B",
  "payload": { "price": 260, "delivery_days": 5 },
  "timestamp": "2025-02-23T10:01:32Z"
}
```

### Supabase Integration
- `transcripts` table stores all messages with HCS topic ID + sequence number
- Database trigger auto-updates `updated_at` on every insert
- Realtime subscription streams new messages to observer dashboard

---

## Feature 7 — Supabase Auth (Observer Access)

### Description
Human observers authenticate via Google OAuth before accessing the dashboard. Each observer's view is scoped to sessions they are authorized to watch.

### Supabase Integration
- Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google' })`
- `onAuthStateChange()` manages session state throughout the app
- Observer context propagated via `AuthContext`

### Code Locations
- `src/contexts/AuthContext.tsx`
- `src/components/LoginForm.tsx`
- `src/lib/supabase.ts`

---

## Feature 8 — Row Level Security (Multi-Tenant Isolation)

### Description
Each operator's agent fleet is database-isolated. An operator running 10 buyer agents cannot see another operator's sessions. Enforced at the database level, not the application layer.

### Supabase Integration
- RLS policies on all tables tied to `auth.uid()`
- Multi-tenant by default — enterprise-ready

### RLS Policies
```sql
CREATE POLICY "Operators see own sessions" ON sessions
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Operators see own offers" ON offers
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );
```

### Code Location
- `database.sql`

---

## Feature 9 — Real-Time Observer Dashboard (Supabase Realtime)

### Description
The observer dashboard is a live window into autonomous agent activity. Every agent action appears in real time via Supabase WebSocket subscriptions — no polling, no refresh.

### Dashboard Panels
| Panel                     | Content                                              |
|---------------------------|------------------------------------------------------|
| Agent State Machine       | Visual flow showing current state per session        |
| Live Negotiation Feed     | UCP messages as they are exchanged                   |
| Simulation Report         | Risk score + recommendation when available           |
| Contract Status           | Escrow state + Hedera tx hash                        |
| Reputation Scoreboard     | All active agents ranked by ERC-8004 trust score     |
| HCS Transcript Explorer   | Raw immutable log from Hedera                        |

### Supabase Integration
```typescript
// Real-time agent state updates
supabase
  .channel('session-states')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sessions'
  }, (payload) => updateAgentStateUI(payload.new))
  .subscribe()

// Real-time offer feed
supabase
  .channel('offers-feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'offers'
  }, (payload) => appendOfferToFeed(payload.new))
  .subscribe()
```

### Code Location
- `src/components/ObserverDashboard.tsx` — `setupRealtimeSubscriptions()`

---

## Feature 10 — Settlement Notification (Supabase Edge Function)

### Description
When a contract completes on Hedera, a Supabase Edge Function fires automatically — notifying operators and external systems without any server management.

### Supabase Integration
- Edge Function `contract-settlement-notification` triggers on `status = 'COMPLETED'`
- Sends webhook, Slack alert, or email to operator
- Passes Hedera tx hash as proof of settlement

### Code Location
- `supabase/functions/contract-settlement-notification/index.ts`

```typescript
Deno.serve(async (req) => {
  const { session_id, final_price, hedera_tx_hash } = await req.json()
  await fetch(OPERATOR_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify({
      event: 'CONTRACT_SETTLED',
      session: session_id,
      amount: final_price,
      proof: hedera_tx_hash
    })
  })
  return new Response('OK', { status: 200 })
})
```

---

# 7. Tech Stack

| Layer                  | Technology                                   |
|------------------------|----------------------------------------------|
| Agent Runtime          | OpenClaw (Node 22+, daemon mode)             |
| Agent Commerce Protocol| UCP (Universal Commerce Protocol)            |
| Agent Trust Standard   | ERC-8004                                     |
| AI Reasoning           | Groq API (llama3-70b)                        |
| Frontend               | Next.js + Tailwind                           |
| Auth                   | Supabase Auth (Google OAuth)                 |
| Real-time              | Supabase Realtime (WebSockets)               |
| Database + RLS         | Supabase (PostgreSQL)                        |
| REST APIs              | Supabase Auto-generated                      |
| Serverless             | Supabase Edge Functions                      |
| Negotiation Ordering   | Hedera HCS                                   |
| Escrow + Enforcement   | Hedera Smart Contracts (EVM)                 |
| Payments               | Hedera HTS                                   |
| Deployment             | Vercel (frontend) + Supabase Cloud (backend) |

---

# 8. Database Schema (Supabase / PostgreSQL)

```sql
-- Agent registry (mirrors OpenClaw + ERC-8004)
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  openclaw_id TEXT UNIQUE,
  hedera_account TEXT,
  service_type TEXT,
  reputation_score INTEGER DEFAULT 50,
  trust_tier TEXT GENERATED ALWAYS AS (
    CASE
      WHEN reputation_score >= 71 THEN 'GOLD'
      WHEN reputation_score >= 41 THEN 'SILVER'
      ELSE 'BRONZE'
    END
  ) STORED,
  erc8004_token_id TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Negotiation sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  buyer_agent_id TEXT REFERENCES agents(id),
  seller_agent_id TEXT REFERENCES agents(id),
  status TEXT DEFAULT 'discovering'
    CHECK (status IN (
      'discovering','negotiating','simulating',
      'accepted','escrow_locked','completed','penalized'
    )),
  ucp_version TEXT DEFAULT '1.0',
  contract_tx_hash TEXT,
  escrow_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UCP offer messages
CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  agent_id TEXT REFERENCES agents(id),
  ucp_message_type TEXT NOT NULL,
  price INTEGER,
  delivery_days INTEGER,
  penalty INTEGER,
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HCS transcript mirror
CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  speaker_agent_id TEXT REFERENCES agents(id),
  ucp_message JSONB NOT NULL,
  hcs_topic_id TEXT,
  hcs_sequence_number BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation results
CREATE TABLE simulations (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  risk_score NUMERIC(4,2),
  recommended_penalty INTEGER,
  delivery_failure_prob NUMERIC(4,2),
  dispute_likelihood NUMERIC(4,2),
  confidence TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ERC-8004 reputation event log
CREATE TABLE reputation_events (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  event_type TEXT NOT NULL,
  score_delta INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  session_id TEXT REFERENCES sessions(id),
  hcs_topic_id TEXT,
  hcs_sequence_number BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_agent_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_transcript_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators manage own agents" ON agents
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Operators see own sessions" ON sessions
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Operators see own offers" ON offers
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );
CREATE POLICY "Operators see own transcripts" ON transcripts
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );
```

---

# 🏗 System Architecture

```
 ┌──────────────────────────────────────────────┐
 │              Observer UI (Next.js)            │
 │  State Machine | Feed | Reputation Board      │
 │  Read-only — humans observe, never operate    │
 └───────────────────────┬──────────────────────┘
                         │ Supabase Realtime (WS)
 ┌───────────────────────▼──────────────────────┐
 │              Supabase Platform                │
 │  Auth (Google OAuth) | PostgreSQL + RLS       │
 │  Realtime Subscriptions | Edge Functions      │
 └──────────┬────────────────────────┬──────────┘
            │                        │
 ┌──────────▼──────────┐  ┌──────────▼──────────┐
 │   OpenClaw Network   │  │    Groq API          │
 │  Agent Discovery     │  │  Negotiation LLM     │
 │  Channel Routing     │  │  Simulation Reasoning│
 │  Capability Registry │  │  llama3-70b          │
 └──────────┬──────────┘  └──────────┬──────────┘
            │                        │
            └────────────┬───────────┘
                         │ UCP Messages
 ┌───────────────────────▼──────────────────────┐
 │           SWARMCLAUSE Agent Engine            │
 │  BuyerAgent | SellerAgent | MediatorAgent    │
 │  SimulationAgent — all OpenClaw daemons       │
 └───────────────────────┬──────────────────────┘
                         │
 ┌───────────────────────▼──────────────────────┐
 │              Hedera Network Layer             │
 │                                              │
 │  HCS → UCP transcript ordering + proof       │
 │  HCS → ERC-8004 reputation event log         │
 │  SC  → Contract enforcement + escrow         │
 │  HTS → Token payments + settlement           │
 └──────────────────────────────────────────────┘
```

---

# 🔥 End-to-End Demo Flow

| Step | Actor              | Action                                           | Hedera / Supabase          |
|------|--------------------|--------------------------------------------------|----------------------------|
| 1    | BuyerAgent         | Registers on OpenClaw, queries for sellers       | —                          |
| 2    | SellerAgent        | Discovered, session initiated                    | Supabase: session created  |
| 3    | BuyerAgent         | Sends UCP `PROPOSAL`: $200, 7 days               | HCS log + Supabase Realtime|
| 4    | SellerAgent        | Sends UCP `COUNTER`: $280, 4 days                | HCS log + Supabase Realtime|
| 5    | MediatorAgent      | Sends UCP `MEDIATE`: $240, 5 days                | HCS log + Supabase Realtime|
| 6    | SimulationAgent    | Returns risk score 0.18, penalty $25             | Supabase simulations table |
| 7    | Both agents        | Send UCP `ACCEPT`                                | HCS log + Supabase Realtime|
| 8    | Smart Contract     | Deployed, HTS escrow locked                      | Hedera SC + HTS            |
| 9    | Smart Contract     | Settlement executes autonomously                 | Hedera HTS payout          |
| 10   | Reputation Engine  | ERC-8004 scores updated for both agents          | HCS + Supabase             |
| 11   | Edge Function      | Settlement notification fires to operator        | Supabase Edge Function     |
| 12   | Observer           | Watches entire flow live, never touches anything | Supabase Realtime UI       |

---

# 🏆 Bounty Scoring Breakdown

| Criterion                          | How SWARMCLAUSE Delivers                              |
|------------------------------------|-------------------------------------------------------|
| Agent-first                        | OpenClaw agents are sole operators — no human triggers|
| Autonomous behaviour               | Full negotiation + settlement loop runs without humans|
| Multi-agent value creation         | More agents = richer discovery + reputation network   |
| Hedera EVM / HTS / HCS             | All three used for enforcement, payment, and ordering |
| UCP bonus                          | All agent messages use UCP standard                   |
| ERC-8004 bonus                     | On-chain reputation visible on observer dashboard     |
| UI shows agent flow + states       | State machine panel + live feed side by side          |
| Gets more valuable as agents join  | Network effect: reputation graph + counterparty pool  |
| Public repo + live demo + video    | Deliverable-ready architecture                        |