// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PINUToken
 * @dev Implementation of the PINU token with fee mechanism
 * Based on Shiba Inu tokenomics model
 */
contract PINUToken is ERC20, Ownable, Pausable {
    // Fee percentages (in basis points, 1% = 100)
    uint256 public burnFee = 50;      // 0.5%
    uint256 public stakingFee = 30;    // 0.3%
    uint256 public developmentFee = 20; // 0.2%
    uint256 public constant TOTAL_FEE = 100; // 1%
    
    // Fee recipients
    address public stakingAddress;
    address public developmentAddress;
    
    // Addresses excluded from fees
    mapping(address => bool) public isExcludedFromFee;
    
    // Events
    event FeePercentagesUpdated(uint256 burnFee, uint256 stakingFee, uint256 developmentFee);
    event FeeAddressesUpdated(address stakingAddress, address developmentAddress);
    event AddressExcludedFromFee(address account, bool excluded);
    
    /**
     * @dev Constructor that gives msg.sender the total supply
     */
    constructor() ERC20("Pinuswap Inu", "PINU") {
        // Initial supply: 1 quadrillion tokens (1,000,000,000,000,000)
        uint256 initialSupply = 1000000000000000 * 10**decimals();
        
        // Mint initial supply to deployer
        _mint(msg.sender, initialSupply);
        
        // Exclude owner and this contract from fees
        isExcludedFromFee[owner()] = true;
        isExcludedFromFee[address(this)] = true;
        
        // Set initial fee recipients to owner (will be updated later)
        stakingAddress = owner();
        developmentAddress = owner();
    }
    
    /**
     * @dev Overrides transfer function to apply fees
     */
    function transfer(address recipient, uint256 amount) public override whenNotPaused returns (bool) {
        return _transferWithFee(_msgSender(), recipient, amount);
    }
    
    /**
     * @dev Overrides transferFrom function to apply fees
     */
    function transferFrom(address sender, address recipient, uint256 amount) public override whenNotPaused returns (bool) {
        uint256 currentAllowance = allowance(sender, _msgSender());
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        
        _approve(sender, _msgSender(), currentAllowance - amount);
        return _transferWithFee(sender, recipient, amount);
    }
    
    /**
     * @dev Internal function to handle transfers with fee calculation
     */
    function _transferWithFee(address sender, address recipient, uint256 amount) internal returns (bool) {
        // Check if sender or recipient is excluded from fees
        if (isExcludedFromFee[sender] || isExcludedFromFee[recipient]) {
            _transfer(sender, recipient, amount);
            return true;
        }
        
        // Calculate fees
        uint256 totalFeeAmount = (amount * TOTAL_FEE) / 10000;
        uint256 burnAmount = (amount * burnFee) / 10000;
        uint256 stakingAmount = (amount * stakingFee) / 10000;
        uint256 developmentAmount = (amount * developmentFee) / 10000;
        uint256 transferAmount = amount - totalFeeAmount;
        
        // Transfer amount minus fees to recipient
        _transfer(sender, recipient, transferAmount);
        
        // Handle fees
        if (burnAmount > 0) {
            _burn(sender, burnAmount);
        }
        
        if (stakingAmount > 0) {
            _transfer(sender, stakingAddress, stakingAmount);
        }
        
        if (developmentAmount > 0) {
            _transfer(sender, developmentAddress, developmentAmount);
        }
        
        return true;
    }
    
    /**
     * @dev Burns tokens from the caller's balance
     */
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }
    
    /**
     * @dev Updates fee percentages (only owner)
     * @notice Total fee must remain 1% (100 basis points)
     */
    function updateFeePercentages(uint256 _burnFee, uint256 _stakingFee, uint256 _developmentFee) external onlyOwner {
        require(_burnFee + _stakingFee + _developmentFee == TOTAL_FEE, "Total fee must be 1%");
        
        burnFee = _burnFee;
        stakingFee = _stakingFee;
        developmentFee = _developmentFee;
        
        emit FeePercentagesUpdated(_burnFee, _stakingFee, _developmentFee);
    }
    
    /**
     * @dev Updates fee recipient addresses (only owner)
     */
    function updateFeeAddresses(address _stakingAddress, address _developmentAddress) external onlyOwner {
        require(_stakingAddress != address(0), "Staking address cannot be zero");
        require(_developmentAddress != address(0), "Development address cannot be zero");
        
        stakingAddress = _stakingAddress;
        developmentAddress = _developmentAddress;
        
        emit FeeAddressesUpdated(_stakingAddress, _developmentAddress);
    }
    
    /**
     * @dev Excludes or includes an address from fees (only owner)
     */
    function setExcludedFromFee(address account, bool excluded) external onlyOwner {
        isExcludedFromFee[account] = excluded;
        emit AddressExcludedFromFee(account, excluded);
    }
    
    /**
     * @dev Pauses token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
