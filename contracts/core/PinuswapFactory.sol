// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PinuswapPair.sol";
import "../interfaces/IPinuswapFactory.sol";
import "../interfaces/IPinuswapPair.sol";

/**
 * @title PinuswapFactory
 * @dev Factory contract for creating and managing liquidity pairs
 */
contract PinuswapFactory is IPinuswapFactory, Ownable {
    // Fee collector address
    address public feeTo;
    
    // Fee setter address (can update fee collector)
    address public feeToSetter;
    
    // Protocol fee (in basis points, 1% = 100)
    uint256 public protocolFeeBP = 30; // 0.3% default
    
    // Mapping from token addresses to mapping of token addresses to pair addresses
    mapping(address => mapping(address => address)) public getPair;
    
    // Array of all pairs
    address[] public allPairs;
    
    // Events
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairIndex);
    event FeeToUpdated(address feeTo);
    event FeeToSetterUpdated(address feeToSetter);
    event ProtocolFeeUpdated(uint256 protocolFeeBP);
    
    /**
     * @dev Constructor sets the fee setter address
     */
    constructor() {
        feeToSetter = msg.sender;
    }
    
    /**
     * @dev Returns the number of pairs created through the factory
     */
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
    
    /**
     * @dev Creates a new pair for the given tokens
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return pair The address of the created pair
     */
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "Pinuswap: IDENTICAL_ADDRESSES");
        require(tokenA != address(0) && tokenB != address(0), "Pinuswap: ZERO_ADDRESS");
        require(getPair[tokenA][tokenB] == address(0), "Pinuswap: PAIR_EXISTS");
        
        // Sort tokens to ensure deterministic pair addresses
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        
        // Create new pair contract
        bytes memory bytecode = type(PinuswapPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        // Initialize pair
        IPinuswapPair(pair).initialize(token0, token1);
        
        // Store pair mapping both ways
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        
        // Add to all pairs array
        allPairs.push(pair);
        
        // Emit event
        emit PairCreated(token0, token1, pair, allPairs.length - 1);
    }
    
    /**
     * @dev Sets the fee collector address
     * @param _feeTo The new fee collector address
     */
    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "Pinuswap: FORBIDDEN");
        feeTo = _feeTo;
        emit FeeToUpdated(_feeTo);
    }
    
    /**
     * @dev Sets the fee setter address
     * @param _feeToSetter The new fee setter address
     */
    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "Pinuswap: FORBIDDEN");
        require(_feeToSetter != address(0), "Pinuswap: ZERO_ADDRESS");
        feeToSetter = _feeToSetter;
        emit FeeToSetterUpdated(_feeToSetter);
    }
    
    /**
     * @dev Sets the protocol fee in basis points
     * @param _protocolFeeBP The new protocol fee (max 100 = 1%)
     */
    function setProtocolFeeBP(uint256 _protocolFeeBP) external {
        require(msg.sender == feeToSetter, "Pinuswap: FORBIDDEN");
        require(_protocolFeeBP <= 100, "Pinuswap: FEE_TOO_HIGH");
        protocolFeeBP = _protocolFeeBP;
        emit ProtocolFeeUpdated(_protocolFeeBP);
    }
}
