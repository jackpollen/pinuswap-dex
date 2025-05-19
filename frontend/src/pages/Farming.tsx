import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

const Farming = () => {
  const { active, account, library } = useWeb3React();
  
  const [farms, setFarms] = useState([]);
  const [userFarms, setUserFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mock farm data - would be fetched from contract in production
  const mockFarms = [
    {
      id: '1',
      name: 'ETH-PINU',
      lpToken: '0x1234567890123456789012345678901234567890',
      depositFee: '0.5%',
      apr: '120%',
      totalStaked: '1,250,000 PINU',
      rewardToken: 'PINU',
      multiplier: '40x',
      userStaked: '0',
      userPendingRewards: '0',
      isActive: true
    },
    {
      id: '2',
      name: 'ETH-USDT',
      lpToken: '0x2345678901234567890123456789012345678901',
      depositFee: '0.5%',
      apr: '80%',
      totalStaked: '500,000 PINU',
      rewardToken: 'PINU',
      multiplier: '20x',
      userStaked: '0',
      userPendingRewards: '0',
      isActive: true
    },
    {
      id: '3',
      name: 'PINU-USDT',
      lpToken: '0x3456789012345678901234567890123456789012',
      depositFee: '0.5%',
      apr: '200%',
      totalStaked: '2,000,000 PINU',
      rewardToken: 'PINU',
      multiplier: '60x',
      userStaked: '0',
      userPendingRewards: '0',
      isActive: true
    }
  ];
  
  // Load farms
  useEffect(() => {
    // In a real implementation, this would fetch farm data from the contract
    setFarms(mockFarms);
    
    if (active && account) {
      // Mock user farm data
      const mockUserFarms = mockFarms.map(farm => ({
        ...farm,
        userStaked: farm.id === '1' ? '1000' : '0',
        userPendingRewards: farm.id === '1' ? '50' : '0'
      }));
      
      setUserFarms(mockUserFarms);
    } else {
      setUserFarms([]);
    }
  }, [active, account]);
  
  // Stake LP tokens
  const stakeLPTokens = async (farmId, amount) => {
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
      // In a real implementation, this would call the farming contract
      // to stake LP tokens
      
      // Mock successful staking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user farms
      setUserFarms(userFarms.map(farm => 
        farm.id === farmId 
          ? { 
              ...farm, 
              userStaked: (parseFloat(farm.userStaked) + parseFloat(amount)).toString() 
            } 
          : farm
      ));
      
      setLoading(false);
      
      // Show success message
      alert('LP tokens staked successfully!');
    } catch (error) {
      console.error('Staking error:', error);
      setError('Failed to stake LP tokens. Please try again.');
      setLoading(false);
    }
  };
  
  // Unstake LP tokens
  const unstakeLPTokens = async (farmId, amount) => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    const farm = userFarms.find(f => f.id === farmId);
    if (!farm || parseFloat(farm.userStaked) <= 0) {
      setError('You have no LP tokens staked in this farm');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(farm.userStaked)) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the farming contract
      // to unstake LP tokens
      
      // Mock successful unstaking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user farms
      setUserFarms(userFarms.map(farm => 
        farm.id === farmId 
          ? { 
              ...farm, 
              userStaked: (parseFloat(farm.userStaked) - parseFloat(amount)).toString() 
            } 
          : farm
      ));
      
      setLoading(false);
      
      // Show success message
      alert('LP tokens unstaked successfully!');
    } catch (error) {
      console.error('Unstaking error:', error);
      setError('Failed to unstake LP tokens. Please try again.');
      setLoading(false);
    }
  };
  
  // Harvest rewards
  const harvestRewards = async (farmId) => {
    if (!active) {
      setError('Please connect your wallet first');
      return;
    }
    
    const farm = userFarms.find(f => f.id === farmId);
    if (!farm || parseFloat(farm.userPendingRewards) <= 0) {
      setError('You have no rewards to harvest');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the farming contract
      // to harvest rewards
      
      // Mock successful harvesting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user farms
      setUserFarms(userFarms.map(farm => 
        farm.id === farmId 
          ? { 
              ...farm, 
              userPendingRewards: '0' 
            } 
          : farm
      ));
      
      setLoading(false);
      
      // Show success message
      alert(`${farm.userPendingRewards} ${farm.rewardToken} harvested successfully!`);
    } catch (error) {
      console.error('Harvesting error:', error);
      setError('Failed to harvest rewards. Please try again.');
      setLoading(false);
    }
  };
  
  // Farm card component
  const FarmCard = ({ farm }) => {
    const [stakeAmount, setStakeAmount] = useState('');
    const [unstakeAmount, setUnstakeAmount] = useState('');
    const [expanded, setExpanded] = useState(false);
    
    const userFarm = userFarms.find(f => f.id === farm.id) || farm;
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">{farm.name}</h3>
              <div className="flex items-center mt-1">
                <span className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full mr-2">
                  {farm.multiplier}
                </span>
                <span className="text-sm text-gray-600">
                  Deposit Fee: {farm.depositFee}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{farm.apr}</p>
              <p className="text-sm text-gray-600">APR</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Staked</p>
              <p>{farm.totalStaked}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Earn</p>
              <p>{farm.rewardToken}</p>
            </div>
          </div>
          
          {active && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Your Stake</p>
                <p>{userFarm.userStaked} LP</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Pending Rewards</p>
                <p>{userFarm.userPendingRewards} {farm.rewardToken}</p>
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
            
            {active && parseFloat(userFarm.userPendingRewards) > 0 && (
              <button
                onClick={() => harvestRewards(farm.id)}
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
                  <h4 className="font-medium mb-2">Stake LP Tokens</h4>
                  <div className="flex">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
                    />
                    <button
                      onClick={() => stakeLPTokens(farm.id, stakeAmount)}
                      disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg"
                    >
                      Stake
                    </button>
                  </div>
                </div>
                
                {parseFloat(userFarm.userStaked) > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Unstake LP Tokens</h4>
                    <div className="flex">
                      <input
                        type="number"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
                      />
                      <button
                        onClick={() => unstakeLPTokens(farm.id, unstakeAmount)}
                        disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > parseFloat(userFarm.userStaked)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-r-lg"
                      >
                        Unstake
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">Connect your wallet to stake LP tokens</p>
                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg">
                  Connect Wallet
                </button>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Farm Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">LP Token</p>
                  <p className="break-all">{farm.lpToken}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Status</p>
                  <p>{farm.isActive ? 'Active' : 'Inactive'}</p>
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
        <h1 className="text-2xl font-bold mb-2 text-center">Yield Farming</h1>
        <p className="text-gray-600 mb-6 text-center">
          Stake LP tokens to earn PINU rewards
        </p>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Farm List */}
        <div>
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Farming;
