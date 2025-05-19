import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

// Pharos Testnet Chain ID
const PHAROS_CHAIN_ID = 13881;

// Injected connector (MetaMask, OKX Wallet)
export const injected = new InjectedConnector({
  supportedChainIds: [PHAROS_CHAIN_ID],
});

// WalletConnect connector
export const walletconnect = new WalletConnectConnector({
  rpc: {
    [PHAROS_CHAIN_ID]: 'https://api.zan.top/node/v1/pharos/testnet/8d2017a632ac47b39bcfd6b05da0e4eb',
  },
  qrcode: true,
  pollingInterval: 12000,
});

// Network configuration
export const NETWORK_CONFIG = {
  [PHAROS_CHAIN_ID]: {
    chainId: `0x${PHAROS_CHAIN_ID.toString(16)}`,
    chainName: 'Pharos Testnet',
    nativeCurrency: {
      name: 'Pharos',
      symbol: 'PHAR',
      decimals: 18,
    },
    rpcUrls: ['https://api.zan.top/node/v1/pharos/testnet/8d2017a632ac47b39bcfd6b05da0e4eb'],
    blockExplorerUrls: ['https://testnet-explorer.pharosnetwork.xyz/'],
  },
};

// Helper function to add Pharos Testnet to MetaMask
export const addPharosToMetaMask = async () => {
  const provider = window.ethereum;
  if (provider) {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORK_CONFIG[PHAROS_CHAIN_ID]],
      });
      return true;
    } catch (error) {
      console.error('Error adding Pharos Testnet to MetaMask:', error);
      return false;
    }
  } else {
    console.error('MetaMask is not installed');
    return false;
  }
};

// Helper function to switch to Pharos Testnet
export const switchToPharosTestnet = async () => {
  const provider = window.ethereum;
  if (provider) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${PHAROS_CHAIN_ID.toString(16)}` }],
      });
      return true;
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        return addPharosToMetaMask();
      }
      console.error('Error switching to Pharos Testnet:', error);
      return false;
    }
  } else {
    console.error('MetaMask is not installed');
    return false;
  }
};
