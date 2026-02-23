/**
 * Mediator Agent - Helps converge negotiations between buyers and sellers
 * OpenClaw-enabled autonomous agent for SWARMCLAUSE
 */

const { BaseAgent } = require('../base-agent');
const { UCPMessage } = require('../ucp-protocol');

class MediatorAgent extends BaseAgent {
  constructor(config) {
    super({
      ...config,
      agentType: 'mediator'
    });
    
    this.mediationStrategies = config.mediationStrategies || ['price_convergence', 'win_win', 'time_based'];
    this.activeMediations = new Map();
    
    console.log(`⚖️ MediatorAgent ${this.agentId} ready to facilitate negotiations`);
    console.log(`🎯 Mediation strategies:`, this.mediationStrategies);
  }

  async handleDiscovery(ucpMessage) {
    // Mediator doesn't participate in discovery
    console.log(`🔍 Ignoring discovery message - mediator agent`);
  }

  async handleProposal(ucpMessage) {
    // Mediator monitors proposals but doesn't respond directly
    console.log(`📋 Monitoring proposal: ${ucpMessage.session_id}`);
    await this.analyzeNegotiationDynamics(ucpMessage.session_id);
  }

  async handleCounter(ucpMessage) {
    // Monitor counter offers and identify mediation opportunities
    console.log(`🔄 Monitoring counter: ${ucpMessage.session_id}`);
    
    const sessionId = ucpMessage.session_id;
    const dynamics = await this.analyzeNegotiationDynamics(sessionId);
    
    // Check if mediation is needed
    if (this.shouldMediate(dynamics)) {
      await this.offerMediation(sessionId, dynamics);
    }
  }

  async analyzeNegotiationDynamics(sessionId) {
    try {
      // Get recent messages for this session from Supabase
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/transcripts?session_id=eq.${sessionId}&order=created_at.desc&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const messages = await response.json();
        return this.calculateNegotiationDynamics(messages);
      }
    } catch (error) {
      console.error(`❌ Failed to analyze negotiation dynamics:`, error.message);
      return null;
    }
  }

  calculateNegotiationDynamics(messages) {
    if (messages.length < 2) {
      return { stage: 'early', needsMediation: false };
    }
    
    // Extract offers from messages
    const offers = messages.filter(msg => 
      msg.ucp_message.message_type === 'PROPOSAL' || 
      msg.ucp_message.message_type === 'COUNTER'
    );
    
    if (offers.length < 2) {
      return { stage: 'early', needsMediation: false };
    }
    
    // Calculate price convergence
    const prices = offers.map(offer => offer.ucp_message.payload.price);
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const priceConvergence = priceRange / Math.max(...prices);
    
    // Calculate delivery time convergence
    const deliveryTimes = offers.map(offer => offer.ucp_message.payload.delivery_days);
    const deliveryRange = Math.max(...deliveryTimes) - Math.min(...deliveryTimes);
    const deliveryConvergence = deliveryRange / Math.max(...deliveryTimes);
    
    // Count negotiation rounds
    const negotiationRounds = offers.length;
    
    // Determine if mediation is needed
    const needsMediation = (
      priceConvergence > 0.3 || // Prices far apart
      deliveryConvergence > 0.4 || // Delivery times far apart
      negotiationRounds > 6 // Too many rounds
    );
    
    return {
      stage: negotiationRounds > 4 ? 'prolonged' : 'active',
      needsMediation,
      priceConvergence,
      deliveryConvergence,
      negotiationRounds,
      latestPrices: prices.slice(-3), // Last 3 prices
      latestDeliveryTimes: deliveryTimes.slice(-3), // Last 3 delivery times
      participants: [...new Set(messages.map(msg => msg.speaker_agent_id))]
    };
  }

  shouldMediate(dynamics) {
    if (!dynamics) return false;
    
    // Don't mediate early negotiations
    if (dynamics.stage === 'early') return false;
    
    // Mediate if convergence is poor or negotiation is prolonged
    return dynamics.needsMediation || dynamics.negotiationRounds > 6;
  }

  async offerMediation(sessionId, dynamics) {
    console.log(`⚖️ Offering mediation for ${sessionId}`);
    
    // Calculate mediation proposal using AI
    const mediationProposal = await this.calculateMediationProposal(dynamics);
    
    // Send mediation message to all participants
    const mediationMessage = UCPMessage.createMediate(
      this.agentId,
      'ALL_PARTICIPANTS',
      sessionId,
      {
        mediation_type: 'convergence_suggestion',
        proposed_terms: mediationProposal,
        reasoning: mediationProposal.reasoning,
        confidence: mediationProposal.confidence,
        success_probability: mediationProposal.successProbability
      }
    );
    
    await this.sendToOpenClaw(mediationMessage);
    
    // Track mediation
    this.activeMediations.set(sessionId, {
      status: 'proposed',
      proposal: mediationProposal,
      dynamics,
      timestamp: new Date().toISOString()
    });
  }

  async calculateMediationProposal(dynamics) {
    const aiPrompt = `
    As a neutral mediator agent, I need to propose fair terms for this negotiation:
    
    Negotiation Dynamics:
    ${JSON.stringify(dynamics, null, 2)}
    
    Latest offers show:
    - Price convergence: ${(dynamics.priceConvergence * 100).toFixed(1)}%
    - Delivery convergence: ${(dynamics.deliveryConvergence * 100).toFixed(1)}%
    - Negotiation rounds: ${dynamics.negotiationRounds}
    
    My mediation goals:
    1. Find a fair middle ground
    2. Ensure both parties can profit
    3. Reduce negotiation friction
    4. Increase success probability
    
    Propose mediation terms with:
    - Fair price (middle ground with adjustments)
    - Reasonable delivery time
    - Appropriate penalty structure
    - Clear reasoning for both parties
    
    Respond with JSON: {
      price: number,
      deliveryDays: number,
      penaltyPerDay: number,
      reasoning: string,
      confidence: "LOW|MEDIUM|HIGH",
      successProbability: number,
      fairnessScore: number
    }
    `;
    
    const aiResponse = await this.callGroq(aiPrompt);
    
    try {
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error(`❌ Failed to parse mediation proposal:`, error.message);
      return this.fallbackMediationProposal(dynamics);
    }
  }

  fallbackMediationProposal(dynamics) {
    // Simple mathematical mediation if AI fails
    const prices = dynamics.latestPrices;
    const deliveryTimes = dynamics.latestDeliveryTimes;
    
    // Calculate fair middle ground
    const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    const medianDelivery = deliveryTimes.sort((a, b) => a - b)[Math.floor(deliveryTimes.length / 2)];
    
    // Adjust for fairness (slightly favor compromise)
    const fairPrice = Math.round(medianPrice * 1.05);
    const fairDelivery = Math.max(3, Math.min(7, medianDelivery));
    const fairPenalty = Math.round(fairPrice * 0.05);
    
    return {
      price: fairPrice,
      deliveryDays: fairDelivery,
      penaltyPerDay: fairPenalty,
      reasoning: `Mathematical mediation: Median price $${medianPrice} adjusted for fairness, Median delivery ${medianDelivery} days`,
      confidence: 'MEDIUM',
      successProbability: 0.75,
      fairnessScore: 0.85
    };
  }

  async handleAccept(ucpMessage) {
    const sessionId = ucpMessage.session_id;
    
    // Check if this was our mediation being accepted
    const mediation = this.activeMediations.get(sessionId);
    if (mediation && mediation.status === 'proposed') {
      console.log(`✅ Mediation accepted for ${sessionId}`);
      
      // Update mediation status
      mediation.status = 'accepted';
      mediation.acceptedAt = new Date().toISOString();
      
      // Update reputation for successful mediation
      await this.updateReputation(+3, sessionId, 'MEDIATION_SUCCESS');
      
      // Log successful mediation
      await this.logMediationOutcome(sessionId, 'accepted');
    }
  }

  async handleReject(ucpMessage) {
    const sessionId = ucpMessage.session_id;
    
    // Check if this was our mediation being rejected
    const mediation = this.activeMediations.get(sessionId);
    if (mediation && mediation.status === 'proposed') {
      console.log(`❌ Mediation rejected for ${sessionId}: ${ucpMessage.payload.reason}`);
      
      // Update mediation status
      mediation.status = 'rejected';
      mediation.rejectedAt = new Date().toISOString();
      mediation.rejectionReason = ucpMessage.payload.reason;
      
      // Small reputation penalty for rejected mediation (but not failure)
      await this.updateReputation(-1, sessionId, 'MEDIATION_REJECTED');
      
      // Log rejected mediation
      await this.logMediationOutcome(sessionId, 'rejected');
    }
  }

  async logMediationOutcome(sessionId, outcome) {
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/mediations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          mediator_agent_id: this.agentId,
          outcome,
          mediation_data: this.activeMediations.get(sessionId),
          created_at: new Date().toISOString()
        })
      });
      
      console.log(`📝 Mediation outcome logged: ${outcome}`);
    } catch (error) {
      console.error(`❌ Failed to log mediation outcome:`, error.message);
    }
  }

  // Advanced mediation strategies
  async applyGameTheoryAnalysis(sessionId) {
    const dynamics = await this.analyzeNegotiationDynamics(sessionId);
    
    if (!dynamics || dynamics.participants.length < 2) {
      return null;
    }
    
    // Apply Nash equilibrium concepts
    const prices = dynamics.latestPrices;
    const buyerReservePrice = Math.min(...prices) * 0.9; // Assume buyer's reserve
    const sellerReservePrice = Math.max(...prices) * 1.1; // Assume seller's reserve
    
    // Calculate optimal compromise zone
    const compromiseZone = {
      min: Math.max(buyerReservePrice, sellerReservePrice * 0.8),
      max: Math.min(sellerReservePrice, buyerReservePrice * 1.2)
    };
    
    if (compromiseZone.min <= compromiseZone.max) {
      return {
        strategy: 'nash_equilibrium',
        optimalPrice: (compromiseZone.min + compromiseZone.max) / 2,
        confidence: 'HIGH',
        reasoning: 'Nash equilibrium analysis shows optimal compromise zone'
      };
    }
    
    return null;
  }

  // Continuous monitoring of all active negotiations
  async monitorAllNegotiations() {
    console.log(`🔍 Monitoring all active negotiations...`);
    
    try {
      // Get all active sessions
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/sessions?status=in.(negotiating,discovering)&order=updated_at.desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const sessions = await response.json();
        
        for (const session of sessions) {
          await this.analyzeNegotiationDynamics(session.id);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to monitor negotiations:`, error.message);
    }
  }
}

module.exports = { MediatorAgent };
