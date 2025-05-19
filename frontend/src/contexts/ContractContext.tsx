import React, { useState, useEffect, createContext, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { getContracts, getTokenBalance, checkAllowance, approveToken, CONTRACT_ADDRESSES } from '../utils/contracts';

// Create context
const ContractContext = createContext(null);

// Provider component
export const ContractProvider = ({ children }) => {
  const { active, account, library, chainId } = useWeb3React();
  
  const [contracts, setContracts] = useState({});
  const [balances, setBalances] = useState({});
  const [allowances, setAllowances] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize contracts when wallet is connected
  useEffect(() => {
    if (active && library && account) {
      setContracts(getContracts(library, account));
    } else {
      setContracts({});
    }
  }, [active, library, account]);
  
  // Load PINU token balance
  useEffect(() => {
    const loadPinuBalance = async () => {
      if (active && library && account && CONTRACT_ADDRESSES.PINU_TOKEN) {
        try {
          const balance = await getTokenBalance(CONTRACT_ADDRESSES.PINU_TOKEN, account, library);
          setBalances(prev => ({
            ...prev,
            PINU: balance
          }));
        } catch (error) {
          console.error('Error loading PINU balance:', error);
        }
      }
    };
    
    loadPinuBalance();
    
    // Set up interval to refresh balance
    const intervalId = setInterval(loadPinuBalance, 15000);
    
    return () => clearInterval(intervalId);
  }, [active, library, account]);
  
  // Load ETH balance
  useEffect(() => {
    const loadEthBalance = async () => {
      if (active && library && account) {
        try {
          const balance = await library.getBalance(account);
          setBalances(prev => ({
            ...prev,
            ETH: balance
          }));
        } catch (error) {
          console.error('Error loading ETH balance:', error);
        }
      }
    };
    
    loadEthBalance();
    
    // Set up interval to refresh balance
    const intervalId = setInterval(loadEthBalance, 15000);
    
    return () => clearInterval(intervalId);
  }, [active, library, account]);
  
  // Check token allowance for router
  const checkRouterAllowance = async (tokenAddress) => {
    if (!active || !library || !account || !tokenAddress) return ethers.BigNumber.from('0');
    
    try {
      const allowance = await checkAllowance(
        tokenAddress,
        account,
        CONTRACT_ADDRESSES.ROUTER,
        library
      );
      
      setAllowances(prev => ({
        ...prev,
        [tokenAddress]: {
          ...prev[tokenAddress],
          router: allowance
        }
      }));
      
      return allowance;
    } catch (error) {
      console.error('Error checking router allowance:', error);
      return ethers.BigNumber.from('0');
    }
  };
  
  // Approve token for router
  const approveTokenForRouter = async (tokenAddress, amount) => {
    if (!active || !library || !account || !tokenAddress) {
      throw new Error('Missing parameters for token approval');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await approveToken(
        tokenAddress,
        CONTRACT_ADDRESSES.ROUTER,
        amount,
        library,
        account
      );
      
      // Update allowance after approval
      await checkRouterAllowance(tokenAddress);
      
      setLoading(false);
      return tx;
    } catch (error) {
      console.error('Error approving token for router:', error);
      setError('Failed to approve token. Please try again.');
      setLoading(false);
      throw error;
    }
  };
  
  // Check token allowance for farming
  const checkFarmingAllowance = async (tokenAddress) => {
    if (!active || !library || !account || !tokenAddress) return ethers.BigNumber.from('0');
    
    try {
      const allowance = await checkAllowance(
        tokenAddress,
        account,
        CONTRACT_ADDRESSES.FARMING,
        library
      );
      
      setAllowances(prev => ({
        ...prev,
        [tokenAddress]: {
          ...prev[tokenAddress],
          farming: allowance
        }
      }));
      
      return allowance;
    } catch (error) {
      console.error('Error checking farming allowance:', error);
      return ethers.BigNumber.from('0');
    }
  };
  
  // Approve token for farming
  const approveTokenForFarming = async (tokenAddress, amount) => {
    if (!active || !library || !account || !tokenAddress) {
      throw new Error('Missing parameters for token approval');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await approveToken(
        tokenAddress,
        CONTRACT_ADDRESSES.FARMING,
        amount,
        library,
        account
      );
      
      // Update allowance after approval
      await checkFarmingAllowance(tokenAddress);
      
      setLoading(false);
      return tx;
    } catch (error) {
      console.error('Error approving token for farming:', error);
      setError('Failed to approve token. Please try again.');
      setLoading(false);
      throw error;
    }
  };
  
  // Check token allowance for staking
  const checkStakingAllowance = async (tokenAddress) => {
    if (!active || !library || !account || !tokenAddress) return ethers.BigNumber.from('0');
    
    try {
      const allowance = await checkAllowance(
        tokenAddress,
        account,
        CONTRACT_ADDRESSES.STAKING,
        library
      );
      
      setAllowances(prev => ({
        ...prev,
        [tokenAddress]: {
          ...prev[tokenAddress],
          staking: allowance
        }
      }));
      
      return allowance;
    } catch (error) {
      console.error('Error checking staking allowance:', error);
      return ethers.BigNumber.from('0');
    }
  };
  
  // Approve token for staking
  const approveTokenForStaking = async (tokenAddress, amount) => {
    if (!active || !library || !account || !tokenAddress) {
      throw new Error('Missing parameters for token approval');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await approveToken(
        tokenAddress,
        CONTRACT_ADDRESSES.STAKING,
        amount,
        library,
        account
      );
      
      // Update allowance after approval
      await checkStakingAllowance(tokenAddress);
      
      setLoading(false);
      return tx;
    } catch (error) {
      console.error('Error approving token for staking:', error);
      setError('Failed to approve token. Please try again.');
      setLoading(false);
      throw error;
    }
  };
  
  // Get token balance
  const getBalance = async (tokenAddress) => {
    if (!active || !library || !account || !tokenAddress) return ethers.BigNumber.from('0');
    
    try {
      const balance = await getTokenBalance(tokenAddress, account, library);
      
      setBalances(prev => ({
        ...prev,
        [tokenAddress]: balance
      }));
      
      return balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return ethers.BigNumber.from('0');
    }
  };
  
  // Context value
  const value = {
    contracts,
    balances,
    allowances,
    loading,
    error,
    checkRouterAllowance,
    approveTokenForRouter,
    checkFarmingAllowance,
    approveTokenForFarming,
    checkStakingAllowance,
    approveTokenForStaking,
    getBalance,
  };
  
  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

// Hook to use the contract context
export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};
