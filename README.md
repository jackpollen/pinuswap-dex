# Pinuswap DEX

A decentralized exchange (DEX) built on the Pharos Testnet, modeled after PancakeSwap on the BNB Smart Chain. Pinuswap features an Automated Market Maker (AMM) model with liquidity pools, yield farming, and staking capabilities.

## Features

- **Token Swapping**: Exchange tokens using automated market maker mechanism
- **Liquidity Pools**: Provide liquidity and earn trading fees
- **Yield Farming**: Stake LP tokens to earn PINU rewards
- **Staking Pools**: Stake PINU tokens to earn additional rewards
- **Wallet Integration**: Connect with MetaMask, OKX Wallet, and WalletConnect
- **Pharos Testnet**: Built specifically for the Pharos Testnet

## Project Structure

```
pinuswap-dex/
├── contracts/             # Smart contracts
│   ├── token/             # PINU token contract
│   ├── core/              # Core AMM contracts (Factory, Pair)
│   ├── periphery/         # Router contract
│   ├── farming/           # Yield farming contracts
│   ├── staking/           # Staking pool contracts
│   └── interfaces/        # Contract interfaces
├── frontend/              # React frontend application
├── scripts/               # Deployment and testing scripts
├── test/                  # Contract test files
├── docker/                # Docker configuration
└── docs/                  # Documentation
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Git
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pinuswap-dex.git
cd pinuswap-dex
```

2. Install dependencies:

```bash
# Install smart contract dependencies
npm install

# Install frontend dependencies
cd frontend
pnpm install
cd ..
```

3. Create a `.env` file in the root directory with your configuration.

4. Compile and deploy the smart contracts:

```bash
npx hardhat compile
npx hardhat run scripts/deploy/deploy.js --network localhost
```

5. Start the frontend development server:

```bash
cd frontend
pnpm run dev
```

### Docker Deployment

For production deployment on a VPS:

```bash
docker-compose -f docker/prod/docker-compose.yml up -d
```

## Documentation

For detailed instructions, please refer to:

- [Full Documentation](./docs/documentation.md)
- [Deployment Guide](./docs/deployment_guide.md)

## License

MIT

## Acknowledgements

- PancakeSwap for inspiration
- Pharos Network for the testnet infrastructure
