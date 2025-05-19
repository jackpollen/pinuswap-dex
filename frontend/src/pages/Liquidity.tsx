import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

const Liquidity = () => {
  const { active, account, library } = useWeb3React();
  
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'remove', 'find'
  const [tokenA, setTokenA] = useState('ETH');
  const [tokenB, setTokenB] = useState('PINU');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [userLiquidityPools, setUserLiquidityPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mock token list - would be fetched from API or contract in production
  const tokenList = [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'PINU', name: 'Pinuswap Inu', address: '0x1234567890123456789012345678901234567890', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x2345678901234567890123456789012345678901', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x3456789012345678901234567890123456789012', decimals: 18 },
  ];
  
  // Mock user liquidity pools
  const mockLiquidityPools = [
    {
      id: '1',
      tokenA: 'ETH',
      tokenB: 'PINU',
      amountA: '0.5',
      amountB: '50000',
      lpTokens: '10.5',
      shareOfPool: '0.02',
      value: '$900'
    },
    {
      id: '2',
      tokenA: 'ETH',
      tokenB: 'USDT',
      amountA: '0.2',
      amountB: '360',
      lpTokens: '8.2',
      shareOfPool: '0.01',
      value: '$360'
    }
  ];
  
  // Load user's liquidity pools
  useEffect(() => {
    if (active && account) {
      // In a real implementation, this would fetch the user's liquidity positions
      // from the contract
      setUserLiquidityPools(mockLiquidityPools);
    } else {
      setUserLiquidityPools([]);
    }
  }, [active, account]);
  
  // Calculate token B amount based on token A input (mock implementation)
  useEffect(() => {
    if (amountA && parseFloat(amountA) > 0) {
      // In a real implementation, this would call the router contract
      // to get the exact token B amount based on the current reserves
      const mockRate = tokenA === 'ETH' && tokenB === 'PINU' ? 100000 : 
                      tokenA === 'PINU' && tokenB === 'ETH' ? 0.00001 :
                      tokenA === 'ETH' && tokenB === 'USDT' ? 1800 :
                      tokenA === 'USDT' && tokenB === 'ETH' ? 0.00055 : 1;
      
      const calculatedAmount = parseFloat(amountA) * mockRate;
      setAmountB(calculatedAmount.toFixed(6));
    } else {
      setAmountB('');
    }
  }, [amountA, tokenA, tokenB]);
  
  // Add liquidity
  const addLiquidity = async () => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!amountA || parseFloat(amountA) <= 0 || !amountB || parseFloat(amountB) <= 0) {
      setError('Please enter valid amounts');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the router contract
      // to add liquidity
      
      // Mock successful liquidity addition
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setAmountA('');
      setAmountB('');
      setLoading(false);
      
      // Show success message
      alert('Liquidity added successfully!');
      
      // Refresh user's liquidity pools
      setUserLiquidityPools([
        ...mockLiquidityPools,
        {
          id: '3',
          tokenA,
          tokenB,
          amountA,
          amountB,
          lpTokens: (parseFloat(amountA) * 2).toFixed(2),
          shareOfPool: '0.01',
          value: '$' + (tokenA === 'ETH' ? parseFloat(amountA) * 1800 : parseFloat(amountB) * 1800).toFixed(0)
        }
      ]);
    } catch (error) {
      console.error('Add liquidity error:', error);
      setError('Failed to add liquidity. Please try again.');
      setLoading(false);
    }
  };
  
  // Remove liquidity
  const removeLiquidity = async (poolId) => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the router contract
      // to remove liquidity
      
      // Mock successful liquidity removal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLoading(false);
      
      // Show success message
      alert('Liquidity removed successfully!');
      
      // Update user's liquidity pools
      setUserLiquidityPools(userLiquidityPools.filter(pool => pool.id !== poolId));
    } catch (error) {
      console.error('Remove liquidity error:', error);
      setError('Failed to remove liquidity. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Liquidity</h1>
        
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'add' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('add')}
          >
            Add Liquidity
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'remove' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('remove')}
          >
            Your Liquidity
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'find' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('find')}
          >
            Find Other LP Tokens
          </button>
        </div>
        
        {/* Add Liquidity Form */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <p className="text-gray-600 mb-6">
              Add liquidity to receive LP tokens that represent your share of the pool. 
              You will earn 0.3% of all trades on this pair proportional to your share.
            </p>
            
            {/* Token A Input */}
            <div className="mb-4 bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <label className="text-gray-600">Token A</label>
                {active && (
                  <span className="text-sm text-gray-500">
                    Balance: 0.00
                  </span>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="number"
                  value={amountA}
                  onChange={(e) => setAmountA(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-2xl w-full outline-none"
                />
                
                <select
                  value={tokenA}
                  onChange={(e) => setTokenA(e.target.value)}
                  className="ml-2 bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  {tokenList.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Plus Icon */}
            <div className="flex justify-center -my-2 mb-2">
              <div className="bg-gray-200 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            
            {/* Token B Input */}
            <div className="mb-6 bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <label className="text-gray-600">Token B</label>
                {active && (
                  <span className="text-sm text-gray-500">
                    Balance: 0.00
                  </span>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="number"
                  value={amountB}
                  onChange={(e) => setAmountB(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-2xl w-full outline-none"
                />
                
                <select
                  value={tokenB}
                  onChange={(e) => setTokenB(e.target.value)}
                  className="ml-2 bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  {tokenList.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Pool Information */}
            {amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Pool Information</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Pool Rate</p>
                    <p>1 {tokenA} = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} {tokenB}</p>
                    <p>1 {tokenB} = {(parseFloat(amountA) / parseFloat(amountB)).toFixed(6)} {tokenA}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Share of Pool</p>
                    <p>0.01%</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {/* Add Liquidity Button */}
            <button
              onClick={addLiquidity}
              disabled={!active || !amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0 || loading}
              className={`w-full py-3 px-4 rounded-lg font-bold ${
                !active || !amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0 || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {loading ? 'Adding Liquidity...' : !active ? 'Connect Wallet' : 'Add Liquidity'}
            </button>
          </div>
        )}
        
        {/* Your Liquidity */}
        {activeTab === 'remove' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            {!active ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Connect your wallet to view your liquidity positions</p>
                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg">
                  Connect Wallet
                </button>
              </div>
            ) : userLiquidityPools.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have any liquidity positions yet</p>
                <button 
                  onClick={() => setActiveTab('add')}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg"
                >
                  Add Liquidity
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Your liquidity positions. Remove liquidity to receive tokens back.
                </p>
                
                {userLiquidityPools.map((pool) => (
                  <div key={pool.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{pool.tokenA}/{pool.tokenB}</h3>
                      <span className="text-sm bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">
                        {pool.shareOfPool}% of pool
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Your pool tokens</p>
                        <p>{pool.lpTokens} LP</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Pooled tokens</p>
                        <p>{pool.amountA} {pool.tokenA}</p>
                        <p>{pool.amountB} {pool.tokenB}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeLiquidity(pool.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Find Other LP Tokens */}
        {activeTab === 'find' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <p className="text-gray-600 mb-6">
              If you imported any LP tokens that don't appear automatically, you can find them here.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Token A</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {tokenList.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 block mb-1">Token B</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {tokenList.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg">
              Find LP Tokens
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Liquidity;
