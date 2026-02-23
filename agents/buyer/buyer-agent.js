/**
 * Buyer Agent - Seeks services and negotiates terms
 * OpenClaw-enabled autonomous agent for SWARMCLAUSE
 */

const { BaseAgent } = require('../base-agent');
const { UCPMessage } = require('../ucp-protocol');

class BuyerAgent extends BaseAgent {
  constructor(config) {
    super({
      ...config,
      agentType: 'buyer'
    });
    
    this.buyerPreferences = config.buyerPreferences || {
      maxPrice: 300,
      preferredDeliveryDays: 5,
      riskTolerance: 'medium',
      serviceType: 'data_delivery'
    };
    
    this.negotiationStrategy = config.negotiationStrategy || 'balanced';
    
    console.log(`🛒 BuyerAgent ${this.agentId} ready to negotiate`);
    console.log(`📋 Preferences:`, this.buyerPreferences);
  }

  async handleDiscovery(ucpMessage) {
    if (ucpMessage.from === this.agentId) return; // Ignore self
    
    const sellerCapabilities = ucpMessage.payload.capabilities;
    
    // Check if seller matches buyer requirements
    if (this.isSellerSuitable(sellerCapabilities)) {
      console.log(`🎯 Found suitable seller: ${ucpMessage.from}`);
      this.discoveredAgents.set(ucpMessage.from, sellerCapabilities);
      
      // Initiate negotiation
      await this.initiateNegotiation(ucpMessage.from);
    }
  }

  isSellerSuitable(capabilities) {
    const { service_type, price_range, delivery_sla_days } = capabilities;
    
    // Check service type match
    if (service_type !== this.buyerPreferences.serviceType) {
      return false;
    }
    
    // Check price range compatibility
    if (price_range.min > this.buyerPreferences.maxPrice) {
      return false;
    }
    
    // Check delivery SLA compatibility
    if (delivery_sla_days.every(days => days > this.buyerPreferences.preferredDeliveryDays + 2)) {
      return false;
    }
    
    return true;
  }

  async initiateNegotiation(sellerId) {
    const sessionId = `NEG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Create initial proposal using AI reasoning
    const aiPrompt = `
    As a buyer agent, I need to negotiate for ${this.buyerPreferences.serviceType}.
    My constraints:
    - Max price: ${this.buyerPreferences.maxPrice}
    - Preferred delivery: ${this.buyerPreferences.preferredDeliveryDays} days
    - Risk tolerance: ${this.buyerPreferences.riskTolerance}
    
    Seller capabilities: ${JSON.stringify(this.discoveredAgents.get(sellerId), null, 2)}
    
    Generate an initial proposal that maximizes my value while being attractive to the seller.
    Respond with JSON: {price: number, deliveryDays: number, penaltyPerDay: number, reasoning: string}
    `;
    
    const aiResponse = await this.callGroq(aiPrompt);
    let proposalTerms;
    
    try {
      proposalTerms = JSON.parse(aiResponse);
    } catch (error) {
      // Fallback to conservative proposal
      proposalTerms = {
        price: Math.min(this.buyerPreferences.maxPrice * 0.8, 250),
        deliveryDays: this.buyerPreferences.preferredDeliveryDays,
        penaltyPerDay: 15,
        reasoning: 'Conservative initial offer'
      };
    }
    
    const proposalMessage = UCPMessage.createProposal(
      this.agentId,
      sellerId,
      sessionId,
      {
        price: proposalTerms.price,
        deliveryDays: proposalTerms.deliveryDays,
        penaltyPerDay: proposalTerms.penaltyPerDay,
        serviceType: this.buyerPreferences.serviceType,
        escrow: true
      }
    );
    
    // Track session
    this.activeSessions.set(sessionId, {
      sellerId,
      status: 'negotiating',
      myLastOffer: proposalTerms,
      negotiationHistory: [proposalMessage]
    });
    
    await this.sendToOpenClaw(proposalMessage);
    console.log(`🤝 Initiated negotiation ${sessionId} with ${sellerId}`);
    
    // Request simulation
    await this.requestSimulation(sessionId, proposalTerms);
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

  async handleCounter(ucpMessage) {
    const sessionId = ucpMessage.session_id;
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      console.log(`❌ No active session: ${sessionId}`);
      return;
    }
    
    console.log(`💰 Received counter-offer for ${sessionId}:`, ucpMessage.payload);
    
    // Update session state
    session.negotiationHistory.push(ucpMessage);
    session.sellerLastOffer = ucpMessage.payload;
    
    // Use AI to decide on counter
    const decision = await this.evaluateCounterOffer(sessionId, ucpMessage.payload);
    
    if (decision.action === 'accept') {
      await this.acceptOffer(sessionId, ucpMessage.from);
    } else if (decision.action === 'counter') {
      await this.makeCounterOffer(sessionId, ucpMessage.from, decision.terms);
    } else {
      await this.rejectOffer(sessionId, ucpMessage.from, decision.reason);
    }
  }

  async evaluateCounterOffer(sessionId, counterOffer) {
    const session = this.activeSessions.get(sessionId);
    const aiPrompt = `
    As a buyer agent, I received this counter-offer:
    ${JSON.stringify(counterOffer, null, 2)}
    
    My original offer was:
    ${JSON.stringify(session.myLastOffer, null, 2)}
    
    My constraints:
    - Max price: ${this.buyerPreferences.maxPrice}
    - Preferred delivery: ${this.buyerPreferences.preferredDeliveryDays} days
    - Risk tolerance: ${this.buyerPreferences.riskTolerance}
    
    Should I:
    1. ACCEPT this offer
    2. Make a COUNTER offer
    3. REJECT this offer
    
    If countering, suggest new terms. If rejecting, explain why.
    Respond with JSON: {action: "accept|counter|reject", terms?: {...}, reason?: string}
    `;
    
    const aiResponse = await this.callGroq(aiPrompt);
    
    try {
      return JSON.parse(aiResponse);
    } catch (error) {
      // Fallback logic
      if (counterOffer.price <= this.buyerPreferences.maxPrice) {
        return { action: 'accept', terms: counterOffer };
      } else {
        return { 
          action: 'reject', 
          reason: `Price ${counterOffer.price} exceeds my maximum of ${this.buyerPreferences.maxPrice}` 
        };
      }
    }
  }

  async makeCounterOffer(sessionId, sellerId, newTerms) {
    const counterMessage = UCPMessage.createCounter(
      this.agentId,
      sellerId,
      sessionId,
      {
        price: newTerms.price,
        deliveryDays: newTerms.deliveryDays,
        penaltyPerDay: newTerms.penaltyPerDay,
        reasoning: newTerms.reasoning
      }
    );
    
    const session = this.activeSessions.get(sessionId);
    session.myLastOffer = newTerms;
    session.negotiationHistory.push(counterMessage);
    
    await this.sendToOpenClaw(counterMessage);
    console.log(`🔄 Made counter-offer for ${sessionId}:`, newTerms);
    
    // Request another simulation
    await this.requestSimulation(sessionId, newTerms);
  }

  async acceptOffer(sessionId, sellerId) {
    const acceptMessage = UCPMessage.createAccept(
      this.agentId,
      sellerId,
      sessionId
    );
    
    const session = this.activeSessions.get(sessionId);
    session.status = 'accepted';
    session.negotiationHistory.push(acceptMessage);
    
    await this.sendToOpenClaw(acceptMessage);
    console.log(`✅ Accepted offer for ${sessionId}`);
    
    // Update reputation for successful negotiation
    await this.updateReputation(+5, sessionId, 'NEGOTIATION_SUCCESS');
    
    // Trigger smart contract deployment (this would integrate with Hedera)
    await this.triggerContractExecution(sessionId, session);
  }

  async rejectOffer(sessionId, sellerId, reason) {
    const rejectMessage = UCPMessage.createReject(
      this.agentId,
      sellerId,
      sessionId,
      reason
    );
    
    const session = this.activeSessions.get(sessionId);
    session.status = 'rejected';
    session.negotiationHistory.push(rejectMessage);
    
    await this.sendToOpenClaw(rejectMessage);
    console.log(`❌ Rejected offer for ${sessionId}: ${reason}`);
    
    // Update reputation for failed negotiation
    await this.updateReputation(-2, sessionId, 'NEGOTIATION_FAILED');
  }

  async triggerContractExecution(sessionId, session) {
    console.log(`🚀 Triggering contract execution for ${sessionId}`);
    
    // This would integrate with Hedera smart contracts
    // For now, simulate the process
    const contractData = {
      sessionId,
      buyerAgent: this.agentId,
      sellerAgent: session.sellerId,
      finalTerms: session.sellerLastOffer,
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
          buyer_agent_id: this.agentId,
          seller_agent_id: session.sellerId,
          status: 'escrow_locked',
          ucp_version: '1.0',
          escrow_amount: session.sellerLastOffer.price
        })
      });
      
      console.log(`💰 Contract deployed for ${sessionId}`);
    } catch (error) {
      console.error(`❌ Failed to deploy contract:`, error.message);
    }
  }

  async handleSimulate(ucpMessage) {
    const sessionId = ucpMessage.session_id;
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      console.log(`📊 Simulation result for ${sessionId}:`, ucpMessage.payload);
      // Store simulation result for decision making
      session.lastSimulation = ucpMessage.payload;
    }
  }
}

module.exports = { BuyerAgent };
