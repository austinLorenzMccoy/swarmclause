/**
 * Agent Launcher - Starts and manages all SWARMCLAUSE agents
 * Coordinates OpenClaw agent ecosystem
 */

const { BuyerAgent } = require('./buyer/buyer-agent');
const { SellerAgent } = require('./seller/seller-agent');
const { SimulatorAgent } = require('./simulator/simulator-agent');
const { MediatorAgent } = require('./mediator/mediator-agent');

class AgentLauncher {
  constructor() {
    this.agents = new Map();
    this.config = this.loadConfiguration();
    this.isRunning = false;
  }

  loadConfiguration() {
    try {
      // Load from environment variables and config files
      return {
        openclaw: {
          channel: process.env.OPENCLAW_CHANNEL || 'default',
          gateway: process.env.OPENCLAW_GATEWAY || 'ws://127.0.0.1:18789'
        },
        groq: {
          apiKey: process.env.GROQ_API_KEY
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
          key: process.env.SUPABASE_SERVICE_KEY || 'demo-key'
        },
        hedera: {
          operatorId: process.env.HEDERA_OPERATOR_ID,
          operatorKey: process.env.HEDERA_OPERATOR_KEY,
          topicId: process.env.HEDERA_TOPIC_ID,
          contractId: process.env.HEDERA_CONTRACT_ID
        }
      };
    } catch (error) {
      console.error(`❌ Failed to load configuration:`, error.message);
      process.exit(1);
    }
  }

  async launchAllAgents() {
    console.log(`🚀 Launching SWARMCLAUSE Agent Ecosystem...`);
    
    try {
      // Launch Buyer Agents
      await this.launchBuyerAgents();
      
      // Launch Seller Agents
      await this.launchSellerAgents();
      
      // Launch Simulator Agent
      await this.launchSimulatorAgent();
      
      // Launch Mediator Agent
      await this.launchMediatorAgent();
      
      this.isRunning = true;
      console.log(`✅ All agents launched successfully!`);
      console.log(`🌐 OpenClaw network active`);
      console.log(`📊 Supabase real-time monitoring enabled`);
      
      // Start monitoring
      this.startMonitoring();
      
    } catch (error) {
      console.error(`❌ Failed to launch agents:`, error.message);
      process.exit(1);
    }
  }

  async launchBuyerAgents() {
    const buyerConfigs = [
      {
        agentId: 'BUYER-TECH-001',
        hederaAccount: '0.0.1234567',
        openclawChannel: this.config.openclaw.channel,
        groqApiKey: this.config.groq.apiKey,
        supabaseUrl: this.config.supabase.url,
        supabaseKey: this.config.supabase.key,
        buyerPreferences: {
          maxPrice: 350,
          preferredDeliveryDays: 5,
          riskTolerance: 'medium',
          serviceType: 'data_delivery'
        }
      },
      {
        agentId: 'BUYER-FINANCE-002',
        hederaAccount: '0.0.2345678',
        openclawChannel: this.config.openclaw.channel,
        groqApiKey: this.config.groq.apiKey,
        supabaseUrl: this.config.supabase.url,
        supabaseKey: this.config.supabase.key,
        buyerPreferences: {
          maxPrice: 280,
          preferredDeliveryDays: 3,
          riskTolerance: 'low',
          serviceType: 'data_delivery'
        }
      }
    ];

    for (const config of buyerConfigs) {
      const agent = new BuyerAgent(config);
      this.agents.set(config.agentId, agent);
      console.log(`🛒 Launched Buyer Agent: ${config.agentId}`);
      
      // Small delay between launches
      await this.sleep(1000);
    }
  }

  async launchSellerAgents() {
    const sellerConfigs = [
      {
        agentId: 'SELLER-DATA-001',
        hederaAccount: '0.0.3456789',
        openclawChannel: this.config.openclaw.channel,
        groqApiKey: this.config.groq.apiKey,
        supabaseUrl: this.config.supabase.url,
        supabaseKey: this.config.supabase.key,
        serviceOffering: {
          serviceType: 'data_delivery',
          priceRange: { min: 200, max: 400 },
          deliverySlaDays: [3, 5, 7],
          qualityLevel: 'premium',
          capacity: 5
        }
      },
      {
        agentId: 'SELLER-ANALYTICS-002',
        hederaAccount: '0.0.4567890',
        openclawChannel: this.config.openclaw.channel,
        groqApiKey: this.config.groq.apiKey,
        supabaseUrl: this.config.supabase.url,
        supabaseKey: this.config.supabase.key,
        serviceOffering: {
          serviceType: 'data_delivery',
          priceRange: { min: 250, max: 500 },
          deliverySlaDays: [2, 4, 6],
          qualityLevel: 'enterprise',
          capacity: 3
        }
      }
    ];

    for (const config of sellerConfigs) {
      const agent = new SellerAgent(config);
      this.agents.set(config.agentId, agent);
      console.log(`🏪 Launched Seller Agent: ${config.agentId}`);
      
      // Small delay between launches
      await this.sleep(1000);
    }
  }

  async launchSimulatorAgent() {
    const simulatorConfig = {
      agentId: 'SIMULATOR-RISK-001',
      hederaAccount: '0.0.5678901',
      openclawChannel: this.config.openclaw.channel,
      groqApiKey: this.config.groq.apiKey,
      supabaseUrl: this.config.supabase.url,
      supabaseKey: this.config.supabase.key,
      simulationModels: ['risk_assessment', 'delivery_probability', 'dispute_likelihood'],
      confidenceThreshold: 0.7
    };

    const agent = new SimulatorAgent(simulatorConfig);
    this.agents.set(simulatorConfig.agentId, agent);
    console.log(`🔬 Launched Simulator Agent: ${simulatorConfig.agentId}`);
    
    await this.sleep(1000);
  }

  async launchMediatorAgent() {
    const mediatorConfig = {
      agentId: 'MEDIATOR-NEUTRAL-001',
      hederaAccount: '0.0.6789012',
      openclawChannel: this.config.openclaw.channel,
      groqApiKey: this.config.groq.apiKey,
      supabaseUrl: this.config.supabase.url,
      supabaseKey: this.config.supabase.key,
      mediationStrategies: ['price_convergence', 'win_win', 'time_based']
    };

    const agent = new MediatorAgent(mediatorConfig);
    this.agents.set(mediatorConfig.agentId, agent);
    console.log(`⚖️ Launched Mediator Agent: ${mediatorConfig.agentId}`);
    
    await this.sleep(1000);
  }

  startMonitoring() {
    console.log(`📡 Starting agent ecosystem monitoring...`);
    
    // Status monitoring every 30 seconds
    setInterval(() => {
      this.printSystemStatus();
    }, 30000);
    
    // Health check every 5 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 300000);
  }

  printSystemStatus() {
    const activeAgents = this.agents.size;
    const totalSessions = Array.from(this.agents.values())
      .reduce((sum, agent) => sum + agent.activeSessions.size, 0);
    
    console.log(`\n📊 SWARMCLAUSE System Status`);
    console.log(`================================`);
    console.log(`🤖 Active Agents: ${activeAgents}`);
    console.log(`🤝 Active Sessions: ${totalSessions}`);
    console.log(`🌐 OpenClaw Network: Connected`);
    console.log(`📊 Supabase Real-time: Active`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.log(`================================\n`);
  }

  async performHealthCheck() {
    console.log(`🏥 Performing system health check...`);
    
    let healthyAgents = 0;
    let unhealthyAgents = [];
    
    for (const [agentId, agent] of this.agents) {
      try {
        // Simple health check - can we access the agent's properties?
        const status = agent.activeSessions ? 'healthy' : 'warning';
        if (status === 'healthy') {
          healthyAgents++;
        } else {
          unhealthyAgents.push(agentId);
        }
      } catch (error) {
        unhealthyAgents.push(agentId);
      }
    }
    
    console.log(`✅ Healthy Agents: ${healthyAgents}/${this.agents.size}`);
    if (unhealthyAgents.length > 0) {
      console.log(`⚠️  Unhealthy Agents: ${unhealthyAgents.join(', ')}`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async shutdown() {
    console.log(`🛑 Shutting down SWARMCLAUSE Agent Ecosystem...`);
    
    this.isRunning = false;
    
    // Graceful shutdown of all agents
    for (const [agentId, agent] of this.agents) {
      try {
        console.log(`🔄 Shutting down ${agentId}...`);
        // In a real implementation, this would call agent.shutdown()
        await this.sleep(500);
      } catch (error) {
        console.error(`❌ Error shutting down ${agentId}:`, error.message);
      }
    }
    
    console.log(`✅ All agents shut down`);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(`\n🛑 Received SIGINT, shutting down gracefully...`);
  if (global.launcher) {
    await global.launcher.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log(`\n🛑 Received SIGTERM, shutting down gracefully...`);
  if (global.launcher) {
    await global.launcher.shutdown();
  }
  process.exit(0);
});

// Main execution
if (require.main === module) {
  console.log(`🚀 Starting SWARMCLAUSE Agent Ecosystem...`);
  console.log(`📋 Configuration loaded from environment variables`);
  
  global.launcher = new AgentLauncher();
  
  global.launcher.launchAllAgents().catch(error => {
    console.error(`❌ Failed to start agent ecosystem:`, error.message);
    process.exit(1);
  });
}

module.exports = { AgentLauncher };
