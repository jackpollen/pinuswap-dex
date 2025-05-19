// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IPinuswapFactory
 * @dev Interface for the Pinuswap factory contract
 */
interface IPinuswapFactory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairIndex);
    
    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);
    function protocolFeeBP() external view returns (uint256);
    
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint256) external view returns (address pair);
    function allPairsLength() external view returns (uint256);
    
    function createPair(address tokenA, address tokenB) external returns (address pair);
    
    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
    function setProtocolFeeBP(uint256) external;
}
