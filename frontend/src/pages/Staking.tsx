import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

const Staking = () => {
  const { active, account, library } = useWeb3React();
  
  const [stakingPools, setStakingPools] = useState([]);
  const [userStakingPools, setUserStakingPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mock staking pool data - would be fetched from contract in production
  const mockStakingPools = [
    {
      id: '1',
      name: 'PINU Staking',
      stakingToken: 'PINU',
      stakingTokenAddress: '0x1234567890123456789012345678901234567890',
      rewardToken: 'PINU',
      rewardTokenAddress: '0x1234567890123456789012345678901234567890',
      apr: '80%',
      totalStaked: '5,000,000 PINU',
      lockDuration: '0 days',
      earlyWithdrawalFee: '0%',
      userStaked: '0',
      userPendingRewards: '0',
      isActive: true
    },
    {
      id: '2',
      name: 'PINU Locked Staking',
      stakingToken: 'PINU',
      stakingTokenAddress: '0x1234567890123456789012345678901234567890',
      rewardToken: 'PINU',
      rewardTokenAddress: '0x1234567890123456789012345678901234567890',
      apr: '120%',
      totalStaked: '3,000,000 PINU',
      lockDuration: '30 days',
      earlyWithdrawalFee: '10%',
      userStaked: '0',
      userPendingRewards: '0',
      isActive: true
    },
    {
      id: '3',
      name: 'PINU Premium Staking',
      stakingToken: 'PINU',
      stakingTokenAddress: '0x1234567890123456789012345678901234567890',
      rewardToken: 'PINU',
      rewardTokenAddress: '0x1234567890123456789012345678901234567890',
      apr: '200%',
      totalStaked: '1,000,000 PINU',
      lockDuration: '90 days',
      earlyWithdrawalFee: '20%',
      userStaked: '0',
      userPendingRewards: '0',
      isActive: true
    }
  ];
  
  // Load staking pools
  useEffect(() => {
    // In a real implementation, this would fetch staking pool data from the contract
    setStakingPools(mockStakingPools);
    
    if (active && account) {
      // Mock user staking data
      const mockUserStakingPools = mockStakingPools.map(pool => ({
        ...pool,
        userStaked: pool.id === '1' ? '2000' : '0',
        userPendingRewards: pool.id === '1' ? '75' : '0'
      }));
      
      setUserStakingPools(mockUserStakingPools);
    } else {
      setUserStakingPools([]);
    }
  }, [active, account]);
  
  // Stake tokens
  const stakeTokens = async (poolId, amount) => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the staking contract
      // to stake tokens
      
      // Mock successful staking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user staking pools
      setUserStakingPools(userStakingPools.map(pool => 
        pool.id === poolId 
          ? { 
              ...pool, 
              userStaked: (parseFloat(pool.userStaked) + parseFloat(amount)).toString() 
            } 
          : pool
      ));
      
      setLoading(false);
      
      // Show success message
      alert('Tokens staked successfully!');
    } catch (error) {
      console.error('Staking error:', error);
      setError('Failed to stake tokens. Please try again.');
      setLoading(false);
    }
  };
  
  // Unstake tokens
  const unstakeTokens = async (poolId, amount) => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    const pool = userStakingPools.find(p => p.id === poolId);
    if (!pool || parseFloat(pool.userStaked) <= 0) {
      setError('You have no tokens staked in this pool');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(pool.userStaked)) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the staking contract
      // to unstake tokens
      
      // Mock successful unstaking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user staking pools
      setUserStakingPools(userStakingPools.map(pool => 
        pool.id === poolId 
          ? { 
              ...pool, 
              userStaked: (parseFloat(pool.userStaked) - parseFloat(amount)).toString() 
            } 
          : pool
      ));
      
      setLoading(false);
      
      // Show success message
      alert('Tokens unstaked successfully!');
    } catch (error) {
      console.error('Unstaking error:', error);
      setError('Failed to unstake tokens. Please try again.');
      setLoading(false);
    }
  };
  
  // Harvest rewards
  const harvestRewards = async (poolId) => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    const pool = userStakingPools.find(p => p.id === poolId);
    if (!pool || parseFloat(pool.userPendingRewards) <= 0) {
      setError('You have no rewards to harvest');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the staking contract
      // to harvest rewards
      
      // Mock successful harvesting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user staking pools
      setUserStakingPools(userStakingPools.map(pool => 
        pool.id === poolId 
          ? { 
              ...pool, 
              userPendingRewards: '0' 
            } 
          : pool
      ));
      
      setLoading(false);
      
      // Show success message
      alert(`${pool.userPendingRewards} ${pool.rewardToken} harvested successfully!`);
    } catch (error) {
      console.error('Harvesting error:', error);
      setError('Failed to harvest rewards. Please try again.');
      setLoading(false);
    }
  };
  
  // Staking pool card component
  const StakingPoolCard = ({ pool }) => {
    const [stakeAmount, setStakeAmount] = useState('');
    const [unstakeAmount, setUnstakeAmount] = useState('');
    const [expanded, setExpanded] = useState(false);
    
    const userPool = userStakingPools.find(p => p.id === pool.id) || pool;
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">{pool.name}</h3>
              <div className="flex items-center mt-1">
                <span className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full mr-2">
                  {pool.lockDuration} lock
                </span>
                {pool.earlyWithdrawalFee !== '0%' && (
                  <span className="text-sm text-gray-600">
                    Early Withdrawal Fee: {pool.earlyWithdrawalFee}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{pool.apr}</p>
              <p className="text-sm text-gray-600">APR</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Staked</p>
              <p>{pool.totalStaked}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Earn</p>
              <p>{pool.rewardToken}</p>
            </div>
          </div>
          
          {active && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Your Stake</p>
                <p>{userPool.userStaked} {pool.stakingToken}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Pending Rewards</p>
                <p>{userPool.userPendingRewards} {pool.rewardToken}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary hover:text-primary-dark font-medium"
            >
              {expanded ? 'Hide' : 'Details'}
            </button>
            
            {active && parseFloat(userPool.userPendingRewards) > 0 && (
              <button
                onClick={() => harvestRewards(pool.id)}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Harvest
              </button>
            )}
          </div>
        </div>
        
        {expanded && (
          <div className="p-6 bg-gray-50 border-t">
            {active ? (
              <div>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Stake {pool.stakingToken}</h4>
                  <div className="flex">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
                    />
                    <button
                      onClick={() => stakeTokens(pool.id, stakeAmount)}
                      disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg"
                    >
                      Stake
                    </button>
                  </div>
                </div>
                
                {parseFloat(userPool.userStaked) > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Unstake {pool.stakingToken}</h4>
                    <div className="flex">
                      <input
                        type="number"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
                      />
                      <button
                        onClick={() => unstakeTokens(pool.id, unstakeAmount)}
                        disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > parseFloat(userPool.userStaked)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-r-lg"
                      >
                        Unstake
                      </button>
                    </div>
                    
                    {pool.lockDuration !== '0 days' && (
                      <p className="text-sm text-gray-600 mt-2">
                        Note: Unstaking before the lock period ends will incur a {pool.earlyWithdrawalFee} fee.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">Connect your wallet to stake tokens</p>
                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg">
                  Connect Wallet
                </button>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Pool Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Staking Token</p>
                  <p className="break-all">{pool.stakingTokenAddress}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Status</p>
                  <p>{pool.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-center">Staking Pools</h1>
        <p className="text-gray-600 mb-6 text-center">
          Stake PINU tokens to earn rewards
        </p>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Staking Pool List */}
        <div>
          {stakingPools.map((pool) => (
            <StakingPoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Staking;
