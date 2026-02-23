/**
 * Simulator Agent - Runs risk assessment on contract terms
 * OpenClaw-enabled autonomous agent for SWARMCLAUSE
 */

const { BaseAgent } = require('../base-agent');
const { UCPMessage } = require('../ucp-protocol');

class SimulatorAgent extends BaseAgent {
  constructor(config) {
    super({
      ...config,
      agentType: 'simulator'
    });
    
    this.simulationModels = config.simulationModels || ['risk_assessment', 'delivery_probability', 'dispute_likelihood'];
    this.confidenceThreshold = config.confidenceThreshold || 0.7;
    
    console.log(`🔬 SimulatorAgent ${this.agentId} ready for risk assessment`);
    console.log(`📊 Simulation models:`, this.simulationModels);
  }

  async handleDiscovery(ucpMessage) {
    // Simulator doesn't participate in discovery
    console.log(`🔍 Ignoring discovery message - simulator agent`);
  }

  async handleProposal(ucpMessage) {
    // Simulator doesn't handle proposals directly
    console.log(`📋 Ignoring proposal message - simulator agent`);
  }

  async handleCounter(ucpMessage) {
    // Simulator doesn't handle counters directly
    console.log(`📋 Ignoring counter message - simulator agent`);
  }

  async handleSimulate(ucpMessage) {
    const sessionId = ucpMessage.session_id;
    const termsToEvaluate = ucpMessage.payload.terms_to_evaluate;
    
    console.log(`🔬 Starting simulation for ${sessionId}`);
    console.log(`📋 Terms to evaluate:`, termsToEvaluate);
    
    // Run comprehensive simulation
    const simulationResult = await this.runSimulation(termsToEvaluate, sessionId);
    
    // Send simulation result back to requesting agent
    const resultMessage = UCPMessage.createSimulation(
      this.agentId,
      ucpMessage.from,
      sessionId,
      {
        simulation_id: `SIM-${Date.now()}`,
        risk_score: simulationResult.riskScore,
        recommended_penalty: simulationResult.recommendedPenalty,
        delivery_failure_probability: simulationResult.deliveryFailureProbability,
        dispute_likelihood: simulationResult.disputeLikelihood,
        confidence: simulationResult.confidence,
        recommendation: simulationResult.recommendation,
        reasoning: simulationResult.reasoning,
        factors_analyzed: simulationResult.factorsAnalyzed,
        simulation_timestamp: new Date().toISOString()
      }
    );
    
    await this.sendToOpenClaw(resultMessage);
    console.log(`📊 Simulation completed for ${sessionId}:`, simulationResult.recommendation);
    
    // Store simulation in Supabase
    await this.storeSimulationResult(sessionId, simulationResult);
  }

  async runSimulation(terms, sessionId) {
    console.log(`🧮 Running multi-model simulation...`);
    
    // Get historical data for context
    const historicalData = await this.getHistoricalContext(terms);
    
    // Run different simulation models
    const riskAssessment = await this.simulateRisk(terms, historicalData);
    const deliveryProbability = await this.simulateDeliveryProbability(terms, historicalData);
    const disputeLikelihood = await this.simulateDisputeLikelihood(terms, historicalData);
    
    // Combine results with AI reasoning
    const aiPrompt = `
    As a simulation agent, I need to analyze these contract terms:
    ${JSON.stringify(terms, null, 2)}
    
    My simulation results:
    - Risk Assessment: ${JSON.stringify(riskAssessment, null, 2)}
    - Delivery Probability: ${JSON.stringify(deliveryProbability, null, 2)}
    - Dispute Likelihood: ${JSON.stringify(disputeLikelihood, null, 2)}
    - Historical Context: ${JSON.stringify(historicalData, null, 2)}
    
    Provide a comprehensive analysis with:
    1. Overall risk score (0-1)
    2. Recommended penalty per day
    3. Delivery failure probability
    4. Dispute likelihood
    5. Confidence level (LOW/MEDIUM/HIGH)
    6. Final recommendation (PROCEED/CAUTION/ABORT)
    7. Detailed reasoning
    
    Respond with JSON: {
      riskScore: number,
      recommendedPenalty: number,
      deliveryFailureProbability: number,
      disputeLikelihood: number,
      confidence: "LOW|MEDIUM|HIGH",
      recommendation: "PROCEED|CAUTION|ABORT",
      reasoning: string,
      factorsAnalyzed: string[]
    }
    `;
    
    const aiResponse = await this.callGroq(aiPrompt);
    
    try {
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error(`❌ Failed to parse AI simulation response:`, error.message);
      return this.fallbackSimulation(terms, riskAssessment, deliveryProbability, disputeLikelihood);
    }
  }

  async simulateRisk(terms, historicalData) {
    // Price risk
    const priceRisk = terms.price > 300 ? 0.3 : terms.price > 200 ? 0.15 : 0.05;
    
    // Delivery time risk
    const deliveryRisk = terms.delivery_days > 7 ? 0.4 : terms.delivery_days > 5 ? 0.2 : 0.1;
    
    // Penalty structure risk
    const penaltyRisk = !terms.penalty_per_day || terms.penalty_per_day < 10 ? 0.3 : 0.1;
    
    // Service type risk
    const serviceRisk = terms.service_type === 'data_delivery' ? 0.1 : 0.2;
    
    return {
      overallRisk: Math.min(1, priceRisk + deliveryRisk + penaltyRisk + serviceRisk),
      factors: {
        price: priceRisk,
        delivery: deliveryRisk,
        penalty: penaltyRisk,
        service: serviceRisk
      }
    };
  }

  async simulateDeliveryProbability(terms, historicalData) {
    // Base probability from historical data
    const baseProbability = historicalData.averageOnTimeDelivery || 0.85;
    
    // Adjust for delivery days
    const daysMultiplier = terms.delivery_days <= 3 ? 0.9 : terms.delivery_days <= 5 ? 1.0 : 0.8;
    
    // Adjust for complexity
    const complexityMultiplier = terms.price > 250 ? 0.9 : 1.0;
    
    const adjustedProbability = baseProbability * daysMultiplier * complexityMultiplier;
    
    return {
      successProbability: Math.min(1, adjustedProbability),
      failureProbability: Math.max(0, 1 - adjustedProbability),
      factors: {
        historical: baseProbability,
        deliveryTime: daysMultiplier,
        complexity: complexityMultiplier
      }
    };
  }

  async simulateDisputeLikelihood(terms, historicalData) {
    // Base dispute rate from historical data
    const baseDisputeRate = historicalData.averageDisputeRate || 0.05;
    
    // Risk factors
    const priceRisk = terms.price > 300 ? 1.5 : terms.price > 200 ? 1.2 : 1.0;
    const timeRisk = terms.delivery_days > 7 ? 1.3 : terms.delivery_days > 5 ? 1.1 : 1.0;
    const penaltyRisk = !terms.penalty_per_day ? 1.4 : 1.0;
    
    const adjustedDisputeRate = baseDisputeRate * priceRisk * timeRisk * penaltyRisk;
    
    return {
      disputeLikelihood: Math.min(1, adjustedDisputeRate),
      factors: {
        historical: baseDisputeRate,
        price: priceRisk,
        deliveryTime: timeRisk,
        penalty: penaltyRisk
      }
    };
  }

  async getHistoricalContext(terms) {
    // Simulate historical data based on similar contracts
    // In real implementation, this would query actual historical data
    
    const similarContracts = Math.floor(Math.random() * 50) + 10; // 10-60 similar contracts
    
    return {
      similarContracts,
      averageOnTimeDelivery: 0.85 + (Math.random() * 0.1 - 0.05), // 0.80-0.90
      averageDisputeRate: 0.03 + (Math.random() * 0.04), // 0.03-0.07
      averagePriceForService: 200 + (Math.random() * 100), // 200-300
      reputationImpact: {
        success: +5,
        failure: -10,
        dispute: -15
      }
    };
  }

  fallbackSimulation(terms, riskAssessment, deliveryProbability, disputeLikelihood) {
    // Fallback calculation if AI reasoning fails
    const riskScore = Math.min(1, riskAssessment.overallRisk);
    const deliveryFailureProbability = deliveryProbability.failureProbability;
    const disputeLikelihoodScore = disputeLikelihood.disputeLikelihood;
    
    // Calculate recommended penalty
    const recommendedPenalty = Math.round(
      terms.price * 0.05 * Math.max(1, riskScore * 2)
    );
    
    // Determine recommendation
    let recommendation;
    if (riskScore > 0.7 || deliveryFailureProbability > 0.3 || disputeLikelihoodScore > 0.15) {
      recommendation = 'ABORT';
    } else if (riskScore > 0.4 || deliveryFailureProbability > 0.2 || disputeLikelihoodScore > 0.1) {
      recommendation = 'CAUTION';
    } else {
      recommendation = 'PROCEED';
    }
    
    // Calculate confidence
    const confidence = riskScore < 0.3 ? 'HIGH' : riskScore < 0.6 ? 'MEDIUM' : 'LOW';
    
    return {
      riskScore,
      recommendedPenalty,
      deliveryFailureProbability,
      disputeLikelihood: disputeLikelihoodScore,
      confidence,
      recommendation,
      reasoning: `Risk assessment: ${riskScore.toFixed(2)}, Delivery risk: ${deliveryFailureProbability.toFixed(2)}, Dispute risk: ${disputeLikelihoodScore.toFixed(2)}`,
      factorsAnalyzed: ['price_risk', 'delivery_time', 'penalty_structure', 'historical_performance']
    };
  }

  async storeSimulationResult(sessionId, simulationResult) {
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/simulations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          risk_score: simulationResult.riskScore,
          recommended_penalty: simulationResult.recommendedPenalty,
          delivery_failure_prob: simulationResult.deliveryFailureProbability,
          dispute_likelihood: simulationResult.disputeLikelihood,
          confidence: simulationResult.confidence,
          recommendation: simulationResult.recommendation,
          reasoning: simulationResult.reasoning
        })
      });
      
      console.log(`📊 Simulation result stored for ${sessionId}`);
    } catch (error) {
      console.error(`❌ Failed to store simulation result:`, error.message);
    }
  }

  // Advanced simulation features
  async runMonteCarloSimulation(terms, iterations = 1000) {
    console.log(`🎲 Running Monte Carlo simulation with ${iterations} iterations...`);
    
    const outcomes = [];
    
    for (let i = 0; i < iterations; i++) {
      const outcome = this.simulateSingleOutcome(terms);
      outcomes.push(outcome);
    }
    
    // Analyze results
    const successCount = outcomes.filter(o => o.success).length;
    const successProbability = successCount / iterations;
    const averageProfit = outcomes.reduce((sum, o) => sum + o.profit, 0) / iterations;
    
    return {
      successProbability,
      averageProfit,
      worstCase: Math.min(...outcomes.map(o => o.profit)),
      bestCase: Math.max(...outcomes.map(o => o.profit)),
      iterations
    };
  }

  simulateSingleOutcome(terms) {
    // Simulate one possible outcome
    const deliverySuccess = Math.random() < 0.85; // 85% base success rate
    const disputeOccurs = Math.random() < 0.05; // 5% base dispute rate
    
    let profit = terms.price * 0.8; // 80% margin
    
    if (!deliverySuccess) {
      profit -= terms.penalty_per_day * terms.delivery_days;
    }
    
    if (disputeOccurs) {
      profit -= terms.price * 0.5; // 50% cost of dispute
    }
    
    return {
      success: deliverySuccess && !disputeOccurs,
      profit
    };
  }
}

module.exports = { SimulatorAgent };
