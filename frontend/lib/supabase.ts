import { createClient } from "@supabase/supabase-js";

// ── Types matching the PostgreSQL schema from database.sql ──────────────────

export type SessionStatus =
  | "negotiating"
  | "accepted"
  | "escrow_locked"
  | "completed"
  | "penalized";

export interface SessionRow {
  id: string;
  owner_id: string;
  buyer_agent: string;
  seller_agent: string;
  status: SessionStatus;
  contract_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferRow {
  id: number;
  session_id: string;
  agent: string;
  price: number;
  delivery_days: number;
  penalty: number | null;
  accepted: boolean;
  created_at: string;
}

export interface TranscriptRow {
  id: number;
  session_id: string;
  speaker: string;
  message: Record<string, unknown>;
  hcs_topic_id: string | null;
  hcs_sequence_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface SimulationRow {
  id: number;
  session_id: string;
  risk_score: number;
  recommended_penalty: number;
  confidence: string;
  reasoning: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: SessionRow;
        Insert: {
          id: string;
          owner_id: string;
          buyer_agent: string;
          seller_agent: string;
          status?: SessionStatus;
          contract_tx_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      offers: {
        Row: OfferRow;
        Insert: {
          session_id: string;
          agent: string;
          price: number;
          delivery_days: number;
          penalty?: number | null;
          accepted?: boolean;
          created_at?: string;
        };
      };
      transcripts: {
        Row: TranscriptRow;
        Insert: {
          session_id: string;
          speaker: string;
          message: Record<string, unknown>;
          hcs_topic_id?: string | null;
          hcs_sequence_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      simulations: {
        Row: SimulationRow;
        Insert: {
          session_id: string;
          risk_score: number;
          recommended_penalty: number;
          confidence: string;
          reasoning?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// ── Client ──────────────────────────────────────────────────────────────────

// Fallback to a placeholder so createClient() doesn't throw during Next.js
// static builds. The client simply won't connect — pages show empty states.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
