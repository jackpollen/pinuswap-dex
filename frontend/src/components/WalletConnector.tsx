import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect, switchToPharosTestnet, addPharosToMetaMask, NETWORK_CONFIG } from '../utils/connectors';

const WalletConnector = () => {
  const { active, account, activate, deactivate, error, chainId } = useWeb3React();
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  // Check if connected to the correct network
  useEffect(() => {
    if (active && chainId !== 13881) {
      setNetworkError(true);
    } else {
      setNetworkError(false);
    }
  }, [active, chainId]);

  // Connect wallet
  const connectWallet = async (connector) => {
    setConnecting(true);
    try {
      await activate(connector, undefined, true);
      setShowModal(false);
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    try {
      deactivate();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  // Switch to Pharos Testnet
  const handleSwitchNetwork = async () => {
    try {
      const success = await switchToPharosTestnet();
      if (success) {
        setNetworkError(false);
      }
    } catch (error) {
      console.error('Network switch error:', error);
    }
  };

  return (
    <div>
      {active ? (
        <div className="flex items-center space-x-2">
          {networkError ? (
            <button
              onClick={handleSwitchNetwork}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Switch to Pharos Testnet
            </button>
          ) : (
            <>
              <span className="text-sm bg-secondary bg-opacity-20 px-3 py-1 rounded-full">
                {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
              </span>
              <button 
                onClick={disconnectWallet}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setShowModal(true)}
          className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      )}

      {/* Wallet Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Connect Wallet</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Connect your wallet to use Pinuswap on Pharos Testnet
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => connectWallet(injected)}
                disabled={connecting}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors"
              >
                <span className="font-medium">MetaMask / OKX Wallet</span>
                <svg className="w-6 h-6" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32.9582 1L19.8241 10.7183L22.2665 5.09082L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.04858 1L15.0707 10.809L12.7423 5.09082L2.04858 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M28.2292 23.5334L24.7497 28.8961L32.2693 30.9312L34.4332 23.6501L28.2292 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0.5834 23.6501L2.73535 30.9312L10.2429 28.8961L6.77537 23.5334L0.5834 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.86646 14.6033L7.77295 17.7496L15.2085 18.0952L14.9797 10.0186L9.86646 14.6033Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M25.1411 14.6033L19.9519 9.92798L19.8242 18.0952L27.2597 17.7496L25.1411 14.6033Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.2429 28.8961L14.7509 26.7775L10.8451 23.7L10.2429 28.8961Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.2568 26.7775L24.7648 28.8961L24.1626 23.7L20.2568 26.7775Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <button
                onClick={() => connectWallet(walletconnect)}
                disabled={connecting}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors"
              >
                <span className="font-medium">WalletConnect</span>
                <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M169.209 184.131C218.694 135.096 299.355 135.096 348.84 184.131L356.262 191.506C360.493 195.708 360.493 202.583 356.262 206.784L335.746 227.133C333.63 229.234 330.269 229.234 328.153 227.133L317.95 217.015C284.793 184.131 233.256 184.131 200.099 217.015L189.178 227.859C187.062 229.96 183.701 229.96 181.585 227.859L161.069 207.51C156.838 203.309 156.838 196.433 161.069 192.232L169.209 184.131ZM378.638 213.54L396.861 231.609C401.092 235.81 401.092 242.686 396.861 246.887L322.485 320.61C320.369 322.711 317.008 322.711 314.892 320.61C314.892 320.61 314.892 320.61 314.892 320.61L262.637 268.788C261.579 267.738 259.899 267.738 258.841 268.788C258.841 268.788 258.841 268.788 258.841 268.788L206.586 320.61C204.47 322.711 201.109 322.711 198.993 320.61C198.993 320.61 198.993 320.61 198.993 320.61L124.346 246.887C120.115 242.686 120.115 235.81 124.346 231.609L142.569 213.54C146.8 209.339 153.681 209.339 157.912 213.54L210.167 265.362C211.225 266.412 212.905 266.412 213.963 265.362C213.963 265.362 213.963 265.362 213.963 265.362L266.218 213.54C268.334 211.439 271.695 211.439 273.811 213.54C273.811 213.54 273.811 213.54 273.811 213.54L326.066 265.362C327.124 266.412 328.804 266.412 329.862 265.362L382.117 213.54C386.348 209.339 393.229 209.339 397.46 213.54L378.638 213.54Z" fill="#3B99FC"/>
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mt-4 text-red-500 text-sm">
                Error connecting wallet. Please try again.
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium mb-2">New to Ethereum?</h3>
              <p className="text-sm text-gray-600 mb-2">
                You'll need a wallet to connect to Pinuswap and interact with the Pharos Testnet.
              </p>
              <div className="flex space-x-2">
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  Get MetaMask
                </a>
                <span className="text-gray-400">|</span>
                <a 
                  href="https://www.okx.com/web3/wallet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  Get OKX Wallet
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
