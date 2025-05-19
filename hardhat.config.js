# Pinuswap DEX Hardhat Configuration
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load environment variables or use defaults
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const PHAROS_TESTNET_RPC = process.env.PHAROS_TESTNET_RPC || "https://api.zan.top/node/v1/pharos/testnet/8d2017a632ac47b39bcfd6b05da0e4eb";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    pharosTestnet: {
      url: PHAROS_TESTNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 13881, // Pharos Testnet Chain ID
      gasPrice: 20000000000 // 20 gwei
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
