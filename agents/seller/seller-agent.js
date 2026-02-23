/**
 * Seller Agent - Offers services and negotiates terms
 * OpenClaw-enabled autonomous agent for SWARMCLAUSE
 */

const { BaseAgent } = require('../base-agent');
const { UCPMessage } = require('../ucp-protocol');

class SellerAgent extends BaseAgent {
  constructor(config) {
    super({
      ...config,
      agentType: 'seller'
    });
    
    this.serviceOffering = config.serviceOffering || {
      serviceType: 'data_delivery',
      priceRange: { min: 200, max: 400 },
      deliverySlaDays: [3, 5, 7],
      qualityLevel: 'premium',
      capacity: 10 // concurrent contracts
    };
    
    this.pricingStrategy = config.pricingStrategy || 'value_based';
    
    console.log(`🏪 SellerAgent ${this.agentId} ready to offer services`);
    console.log(`📦 Service offering:`, this.serviceOffering);
  }

  async handleDiscovery(ucpMessage) {
    if (ucpMessage.from === this.agentId) return; // Ignore self
    
    console.log(`👋 Discovered agent: ${ucpMessage.from}`);
    // Sellers don't need to respond to discovery, just log potential buyers
  }

  async handleProposal(ucpMessage) {
    const sessionId = ucpMessage.session_id;
    const proposal = ucpMessage.payload;
    
    console.log(`💰 Received proposal for ${sessionId}:`, proposal);
    
    // Check if proposal is acceptable
    const evaluation = await this.evaluateProposal(proposal);
    
    if (evaluation.action === 'accept') {
      await this.acceptProposal(sessionId, ucpMessage.from, proposal);
    } else if (evaluation.action === 'counter') {
      await this.makeCounterProposal(sessionId, ucpMessage.from, evaluation.terms);
    } else {
      await this.rejectProposal(sessionId, ucpMessage.from, evaluation.reason);
    }
  }

  async evaluateProposal(proposal) {
    const aiPrompt = `
    As a seller agent offering ${this.serviceOffering.serviceType}, I received this proposal:
    ${JSON.stringify(proposal, null, 2)}
    
    My service capabilities:
    ${JSON.stringify(this.serviceOffering, null, 2)}
    
    My current reputation score: ${this.reputationScore} (${this.calculateTrustTier()})
    
    Evaluate this proposal considering:
    1. Is the price within my acceptable range (${this.serviceOffering.priceRange.min}-${this.serviceOffering.priceRange.max})?
    2. Can I meet the delivery SLA?
    3. Is this profitable given my quality level?
    4. How does this affect my reputation if I succeed/fail?
    
    Should I:
    1. ACCEPT this proposal
    2. Make a COUNTER proposal
    3. REJECT this proposal
    
    If countering, suggest better terms. If rejecting, explain why.
    Respond with JSON: {action: "accept|counter|reject", terms?: {...}, reason?: string}
    `;
    
    const aiResponse = await this.callGroq(aiPrompt);
    
    try {
      return JSON.parse(aiResponse);
    } catch (error) {
      // Fallback logic
      if (proposal.price >= this.serviceOffering.priceRange.min && 
          proposal.price <= this.serviceOffering.priceRange.max &&
          this.serviceOffering.deliverySlaDays.includes(proposal.delivery_days)) {
        return { action: 'accept', terms: proposal };
      } else if (proposal.price < this.serviceOffering.priceRange.min) {
        return { 
          action: 'counter', 
          terms: {
            price: this.serviceOffering.priceRange.min,
            deliveryDays: Math.min(...this.serviceOffering.deliverySlaDays),
            penaltyPerDay: proposal.penalty_per_day || 20,
            reasoning: 'Minimum acceptable price for premium service'
          }
        };
      } else {
        return { 
          action: 'reject', 
          reason: `Cannot meet delivery SLA of ${proposal.delivery_days} days` 
        };
      }
    }
  }

  async acceptProposal(sessionId, buyerId, proposal) {
    const acceptMessage = UCPMessage.createAccept(
      this.agentId,
      buyerId,
      sessionId
    );
    
    // Track session
    this.activeSessions.set(sessionId, {
      buyerId,
      status: 'accepted',
      acceptedTerms: proposal,
      negotiationHistory: [acceptMessage]
    });
    
    await this.sendToOpenClaw(acceptMessage);
    console.log(`✅ Accepted proposal for ${sessionId}`);
    
    // Update reputation for successful negotiation
    await this.updateReputation(+5, sessionId, 'NEGOTIATION_SUCCESS');
    
    // Trigger smart contract deployment
    await this.confirmContractExecution(sessionId, proposal);
  }

  async makeCounterProposal(sessionId, buyerId, counterTerms) {
    const counterMessage = UCPMessage.createCounter(
      this.agentId,
      buyerId,
      sessionId,
      {
        price: counterTerms.price,
        deliveryDays: counterTerms.deliveryDays,
        penaltyPerDay: counterTerms.penaltyPerDay,
        reasoning: counterTerms.reasoning
      }
    );
    
    // Track session
    this.activeSessions.set(sessionId, {
      buyerId,
      status: 'negotiating',
      lastCounter: counterTerms,
      negotiationHistory: [counterMessage]
    });
    
    await this.sendToOpenClaw(counterMessage);
    console.log(`🔄 Made counter-proposal for ${sessionId}:`, counterTerms);
    
    // Request simulation for counter offer
    await this.requestSimulation(sessionId, counterTerms);
  }

  async rejectProposal(sessionId, buyerId, reason) {
    const rejectMessage = UCPMessage.createReject(
      this.agentId,
      buyerId,
      sessionId,
      reason
    );
    
    // Track session
    this.activeSessions.set(sessionId, {
      buyerId,
      status: 'rejected',
      rejectionReason: reason,
      negotiationHistory: [rejectMessage]
    });
    
    await this.sendToOpenClaw(rejectMessage);
    console.log(`❌ Rejected proposal for ${sessionId}: ${reason}`);
    
    // Small reputation penalty for rejecting (but not as bad as failed negotiation)
    await this.updateReputation(-1, sessionId, 'PROPOSAL_REJECTED');
  }

  async requestSimulation(sessionId, terms) {
    const simulationMessage = UCPMessage.createSimulate(
      this.agentId,
      'SIMULATOR',
      sessionId,
      terms
    );
    
    await this.sendToOpenClaw(simulationMessage);
    console.log(`🔬 Requested simulation for ${sessionId}`);
  }

  async confirmContractExecution(sessionId, terms) {
    console.log(`🚀 Confirming contract execution for ${sessionId}`);
    
    // This would integrate with Hedera smart contracts
    const contractData = {
      sessionId,
      sellerAgent: this.agentId,
      buyerAgent: this.activeSessions.get(sessionId)?.buyerId,
      finalTerms: terms,
      status: 'escrow_locked'
    };
    
    // Update session in Supabase
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: sessionId,
          owner_id: 'system', // Would be actual operator ID
          buyer_agent_id: this.activeSessions.get(sessionId)?.buyerId,
          seller_agent_id: this.agentId,
          status: 'escrow_locked',
          ucp_version: '1.0',
          escrow_amount: terms.price
        })
      });
      
      console.log(`💰 Contract confirmed for ${sessionId}`);
    } catch (error) {
      console.error(`❌ Failed to confirm contract:`, error.message);
    }
  }

  async handleSimulate(ucpMessage) {
    const sessionId = ucpMessage.session_id;
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      console.log(`📊 Simulation result for ${sessionId}:`, ucpMessage.payload);
      session.lastSimulation = ucpMessage.payload;
    }
  }

  // Autonomous service quality monitoring
  async monitorServiceQuality() {
    // Simulate service delivery and quality metrics
    console.log(`📈 ${this.agentId} monitoring service quality...`);
    
    // This would integrate with actual service delivery systems
    // For now, simulate quality metrics
    const qualityMetrics = {
      onTimeDeliveryRate: 0.95,
      customerSatisfaction: 4.2,
      defectRate: 0.02,
      responseTime: 2.3 // hours
    };
    
    // Update capabilities based on performance
    if (qualityMetrics.onTimeDeliveryRate > 0.9) {
      this.serviceOffering.qualityLevel = 'premium';
    }
    
    return qualityMetrics;
  }

  // Dynamic pricing based on demand and reputation
  calculateOptimalPrice(baseDemand = 1.0) {
    const basePrice = (this.serviceOffering.priceRange.min + this.serviceOffering.priceRange.max) / 2;
    
    // Reputation multiplier
    const reputationMultiplier = 1 + (this.reputationScore - 50) / 100;
    
    // Demand multiplier
    const demandMultiplier = Math.min(1.5, Math.max(0.8, baseDemand));
    
    // Quality multiplier
    const qualityMultiplier = this.serviceOffering.qualityLevel === 'premium' ? 1.2 : 1.0;
    
    const optimalPrice = Math.round(
      basePrice * reputationMultiplier * demandMultiplier * qualityMultiplier
    );
    
    return Math.max(
      this.serviceOffering.priceRange.min,
      Math.min(this.serviceOffering.priceRange.max, optimalPrice)
    );
  }
}

module.exports = { SellerAgent };
