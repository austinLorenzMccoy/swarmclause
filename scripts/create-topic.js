/**
 * Creates an HCS topic on Hedera Testnet and prints the Topic ID.
 *
 * Usage:
 *   node scripts/create-topic.js
 *
 * Requires HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in backend/.env
 */
const { Client, TopicCreateTransaction, AccountId, PrivateKey } = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");

// Load env vars from backend/.env
const envPath = path.resolve(__dirname, "../backend/.env");
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    }
}

async function main() {
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        console.error("❌ Set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in backend/.env first");
        process.exit(1);
    }

    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromStringDer(operatorKey));

    console.log("Creating HCS topic on testnet...");
    const tx = await new TopicCreateTransaction().execute(client);
    const receipt = await tx.getReceipt(client);
    const topicId = receipt.topicId;

    console.log(`✅ Created Topic ID: ${topicId.toString()}`);
    console.log(`\nAdd this to backend/.env:\nHEDERA_TOPIC_ID=${topicId.toString()}`);

    client.close();
}

main().catch(console.error);
