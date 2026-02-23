-- ============================================================================
-- SWARMCLAUSE — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor to initialize the database.
-- ============================================================================

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

-- ─── Auto-update timestamps ────────────────────────────────────────────────

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

-- ─── Row Level Security ────────────────────────────────────────────────────

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

-- ─── Enable Realtime ───────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE offers;
ALTER PUBLICATION supabase_realtime ADD TABLE transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE simulations;
