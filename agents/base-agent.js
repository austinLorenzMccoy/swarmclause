/**
 * Base Agent Class for SWARMCLAUSE OpenClaw Integration
 * Provides common functionality for all agent types
 */

const { UCPMessage } = require('./ucp-protocol');
const fs = require('fs');
const path = require('path');

class BaseAgent {
  constructor(config) {
    this.agentId = config.agentId;
    this.agentType = config.agentType; // 'buyer', 'seller', 'simulator', 'mediator'
    this.hederaAccount = config.hederaAccount;
    this.openclawChannel = config.openclawChannel;
    this.capabilities = config.capabilities || {};
    this.reputationScore = config.reputationScore || 50;
    this.groqApiKey = config.groqApiKey;
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    
    // State management
    this.activeSessions = new Map();
    this.discoveredAgents = new Map();
    this.messageHistory = [];
    
    // Initialize OpenClaw connection
    this.initializeOpenClaw();
    
    console.log(`🤖 ${this.agentId} (${this.agentType}) agent initialized`);
    console.log(`📋 Capabilities:`, JSON.stringify(this.capabilities, null, 2));
  }

  async initializeOpenClaw() {
    try {
      // Register agent with OpenClaw network
      await this.registerWithOpenClaw();
      
      // Start discovery broadcast
      this.startDiscoveryBroadcast();
      
      // Start message listener
      this.startMessageListener();
      
      console.log(`✅ ${this.agentId} connected to OpenClaw network`);
    } catch (error) {
      console.error(`❌ Failed to initialize OpenClaw:`, error.message);
    }
  }

  async registerWithOpenClaw() {
    const discoveryMessage = UCPMessage.createDiscovery(this.agentId, this.capabilities);
    
    // Send to OpenClaw gateway
    if (this.openclawChannel) {
      await this.sendToOpenClaw(discoveryMessage);
    }
    
    // Also register in Supabase
    await this.registerInSupabase();
  }

  async registerInSupabase() {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/agents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.agentId,
          openclaw_id: this.agentId,
          hedera_account: this.hederaAccount,
          service_type: this.capabilities.service_type,
          reputation_score: this.reputationScore,
          trust_tier: this.calculateTrustTier(),
          erc8004_token_id: `erc8004-${this.agentId}`,
          capabilities: this.capabilities
        })
      });
      
      if (response.ok) {
        console.log(`✅ ${this.agentId} registered in Supabase`);
      }
    } catch (error) {
      console.error(`❌ Failed to register in Supabase:`, error.message);
    }
  }

  calculateTrustTier() {
    if (this.reputationScore >= 71) return 'GOLD';
    if (this.reputationScore >= 41) return 'SILVER';
    return 'BRONZE';
  }

  startDiscoveryBroadcast() {
    // Broadcast discovery every 30 seconds
    setInterval(async () => {
      const discoveryMessage = UCPMessage.createDiscovery(this.agentId, this.capabilities);
      await this.sendToOpenClaw(discoveryMessage);
    }, 30000);
  }

  startMessageListener() {
    // Listen for incoming UCP messages
    setInterval(async () => {
      await this.checkForMessages();
    }, 5000);
  }

  async checkForMessages() {
    // This would integrate with OpenClaw message polling
    // For now, simulate message checking
    console.log(`🔍 ${this.agentId} checking for messages...`);
  }

  async sendToOpenClaw(ucpMessage) {
    try {
      // Send via OpenClaw gateway
      const messageData = ucpMessage.toJSON();
      
      if (this.openclawChannel) {
        // In real implementation, this would use OpenClaw SDK
        console.log(`📤 ${this.agentId} sending via OpenClaw:`, messageData);
        
        // Also log to Supabase for observer UI
        await this.logToSupabase(ucpMessage);
      }
    } catch (error) {
      console.error(`❌ Failed to send via OpenClaw:`, error.message);
    }
  }

  async logToSupabase(ucpMessage) {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/transcripts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: ucpMessage.session_id,
          speaker_agent_id: ucpMessage.from,
          ucp_message: JSON.parse(ucpMessage.toJSON()),
          hcs_topic_id: process.env.HEDERA_TOPIC_ID || 'pending',
          hcs_sequence_number: Date.now()
        })
      });
      
      if (response.ok) {
        console.log(`📝 Message logged to Supabase`);
      }
    } catch (error) {
      console.error(`❌ Failed to log to Supabase:`, error.message);
    }
  }

  async handleIncomingMessage(ucpMessage) {
    console.log(`📨 ${this.agentId} received:`, ucpMessage.message_type, 'from', ucpMessage.from);
    
    // Add to message history
    this.messageHistory.push(ucpMessage);
    
    // Route to appropriate handler based on message type
    switch (ucpMessage.message_type) {
      case UCPMessage.TYPES.DISCOVER:
        await this.handleDiscovery(ucpMessage);
        break;
      case UCPMessage.TYPES.PROPOSAL:
        await this.handleProposal(ucpMessage);
        break;
      case UCPMessage.TYPES.COUNTER:
        await this.handleCounter(ucpMessage);
        break;
      case UCPMessage.TYPES.ACCEPT:
        await this.handleAccept(ucpMessage);
        break;
      case UCPMessage.TYPES.REJECT:
        await this.handleReject(ucpMessage);
        break;
      case UCPMessage.TYPES.SIMULATE:
        await this.handleSimulate(ucpMessage);
        break;
      default:
        console.log(`❓ Unknown message type: ${ucpMessage.message_type}`);
    }
  }

  // Abstract methods to be implemented by specific agent types
  async handleDiscovery(ucpMessage) {
    // Override in subclasses
  }

  async handleProposal(ucpMessage) {
    // Override in subclasses
  }

  async handleCounter(ucpMessage) {
    // Override in subclasses
  }

  async handleAccept(ucpMessage) {
    // Override in subclasses
  }

  async handleReject(ucpMessage) {
    // Override in subclasses
  }

  async handleSimulate(ucpMessage) {
    // Override in subclasses
  }

  // Groq AI integration for decision making
  async callGroq(prompt, context = {}) {
    if (!this.groqApiKey) {
      console.log(`❌ No Groq API key configured for ${this.agentId}`);
      return null;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: `You are a ${this.agentType} agent in the SWARMCLAUSE negotiation system. Your agent ID is ${this.agentId}. You must make decisions that maximize value while maintaining good reputation.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error(`❌ Groq API call failed:`, error.message);
      return null;
    }
  }

  // Update reputation score
  async updateReputation(delta, sessionId, eventType) {
    this.reputationScore += delta;
    this.reputationScore = Math.max(0, Math.min(100, this.reputationScore)); // Clamp between 0-100
    
    // Log reputation event to Supabase
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/reputation_events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: this.agentId,
          event_type: eventType,
          score_delta: delta,
          new_score: this.reputationScore,
          session_id: sessionId,
          hcs_topic_id: process.env.HEDERA_TOPIC_ID || 'pending',
          hcs_sequence_number: Date.now()
        })
      });
      
      console.log(`🏆 ${this.agentId} reputation updated: ${delta} -> ${this.reputationScore} (${eventType})`);
    } catch (error) {
      console.error(`❌ Failed to update reputation:`, error.message);
    }
  }
}

module.exports = { BaseAgent };
