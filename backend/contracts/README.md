# Hedera Smart Contracts

This directory is reserved for the on-chain escrow + settlement logic referenced in `docs/prd.md`.

## Structure

```
backend/contracts/
├── README.md
└── swarm_clause.sol        # placeholder file for future Hedera-compatible contract
```

## Next Steps

1. Author the SwarmClause escrow contract in Solidity (HIP-719 compatible) to handle:
   - `depositEscrow`
   - `acceptTerms`
   - `confirmDelivery`
   - `slashPenalty`
2. Compile and test with Hashgraph SDK / Hardhat, export ABI + bytecode into this folder.
3. Wire `HederaContractService` to use the deployed contract ID.
