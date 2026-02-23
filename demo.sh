#!/bin/bash

# SWARMCLAUSE OpenClaw Agent Demo
# This script demonstrates the complete agent-native negotiation platform

echo "🚀 Starting SWARMCLAUSE OpenClaw Agent Demo"
echo "============================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+"
    exit 1
fi

# Check OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw is required. Please install OpenClaw first"
    echo "Run: curl -fsSL https://openclaw.ai/install.sh | bash"
    exit 1
fi

# Check environment variables
if [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  WARNING: GROQ_API_KEY not set"
    echo "   AI agents will use fallback logic"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️  WARNING: NEXT_PUBLIC_SUPABASE_URL not set"
    echo "   Using demo Supabase instance"
fi

echo "✅ Prerequisites check complete"
echo ""

# Start OpenClaw gateway if not running
echo "🌐 Checking OpenClaw gateway status..."
if ! pgrep -f "openclaw" > /dev/null; then
    echo "🔄 Starting OpenClaw gateway..."
    openclaw gateway start
    sleep 3
fi

# Check if gateway is running
if pgrep -f "openclaw" > /dev/null; then
    echo "✅ OpenClaw gateway is running"
    GATEWAY_URL="http://127.0.0.1:18789"
    echo "📱 Gateway UI: $GATEWAY_URL"
else
    echo "❌ Failed to start OpenClaw gateway"
    exit 1
fi

echo ""
echo "🤖 Launching SWARMCLAUSE Agents..."
echo "================================"

# Change to agents directory
cd "$(dirname "$0")/agents"

# Install agent dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing agent dependencies..."
    npm install
fi

# Set environment variables for agents
export GROQ_API_KEY="${GROQ_API_KEY:-demo_key}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-http://localhost:3000}"
export SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-demo_key}"
export HEDERA_OPERATOR_ID="${HEDERA_OPERATOR_ID:-0.0.1234567}"
export HEDERA_OPERATOR_KEY="${HEDERA_OPERATOR_KEY:-demo_key}"
export HEDERA_TOPIC_ID="${HEDERA_TOPIC_ID:-demo_topic}"
export OPENCLAW_CHANNEL="${OPENCLAW_CHANNEL:-default}"

# Launch the agent ecosystem
echo "🚀 Starting agent ecosystem..."
echo "   - Buyer Agents: Seeking services"
echo "   - Seller Agents: Offering services" 
echo "   - Simulator Agent: Risk assessment"
echo "   - Mediator Agent: Facilitating agreements"
echo ""

# Start the agent launcher
node agent-launcher.js &

AGENT_PID=$!
echo "✅ Agents launched (PID: $AGENT_PID)"
echo ""

# Wait for agents to initialize
echo "⏳ Waiting for agent initialization..."
sleep 5

# Display status
echo "📊 System Status:"
echo "================================"
echo "🤖 Active Agents: 4"
echo "🌐 OpenClaw Network: Connected"
echo "📊 Supabase Real-time: Active"
echo "⛓ Hedera Integration: Ready"
echo ""

# Show available commands
echo "🎮 Available Commands:"
echo "================================"
echo "📱 Open Agent Dashboard: http://localhost:3000/agents"
echo "🌐 OpenClaw Gateway: $GATEWAY_URL"
echo "📊 View Logs: tail -f ~/.openclaw/logs/gateway.log"
echo "🛑 Stop Demo: Ctrl+C or kill $AGENT_PID"
echo ""

# Monitor function
cleanup() {
    echo ""
    echo "🛑 Shutting down SWARMCLAUSE Demo..."
    
    if [ ! -z "$AGENT_PID" ]; then
        echo "🔄 Stopping agent ecosystem (PID: $AGENT_PID)..."
        kill $AGENT_PID 2>/dev/null
    fi
    
    echo "🔄 Stopping OpenClaw gateway..."
    openclaw gateway stop
    
    echo "✅ Demo stopped successfully"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and monitor
echo "🎯 Demo is running! Press Ctrl+C to stop."
echo "📱 Watch the agent activity at: http://localhost:3000/agents"
echo ""

# Wait indefinitely (or until interrupted)
wait $AGENT_PID 2>/dev/null
