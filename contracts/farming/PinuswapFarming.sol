// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PinuswapFarming
 * @dev Contract for farming rewards by staking LP tokens
 */
contract PinuswapFarming is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Info of each user
    struct UserInfo {
        uint256 amount;         // How many LP tokens the user has provided
        uint256 rewardDebt;     // Reward debt
        uint256 pendingRewards; // Pending rewards to be claimed
    }

    // Info of each pool
    struct PoolInfo {
        IERC20 lpToken;           // Address of LP token contract
        uint256 allocPoint;       // How many allocation points assigned to this pool
        uint256 lastRewardBlock;  // Last block number that rewards distribution occurred
        uint256 accRewardPerShare; // Accumulated rewards per share, times 1e12
        uint16 depositFeeBP;      // Deposit fee in basis points (100 = 1%)
    }

    // The PINU TOKEN
    IERC20 public rewardToken;
    
    // PINU tokens created per block
    uint256 public rewardPerBlock;
    
    // Deposit fee address
    address public feeAddress;
    
    // Info of each pool
    PoolInfo[] public poolInfo;
    
    // Info of each user that stakes LP tokens
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    
    // Total allocation points. Must be the sum of all allocation points in all pools
    uint256 public totalAllocPoint = 0;
    
    // The block number when reward mining starts
    uint256 public startBlock;
    
    // The block number when reward mining ends
    uint256 public endBlock;
    
    // Events
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event RewardClaimed(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, address indexed lpToken, uint256 allocPoint, uint16 depositFeeBP);
    event PoolUpdated(uint256 indexed pid, uint256 allocPoint, uint16 depositFeeBP);
    
    /**
     * @dev Constructor initializes the farming contract
     * @param _rewardToken The PINU token address
     * @param _rewardPerBlock PINU tokens created per block
     * @param _startBlock Block number when reward mining starts
     * @param _endBlock Block number when reward mining ends
     * @param _feeAddress Address where deposit fees will be sent
     */
    constructor(
        IERC20 _rewardToken,
        uint256 _rewardPerBlock,
        uint256 _startBlock,
        uint256 _endBlock,
        address _feeAddress
    ) {
        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;
        startBlock = _startBlock;
        endBlock = _endBlock;
        feeAddress = _feeAddress;
    }
    
    /**
     * @dev Returns the number of pools
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }
    
    /**
     * @dev Add a new LP to the pool
     * @param _allocPoint Allocation points for this pool
     * @param _lpToken Address of the LP token contract
     * @param _depositFeeBP Deposit fee in basis points
     * @param _withUpdate Whether to update all pools
     */
    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        uint16 _depositFeeBP,
        bool _withUpdate
    ) public onlyOwner {
        require(_depositFeeBP <= 1000, "add: deposit fee too high"); // Max 10%
        
        if (_withUpdate) {
            massUpdatePools();
        }
        
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accRewardPerShare: 0,
                depositFeeBP: _depositFeeBP
            })
        );
        
        emit PoolAdded(poolInfo.length - 1, address(_lpToken), _allocPoint, _depositFeeBP);
    }
    
    /**
     * @dev Update the given pool's allocation points and deposit fee
     * @param _pid Pool ID
     * @param _allocPoint New allocation points
     * @param _depositFeeBP New deposit fee in basis points
     * @param _withUpdate Whether to update all pools
     */
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        uint16 _depositFeeBP,
        bool _withUpdate
    ) public onlyOwner {
        require(_depositFeeBP <= 1000, "set: deposit fee too high"); // Max 10%
        
        if (_withUpdate) {
            massUpdatePools();
        }
        
        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
        poolInfo[_pid].depositFeeBP = _depositFeeBP;
        
        emit PoolUpdated(_pid, _allocPoint, _depositFeeBP);
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
        
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        
        if (lpSupply == 0 || pool.allocPoint == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 reward = (multiplier * rewardPerBlock * pool.allocPoint) / totalAllocPoint;
        
        pool.accRewardPerShare = pool.accRewardPerShare + ((reward * 1e12) / lpSupply);
        pool.lastRewardBlock = block.number;
    }
    
    /**
     * @dev Return reward multiplier based on block range
     * @param _from Starting block
     * @param _to Ending block
     */
    function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
        if (_to <= endBlock) {
            return _to - _from;
        } else if (_from >= endBlock) {
            return 0;
        } else {
            return endBlock - _from;
        }
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
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        
        if (block.number > pool.lastRewardBlock && lpSupply != 0 && pool.allocPoint != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 reward = (multiplier * rewardPerBlock * pool.allocPoint) / totalAllocPoint;
            accRewardPerShare = accRewardPerShare + ((reward * 1e12) / lpSupply);
        }
        
        return user.amount * accRewardPerShare / 1e12 - user.rewardDebt + user.pendingRewards;
    }
    
    /**
     * @dev Deposit LP tokens to the farming contract for reward allocation
     * @param _pid Pool ID
     * @param _amount Amount of LP tokens to deposit
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
        
        // Transfer LP tokens to contract
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            
            // Take deposit fee if applicable
            if (pool.depositFeeBP > 0) {
                uint256 depositFee = (_amount * pool.depositFeeBP) / 10000;
                pool.lpToken.safeTransfer(feeAddress, depositFee);
                user.amount = user.amount + _amount - depositFee;
            } else {
                user.amount = user.amount + _amount;
            }
        }
        
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
        
        emit Deposit(msg.sender, _pid, _amount);
    }
    
    /**
     * @dev Withdraw LP tokens from the farming contract
     * @param _pid Pool ID
     * @param _amount Amount of LP tokens to withdraw
     */
    function withdraw(uint256 _pid, uint256 _amount) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(user.amount >= _amount, "withdraw: not enough LP tokens");
        
        updatePool(_pid);
        
        // Harvest pending rewards
        uint256 pending = (user.amount * pool.accRewardPerShare / 1e12) - user.rewardDebt;
        if (pending > 0 || user.pendingRewards > 0) {
            user.pendingRewards = user.pendingRewards + pending;
        }
        
        // Withdraw LP tokens
        if (_amount > 0) {
            user.amount = user.amount - _amount;
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
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
            safeRewardTransfer(msg.sender, totalRewards);
            
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
        user.amount = 0;
        user.rewardDebt = 0;
        user.pendingRewards = 0;
        
        pool.lpToken.safeTransfer(address(msg.sender), amount);
        
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }
    
    /**
     * @dev Safe reward token transfer function, in case of rounding error
     * @param _to Address to transfer rewards to
     * @param _amount Amount of rewards to transfer
     */
    function safeRewardTransfer(address _to, uint256 _amount) internal {
        uint256 rewardBal = rewardToken.balanceOf(address(this));
        
        if (_amount > rewardBal) {
            rewardToken.safeTransfer(_to, rewardBal);
        } else {
            rewardToken.safeTransfer(_to, _amount);
        }
    }
    
    /**
     * @dev Update the reward per block
     * @param _rewardPerBlock New reward per block
     */
    function updateRewardPerBlock(uint256 _rewardPerBlock) public onlyOwner {
        massUpdatePools();
        rewardPerBlock = _rewardPerBlock;
    }
    
    /**
     * @dev Update the end block
     * @param _endBlock New end block
     */
    function updateEndBlock(uint256 _endBlock) public onlyOwner {
        endBlock = _endBlock;
    }
    
    /**
     * @dev Update the fee address
     * @param _feeAddress New fee address
     */
    function setFeeAddress(address _feeAddress) public onlyOwner {
        feeAddress = _feeAddress;
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
     * @param _amount Amount to withdraw
     */
    function emergencyRewardWithdraw(uint256 _amount) public onlyOwner {
        require(_amount <= rewardToken.balanceOf(address(this)), "not enough tokens");
        rewardToken.safeTransfer(address(msg.sender), _amount);
    }
}
