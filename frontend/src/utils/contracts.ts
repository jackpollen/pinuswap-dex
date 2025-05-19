import { ethers } from 'ethers';

// Contract ABIs
import PINUTokenABI from '../abis/PINUToken.json';
import PinuswapFactoryABI from '../abis/PinuswapFactory.json';
import PinuswapPairABI from '../abis/PinuswapPair.json';
import PinuswapRouterABI from '../abis/PinuswapRouter.json';
import PinuswapFarmingABI from '../abis/PinuswapFarming.json';
import PinuswapStakingABI from '../abis/PinuswapStaking.json';

// Contract addresses on Pharos Testnet
export const CONTRACT_ADDRESSES = {
  PINU_TOKEN: '0x1234567890123456789012345678901234567890', // Placeholder - will be replaced with actual deployed address
  FACTORY: '0x2345678901234567890123456789012345678901',    // Placeholder - will be replaced with actual deployed address
  ROUTER: '0x3456789012345678901234567890123456789012',     // Placeholder - will be replaced with actual deployed address
  FARMING: '0x4567890123456789012345678901234567890123',    // Placeholder - will be replaced with actual deployed address
  STAKING: '0x5678901234567890123456789012345678901234',    // Placeholder - will be replaced with actual deployed address
  WETH: '0x6789012345678901234567890123456789012345',       // Placeholder - will be replaced with actual deployed address
};

// Get contract instances
export const getContracts = (library, account) => {
  if (!library) return {};
  
  const signer = account ? library.getSigner(account) : library;
  
  return {
    pinuToken: new ethers.Contract(
      CONTRACT_ADDRESSES.PINU_TOKEN,
      PINUTokenABI,
      signer
    ),
    factory: new ethers.Contract(
      CONTRACT_ADDRESSES.FACTORY,
      PinuswapFactoryABI,
      signer
    ),
    router: new ethers.Contract(
      CONTRACT_ADDRESSES.ROUTER,
      PinuswapRouterABI,
      signer
    ),
    farming: new ethers.Contract(
      CONTRACT_ADDRESSES.FARMING,
      PinuswapFarmingABI,
      signer
    ),
    staking: new ethers.Contract(
      CONTRACT_ADDRESSES.STAKING,
      PinuswapStakingABI,
      signer
    ),
  };
};

// Get pair contract instance
export const getPairContract = (pairAddress, library, account) => {
  if (!library || !pairAddress) return null;
  
  const signer = account ? library.getSigner(account) : library;
  
  return new ethers.Contract(
    pairAddress,
    PinuswapPairABI,
    signer
  );
};

// Helper function to format token amounts
export const formatTokenAmount = (amount, decimals = 18) => {
  if (!amount) return '0';
  return ethers.utils.formatUnits(amount, decimals);
};

// Helper function to parse token amounts
export const parseTokenAmount = (amount, decimals = 18) => {
  if (!amount) return ethers.BigNumber.from('0');
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

// Helper function to get token balance
export const getTokenBalance = async (tokenAddress, account, library) => {
  if (!tokenAddress || !account || !library) return ethers.BigNumber.from('0');
  
  // Handle ETH balance
  if (tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    return await library.getBalance(account);
  }
  
  // Handle ERC20 token balance
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ['function balanceOf(address) view returns (uint256)'],
    library
  );
  
  return await tokenContract.balanceOf(account);
};

// Helper function to approve token spending
export const approveToken = async (tokenAddress, spenderAddress, amount, library, account) => {
  if (!tokenAddress || !spenderAddress || !amount || !library || !account) {
    throw new Error('Missing parameters for token approval');
  }
  
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ['function approve(address, uint256) returns (bool)'],
    library.getSigner(account)
  );
  
  const tx = await tokenContract.approve(spenderAddress, amount);
  return await tx.wait();
};

// Helper function to check token allowance
export const checkAllowance = async (tokenAddress, ownerAddress, spenderAddress, library) => {
  if (!tokenAddress || !ownerAddress || !spenderAddress || !library) {
    return ethers.BigNumber.from('0');
  }
  
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ['function allowance(address, address) view returns (uint256)'],
    library
  );
  
  return await tokenContract.allowance(ownerAddress, spenderAddress);
};

// Helper function to get token info
export const getTokenInfo = async (tokenAddress, library) => {
  if (!tokenAddress || !library) {
    throw new Error('Missing parameters for token info');
  }
  
  // Handle ETH
  if (tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    return {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    };
  }
  
  const tokenContract = new ethers.Contract(
    tokenAddress,
    [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
    ],
    library
  );
  
  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals(),
  ]);
  
  return {
    name,
    symbol,
    decimals,
  };
};

// Helper function to calculate price impact
export const calculatePriceImpact = (amountIn, amountOut, reserveIn, reserveOut) => {
  if (!amountIn || !amountOut || !reserveIn || !reserveOut) {
    return 0;
  }
  
  // Convert to BigNumber if they aren't already
  const amountInBN = ethers.BigNumber.isBigNumber(amountIn) ? amountIn : ethers.BigNumber.from(amountIn);
  const amountOutBN = ethers.BigNumber.isBigNumber(amountOut) ? amountOut : ethers.BigNumber.from(amountOut);
  const reserveInBN = ethers.BigNumber.isBigNumber(reserveIn) ? reserveIn : ethers.BigNumber.from(reserveIn);
  const reserveOutBN = ethers.BigNumber.isBigNumber(reserveOut) ? reserveOut : ethers.BigNumber.from(reserveOut);
  
  // Calculate mid price
  const midPrice = reserveOutBN.mul(ethers.utils.parseEther('1')).div(reserveInBN);
  
  // Calculate execution price
  const executionPrice = amountOutBN.mul(ethers.utils.parseEther('1')).div(amountInBN);
  
  // Calculate price impact
  const impact = midPrice.sub(executionPrice).mul(10000).div(midPrice);
  
  return parseFloat(ethers.utils.formatUnits(impact, 2));
};
