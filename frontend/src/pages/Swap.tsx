import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

const Swap = () => {
  const { active, account, library } = useWeb3React();
  
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('PINU');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [deadline, setDeadline] = useState('20'); // minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceImpact, setPriceImpact] = useState('0.00');
  
  // Mock token list - would be fetched from API or contract in production
  const tokenList = [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'PINU', name: 'Pinuswap Inu', address: '0x1234567890123456789012345678901234567890', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x2345678901234567890123456789012345678901', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x3456789012345678901234567890123456789012', decimals: 18 },
  ];
  
  // Swap the tokens
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };
  
  // Calculate output amount based on input (mock implementation)
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      // In a real implementation, this would call the router contract
      // to get the exact output amount
      const mockRate = fromToken === 'ETH' && toToken === 'PINU' ? 100000 : 
                      fromToken === 'PINU' && toToken === 'ETH' ? 0.00001 :
                      fromToken === 'ETH' && toToken === 'USDT' ? 1800 :
                      fromToken === 'USDT' && toToken === 'ETH' ? 0.00055 : 1;
      
      const calculatedAmount = parseFloat(fromAmount) * mockRate;
      setToAmount(calculatedAmount.toFixed(6));
      
      // Mock price impact calculation
      const mockImpact = parseFloat(fromAmount) > 10 ? 
                        (parseFloat(fromAmount) * 0.05).toFixed(2) : 
                        (parseFloat(fromAmount) * 0.01).toFixed(2);
      setPriceImpact(mockImpact);
    } else {
      setToAmount('');
      setPriceImpact('0.00');
    }
  }, [fromAmount, fromToken, toToken]);
  
  // Execute the swap
  const executeSwap = async () => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the router contract
      // to execute the swap
      
      // Mock successful swap
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setLoading(false);
      
      // Show success message
      alert('Swap successful!');
    } catch (error) {
      console.error('Swap error:', error);
      setError('Failed to execute swap. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Swap Tokens</h1>
        
        {/* From Token */}
        <div className="mb-4 bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <label className="text-gray-600">From</label>
            {active && (
              <span className="text-sm text-gray-500">
                Balance: 0.00
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl w-full outline-none"
            />
            
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
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
        
        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleSwapTokens}
            className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>
        
        {/* To Token */}
        <div className="mb-6 bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <label className="text-gray-600">To (estimated)</label>
            {active && (
              <span className="text-sm text-gray-500">
                Balance: 0.00
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="bg-transparent text-2xl w-full outline-none"
            />
            
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
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
        
        {/* Swap Details */}
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Price</span>
              <span>1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}</span>
            </div>
            
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Minimum received</span>
              <span>{(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken}</span>
            </div>
            
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Price Impact</span>
              <span className={`${parseFloat(priceImpact) > 5 ? 'text-red-500' : 'text-green-500'}`}>
                {priceImpact}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Liquidity Provider Fee</span>
              <span>{(parseFloat(fromAmount) * 0.003).toFixed(6)} {fromToken}</span>
            </div>
          </div>
        )}
        
        {/* Settings */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Transaction Settings</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Slippage Tolerance</label>
              <div className="flex">
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <span className="ml-1 flex items-center">%</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 block mb-1">Transaction Deadline</label>
              <div className="flex">
                <input
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <span className="ml-1 flex items-center">min</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {/* Swap Button */}
        <button
          onClick={executeSwap}
          disabled={!active || !fromAmount || parseFloat(fromAmount) <= 0 || loading}
          className={`w-full py-3 px-4 rounded-lg font-bold ${
            !active || !fromAmount || parseFloat(fromAmount) <= 0 || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark text-white'
          }`}
        >
          {loading ? 'Swapping...' : !active ? 'Connect Wallet' : 'Swap'}
        </button>
      </div>
    </div>
  );
};

export default Swap;
