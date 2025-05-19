import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../utils/connectors';

const Navbar = () => {
  const { active, account, activate, deactivate } = useWeb3React();

  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    try {
      deactivate();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Pinuswap Logo" className="h-10 w-10" />
          <span className="text-xl font-bold">Pinuswap</span>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
          <Link to="/swap" className="hover:text-secondary transition-colors">Swap</Link>
          <Link to="/liquidity" className="hover:text-secondary transition-colors">Liquidity</Link>
          <Link to="/farming" className="hover:text-secondary transition-colors">Farming</Link>
          <Link to="/staking" className="hover:text-secondary transition-colors">Staking</Link>
        </div>
        
        <div>
          {active ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm bg-secondary bg-opacity-20 px-3 py-1 rounded-full">
                {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
              </span>
              <button 
                onClick={disconnectWallet}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
