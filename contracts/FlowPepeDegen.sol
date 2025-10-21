// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FlowPepeDegen
 * @notice DEGEN Mode prize pool for FlowPepe game
 * @dev Daily play-to-earn with exponential multipliers
 */
contract FlowPepeDegen is Ownable, ReentrancyGuard {
    // Entry fee: $5 USD in ETH (will be converted based on oracle)
    uint256 public entryFee = 0.002 ether; // ~$5 at $2500 ETH
    uint256 public constant CREATOR_FEE_BPS = 500; // 5%
    uint256 public constant MAX_PAYOUT_BPS = 5000; // 50% of pool
    uint256 public constant ROLLOVER_BPS = 2000; // 20% rolls over daily
    uint256 public constant MIN_SCORE_THRESHOLD_BPS = 8000; // 80% of high score

    struct DayStats {
        uint256 highScore;
        address highScorer;
        uint256 totalPool;
        uint256 totalPlayers;
        uint256 dayStart;
    }

    struct PlayerScore {
        uint256 score;
        uint256 multiplier; // In basis points (100 = 1.0x)
        uint256 timestamp;
        bool claimed;
    }

    // Current day number (increments every 24 hours)
    uint256 public currentDay;
    uint256 public gameStartTime;

    // Day => Stats
    mapping(uint256 => DayStats) public dayStats;

    // Day => Player => Score
    mapping(uint256 => mapping(address => PlayerScore)) public playerScores;

    // Day => Player => Has Played
    mapping(uint256 => mapping(address => bool)) public hasPlayed;

    // Accumulated creator fees
    uint256 public creatorFees;

    event GamePlayed(address indexed player, uint256 day, uint256 score, uint256 multiplier);
    event RewardClaimed(address indexed player, uint256 day, uint256 amount);
    event NewDay(uint256 day, uint256 rolloverAmount);
    event EntryFeeUpdated(uint256 newFee);

    constructor() {
        gameStartTime = block.timestamp;
        currentDay = 0;
        dayStats[0].dayStart = block.timestamp;
    }

    /**
     * @notice Get current day number
     */
    function getCurrentDay() public view returns (uint256) {
        return (block.timestamp - gameStartTime) / 1 days;
    }

    /**
     * @notice Check if player has played today
     */
    function hasPlayedToday(address player) public view returns (bool) {
        uint256 day = getCurrentDay();
        return hasPlayed[day][player];
    }

    /**
     * @notice Submit entry and start game
     */
    function enterGame() external payable nonReentrant {
        require(msg.value == entryFee, "Incorrect entry fee");

        uint256 day = getCurrentDay();

        // Check for day rollover
        if (day > currentDay) {
            _rolloverDay();
        }

        require(!hasPlayed[day][msg.sender], "Already played today");

        // Mark as played
        hasPlayed[day][msg.sender] = true;

        // Calculate fees
        uint256 creatorFee = (msg.value * CREATOR_FEE_BPS) / 10000;
        uint256 poolAmount = msg.value - creatorFee;

        // Update stats
        creatorFees += creatorFee;
        dayStats[day].totalPool += poolAmount;
        dayStats[day].totalPlayers++;

        emit GamePlayed(msg.sender, day, 0, 100); // Initial emit, score submitted later
    }

    /**
     * @notice Submit score after game ends
     * @param score Final score (click count)
     */
    function submitScore(uint256 score) external {
        uint256 day = getCurrentDay();
        require(hasPlayed[day][msg.sender], "Must enter game first");
        require(playerScores[day][msg.sender].score == 0, "Score already submitted");
        require(score > 0, "Score must be greater than 0");

        // Calculate speed multiplier (increases 0.1x every 2.5 points for DEGEN mode)
        // Formula: 100 + (score * 4) basis points (4 = 0.1x per 2.5 points)
        uint256 multiplier = 100 + (score * 4); // 100 bps = 1.0x

        // Store score
        playerScores[day][msg.sender] = PlayerScore({
            score: score,
            multiplier: multiplier,
            timestamp: block.timestamp,
            claimed: false
        });

        // Update high score
        if (score > dayStats[day].highScore) {
            dayStats[day].highScore = score;
            dayStats[day].highScorer = msg.sender;
        }

        emit GamePlayed(msg.sender, day, score, multiplier);
    }

    /**
     * @notice Calculate potential reward for a player
     */
    function calculateReward(address player, uint256 day) public view returns (uint256) {
        PlayerScore memory playerScore = playerScores[day][player];
        DayStats memory stats = dayStats[day];

        if (playerScore.score == 0 || stats.highScore == 0) {
            return 0;
        }

        // Must reach 80% of high score to earn
        uint256 threshold = (stats.highScore * MIN_SCORE_THRESHOLD_BPS) / 10000;
        if (playerScore.score < threshold) {
            return 0;
        }

        // Base reward: (Your Score / High Score) × Pool
        uint256 baseReward = (playerScore.score * stats.totalPool) / stats.highScore;

        // Apply speed multiplier
        uint256 multipliedReward = (baseReward * playerScore.multiplier) / 100;

        // Cap at 50% of pool
        uint256 maxPayout = (stats.totalPool * MAX_PAYOUT_BPS) / 10000;
        if (multipliedReward > maxPayout) {
            multipliedReward = maxPayout;
        }

        return multipliedReward;
    }

    /**
     * @notice Claim rewards for a specific day
     */
    function claimReward(uint256 day) external nonReentrant {
        require(day < getCurrentDay(), "Cannot claim current day");
        require(!playerScores[day][msg.sender].claimed, "Already claimed");

        uint256 reward = calculateReward(msg.sender, day);
        require(reward > 0, "No reward to claim");

        playerScores[day][msg.sender].claimed = true;

        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");

        emit RewardClaimed(msg.sender, day, reward);
    }

    /**
     * @notice Rollover to new day
     */
    function _rolloverDay() private {
        uint256 oldDay = currentDay;
        uint256 newDay = getCurrentDay();

        // Calculate rollover amount (20% of unclaimed pool)
        uint256 rolloverAmount = (dayStats[oldDay].totalPool * ROLLOVER_BPS) / 10000;

        // Start new day
        currentDay = newDay;
        dayStats[newDay].dayStart = block.timestamp;
        dayStats[newDay].totalPool = rolloverAmount;

        emit NewDay(newDay, rolloverAmount);
    }

    /**
     * @notice Withdraw creator fees
     */
    function withdrawCreatorFees() external onlyOwner {
        uint256 amount = creatorFees;
        creatorFees = 0;

        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Update entry fee (owner only)
     */
    function setEntryFee(uint256 newFee) external onlyOwner {
        entryFee = newFee;
        emit EntryFeeUpdated(newFee);
    }

    /**
     * @notice Get current pool size
     */
    function getCurrentPool() external view returns (uint256) {
        return dayStats[getCurrentDay()].totalPool;
    }

    /**
     * @notice Get player score for current day
     */
    function getMyScore() external view returns (uint256 score, uint256 multiplier, bool claimed) {
        uint256 day = getCurrentDay();
        PlayerScore memory ps = playerScores[day][msg.sender];
        return (ps.score, ps.multiplier, ps.claimed);
    }

    /**
     * @notice Get day statistics
     */
    function getDayStats(uint256 day) external view returns (
        uint256 highScore,
        address highScorer,
        uint256 totalPool,
        uint256 totalPlayers,
        uint256 dayStart
    ) {
        DayStats memory stats = dayStats[day];
        return (stats.highScore, stats.highScorer, stats.totalPool, stats.totalPlayers, stats.dayStart);
    }

    receive() external payable {}
}
