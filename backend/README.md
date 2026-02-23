# SWARMCLAUSE Backend

FastAPI-based backend that powers the negotiation, simulation, and settlement workflows outlined in `docs/prd.md`.

## Capabilities (MVP)

1. **Negotiation session orchestration** – create rooms, capture agent identities, and store structured offers in SQLite.
2. **Groq-driven agent hooks** – typed service layer that can call Groq for counter-offers or simulation reasoning (safe stubs included).
3. **Simulation service** – runs pre-settlement risk analysis using either Groq or deterministic heuristics.
4. **Hedera integrations** – pluggable clients for HCS transcript publishing, smart-contract escrow, and HTS settlement (non-destructive adapters + TODO markers).
5. **API surface** – REST endpoints for sessions, offers, simulations, and settlement triggers, ready for WebSocket upgrades if needed later.

## Project Layout

```
backend/
├── README.md
├── requirements.txt
└── app/
    ├── main.py
    ├── core/
    │   └── config.py
    ├── db/
    │   ├── base.py
    │   └── session.py
    ├── models/
    │   ├── offer.py
    │   └── session.py
    ├── schemas/
    │   ├── offer.py
    │   └── session.py
    ├── services/
    │   ├── groq.py
    │   ├── hcs.py
    │   ├── hedera_contract.py
    │   └── simulation.py
    └── api/
        ├── __init__.py
        ├── deps.py
        └── endpoints/
            ├── sessions.py
            ├── offers.py
            └── simulation.py
```

## Getting Started

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

The SQLite file will default to `backend/data/swarmclause.db`. Create the folder ahead of time or update `DB_PATH` in environment variables.

## Environment Variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `DB_PATH` | SQLite file path | `./data/swarmclause.db` |
| `GROQ_API_KEY` | Required for Groq agent calls | _none_ |
| `HEDERA_OPERATOR_ID` | Hedera operator account | _none_ |
| `HEDERA_OPERATOR_KEY` | Hedera private key | _none_ |
| `HEDERA_TOPIC_ID` | HCS topic for transcripts | _none_ |

Use a `.env` file in the `backend/` root for local development.

## Next Steps

1. Connect the Groq service to real prompts per agent persona.
2. Wire Hedera SDK calls inside the service adapters.
3. Add WebSocket streaming for live negotiation updates.
4. Extend schemas to track escrow states and penalties for richer dashboards.
