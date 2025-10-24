# FlowPepe 🐸

**WAGMI! Help Pepe navigate through red candlestick obstacles in this skill-based arcade game with real ETH rewards!**

A Flappy Bird-style game built as a Farcaster Mini App with dual game modes: Free-to-play **Fun Mode** and prize-pool-based **DEGEN Mode** on Base network.

🎮 **Play Now:**
- **Web:** [https://www.flowpepe.com](https://www.flowpepe.com)
- **Farcaster Mini App:** [Play on Farcaster](https://farcaster.xyz/miniapps/qXKHh0xCCqID/flowpepe)

⚠️ **DEGEN Mode Requirement:** You must have Base Sepolia testnet ETH in your wallet before playing DEGEN Mode. Get free testnet ETH from the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet).

## 🌟 Game Modes

### 🎮 Fun Mode (Free-to-Play)
- **Unlimited plays** - No cost, play as much as you want
- **On-chain leaderboard** - Submit high scores to Base blockchain
- **Wallet optional** - Play without connecting (local scores only)
- **Normal difficulty** - Speed increases 10% every 5 points

### 💰 DEGEN Mode (Play-to-Earn)
- **0.002 ETH entry** (~$5 USD per play) ⚠️ **Requires Base Sepolia testnet ETH**
- **Daily prize pools** with weight-based band distribution
- **Mega Sunday Events** - Every 7 days, weekly pot added (60-80% larger pools!)
- **Real ETH rewards** - Top performers get premium 3x weight multipliers
- **15% daily rollover** + **10% weekly mega pot** = Compounding growth
- **Unlimited replays** - Keep entering until you get your best score!

**Get Testnet ETH:** [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

**Prize Pool Economics (Weight-Based System):**
- **95%** of entry fees → Prize pool
- **5%** → Creator fee (sustains development)
- **75%** distributed to qualified winners (weight-based bands)
- **15%** rolls over to next day (daily compounding)
- **10%** contributes to weekly mega pot (Mega Sunday every 7 days)

**Weight-Based Reward Bands:**
- **Top 20%**: Get 3x weight (premium rewards)
- **Middle 30%**: Get 2x weight (solid rewards)
- **Bottom 50%**: Get 1x weight (base rewards)
- **Qualification**: Must score 80%+ of day's high score
- **Formula**: `Your Reward = (Your Weight / Total Weights) × 75% of pool`
- **No max payout cap** - Weight system naturally distributes fairly

## ✨ Features

- 🐸 **Classic Flappy Bird Mechanics** - Tap/click to fly, avoid obstacles
- 🎨 **Retro Pixel Art** - Press Start 2P font, trading chart aesthetics
- ⛓️ **Fully On-Chain** - Two smart contracts on Base (Sepolia testnet)
- 🎯 **Skill-Based Rewards** - DEGEN Mode: Higher scores = exponentially higher earnings
- 📊 **Live Leaderboards** - Real-time rankings with on-chain verification
- 🏆 **Hall of Fame** - Lifetime earnings tracker for top players
- 💸 **Instant Claims** - Withdraw winnings any time after period ends
- 📱 **Farcaster Native** - Built with Frame SDK, optimized for mobile
- 🔊 **Mutable Audio** - Background music with toggle control

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 12.3.2, React 18, TypeScript 4.7
- **Styling:** TailwindCSS 3, Custom CSS variables
- **Animation:** Framer Motion 6.2.4 (physics-based movement)
- **State:** use-immer 0.8.1 (immutable updates), React Context API

### Blockchain
- **Network:** Base Sepolia (testnet), Base mainnet ready
- **Wallet:** wagmi 2.18, viem 2.38 (Ethereum interactions)
- **Connectors:** Farcaster Mini App Connector 1.1, Injected (MetaMask)
- **Smart Contracts:** Solidity 0.8.20, OpenZeppelin 5.4

### Farcaster Integration
- **SDK:** @farcaster/frame-sdk 0.1.12
- **Connector:** @farcaster/miniapp-wagmi-connector 1.1.0
- **Features:** Auto-wallet connection, user context, mini app manifest

### Development
- **Deployment:** Hardhat 3.0.7, hardhat-deploy 1.0.4
- **Build:** Vercel (recommended), static export support
- **Compiler:** TypeScript 5.9, Next.js compiler

## 📜 Smart Contracts

### Base Sepolia Testnet

**FlowPepeLeaderboard (Fun Mode)**
- **Address:** `0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c`
- **Purpose:** On-chain high score tracking
- **Functions:** submitScore, getScore, getTopScores
- **Explorer:** [View on BaseScan](https://sepolia.basescan.org/address/0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c)

**FlowPepeDegen (DEGEN Mode - Weight-Based System)**
- **Address:** `0x2bc70abb0ecebd0660429251d9790a712d12ce13`
- **Purpose:** Daily prize pool with weight-based bands + Weekly Mega Sunday
- **Key Functions:**
  - `enterGame()` - Pay 0.002 ETH to play
  - `submitScore(uint256 score)` - Record your result
  - `calculateReward(address, uint256 day)` - View potential earnings
  - `claimReward(uint256 day)` - Withdraw winnings
  - `getDayLeaderboard(uint256 day, uint256 limit)` - View rankings
  - `hasPlayedToday(address)` - Check play status
  - `getDaysUntilMegaSunday()` - Countdown to next Mega Sunday
  - `getWeeklyMegaPot()` - View accumulated weekly pot
  - `getPlayerBandInfo(address, uint256 day)` - View band, weight, estimated reward
  - `getQualifiedCount(uint256 day)` - Total qualified players
- **Security:** ReentrancyGuard, Ownable, weight-based math (exact 75% distribution)
- **Explorer:** [View on BaseScan](https://sepolia.basescan.org/address/0x2bc70abb0ecebd0660429251d9790a712d12ce13)

### Base Mainnet
*Ready to deploy - see deployment section below*

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Aliserag/pepethegame.git
cd pepethegame

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env

# Edit .env with your values
# Required: NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS, NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS
# Optional: DEPLOYER_PRIVATE_KEY (only for contract deployment)

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to play locally.

### Environment Variables

**Required for Production:**
```env
# Fun Mode Contract
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c

# DEGEN Mode Contract
NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS=0x806e4d33f36886ca9439f2c407505de936498d0e

# Base Sepolia RPC (for better rate limits)
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

**Required for Deployment Only:**
```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

## 🎮 Game Mechanics

### Gameplay
1. **Choose Mode:** Fun (free) or DEGEN (0.002 ETH)
2. **Start Game:** Click/tap START button
3. **Control Pepe:** Single tap/click makes Pepe jump
4. **Avoid Obstacles:** Navigate through gaps in red candlestick pipes
5. **Score Points:** +1 for each obstacle cleared
6. **Survive:** Game over on collision with pipes or ground

### Difficulty Scaling

**Fun Mode:**
- Initial speed: 10px per 75ms
- Speed multiplier: 1.1x every 5 points
- Example: Score 25 = 2.61x base speed

**DEGEN Mode:**
- Initial speed: Same as Fun Mode
- Speed multiplier: 1.04x every 2.5 points (2x faster scaling)
- Reward multiplier: 1.0x + (score × 0.04)
  - Score 10 → 1.4x rewards
  - Score 25 → 2.0x rewards
  - Score 50 → 3.0x rewards

### DEGEN Mode Reward Formula

```
Base Reward = (Your Score / High Score) × Prize Pool
Multiplied Reward = Base Reward × (1.0 + score × 0.04)
Final Reward = min(Multiplied Reward, 50% of pool)

Requirements:
- Score must reach 80% of day's high score
- Only your highest score counts per day
- Unlimited entry attempts (0.002 ETH each)
```

**Example:**
- Day's high score: 50
- Your score: 40 (80% of high = qualifies!)
- Prize pool: 0.1 ETH
- Base reward: (40/50) × 0.1 = 0.08 ETH
- Multiplier: 1.0 + (40 × 0.04) = 2.6x
- Your reward: 0.08 × 2.6 = **0.208 ETH** (capped at 0.05 ETH if exceeds 50%)

## 📁 Project Structure

```
pepethegame/
├── components/
│   ├── Game.tsx                 # Main game orchestrator, mode switching
│   ├── ModeSelection.tsx        # Fun vs DEGEN mode selection UI
│   ├── FlappyBird.tsx           # Pepe character (animated GIF)
│   ├── Pipes.tsx                # Obstacle generation and movement
│   ├── Background.tsx           # Visual background layer
│   ├── Footer.tsx               # Score display, mute button
│   ├── Leaderboard.tsx          # Fun Mode leaderboard (on-chain)
│   ├── DegenLeaderboard.tsx     # DEGEN Mode daily leaderboard
│   ├── DailyLeaderboard.tsx     # DEGEN Mode day-specific view
│   ├── HallOfFame.tsx           # DEGEN Mode lifetime earners
│   ├── ClaimableRewards.tsx     # DEGEN Mode rewards UI
│   ├── PayoutBreakdown.tsx      # DEGEN Mode reward calculator
│   ├── WalletConnect.tsx        # Wallet connection button
│   └── FarcasterProvider.tsx    # Farcaster SDK context
├── hooks/
│   ├── useGame.tsx              # Core game loop, physics, collision
│   ├── useDegenMode.tsx         # DEGEN Mode contract interactions
│   ├── useOnChainScore.tsx      # Fun Mode contract interactions
│   ├── useScores.tsx            # Local storage score tracking
│   ├── useInterval.tsx          # setInterval React hook
│   ├── useElementSize.tsx       # ResizeObserver hook
│   └── useWindowSize.tsx        # Window dimensions hook
├── contracts/
│   ├── FlowPepeLeaderboard.sol  # Fun Mode smart contract
│   └── FlowPepeDegen.sol        # DEGEN Mode smart contract
├── lib/
│   ├── wagmi.ts                 # Wagmi configuration, connectors
│   └── FlowPepeDegen.abi.json   # DEGEN contract ABI
├── pages/
│   ├── index.tsx                # Main game page
│   ├── _app.tsx                 # Wagmi + React Query providers
│   └── _document.tsx            # Meta tags, Farcaster manifest
├── scripts/
│   ├── deploy-simple.js         # Fun Mode deployment
│   ├── deploy-degen.cjs         # DEGEN Mode deployment
│   └── verify.js                # Basescan verification helper
├── public/
│   ├── pepe.gif                 # Player character sprite
│   ├── pipe.png                 # Red candlestick obstacle
│   ├── bg.png                   # Background texture
│   └── jeet.m4a                 # Background music loop
└── styles/
    └── globals.css              # TailwindCSS, Telegram theme vars
```

## 🛠️ Development

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

### Export Static Site
```bash
npm run build
npm run export
```

## 🚢 Deployment

### Smart Contracts

**Deploy FlowPepeLeaderboard (Fun Mode):**
```bash
node scripts/deploy-simple.js baseSepolia
```

**Deploy FlowPepeDegen (DEGEN Mode):**
```bash
node scripts/deploy-degen.cjs baseSepolia
```

**Verify on Basescan:**
```bash
# Get instructions
node scripts/verify.js baseSepolia

# Or manually verify at:
# https://sepolia.basescan.org/verifyContract
# Compiler: v0.8.20+commit.a1b79de6
# Optimization: Yes (200 runs)
```

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_BASE_SEPOLIA_RPC` (optional, for better rate limits)
4. Deploy
5. Add custom domain (optional)

### Farcaster Mini App

1. Create manifest at `public/.well-known/farcaster.json`:
```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "frame": {
    "version": "1",
    "name": "FlowPepe",
    "iconUrl": "https://flowpepe.com/logo.png",
    "splashImageUrl": "https://flowpepe.com/splash.png",
    "splashBackgroundColor": "#ded895",
    "homeUrl": "https://flowpepe.com"
  }
}
```

2. Verify domain ownership via Farcaster Hub
3. Submit to Farcaster Mini App directory

## 📊 Gas Costs (Base Network)

| Action | Estimated Gas | Cost @ 0.5 gwei |
|--------|---------------|-----------------|
| **Fun Mode** | | |
| Submit Score | ~50,000 | $0.015 |
| **DEGEN Mode** | | |
| Enter Game | ~65,000 | $0.020 |
| Submit Score | ~85,000 | $0.026 |
| Claim Reward | ~55,000 | $0.016 |
| **Total (DEGEN)** | **~205,000** | **~$0.062** |

*Note: Base L2 gas is 95% cheaper than Ethereum mainnet*

## 🔐 Security

### Smart Contract Security
- ✅ **ReentrancyGuard:** All money-handling functions protected
- ✅ **Ownable:** Admin functions restricted to contract owner
- ✅ **Pull Pattern:** Users claim rewards (no push transfers)
- ✅ **Input Validation:** Score thresholds, amount checks
- ✅ **No External Calls:** No arbitrary contract interactions
- ✅ **Time-Based Logic:** Prevents daily play manipulation
- ⚠️ **Audit Pending:** Not yet audited (testnet only for now)

### Frontend Security
- ✅ **No Private Keys Stored:** Wallet connectors handle keys
- ✅ **Read-Only by Default:** Smart contract calls are view functions
- ✅ **User Confirmation:** Explicit approval for transactions
- ✅ **Error Handling:** Graceful failures with retry logic
- ✅ **Rate Limiting Protection:** Exponential backoff on RPC errors

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Areas for Contribution:**
- UI/UX improvements
- Additional game modes or power-ups
- Mobile app version (React Native)
- Farcaster Frame integration
- Contract optimizations
- Bug fixes and testing

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Game (Web):** https://www.flowpepe.com
- **Farcaster Mini App:** https://farcaster.xyz/miniapps/qXKHh0xCCqID/flowpepe
- **GitHub:** https://github.com/Aliserag/pepethegame
- **Base Sepolia Testnet Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Base Sepolia Contracts:**
  - Leaderboard: [0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c](https://sepolia.basescan.org/address/0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c)
  - DEGEN: [0x806e4d33f36886ca9439f2c407505de936498d0e](https://sepolia.basescan.org/address/0x806e4d33f36886ca9439f2c407505de936498d0e)

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/Aliserag/pepethegame/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Aliserag/pepethegame/discussions)
- **Farcaster:** Tag @flowpepe

## 🎯 Roadmap

### Phase 1: MVP (Completed ✅)
- [x] Core Flappy Bird mechanics
- [x] Fun Mode with on-chain leaderboard
- [x] DEGEN Mode smart contract
- [x] Prize pool distribution logic
- [x] Farcaster Mini App integration
- [x] Base Sepolia deployment

### Phase 2: Polish (Current)
- [x] Daily leaderboard UI
- [x] Reward calculation display
- [x] Hall of Fame (lifetime earners)
- [x] Claim rewards interface
- [ ] Mobile-optimized controls
- [ ] Sound effects (jump, collision, score)

### Phase 3: Mainnet Launch
- [ ] Smart contract audit
- [ ] Deploy to Base mainnet
- [ ] Marketing campaign
- [ ] Farcaster Frame casts
- [ ] Community events

### Phase 4: Expansion
- [ ] Weekly tournaments
- [ ] NFT rewards for top players
- [ ] Referral system (earn from invited players)
- [ ] Multiple difficulty tiers
- [ ] Power-ups and special modes
- [ ] Cross-chain support (Optimism, Arbitrum)

---

**Built with ❤️ for the Farcaster and Base communities**

*WAGMI! 🐸🚀*
