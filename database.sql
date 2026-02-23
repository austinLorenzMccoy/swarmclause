-- ============================================================================
-- SWARMCLAUSE — Supabase PostgreSQL Schema v3.0
-- OpenClaw Agent-Native Contract Negotiation Platform
-- Run this in your Supabase SQL Editor to initialize the database.
-- ============================================================================

-- Agent registry (OpenClaw + ERC-8004 compliant)
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
  capabilities JSONB,
  owner_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Negotiation sessions (UCP-compliant)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  buyer_agent_id TEXT REFERENCES agents(id),
  seller_agent_id TEXT REFERENCES agents(id),
  mediator_agent_id TEXT REFERENCES agents(id),
  status TEXT DEFAULT 'discovering'
    CHECK (status IN (
      'discovering','negotiating','simulating',
      'mediating','accepted','escrow_locked','completed','penalized','failed'
    )),
  ucp_version TEXT DEFAULT '1.0',
  contract_tx_hash TEXT,
  escrow_amount INTEGER,
  final_terms JSONB,
  hcs_topic_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UCP offer messages (structured agent-to-agent communication)
CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  agent_id TEXT REFERENCES agents(id),
  ucp_message_type TEXT NOT NULL,
  price INTEGER,
  delivery_days INTEGER,
  penalty_per_day INTEGER,
  payload JSONB NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HCS transcript mirror (immutable negotiation record)
CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  speaker_agent_id TEXT REFERENCES agents(id),
  ucp_message JSONB NOT NULL,
  hcs_topic_id TEXT,
  hcs_sequence_number BIGINT,
  message_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation results (AI risk assessment)
CREATE TABLE simulations (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  risk_score NUMERIC(4,2),
  recommended_penalty INTEGER,
  delivery_failure_prob NUMERIC(4,2),
  dispute_likelihood NUMERIC(4,2),
  confidence TEXT,
  recommendation TEXT,
  reasoning TEXT,
  factors_analyzed TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ERC-8004 reputation event log (on-chain trust indicators)
CREATE TABLE reputation_events (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  event_type TEXT NOT NULL,
  score_delta INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  session_id TEXT REFERENCES sessions(id),
  hcs_topic_id TEXT,
  hcs_sequence_number BIGINT,
  on_chain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mediation tracking
CREATE TABLE mediations (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  mediator_agent_id TEXT REFERENCES agents(id),
  outcome TEXT NOT NULL CHECK (outcome IN ('accepted', 'rejected', 'expired')),
  mediation_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent performance metrics
CREATE TABLE agent_metrics (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Auto-update timestamps ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_transcript_updated_at
  BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security (Multi-tenant Agent Isolation) ───────────────────────

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators see own agents" ON agents
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

CREATE POLICY "Operators see own simulations" ON simulations
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );

CREATE POLICY "Operators see own reputation events" ON reputation_events
  FOR ALL USING (
    agent_id IN (SELECT id FROM agents WHERE owner_id = auth.uid())
  );

CREATE POLICY "Operators see own mediations" ON mediations
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE owner_id = auth.uid())
  );

CREATE POLICY "Operators see own metrics" ON agent_metrics
  FOR ALL USING (
    agent_id IN (SELECT id FROM agents WHERE owner_id = auth.uid())
  );

-- ─── Enable Realtime (Observer Dashboard) ───────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE offers;
ALTER PUBLICATION supabase_realtime ADD TABLE transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE simulations;
ALTER PUBLICATION supabase_realtime ADD TABLE reputation_events;
ALTER PUBLICATION supabase_realtime ADD TABLE mediations;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_metrics;

-- ─── Indexes for Performance ───────────────────────────────────────────────

CREATE INDEX idx_agents_owner_id ON agents(owner_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_sessions_owner_id ON sessions(owner_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_buyer_agent ON sessions(buyer_agent_id);
CREATE INDEX idx_sessions_seller_agent ON sessions(seller_agent_id);
CREATE INDEX idx_offers_session_id ON offers(session_id);
CREATE INDEX idx_offers_agent_id ON offers(agent_id);
CREATE INDEX idx_transcripts_session_id ON transcripts(session_id);
CREATE INDEX idx_transcripts_speaker ON transcripts(speaker_agent_id);
CREATE INDEX idx_reputation_events_agent_id ON reputation_events(agent_id);
CREATE INDEX idx_simulations_session_id ON simulations(session_id);

-- ─── Sample Data for Demo ───────────────────────────────────────────────────

INSERT INTO agents (id, openclaw_id, hedera_account, service_type, reputation_score, erc8004_token_id, capabilities, owner_id) VALUES
('BUYER-TECH-001', 'BUYER-TECH-001', '0.0.1234567', 'data_delivery', 75, 'erc8004-buyer-tech-001', '{"service_type": "data_delivery", "max_price": 350, "preferred_delivery": 5}', auth.uid()),
('SELLER-DATA-001', 'SELLER-DATA-001', '0.0.3456789', 'data_delivery', 82, 'erc8004-seller-data-001', '{"service_type": "data_delivery", "price_range": {"min": 200, "max": 400}, "delivery_sla_days": [3,5,7]}', auth.uid()),
('SIMULATOR-RISK-001', 'SIMULATOR-RISK-001', '0.0.5678901', 'simulation', 90, 'erc8004-sim-risk-001', '{"simulation_models": ["risk_assessment", "delivery_probability", "dispute_likelihood"]}', auth.uid()),
('MEDIATOR-NEUTRAL-001', 'MEDIATOR-NEUTRAL-001', '0.0.6789012', 'mediation', 88, 'erc8004-mediator-neutral-001', '{"mediation_strategies": ["price_convergence", "win_win", "time_based"]}', auth.uid());
