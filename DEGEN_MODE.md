# DEGEN Mode Implementation Guide

## Overview
DEGEN Mode is a play-to-earn game mode where players pay $5 to enter and compete for a prize pool with exponential rewards based on score and speed.

## Economics Model

### Entry & Fees
- **Entry Fee**: $5 USD (0.002 ETH at $2500 ETH price)
- **Creator Fee**: 5% ($0.25 per entry)
- **Prize Pool**: 95% ($4.75 per entry)
- **Daily Limit**: 1 play per wallet per 24 hours

### Reward Formula
```
Your Reward = (Your Score / High Score) × Pool × Speed Multiplier
```

**Capped at 50% of total pool to prevent drainage**

### Speed Multiplier (DEGEN Mode Only)
- Base: 1.0x (100 basis points)
- Increases 0.1x every 2.5 points (2x faster than Fun Mode)
- Formula: `100 + (score × 4)` basis points

**Examples:**
- Score 10: 1.4x multiplier
- Score 25: 2.0x multiplier
- Score 50: 3.0x multiplier
- Score 100: 5.0x multiplier

### Anti-Gaming Mechanics
1. **Minimum Threshold**: Must score ≥80% of day's high score to earn anything
2. **Max Payout Cap**: 50% of total pool
3. **Daily Verification**: On-chain timestamp prevents multi-play
4. **Rollover**: 20% of unclaimed pool carries to next day

## Smart Contract

### Contract: `FlowPepeDegen.sol`
Location: `/contracts/FlowPepeDegen.sol`

### Key Functions

#### For Players:
```solidity
// Pay entry fee and start game
function enterGame() external payable

// Submit score after game ends
function submitScore(uint256 score) external

// Calculate potential reward
function calculateReward(address player, uint256 day) public view returns (uint256)

// Claim rewards from previous days
function claimReward(uint256 day) external

// Check if played today
function hasPlayedToday(address player) public view returns (bool)

// Get current prize pool
function getCurrentPool() external view returns (uint256)
```

#### For Owner:
```solidity
// Withdraw accumulated creator fees
function withdrawCreatorFees() external onlyOwner

// Update entry fee
function setEntryFee(uint256 newFee) external onlyOwner
```

## Example Scenarios

### Scenario 1: Early Player Advantage
**Day 1, 10 players, $50 pool**
- Player A scores 50 (high score, 3.0x multiplier)
  - Base reward: $50 (100% of high score)
  - With multiplier: $50 × 3.0 = $150
  - **Capped at $25** (50% of pool)
- Player B scores 40 (80%, 2.6x multiplier)
  - Base reward: $40
  - With multiplier: $40 × 2.6 = $104
  - **Capped at $25**
- Players C-J score below threshold: $0
- **Rollover to Day 2**: $10 (20% of $50)

### Scenario 2: Competitive Day
**Day 5, 50 players, $250 pool**
- Player A scores 100 (high score, 5.0x multiplier)
  - Base reward: $250
  - With multiplier: $250 × 5.0 = $1,250
  - **Capped at $125** (50% of pool)
- Player B scores 95 (95%, 4.8x multiplier)
  - Base reward: $237.50
  - With multiplier: $1,140
  - **Capped at $125**
- Player C scores 80 (80%, 4.2x multiplier)
  - Reward: ~$50
- Players below 80 threshold: $0
- Total paid: ~$200, Rollover: $50

### Scenario 3: Rollover Accumulation
**Week 2, daily rollovers building up**
- Base pool: $500 from entries
- Rollover from previous day: $100
- **Total available**: $600
- High scorer can win up to $300 (50% cap)

## UI Components

### Mode Selection Screen
Component: `ModeSelection.tsx`
- Fun Mode vs DEGEN Mode selection
- Clear explanation of each mode
- Visual distinction (blue vs green)

### DEGEN Mode Features (To Be Implemented)
1. **Entry Flow**:
   - Show current prize pool
   - Show players today
   - Confirm $5 payment
   - Transaction approval

2. **During Game**:
   - Live multiplier display
   - Potential earnings calculator
   - Current high score to beat

3. **Game Over**:
   - Final multiplier
   - Calculated reward
   - Claim button (if reward > 0)
   - Try again tomorrow if already played

## Game Mechanics Differences

### Fun Mode
- Speed multiplier: +10% every 5 points
- Unlimited plays
- Free to play
- Regular leaderboard

### DEGEN Mode
- Speed multiplier: +10% every 2.5 points (2x faster)
- 1 play per 24 hours
- $5 entry fee
- Prize pool rewards
- More challenging (faster speed increase)

## Implementation Status

### ✅ Completed
1. Economic model design
2. Smart contract development
3. Mode selection UI
4. Anti-gaming mechanics
5. Daily reset system
6. Prize pool calculation
7. Rollover mechanism

### 🚧 In Progress
1. Mode selection integration
2. Game speed adjustment for DEGEN Mode
3. DEGEN contract interaction hook

### 📋 Todo
1. Entry fee payment flow
2. Prize pool display UI
3. Earnings calculator
4. Game over flow for DEGEN Mode
5. Claim rewards UI
6. Contract deployment
7. Testing & audit

## Deployment Steps

1. **Deploy Contract** to Base Sepolia
2. **Verify Contract** on Basescan
3. **Fund Initial Pool** (optional seed)
4. **Update Frontend** with contract address
5. **Test with Test ETH**
6. **Launch** to mainnet

## Security Considerations

- ✅ ReentrancyGuard on all money functions
- ✅ Ownable for admin functions
- ✅ No arbitrary external calls
- ✅ Pull over push for payments
- ✅ Time-based validation for daily plays
- ⚠️ **Needs audit before mainnet**

## Future Enhancements

1. **Dynamic Entry Fees**: Adjust based on ETH price oracle
2. **Tournaments**: Weekly/monthly special events
3. **NFT Rewards**: Mint NFTs for top players
4. **Referral System**: Earn % of referred players' fees
5. **Leaderboard Seasons**: Reset rankings periodically
6. **Multiple Prize Tiers**: 1st, 2nd, 3rd place bonuses
