# Pinuswap DEX Documentation

## Overview

Pinuswap is a decentralized exchange (DEX) built on the Pharos Testnet, modeled after PancakeSwap on the BNB Smart Chain. It features an Automated Market Maker (AMM) model with liquidity pools, yield farming, and staking capabilities.

This documentation provides comprehensive instructions for setting up, deploying, and using the Pinuswap DEX.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Smart Contracts](#smart-contracts)
3. [Frontend Application](#frontend-application)
4. [Local Development Setup](#local-development-setup)
5. [Deployment Guide](#deployment-guide)
6. [Wallet Integration](#wallet-integration)
7. [Usage Guide](#usage-guide)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Project Structure

The Pinuswap DEX project is organized as follows:

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
│   ├── public/            # Static assets
│   └── src/               # Source code
│       ├── components/    # UI components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       ├── utils/         # Utility functions
│       └── abis/          # Contract ABIs
├── scripts/               # Deployment and testing scripts
│   ├── deploy/            # Contract deployment scripts
│   └── test/              # Test scripts
├── test/                  # Contract test files
├── docker/                # Docker configuration
│   ├── dev/               # Development environment
│   └── prod/              # Production environment
└── docs/                  # Additional documentation
```

## Smart Contracts

Pinuswap DEX consists of the following smart contracts:

### PINU Token

The native token of the Pinuswap ecosystem, following the ERC-20 standard with additional features for governance and rewards.

### Factory

The factory contract is responsible for creating and managing liquidity pairs. It keeps track of all pairs and collects protocol fees.

### Pair

The pair contract implements the core AMM functionality, managing liquidity pools between two tokens and handling swaps.

### Router

The router contract provides a user-friendly interface for interacting with pairs, handling token swaps, and managing liquidity.

### Farming

The farming contract allows users to stake LP tokens to earn PINU rewards, with configurable reward rates and durations.

### Staking

The staking contract enables users to stake PINU tokens to earn additional rewards, with options for different lock periods.

## Frontend Application

The frontend application is built with React and provides a user interface for interacting with the Pinuswap DEX. It includes the following features:

- Token swapping
- Liquidity provision and management
- Yield farming
- Staking
- Wallet integration (MetaMask, OKX Wallet, WalletConnect)
- Pharos Testnet connectivity

## Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Git
- Docker and Docker Compose (for containerized deployment)

### Setting Up the Development Environment

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

3. Create a `.env` file in the root directory with the following variables:

```
PRIVATE_KEY=your_private_key_here
PHAROS_TESTNET_RPC=https://api.zan.top/node/v1/pharos/testnet/8d2017a632ac47b39bcfd6b05da0e4eb
```

4. Compile the smart contracts:

```bash
npx hardhat compile
```

5. Run the local development blockchain:

```bash
npx hardhat node
```

6. Deploy the contracts to the local blockchain:

```bash
npx hardhat run scripts/deploy/deploy.js --network localhost
```

7. Start the frontend development server:

```bash
cd frontend
pnpm run dev
```

8. Open your browser and navigate to `http://localhost:5173` to access the DEX.

## Deployment Guide

### Deploying Smart Contracts to Pharos Testnet

1. Ensure your `.env` file is set up with your private key and the Pharos Testnet RPC URL.

2. Deploy the contracts to Pharos Testnet:

```bash
npx hardhat run scripts/deploy/deploy.js --network pharosTestnet
```

3. Update the contract addresses in `frontend/src/utils/contracts.ts` with the deployed contract addresses.

### Deploying the Frontend

#### Using Docker (Recommended for Production)

1. Build the Docker image:

```bash
docker build -t pinuswap-dex -f docker/prod/Dockerfile .
```

2. Run the Docker container:

```bash
docker run -p 80:80 pinuswap-dex
```

3. Access the DEX at `http://localhost`.

#### Manual Deployment

1. Build the frontend:

```bash
cd frontend
pnpm run build
```

2. The build output will be in the `frontend/dist` directory, which can be served using any static file server.

### VPS Deployment

To deploy the Pinuswap DEX on a Linux VPS:

1. Clone the repository on your VPS:

```bash
git clone https://github.com/yourusername/pinuswap-dex.git
cd pinuswap-dex
```

2. Install Docker and Docker Compose if not already installed:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

3. Build and run the Docker containers:

```bash
docker-compose -f docker/prod/docker-compose.yml up -d
```

4. The DEX will be accessible at your VPS's IP address or domain name.

## Wallet Integration

Pinuswap DEX supports the following wallets:

- MetaMask
- OKX Wallet
- WalletConnect

### Adding Pharos Testnet to MetaMask

1. Open MetaMask and click on the network dropdown.
2. Click "Add Network".
3. Enter the following details:
   - Network Name: Pharos Testnet
   - RPC URL: https://api.zan.top/node/v1/pharos/testnet/8d2017a632ac47b39bcfd6b05da0e4eb
   - Chain ID: 13881
   - Currency Symbol: PHAR
   - Block Explorer URL: https://testnet-explorer.pharosnetwork.xyz/

4. Click "Save".

## Usage Guide

### Swapping Tokens

1. Navigate to the "Swap" page.
2. Select the tokens you want to swap.
3. Enter the amount you want to swap.
4. Click "Swap" and confirm the transaction in your wallet.

### Adding Liquidity

1. Navigate to the "Liquidity" page.
2. Click "Add Liquidity".
3. Select the token pair and enter the amounts.
4. Click "Add Liquidity" and confirm the transaction in your wallet.

### Yield Farming

1. Navigate to the "Farming" page.
2. Find a farm you want to participate in.
3. Click "Details" to expand the farm information.
4. Enter the amount of LP tokens you want to stake.
5. Click "Stake" and confirm the transaction in your wallet.

### Staking

1. Navigate to the "Staking" page.
2. Find a staking pool you want to participate in.
3. Click "Details" to expand the pool information.
4. Enter the amount of PINU tokens you want to stake.
5. Click "Stake" and confirm the transaction in your wallet.

## Security Considerations

- Always verify contract addresses before interacting with them.
- Be cautious of phishing attempts and fake websites.
- Use hardware wallets for large transactions when possible.
- Review transaction details carefully before confirming.
- The Pinuswap DEX is deployed on the Pharos Testnet, which is for testing purposes only. Do not use real funds.

## Troubleshooting

### Common Issues

1. **Transaction Failed**: Ensure you have enough PHAR for gas fees and that you're connected to the Pharos Testnet.

2. **Cannot Connect Wallet**: Make sure you have the Pharos Testnet configured in your wallet and that you're using a supported browser.

3. **Frontend Not Loading**: Clear your browser cache and try again. Ensure you're using a modern browser with JavaScript enabled.

4. **Docker Issues**: Make sure Docker is running and that you have the necessary permissions to run Docker commands.

### Getting Help

If you encounter any issues not covered in this documentation, please:

1. Check the GitHub repository issues section.
2. Join our community channels for support.
3. Submit a detailed bug report if you believe you've found a bug.

---

This documentation is maintained by the Pinuswap team. For updates and more information, visit our GitHub repository.
