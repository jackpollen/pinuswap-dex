import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

const Home = () => {
  const { active, account, library } = useWeb3React();
  const [networkName, setNetworkName] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    const getNetworkInfo = async () => {
      if (library) {
        const network = await library.getNetwork();
        setNetworkName(network.name === 'unknown' ? 'Pharos Testnet' : network.name);
      }
    };

    const getBalance = async () => {
      if (library && account) {
        const balance = await library.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
      }
    };

    getNetworkInfo();
    getBalance();
  }, [library, account]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Pinuswap</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The first dog-themed decentralized exchange on Pharos Testnet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Swap</h2>
          <p className="text-gray-600 mb-4">Exchange tokens with our automated market maker</p>
          <a href="/swap" className="text-primary hover:text-primary-dark font-medium">Start swapping →</a>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Liquidity</h2>
          <p className="text-gray-600 mb-4">Provide liquidity to earn trading fees</p>
          <a href="/liquidity" className="text-primary hover:text-primary-dark font-medium">Add liquidity →</a>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Farming</h2>
          <p className="text-gray-600 mb-4">Stake LP tokens to earn PINU rewards</p>
          <a href="/farming" className="text-primary hover:text-primary-dark font-medium">Start farming →</a>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Staking</h2>
          <p className="text-gray-600 mb-4">Stake PINU tokens to earn more rewards</p>
          <a href="/staking" className="text-primary hover:text-primary-dark font-medium">Stake now →</a>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Get started with Pinuswap</h2>
            <p className="text-lg opacity-90">Connect your wallet to start trading on Pharos Testnet</p>
          </div>
          
          {active ? (
            <div className="bg-white text-gray-800 rounded-lg p-4 shadow-md">
              <p className="font-medium">Connected to {networkName}</p>
              <p className="text-sm text-gray-600">Account: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}</p>
              <p className="text-sm text-gray-600">Balance: {parseFloat(balance).toFixed(4)} PHAR</p>
            </div>
          ) : (
            <button className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-md transition-colors">
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">About Pinuswap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-full p-4 inline-block mb-4">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Automated Market Maker</h3>
            <p className="text-gray-600">Trade tokens without the need for traditional order books</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-full p-4 inline-block mb-4">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
            <p className="text-gray-600">Provide liquidity and stake tokens to earn PINU rewards</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-full p-4 inline-block mb-4">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Non-Custodial</h3>
            <p className="text-gray-600">You always maintain control of your funds</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Ready to dive in?</h2>
        <a href="/swap" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-md inline-block transition-colors">
          Launch App
        </a>
      </div>
    </div>
  );
};

export default Home;
