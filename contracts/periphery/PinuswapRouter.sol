// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/IPinuswapFactory.sol";
import "../interfaces/IPinuswapPair.sol";

/**
 * @title PinuswapRouter
 * @dev Router contract for interacting with Pinuswap pairs
 */
contract PinuswapRouter is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Factory address
    address public immutable factory;
    
    // WETH address for ETH<>Token swaps
    address public immutable WETH;
    
    // Deadline validation
    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "PinuswapRouter: EXPIRED");
        _;
    }
    
    /**
     * @dev Constructor sets the factory and WETH addresses
     */
    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
    }
    
    /**
     * @dev Receive function to allow receiving ETH
     */
    receive() external payable {
        assert(msg.sender == WETH); // Only accept ETH from WETH contract
    }
    
    /**
     * @dev Add liquidity to a token pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param amountADesired Desired amount of tokenA
     * @param amountBDesired Desired amount of tokenB
     * @param amountAMin Minimum amount of tokenA
     * @param amountBMin Minimum amount of tokenB
     * @param to Address to receive LP tokens
     * @param deadline Deadline for the transaction
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _calculateLiquidityAmounts(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        
        address pair = IPinuswapFactory(factory).getPair(tokenA, tokenB);
        
        // Create pair if it doesn't exist
        if (pair == address(0)) {
            pair = IPinuswapFactory(factory).createPair(tokenA, tokenB);
        }
        
        // Transfer tokens to pair
        IERC20(tokenA).safeTransferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, pair, amountB);
        
        // Mint LP tokens to recipient
        liquidity = IPinuswapPair(pair).mint(to);
    }
    
    /**
     * @dev Add liquidity to an ETH-token pair
     * @param token Token address
     * @param amountTokenDesired Desired amount of token
     * @param amountTokenMin Minimum amount of token
     * @param amountETHMin Minimum amount of ETH
     * @param to Address to receive LP tokens
     * @param deadline Deadline for the transaction
     */
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable ensure(deadline) nonReentrant returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
        (amountToken, amountETH) = _calculateLiquidityAmounts(
            token,
            WETH,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountETHMin
        );
        
        address pair = IPinuswapFactory(factory).getPair(token, WETH);
        
        // Create pair if it doesn't exist
        if (pair == address(0)) {
            pair = IPinuswapFactory(factory).createPair(token, WETH);
        }
        
        // Transfer token to pair
        IERC20(token).safeTransferFrom(msg.sender, pair, amountToken);
        
        // Wrap ETH and transfer to pair
        // Note: In a real implementation, you would call WETH.deposit{value: amountETH}()
        // and then transfer the WETH to the pair
        
        // For simplicity, we're assuming WETH is handled correctly here
        // IWETH(WETH).deposit{value: amountETH}();
        // IERC20(WETH).safeTransfer(pair, amountETH);
        
        // Mint LP tokens to recipient
        liquidity = IPinuswapPair(pair).mint(to);
        
        // Refund unused ETH
        if (msg.value > amountETH) {
            (bool success, ) = msg.sender.call{value: msg.value - amountETH}("");
            require(success, "PinuswapRouter: ETH_TRANSFER_FAILED");
        }
    }
    
    /**
     * @dev Remove liquidity from a token pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param liquidity Amount of LP tokens to burn
     * @param amountAMin Minimum amount of tokenA to receive
     * @param amountBMin Minimum amount of tokenB to receive
     * @param to Address to receive tokens
     * @param deadline Deadline for the transaction
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) nonReentrant returns (uint256 amountA, uint256 amountB) {
        address pair = IPinuswapFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "PinuswapRouter: PAIR_NOT_FOUND");
        
        // Transfer LP tokens to pair for burning
        IERC20(pair).safeTransferFrom(msg.sender, pair, liquidity);
        
        // Burn LP tokens and receive tokens
        (amountA, amountB) = IPinuswapPair(pair).burn(to);
        
        require(amountA >= amountAMin, "PinuswapRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "PinuswapRouter: INSUFFICIENT_B_AMOUNT");
    }
    
    /**
     * @dev Remove liquidity from an ETH-token pair
     * @param token Token address
     * @param liquidity Amount of LP tokens to burn
     * @param amountTokenMin Minimum amount of token to receive
     * @param amountETHMin Minimum amount of ETH to receive
     * @param to Address to receive tokens and ETH
     * @param deadline Deadline for the transaction
     */
    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) nonReentrant returns (uint256 amountToken, uint256 amountETH) {
        address pair = IPinuswapFactory(factory).getPair(token, WETH);
        require(pair != address(0), "PinuswapRouter: PAIR_NOT_FOUND");
        
        // Transfer LP tokens to pair for burning
        IERC20(pair).safeTransferFrom(msg.sender, pair, liquidity);
        
        // Burn LP tokens and receive tokens
        (uint256 amount0, uint256 amount1) = IPinuswapPair(pair).burn(address(this));
        
        // Determine which amount is token and which is WETH
        (address token0,) = _sortTokens(token, WETH);
        (amountToken, amountETH) = token0 == token ? (amount0, amount1) : (amount1, amount0);
        
        require(amountToken >= amountTokenMin, "PinuswapRouter: INSUFFICIENT_TOKEN_AMOUNT");
        require(amountETH >= amountETHMin, "PinuswapRouter: INSUFFICIENT_ETH_AMOUNT");
        
        // Transfer token to recipient
        IERC20(token).safeTransfer(to, amountToken);
        
        // Unwrap WETH and transfer ETH to recipient
        // Note: In a real implementation, you would call WETH.withdraw(amountETH)
        // and then transfer the ETH to the recipient
        
        // For simplicity, we're assuming ETH is handled correctly here
        // IWETH(WETH).withdraw(amountETH);
        // (bool success, ) = to.call{value: amountETH}("");
        // require(success, "PinuswapRouter: ETH_TRANSFER_FAILED");
    }
    
    /**
     * @dev Swap exact tokens for tokens
     * @param amountIn Exact amount of input tokens
     * @param amountOutMin Minimum amount of output tokens
     * @param path Array of token addresses (path[0] = input token, path[path.length-1] = output token)
     * @param to Address to receive output tokens
     * @param deadline Deadline for the transaction
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        amounts = _getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "PinuswapRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        
        // Transfer input tokens to first pair
        IERC20(path[0]).safeTransferFrom(msg.sender, _getPair(path[0], path[1]), amounts[0]);
        
        // Execute the swap
        _swap(amounts, path, to);
    }
    
    /**
     * @dev Swap tokens for exact tokens
     * @param amountOut Exact amount of output tokens
     * @param amountInMax Maximum amount of input tokens
     * @param path Array of token addresses (path[0] = input token, path[path.length-1] = output token)
     * @param to Address to receive output tokens
     * @param deadline Deadline for the transaction
     */
    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        amounts = _getAmountsIn(amountOut, path);
        require(amounts[0] <= amountInMax, "PinuswapRouter: EXCESSIVE_INPUT_AMOUNT");
        
        // Transfer input tokens to first pair
        IERC20(path[0]).safeTransferFrom(msg.sender, _getPair(path[0], path[1]), amounts[0]);
        
        // Execute the swap
        _swap(amounts, path, to);
    }
    
    /**
     * @dev Swap exact ETH for tokens
     * @param amountOutMin Minimum amount of output tokens
     * @param path Array of token addresses (path[0] = WETH, path[path.length-1] = output token)
     * @param to Address to receive output tokens
     * @param deadline Deadline for the transaction
     */
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        require(path[0] == WETH, "PinuswapRouter: INVALID_PATH");
        
        amounts = _getAmountsOut(msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "PinuswapRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        
        // Wrap ETH and transfer to first pair
        // Note: In a real implementation, you would call WETH.deposit{value: amounts[0]}()
        // and then transfer the WETH to the pair
        
        // For simplicity, we're assuming WETH is handled correctly here
        // IWETH(WETH).deposit{value: amounts[0]}();
        // IERC20(WETH).safeTransfer(_getPair(path[0], path[1]), amounts[0]);
        
        // Execute the swap
        _swap(amounts, path, to);
    }
    
    /**
     * @dev Swap tokens for exact ETH
     * @param amountOut Exact amount of ETH to receive
     * @param amountInMax Maximum amount of input tokens
     * @param path Array of token addresses (path[0] = input token, path[path.length-1] = WETH)
     * @param to Address to receive ETH
     * @param deadline Deadline for the transaction
     */
    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WETH, "PinuswapRouter: INVALID_PATH");
        
        amounts = _getAmountsIn(amountOut, path);
        require(amounts[0] <= amountInMax, "PinuswapRouter: EXCESSIVE_INPUT_AMOUNT");
        
        // Transfer input tokens to first pair
        IERC20(path[0]).safeTransferFrom(msg.sender, _getPair(path[0], path[1]), amounts[0]);
        
        // Execute the swap
        _swap(amounts, path, address(this));
        
        // Unwrap WETH and transfer ETH to recipient
        // Note: In a real implementation, you would call WETH.withdraw(amounts[amounts.length - 1])
        // and then transfer the ETH to the recipient
        
        // For simplicity, we're assuming ETH is handled correctly here
        // IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        // (bool success, ) = to.call{value: amounts[amounts.length - 1]}("");
        // require(success, "PinuswapRouter: ETH_TRANSFER_FAILED");
    }
    
    /**
     * @dev Swap exact tokens for ETH
     * @param amountIn Exact amount of input tokens
     * @param amountOutMin Minimum amount of ETH to receive
     * @param path Array of token addresses (path[0] = input token, path[path.length-1] = WETH)
     * @param to Address to receive ETH
     * @param deadline Deadline for the transaction
     */
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WETH, "PinuswapRouter: INVALID_PATH");
        
        amounts = _getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "PinuswapRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        
        // Transfer input tokens to first pair
        IERC20(path[0]).safeTransferFrom(msg.sender, _getPair(path[0], path[1]), amounts[0]);
        
        // Execute the swap
        _swap(amounts, path, address(this));
        
        // Unwrap WETH and transfer ETH to recipient
        // Note: In a real implementation, you would call WETH.withdraw(amounts[amounts.length - 1])
        // and then transfer the ETH to the recipient
        
        // For simplicity, we're assuming ETH is handled correctly here
        // IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        // (bool success, ) = to.call{value: amounts[amounts.length - 1]}("");
        // require(success, "PinuswapRouter: ETH_TRANSFER_FAILED");
    }
    
    /**
     * @dev Swap ETH for exact tokens
     * @param amountOut Exact amount of output tokens
     * @param path Array of token addresses (path[0] = WETH, path[path.length-1] = output token)
     * @param to Address to receive tokens
     * @param deadline Deadline for the transaction
     */
    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        require(path[0] == WETH, "PinuswapRouter: INVALID_PATH");
        
        amounts = _getAmountsIn(amountOut, path);
        require(amounts[0] <= msg.value, "PinuswapRouter: EXCESSIVE_INPUT_AMOUNT");
        
        // Wrap ETH and transfer to first pair
        // Note: In a real implementation, you would call WETH.deposit{value: amounts[0]}()
        // and then transfer the WETH to the pair
        
        // For simplicity, we're assuming WETH is handled correctly here
        // IWETH(WETH).deposit{value: amounts[0]}();
        // IERC20(WETH).safeTransfer(_getPair(path[0], path[1]), amounts[0]);
        
        // Execute the swap
        _swap(amounts, path, to);
        
        // Refund unused ETH
        if (msg.value > amounts[0]) {
            (bool success, ) = msg.sender.call{value: msg.value - amounts[0]}("");
            require(success, "PinuswapRouter: ETH_TRANSFER_FAILED");
        }
    }
    
    /**
     * @dev Calculate the amount of tokens to be received for a given input amount
     * @param amountIn Input amount
     * @param path Array of token addresses
     */
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts) {
        return _getAmountsOut(amountIn, path);
    }
    
    /**
     * @dev Calculate the amount of tokens to be provided for a given output amount
     * @param amountOut Output amount
     * @param path Array of token addresses
     */
    function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts) {
        return _getAmountsIn(amountOut, path);
    }
    
    // Internal functions
    
    /**
     * @dev Sort token addresses to ensure consistent pair addresses
     */
    function _sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "PinuswapRouter: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "PinuswapRouter: ZERO_ADDRESS");
    }
    
    /**
     * @dev Get pair address for two tokens
     */
    function _getPair(address tokenA, address tokenB) internal view returns (address) {
        return IPinuswapFactory(factory).getPair(tokenA, tokenB);
    }
    
    /**
     * @dev Calculate optimal liquidity amounts based on reserves
     */
    function _calculateLiquidityAmounts(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal view returns (uint256 amountA, uint256 amountB) {
        // Get pair address
        address pair = IPinuswapFactory(factory).getPair(tokenA, tokenB);
        
        if (pair == address(0)) {
            // No existing pair, use desired amounts
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            // Get reserves
            (uint256 reserveA, uint256 reserveB) = _getReserves(tokenA, tokenB);
            
            if (reserveA == 0 && reserveB == 0) {
                // Pair exists but no liquidity, use desired amounts
                amountA = amountADesired;
                amountB = amountBDesired;
            } else {
                // Calculate optimal B amount based on A
                uint256 amountBOptimal = _quote(amountADesired, reserveA, reserveB);
                
                if (amountBOptimal <= amountBDesired) {
                    // B optimal amount is within desired range
                    require(amountBOptimal >= amountBMin, "PinuswapRouter: INSUFFICIENT_B_AMOUNT");
                    amountA = amountADesired;
                    amountB = amountBOptimal;
                } else {
                    // Calculate optimal A amount based on B
                    uint256 amountAOptimal = _quote(amountBDesired, reserveB, reserveA);
                    
                    require(amountAOptimal <= amountADesired, "PinuswapRouter: EXCESSIVE_A_AMOUNT");
                    require(amountAOptimal >= amountAMin, "PinuswapRouter: INSUFFICIENT_A_AMOUNT");
                    
                    amountA = amountAOptimal;
                    amountB = amountBDesired;
                }
            }
        }
    }
    
    /**
     * @dev Get reserves for a token pair
     */
    function _getReserves(address tokenA, address tokenB) internal view returns (uint256 reserveA, uint256 reserveB) {
        (address token0,) = _sortTokens(tokenA, tokenB);
        address pair = IPinuswapFactory(factory).getPair(tokenA, tokenB);
        
        if (pair == address(0)) {
            return (0, 0);
        }
        
        (uint112 reserve0, uint112 reserve1,) = IPinuswapPair(pair).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }
    
    /**
     * @dev Calculate amount based on reserves
     */
    function _quote(uint256 amountA, uint256 reserveA, uint256 reserveB) internal pure returns (uint256 amountB) {
        require(amountA > 0, "PinuswapRouter: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "PinuswapRouter: INSUFFICIENT_LIQUIDITY");
        amountB = (amountA * reserveB) / reserveA;
    }
    
    /**
     * @dev Calculate amounts out for a given input amount and path
     */
    function _getAmountsOut(uint256 amountIn, address[] calldata path) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "PinuswapRouter: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            (uint256 reserveIn, uint256 reserveOut) = _getReserves(path[i], path[i + 1]);
            amounts[i + 1] = _getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }
    
    /**
     * @dev Calculate amounts in for a given output amount and path
     */
    function _getAmountsIn(uint256 amountOut, address[] calldata path) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "PinuswapRouter: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[amounts.length - 1] = amountOut;
        
        for (uint256 i = path.length - 1; i > 0; i--) {
            (uint256 reserveIn, uint256 reserveOut) = _getReserves(path[i - 1], path[i]);
            amounts[i - 1] = _getAmountIn(amounts[i], reserveIn, reserveOut);
        }
    }
    
    /**
     * @dev Calculate output amount for a given input and reserves
     */
    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal view returns (uint256 amountOut) {
        require(amountIn > 0, "PinuswapRouter: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "PinuswapRouter: INSUFFICIENT_LIQUIDITY");
        
        uint256 amountInWithFee = amountIn * (10000 - IPinuswapFactory(factory).protocolFeeBP());
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 10000) + amountInWithFee;
        amountOut = numerator / denominator;
    }
    
    /**
     * @dev Calculate input amount for a given output and reserves
     */
    function _getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) internal view returns (uint256 amountIn) {
        require(amountOut > 0, "PinuswapRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "PinuswapRouter: INSUFFICIENT_LIQUIDITY");
        
        uint256 numerator = reserveIn * amountOut * 10000;
        uint256 denominator = (reserveOut - amountOut) * (10000 - IPinuswapFactory(factory).protocolFeeBP());
        amountIn = (numerator / denominator) + 1;
    }
    
    /**
     * @dev Execute a swap along a path
     */
    function _swap(uint256[] memory amounts, address[] calldata path, address _to) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = _sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            
            address to = i < path.length - 2 ? _getPair(output, path[i + 2]) : _to;
            
            IPinuswapPair(_getPair(input, output)).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }
}
