# 🤖 SWARMCLAUSE OpenClaw Agents

Autonomous AI agents that negotiate contracts on the Hedera blockchain using OpenClaw framework.

## 🎯 Agent Types

### 🛒 Buyer Agents
- **Purpose**: Seek services and negotiate favorable terms
- **Behavior**: Discover sellers, initiate UCP negotiations, evaluate counter-offers
- **AI**: Groq-powered negotiation strategy
- **Reputation**: Gains +5 for successful negotiations, -2 for failures

### 🏪 Seller Agents  
- **Purpose**: Offer services and maximize profit
- **Behavior**: Broadcast capabilities, evaluate proposals, make counter-offers
- **AI**: Groq-powered pricing and acceptance logic
- **Reputation**: Gains +5 for successful delivery, -10 for failures

### 🔬 Simulator Agent
- **Purpose**: Risk assessment and outcome prediction
- **Behavior**: Analyze contract terms, calculate risk scores
- **Models**: Risk assessment, delivery probability, dispute likelihood
- **AI**: Groq-powered comprehensive analysis

### ⚖️ Mediator Agent
- **Purpose**: Facilitate agreement between parties
- **Behavior**: Monitor negotiations, suggest convergence points
- **Strategies**: Price convergence, win-win scenarios, game theory
- **AI**: Groq-powered mediation proposals

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenClaw installed and running
- Groq API key
- Supabase credentials
- Hedera testnet account

### Environment Variables
```bash
export GROQ_API_KEY=your_groq_api_key
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_KEY=your_supabase_service_key
export HEDERA_OPERATOR_ID=your_hedera_account_id
export HEDERA_OPERATOR_KEY=your_hedera_private_key
export HEDERA_TOPIC_ID=your_hcs_topic_id
export OPENCLAW_CHANNEL=default
```

### Launch All Agents
```bash
cd agents
npm install
npm start
```

### Launch Specific Agent Types
```bash
# Launch only buyers
npm run start:buyers

# Launch only sellers
npm run start:sellers

# Launch only simulator
npm run start:simulator

# Launch only mediator
npm run start:mediator
```

## 📡 UCP Protocol

All agent communication uses **Universal Commerce Protocol (UCP)**:

### Message Types
- `PROPOSAL` - Initial offer from buyer
- `COUNTER` - Counter-offer from seller  
- `MEDIATE` - Mediator convergence suggestion
- `ACCEPT` - Final agreement
- `REJECT` - Negotiation termination
- `SIMULATE` - Risk assessment request
- `DISCOVER` - Agent capability broadcast

### Message Structure
```json
{
  "ucp_version": "1.0",
  "session_id": "NEG-12345",
  "from": "BUYER-TECH-001",
  "to": "SELLER-DATA-001", 
  "message_type": "PROPOSAL",
  "payload": {
    "price": 250,
    "delivery_days": 5,
    "penalty_per_day": 15
  },
  "timestamp": "2025-02-23T10:00:00Z"
}
```

## 🏆 Agent Reputation System

### ERC-8004 Compliant
- **Bronze**: 0-40 points (Low trust)
- **Silver**: 41-70 points (Moderate trust)  
- **Gold**: 71-100 points (High trust)

### Reputation Events
- **Successful settlement**: +5 points
- **Failed/abandoned**: -10 points
- **Dispute raised**: -15 points
- **On-time delivery**: +3 points
- **Mediation success**: +3 points

## 🔗 Integration Points

### OpenClaw Network
- Agents register capabilities on startup
- Continuous discovery broadcasting
- UCP message routing via OpenClaw gateway

### Supabase Real-time
- All agent actions logged instantly
- Human observer dashboard updates
- Multi-tenant isolation via RLS

### Hedera Blockchain
- **HCS**: Immutable negotiation transcripts
- **HTS**: Escrow and settlement payments
- **Smart Contracts**: Autonomous enforcement

## 📊 Monitoring

### System Status
```bash
# Real-time agent status
npm start

# Watch logs
tail -f ~/.openclaw/logs/gateway.log
```

### Health Checks
- Agent connectivity monitoring
- Session state tracking
- Reputation score updates
- Negotiation success rates

## 🧪 Testing

### Single Agent Test
```bash
node -e "
const {BuyerAgent} = require('./buyer/buyer-agent');
const agent = new BuyerAgent({
  agentId: 'TEST-BUYER',
  hederaAccount: '0.0.1234567',
  groqApiKey: process.env.GROQ_API_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY
});
"
```

### Integration Test
```bash
# Test UCP message flow
node -e "
const {UCPMessage} = require('./ucp-protocol');
const msg = UCPMessage.createProposal('BUYER-1', 'SELLER-1', 'TEST-123', {
  price: 250,
  deliveryDays: 5,
  penaltyPerDay: 15
});
console.log(msg.toJSON());
"
```

## 🐛 Troubleshooting

### Common Issues
1. **OpenClaw Connection Failed**
   ```bash
   openclaw doctor --fix
   ```

2. **Groq API Errors**
   ```bash
   export GROQ_API_KEY=valid_key
   ```

3. **Supabase Connection Issues**
   ```bash
   export SUPABASE_SERVICE_KEY=valid_service_key
   ```

4. **Agent Not Discovering Others**
   - Check OpenClaw gateway status
   - Verify channel configuration
   - Check network connectivity

### Debug Mode
```bash
DEBUG=openclaw npm start
```

## 📈 Performance Metrics

### Agent KPIs
- Negotiation success rate
- Average negotiation duration  
- Reputation score trends
- Contract settlement rate
- Dispute frequency

### System KPIs
- Total active agents
- Messages per second
- Blockchain transaction success rate
- Real-time UI latency

## 🔮 Future Enhancements

- [ ] Multi-party negotiations (3+ agents)
- [ ] Cross-chain settlement support
- [ ] Advanced AI agent personas
- [ ] Mobile agent deployment
- [ ] Edge computing integration
- [ ] Quantum-resistant cryptography
