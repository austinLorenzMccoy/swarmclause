/**
 * Universal Commerce Protocol (UCP) - Agent-to-Agent Communication Standard
 * SWARMCLAUSE v1.0
 */

class UCPMessage {
  constructor({ from, to, messageType, payload, sessionId }) {
    this.ucp_version = "1.0";
    this.session_id = sessionId;
    this.from = from;
    this.to = to;
    this.message_type = messageType;
    this.payload = payload;
    this.timestamp = new Date().toISOString();
    this.signature = null; // Will be signed by sending agent
  }

  // UCP Message Types
  static TYPES = {
    PROPOSAL: 'PROPOSAL',
    COUNTER: 'COUNTER',
    MEDIATE: 'MEDIATE',
    ACCEPT: 'ACCEPT',
    REJECT: 'REJECT',
    SIMULATE: 'SIMULATE',
    DISCOVER: 'DISCOVER',
    REGISTER: 'REGISTER',
    HEARTBEAT: 'HEARTBEAT'
  };

  // Validate UCP message structure
  validate() {
    const required = ['ucp_version', 'session_id', 'from', 'to', 'message_type', 'payload', 'timestamp'];
    for (const field of required) {
      if (!this[field]) {
        throw new Error(`UCP Validation Error: Missing required field '${field}'`);
      }
    }
    
    if (!Object.values(UCPMessage.TYPES).includes(this.message_type)) {
      throw new Error(`UCP Validation Error: Invalid message_type '${this.message_type}'`);
    }
    
    return true;
  }

  // Serialize to JSON for transmission
  toJSON() {
    this.validate();
    return JSON.stringify(this);
  }

  // Create specific message types
  static createProposal(from, to, sessionId, terms) {
    return new UCPMessage({
      from,
      to,
      messageType: UCPMessage.TYPES.PROPOSAL,
      sessionId,
      payload: {
        price: terms.price,
        delivery_days: terms.deliveryDays,
        penalty_per_day: terms.penaltyPerDay,
        escrow: terms.escrow || true,
        service_type: terms.serviceType
      }
    });
  }

  static createCounter(from, to, sessionId, terms) {
    return new UCPMessage({
      from,
      to,
      messageType: UCPMessage.TYPES.COUNTER,
      sessionId,
      payload: {
        price: terms.price,
        delivery_days: terms.deliveryDays,
        penalty_per_day: terms.penaltyPerDay,
        reasoning: terms.reasoning
      }
    });
  }

  static createAccept(from, to, sessionId) {
    return new UCPMessage({
      from,
      to,
      messageType: UCPMessage.TYPES.ACCEPT,
      sessionId,
      payload: {
        accepted_at: new Date().toISOString(),
        final_terms: "See previous proposal"
      }
    });
  }

  static createReject(from, to, sessionId, reason) {
    return new UCPMessage({
      from,
      to,
      messageType: UCPMessage.TYPES.REJECT,
      sessionId,
      payload: {
        rejected_at: new Date().toISOString(),
        reason: reason
      }
    });
  }

  static createSimulate(from, to, sessionId, terms) {
    return new UCPMessage({
      from,
      to,
      messageType: UCPMessage.TYPES.SIMULATE,
      sessionId,
      payload: {
        terms_to_evaluate: terms,
        request_timestamp: new Date().toISOString()
      }
    });
  }

  static createDiscovery(agentId, capabilities) {
    return new UCPMessage({
      from: agentId,
      to: 'network',
      messageType: UCPMessage.TYPES.DISCOVER,
      sessionId: 'DISCOVERY',
      payload: {
        agent_id: agentId,
        capabilities,
        timestamp: new Date().toISOString()
      }
    });
  }
}

module.exports = { UCPMessage };
