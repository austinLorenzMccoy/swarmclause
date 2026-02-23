/**
 * Compiles SwarmClauseEscrow.sol and deploys it to Hedera Testnet.
 *
 * Usage:
 *   node scripts/deploy-contract.js
 *
 * Requires: HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in backend/.env
 * Outputs:  The deployed contract ID (0.0.XXXXXX)
 */
const {
    Client,
    AccountId,
    PrivateKey,
    ContractCreateFlow,
    ContractCallQuery,
    ContractFunctionParameters,
} = require("@hashgraph/sdk");
const solc = require("solc");
const fs = require("fs");
const path = require("path");

// ── Load env vars from backend/.env ─────────────────────────────────────────

const envPath = path.resolve(__dirname, "../backend/.env");
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    }
}

// ── Compile Solidity ────────────────────────────────────────────────────────

function compileSolidity() {
    const contractPath = path.resolve(
        __dirname,
        "../backend/contracts/SwarmClauseEscrow.sol"
    );
    const source = fs.readFileSync(contractPath, "utf8");

    const input = {
        language: "Solidity",
        sources: { "SwarmClauseEscrow.sol": { content: source } },
        settings: {
            outputSelection: {
                "*": { "*": ["abi", "evm.bytecode.object"] },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter((e) => e.severity === "error");
        if (errors.length > 0) {
            console.error("Compilation errors:");
            errors.forEach((e) => console.error(e.formattedMessage));
            process.exit(1);
        }
    }

    const contract = output.contracts["SwarmClauseEscrow.sol"]["SwarmClauseEscrow"];
    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;

    // Save ABI for later use
    const abiPath = path.resolve(__dirname, "../backend/contracts/SwarmClauseEscrow.abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    console.log(`✅ ABI saved to ${abiPath}`);

    return { bytecode, abi };
}

// ── Deploy to Hedera ────────────────────────────────────────────────────────

async function deploy() {
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        console.error("❌ Set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in backend/.env");
        process.exit(1);
    }

    console.log("📦 Compiling SwarmClauseEscrow.sol...");
    const { bytecode, abi } = compileSolidity();
    console.log(`   Bytecode size: ${(bytecode.length / 2).toLocaleString()} bytes`);
    console.log(`   ABI functions: ${abi.filter((a) => a.type === "function").map((a) => a.name).join(", ")}`);

    const client = Client.forTestnet();
    client.setOperator(
        AccountId.fromString(operatorId),
        PrivateKey.fromStringDer(operatorKey)
    );

    console.log("\n🚀 Deploying to Hedera Testnet...");
    const tx = await new ContractCreateFlow()
        .setBytecode(bytecode)
        .setGas(2_000_000)
        .execute(client);

    const receipt = await tx.getReceipt(client);
    const contractId = receipt.contractId;

    console.log(`\n✅ Contract deployed!`);
    console.log(`   Contract ID: ${contractId.toString()}`);
    console.log(`   EVM Address: ${contractId.toSolidityAddress()}`);
    console.log(`\nView on HashScan: https://hashscan.io/testnet/contract/${contractId.toString()}`);

    // Save contract ID to a file for reference
    const deployInfo = {
        contractId: contractId.toString(),
        evmAddress: contractId.toSolidityAddress(),
        deployedAt: new Date().toISOString(),
        network: "testnet",
    };
    const deployPath = path.resolve(__dirname, "../backend/contracts/deployment.json");
    fs.writeFileSync(deployPath, JSON.stringify(deployInfo, null, 2));
    console.log(`\n📄 Deployment info saved to ${deployPath}`);

    client.close();
}

deploy().catch((err) => {
    console.error("Deploy failed:", err.message || err);
    process.exit(1);
});
