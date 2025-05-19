// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../interfaces/IPinuswapPair.sol";
import "../interfaces/IPinuswapFactory.sol";
import "../interfaces/IPinuswapERC20.sol";

/**
 * @title PinuswapPair
 * @dev Implementation of the Pinuswap liquidity pair with AMM functionality
 */
contract PinuswapPair is IPinuswapPair, IPinuswapERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Constants for fee calculation and precision
    uint256 private constant MINIMUM_LIQUIDITY = 10**3;
    uint256 private constant FEE_DENOMINATOR = 10000;
    
    // ERC20 token data
    string public constant name = 'Pinuswap LP Token';
    string public constant symbol = 'PINU-LP';
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Pair data
    address public factory;
    address public token0;
    address public token1;
    
    // Reserve data
    uint112 private reserve0;           // Uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // Uses single storage slot, accessible via getReserves
    uint32  private blockTimestampLast; // Uses single storage slot, accessible via getReserves
    
    // Price accumulator data for TWAP
    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    
    // Lock to prevent reentrancy
    uint private unlocked = 1;
    
    // Events
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Modifier to prevent reentrancy
    modifier lock() {
        require(unlocked == 1, 'Pinuswap: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }
    
    /**
     * @dev Constructor sets the factory address
     */
    constructor() {
        factory = msg.sender;
    }
    
    /**
     * @dev Initialize the pair with token addresses
     * @param _token0 Address of the first token
     * @param _token1 Address of the second token
     */
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, 'Pinuswap: FORBIDDEN');
        token0 = _token0;
        token1 = _token1;
    }
    
    /**
     * @dev Get the current reserves and last updated timestamp
     */
    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }
    
    /**
     * @dev Update reserves and price accumulators
     * @param balance0 Current balance of token0
     * @param balance1 Current balance of token1
     */
    function _update(uint256 balance0, uint256 balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, 'Pinuswap: OVERFLOW');
        
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast;
        
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            // Update price accumulators for TWAP
            price0CumulativeLast += uint256(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
            price1CumulativeLast += uint256(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        }
        
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        
        emit Sync(reserve0, reserve1);
    }
    
    /**
     * @dev Calculate the fee amount based on protocol fee
     * @param amount The amount to calculate fee on
     */
    function _calculateFee(uint256 amount) private view returns (uint256) {
        address feeTo = IPinuswapFactory(factory).feeTo();
        uint256 protocolFeeBP = IPinuswapFactory(factory).protocolFeeBP();
        
        if (feeTo == address(0) || protocolFeeBP == 0) {
            return 0;
        }
        
        return (amount * protocolFeeBP) / FEE_DENOMINATOR;
    }
    
    /**
     * @dev Mint liquidity tokens when tokens are added to the pool
     * @param to Address to receive the LP tokens
     */
    function mint(address to) external lock nonReentrant returns (uint256 liquidity) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - _reserve0;
        uint256 amount1 = balance1 - _reserve1;
        
        // Calculate protocol fee
        uint256 feeOn = _calculateFee(1) > 0 ? 1 : 0;
        
        // Calculate liquidity amount
        uint256 _totalSupply = totalSupply;
        
        if (_totalSupply == 0) {
            // Initial liquidity provision
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // Permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            // Subsequent liquidity provision
            liquidity = Math.min(
                (amount0 * _totalSupply) / _reserve0,
                (amount1 * _totalSupply) / _reserve1
            );
        }
        
        require(liquidity > 0, 'Pinuswap: INSUFFICIENT_LIQUIDITY_MINTED');
        
        // Mint LP tokens to the provider
        _mint(to, liquidity);
        
        // Update reserves
        _update(balance0, balance1, _reserve0, _reserve1);
        
        emit Mint(msg.sender, amount0, amount1);
    }
    
    /**
     * @dev Burn liquidity tokens to withdraw tokens from the pool
     * @param to Address to receive the withdrawn tokens
     */
    function burn(address to) external lock nonReentrant returns (uint256 amount0, uint256 amount1) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        address _token0 = token0;
        address _token1 = token1;
        uint256 balance0 = IERC20(_token0).balanceOf(address(this));
        uint256 balance1 = IERC20(_token1).balanceOf(address(this));
        uint256 liquidity = balanceOf[address(this)];
        
        // Calculate protocol fee
        uint256 feeOn = _calculateFee(1) > 0 ? 1 : 0;
        
        // Calculate token amounts to return
        uint256 _totalSupply = totalSupply;
        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;
        
        require(amount0 > 0 && amount1 > 0, 'Pinuswap: INSUFFICIENT_LIQUIDITY_BURNED');
        
        // Burn LP tokens
        _burn(address(this), liquidity);
        
        // Transfer tokens to recipient
        IERC20(_token0).safeTransfer(to, amount0);
        IERC20(_token1).safeTransfer(to, amount1);
        
        // Update balances after transfer
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));
        
        // Update reserves
        _update(balance0, balance1, _reserve0, _reserve1);
        
        emit Burn(msg.sender, amount0, amount1, to);
    }
    
    /**
     * @dev Swap tokens
     * @param amount0Out Amount of token0 to output
     * @param amount1Out Amount of token1 to output
     * @param to Address to receive the output tokens
     * @param data Additional data for flash swaps (if implemented)
     */
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external lock nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, 'Pinuswap: INSUFFICIENT_OUTPUT_AMOUNT');
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'Pinuswap: INSUFFICIENT_LIQUIDITY');
        
        uint256 balance0;
        uint256 balance1;
        {
            address _token0 = token0;
            address _token1 = token1;
            require(to != _token0 && to != _token1, 'Pinuswap: INVALID_TO');
            
            // Transfer output tokens
            if (amount0Out > 0) IERC20(_token0).safeTransfer(to, amount0Out);
            if (amount1Out > 0) IERC20(_token1).safeTransfer(to, amount1Out);
            
            // Handle flash swap callback if data is provided
            if (data.length > 0) {
                // Flash swap implementation would go here
            }
            
            // Check balances after transfers
            balance0 = IERC20(_token0).balanceOf(address(this));
            balance1 = IERC20(_token1).balanceOf(address(this));
        }
        
        // Calculate amounts in
        uint256 amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, 'Pinuswap: INSUFFICIENT_INPUT_AMOUNT');
        
        // Verify k value (constant product formula)
        {
            // Apply fee to input amounts
            uint256 fee = FEE_DENOMINATOR - IPinuswapFactory(factory).protocolFeeBP();
            uint256 balance0Adjusted = (balance0 * FEE_DENOMINATOR) - (amount0In * fee);
            uint256 balance1Adjusted = (balance1 * FEE_DENOMINATOR) - (amount1In * fee);
            
            require(
                balance0Adjusted * balance1Adjusted >= uint256(_reserve0) * uint256(_reserve1) * (FEE_DENOMINATOR**2),
                'Pinuswap: K'
            );
        }
        
        // Update reserves
        _update(balance0, balance1, _reserve0, _reserve1);
        
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
    
    /**
     * @dev Force balances to match reserves
     */
    function skim(address to) external lock {
        address _token0 = token0;
        address _token1 = token1;
        IERC20(_token0).safeTransfer(to, IERC20(_token0).balanceOf(address(this)) - reserve0);
        IERC20(_token1).safeTransfer(to, IERC20(_token1).balanceOf(address(this)) - reserve1);
    }
    
    /**
     * @dev Force reserves to match balances
     */
    function sync() external lock {
        _update(
            IERC20(token0).balanceOf(address(this)),
            IERC20(token1).balanceOf(address(this)),
            reserve0,
            reserve1
        );
    }
    
    // ERC20 functions
    
    function _mint(address to, uint256 value) internal {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
    
    function _burn(address from, uint256 value) internal {
        balanceOf[from] -= value;
        totalSupply -= value;
        emit Transfer(from, address(0), value);
    }
    
    function _approve(address owner, address spender, uint256 value) private {
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
    
    function _transfer(address from, address to, uint256 value) private {
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
    
    function approve(address spender, uint256 value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }
    
    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= value;
        }
        _transfer(from, to, value);
        return true;
    }
}

// Helper library for fixed point math
library UQ112x112 {
    uint224 constant Q112 = 2**112;

    function encode(uint112 y) internal pure returns (uint224 z) {
        z = uint224(y) * Q112;
    }

    function uqdiv(uint224 x, uint112 y) internal pure returns (uint224 z) {
        z = x / uint224(y);
    }
}
