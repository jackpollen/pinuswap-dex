# Pinuswap DEX Deployment Guide

This guide provides step-by-step instructions for deploying the Pinuswap DEX on a Linux VPS using Docker.

## Prerequisites

- A Linux VPS with at least:
  - 6 vCPU Cores
  - 12 GB RAM
  - 200 GB SSD
- Docker and Docker Compose installed
- Git installed
- Basic knowledge of Linux command line

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pinuswap-dex.git
cd pinuswap-dex
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following variables to the `.env` file:

```
PRIVATE_KEY=your_private_key_here
PHAROS_TESTNET_RPC=https://api.zan.top/node/v1/pharos/testnet/8d2017a632ac47b39bcfd6b05da0e4eb
```

Replace `your_private_key_here` with your actual private key for deploying contracts.

### 3. Deploy Smart Contracts to Pharos Testnet

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy contracts to Pharos Testnet
npx hardhat run scripts/deploy/deploy.js --network pharosTestnet
```

After deployment, note the contract addresses that are output to the console.

### 4. Update Contract Addresses in Frontend

Edit the file `frontend/src/utils/contracts.ts` and update the contract addresses with the ones from the deployment:

```typescript
export const CONTRACT_ADDRESSES = {
  PINU_TOKEN: '0x...', // Replace with actual deployed address
  FACTORY: '0x...',    // Replace with actual deployed address
  ROUTER: '0x...',     // Replace with actual deployed address
  FARMING: '0x...',    // Replace with actual deployed address
  STAKING: '0x...',    // Replace with actual deployed address
  WETH: '0x...',       // Replace with actual deployed address
};
```

### 5. Build and Deploy Using Docker

```bash
# Build the Docker image
docker build -t pinuswap-dex -f docker/prod/Dockerfile .

# Run the Docker container
docker run -d -p 80:80 --name pinuswap-dex pinuswap-dex
```

Alternatively, use Docker Compose:

```bash
docker-compose -f docker/prod/docker-compose.yml up -d
```

### 6. Access the DEX

The Pinuswap DEX should now be accessible at:

```
http://your_vps_ip
```

Replace `your_vps_ip` with the actual IP address of your VPS.

## Troubleshooting

### Docker Issues

If you encounter issues with Docker, try the following:

```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker if needed
sudo systemctl restart docker

# Check running containers
docker ps -a

# Check container logs
docker logs pinuswap-dex
```

### Smart Contract Deployment Issues

If contract deployment fails:

1. Ensure you have enough PHAR tokens for gas fees
2. Verify your private key is correct
3. Check the Pharos Testnet RPC URL is accessible

### Frontend Issues

If the frontend doesn't load properly:

1. Check the Docker container logs
2. Verify the contract addresses are correctly updated
3. Ensure port 80 is open on your VPS firewall

## Maintenance

### Updating the DEX

To update the DEX after making changes to the repository:

```bash
# Pull the latest changes
git pull

# Rebuild and restart the Docker container
docker-compose -f docker/prod/docker-compose.yml down
docker-compose -f docker/prod/docker-compose.yml up -d --build
```

### Backing Up

Regularly back up your `.env` file and any other configuration files that contain important information.

## Security Considerations

- Never share your private key
- Keep your VPS updated with security patches
- Use a firewall to restrict access to necessary ports only
- Consider using HTTPS with a reverse proxy like Nginx for production deployments
