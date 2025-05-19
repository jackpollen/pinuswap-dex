// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PinuswapStaking
 * @dev Contract for staking PINU tokens to earn rewards
 */
contract PinuswapStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Info of each user
    struct UserInfo {
        uint256 amount;         // How many tokens the user has staked
        uint256 rewardDebt;     // Reward debt
        uint256 pendingRewards; // Pending rewards to be claimed
        uint256 lastStakeTime;  // Last time user staked tokens
        uint256 lockEndTime;    // End time of the lock period (0 if no lock)
    }

    // Info of each pool
    struct PoolInfo {
        IERC20 rewardToken;       // Address of reward token contract
        uint256 rewardPerBlock;   // Reward tokens created per block
        uint256 lastRewardBlock;  // Last block number that rewards distribution occurred
        uint256 accRewardPerShare; // Accumulated rewards per share, times 1e12
        uint256 lockDuration;     // Lock duration in seconds (0 if no lock)
        uint256 earlyWithdrawalFee; // Fee for early withdrawal in basis points (100 = 1%)
        uint256 totalStaked;      // Total tokens staked in this pool
    }

    // The PINU TOKEN
    IERC20 public stakingToken;
    
    // Fee address
    address public feeAddress;
    
    // Info of each pool
    PoolInfo[] public poolInfo;
    
    // Info of each user that stakes tokens
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    
    // The block number when staking starts
    uint256 public startBlock;
    
    // Events
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event RewardClaimed(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, address indexed rewardToken, uint256 rewardPerBlock, uint256 lockDuration);
    event PoolUpdated(uint256 indexed pid, uint256 rewardPerBlock);
    
    /**
     * @dev Constructor initializes the staking contract
     * @param _stakingToken The PINU token address
     * @param _feeAddress Address where early withdrawal fees will be sent
     * @param _startBlock Block number when staking starts
     */
    constructor(
        IERC20 _stakingToken,
        address _feeAddress,
        uint256 _startBlock
    ) {
        stakingToken = _stakingToken;
        feeAddress = _feeAddress;
        startBlock = _startBlock;
    }
    
    /**
     * @dev Returns the number of pools
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }
    
    /**
     * @dev Add a new staking pool
     * @param _rewardToken Address of the reward token contract
     * @param _rewardPerBlock Reward tokens created per block
     * @param _lockDuration Lock duration in seconds (0 if no lock)
     * @param _earlyWithdrawalFee Fee for early withdrawal in basis points
     * @param _withUpdate Whether to update all pools
     */
    function add(
        IERC20 _rewardToken,
        uint256 _rewardPerBlock,
        uint256 _lockDuration,
        uint256 _earlyWithdrawalFee,
        bool _withUpdate
    ) public onlyOwner {
        require(_earlyWithdrawalFee <= 3000, "add: fee too high"); // Max 30%
        
        if (_withUpdate) {
            massUpdatePools();
        }
        
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        
        poolInfo.push(
            PoolInfo({
                rewardToken: _rewardToken,
                rewardPerBlock: _rewardPerBlock,
                lastRewardBlock: lastRewardBlock,
                accRewardPerShare: 0,
                lockDuration: _lockDuration,
                earlyWithdrawalFee: _earlyWithdrawalFee,
                totalStaked: 0
            })
        );
        
        emit PoolAdded(poolInfo.length - 1, address(_rewardToken), _rewardPerBlock, _lockDuration);
    }
    
    /**
     * @dev Update the given pool's reward per block
     * @param _pid Pool ID
     * @param _rewardPerBlock New reward per block
     * @param _withUpdate Whether to update all pools
     */
    function set(
        uint256 _pid,
        uint256 _rewardPerBlock,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        
        poolInfo[_pid].rewardPerBlock = _rewardPerBlock;
        
        emit PoolUpdated(_pid, _rewardPerBlock);
    }
    
    /**
     * @dev Update reward variables for all pools
     */
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }
    
    /**
     * @dev Update reward variables of the given pool
     * @param _pid Pool ID
     */
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        
        uint256 stakedSupply = pool.totalStaked;
        
        if (stakedSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        
        uint256 multiplier = block.number - pool.lastRewardBlock;
        uint256 reward = multiplier * pool.rewardPerBlock;
        
        pool.accRewardPerShare = pool.accRewardPerShare + ((reward * 1e12) / stakedSupply);
        pool.lastRewardBlock = block.number;
    }
    
    /**
     * @dev View function to see pending rewards on frontend
     * @param _pid Pool ID
     * @param _user User address
     */
    function pendingReward(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        
        uint256 accRewardPerShare = pool.accRewardPerShare;
        
        if (block.number > pool.lastRewardBlock && pool.totalStaked != 0) {
            uint256 multiplier = block.number - pool.lastRewardBlock;
            uint256 reward = multiplier * pool.rewardPerBlock;
            accRewardPerShare = accRewardPerShare + ((reward * 1e12) / pool.totalStaked);
        }
        
        return user.amount * accRewardPerShare / 1e12 - user.rewardDebt + user.pendingRewards;
    }
    
    /**
     * @dev Check if a user can withdraw without fees
     * @param _pid Pool ID
     * @param _user User address
     */
    function canWithdrawWithoutFee(uint256 _pid, address _user) public view returns (bool) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        
        if (pool.lockDuration == 0) {
            return true;
        }
        
        return block.timestamp >= user.lockEndTime;
    }
    
    /**
     * @dev Deposit tokens to the staking contract
     * @param _pid Pool ID
     * @param _amount Amount of tokens to deposit
     */
    function deposit(uint256 _pid, uint256 _amount) public nonReentrant whenNotPaused {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        updatePool(_pid);
        
        // Harvest pending rewards
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare / 1e12) - user.rewardDebt;
            if (pending > 0) {
                user.pendingRewards = user.pendingRewards + pending;
            }
        }
        
        // Transfer tokens to contract
        if (_amount > 0) {
            stakingToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount + _amount;
            pool.totalStaked = pool.totalStaked + _amount;
            
            // Update lock end time
            if (pool.lockDuration > 0) {
                user.lastStakeTime = block.timestamp;
                user.lockEndTime = block.timestamp + pool.lockDuration;
            }
        }
        
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
        
        emit Deposit(msg.sender, _pid, _amount);
    }
    
    /**
     * @dev Withdraw tokens from the staking contract
     * @param _pid Pool ID
     * @param _amount Amount of tokens to withdraw
     */
    function withdraw(uint256 _pid, uint256 _amount) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(user.amount >= _amount, "withdraw: not enough staked tokens");
        
        updatePool(_pid);
        
        // Harvest pending rewards
        uint256 pending = (user.amount * pool.accRewardPerShare / 1e12) - user.rewardDebt;
        if (pending > 0 || user.pendingRewards > 0) {
            user.pendingRewards = user.pendingRewards + pending;
        }
        
        // Withdraw tokens
        if (_amount > 0) {
            user.amount = user.amount - _amount;
            pool.totalStaked = pool.totalStaked - _amount;
            
            // Check if early withdrawal fee applies
            if (!canWithdrawWithoutFee(_pid, msg.sender) && pool.earlyWithdrawalFee > 0) {
                uint256 withdrawalFee = (_amount * pool.earlyWithdrawalFee) / 10000;
                stakingToken.safeTransfer(feeAddress, withdrawalFee);
                stakingToken.safeTransfer(address(msg.sender), _amount - withdrawalFee);
            } else {
                stakingToken.safeTransfer(address(msg.sender), _amount);
            }
        }
        
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
        
        emit Withdraw(msg.sender, _pid, _amount);
    }
    
    /**
     * @dev Claim pending rewards
     * @param _pid Pool ID
     */
    function claimReward(uint256 _pid) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        updatePool(_pid);
        
        // Calculate pending rewards
        uint256 pending = (user.amount * pool.accRewardPerShare / 1e12) - user.rewardDebt;
        
        if (pending > 0 || user.pendingRewards > 0) {
            uint256 totalRewards = pending + user.pendingRewards;
            user.pendingRewards = 0;
            
            // Transfer rewards
            safeRewardTransfer(pool.rewardToken, msg.sender, totalRewards);
            
            emit RewardClaimed(msg.sender, _pid, totalRewards);
        }
        
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
    }
    
    /**
     * @dev Withdraw without caring about rewards (EMERGENCY ONLY)
     * @param _pid Pool ID
     */
    function emergencyWithdraw(uint256 _pid) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        uint256 amount = user.amount;
        pool.totalStaked = pool.totalStaked - amount;
        user.amount = 0;
        user.rewardDebt = 0;
        user.pendingRewards = 0;
        
        // Check if early withdrawal fee applies
        if (!canWithdrawWithoutFee(_pid, msg.sender) && pool.earlyWithdrawalFee > 0) {
            uint256 withdrawalFee = (amount * pool.earlyWithdrawalFee) / 10000;
            stakingToken.safeTransfer(feeAddress, withdrawalFee);
            stakingToken.safeTransfer(address(msg.sender), amount - withdrawalFee);
        } else {
            stakingToken.safeTransfer(address(msg.sender), amount);
        }
        
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }
    
    /**
     * @dev Safe reward token transfer function, in case of rounding error
     * @param _rewardToken Address of the reward token
     * @param _to Address to transfer rewards to
     * @param _amount Amount of rewards to transfer
     */
    function safeRewardTransfer(IERC20 _rewardToken, address _to, uint256 _amount) internal {
        uint256 rewardBal = _rewardToken.balanceOf(address(this));
        
        if (_amount > rewardBal) {
            _rewardToken.safeTransfer(_to, rewardBal);
        } else {
            _rewardToken.safeTransfer(_to, _amount);
        }
    }
    
    /**
     * @dev Update the fee address
     * @param _feeAddress New fee address
     */
    function setFeeAddress(address _feeAddress) public onlyOwner {
        feeAddress = _feeAddress;
    }
    
    /**
     * @dev Update the lock duration for a pool
     * @param _pid Pool ID
     * @param _lockDuration New lock duration in seconds
     */
    function updateLockDuration(uint256 _pid, uint256 _lockDuration) public onlyOwner {
        poolInfo[_pid].lockDuration = _lockDuration;
    }
    
    /**
     * @dev Update the early withdrawal fee for a pool
     * @param _pid Pool ID
     * @param _earlyWithdrawalFee New early withdrawal fee in basis points
     */
    function updateEarlyWithdrawalFee(uint256 _pid, uint256 _earlyWithdrawalFee) public onlyOwner {
        require(_earlyWithdrawalFee <= 3000, "updateFee: fee too high"); // Max 30%
        poolInfo[_pid].earlyWithdrawalFee = _earlyWithdrawalFee;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw reward tokens (EMERGENCY ONLY)
     * @param _rewardToken Address of the reward token
     * @param _amount Amount to withdraw
     */
    function emergencyRewardWithdraw(IERC20 _rewardToken, uint256 _amount) public onlyOwner {
        require(_amount <= _rewardToken.balanceOf(address(this)), "not enough tokens");
        _rewardToken.safeTransfer(address(msg.sender), _amount);
    }
}
