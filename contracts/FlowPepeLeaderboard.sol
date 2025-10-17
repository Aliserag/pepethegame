// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FlowPepe Leaderboard
 * @notice Stores high scores on-chain for FlowPepe game
 * @dev Optimized for Base network with minimal gas usage
 */
contract FlowPepeLeaderboard {
    // State variables
    mapping(address => uint256) public scores;
    address[] public players;
    mapping(address => bool) private hasPlayed;

    // Events
    event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);
    event NewHighScore(address indexed player, uint256 oldScore, uint256 newScore);

    /**
     * @notice Submit a new score (only updates if higher than current)
     * @param score The score to submit
     */
    function submitScore(uint256 score) external {
        address player = msg.sender;
        uint256 currentScore = scores[player];

        // Only update if new score is higher
        require(score > currentScore, "Score must be higher than current");

        // Track new players
        if (!hasPlayed[player]) {
            players.push(player);
            hasPlayed[player] = true;
        }

        // Update score
        scores[player] = score;

        // Emit events
        emit ScoreSubmitted(player, score, block.timestamp);
        if (currentScore > 0) {
            emit NewHighScore(player, currentScore, score);
        }
    }

    /**
     * @notice Get a player's score
     * @param player The player's address
     * @return The player's high score
     */
    function getScore(address player) external view returns (uint256) {
        return scores[player];
    }

    /**
     * @notice Get total number of players
     * @return The number of unique players
     */
    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }

    /**
     * @notice Get top N scores for leaderboard
     * @param count Number of top scores to return
     * @return topPlayers Array of player addresses
     * @return topScores Array of corresponding scores
     */
    function getTopScores(uint256 count) external view returns (address[] memory topPlayers, uint256[] memory topScores) {
        uint256 playerCount = players.length;
        uint256 returnCount = count > playerCount ? playerCount : count;

        topPlayers = new address[](returnCount);
        topScores = new uint256[](returnCount);

        // Create temporary array of all scores
        address[] memory tempPlayers = new address[](playerCount);
        uint256[] memory tempScores = new uint256[](playerCount);

        for (uint256 i = 0; i < playerCount; i++) {
            tempPlayers[i] = players[i];
            tempScores[i] = scores[players[i]];
        }

        // Simple bubble sort (efficient for small arrays)
        for (uint256 i = 0; i < playerCount; i++) {
            for (uint256 j = i + 1; j < playerCount; j++) {
                if (tempScores[j] > tempScores[i]) {
                    // Swap scores
                    uint256 tempScore = tempScores[i];
                    tempScores[i] = tempScores[j];
                    tempScores[j] = tempScore;

                    // Swap players
                    address tempPlayer = tempPlayers[i];
                    tempPlayers[i] = tempPlayers[j];
                    tempPlayers[j] = tempPlayer;
                }
            }
        }

        // Copy top scores
        for (uint256 i = 0; i < returnCount; i++) {
            topPlayers[i] = tempPlayers[i];
            topScores[i] = tempScores[i];
        }

        return (topPlayers, topScores);
    }

    /**
     * @notice Check if an address has played before
     * @param player The player's address
     * @return Whether the player has submitted a score
     */
    function hasPlayerPlayed(address player) external view returns (bool) {
        return hasPlayed[player];
    }
}
