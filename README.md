# FlowPepe 🐸

**WAGMI! Help Pepe make it through red candlestick obstacles and earn points!**

A Flappy Bird-style game built as a Farcaster Mini App with on-chain leaderboard on Base network.

🎮 **Play Now:** [https://www.flowpepe.com](https://www.flowpepe.com)

## Features

- 🕹️ **Classic Gameplay** - Flappy Bird mechanics with crypto candlestick obstacles
- 🐸 **Retro Aesthetic** - Pixel-perfect graphics with Press Start 2P font
- 🏆 **On-Chain Leaderboard** - Submit your high scores to the blockchain
- 🔗 **Wallet Integration** - Connect via Farcaster Mini App connector
- 📊 **Progressive Difficulty** - 10% speed increase every 5 points
- 🎵 **Sound Effects** - Background music with mute toggle
- 📱 **Fully Responsive** - Optimized for mobile and desktop
- 🌐 **Farcaster Native** - Built with Farcaster Frame SDK

## Tech Stack

- **Frontend:** Next.js 12, React 18, TypeScript, TailwindCSS
- **Animation:** Framer Motion (physics-based)
- **Blockchain:** Base (L2), wagmi, viem
- **Farcaster:** Frame SDK, Mini App connector
- **Smart Contract:** Solidity 0.8.20
- **Deployment:** Vercel

## Smart Contracts

### Base Sepolia Testnet

- **Leaderboard Contract:** `0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c`
- **BaseScan:** [View on Base Sepolia Explorer](https://sepolia.basescan.org/address/0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c)
- **Network:** Base Sepolia (Chain ID: 84532)
- **Deployer:** `0xCC18E51efc529ed41e48aE5DEa8fCeC60A2baefE`
- **Deployment TX:** [0x808d0fa3fcb69533ee1792a8df445af8d2a019dd5aff4dfa9110d2b30ba4399e](https://sepolia.basescan.org/tx/0x808d0fa3fcb69533ee1792a8df445af8d2a019dd5aff4dfa9110d2b30ba4399e)
- **Block:** 32446606

### Base Mainnet

*Coming soon - Deploy with `node scripts/deploy-simple.js base`*

## Contract Features

The FlowPepe Leaderboard contract provides:

✅ **submitScore(uint256 score)** - Submit your high score on-chain
✅ **getScore(address player)** - Get a player's high score
✅ **getTopScores(uint256 count)** - Get top N players and scores
✅ **getPlayerCount()** - Get total number of unique players
✅ Gas-optimized sorting algorithm
✅ Automatic high score validation
✅ Event emissions for indexing

## Installation

```bash
# Clone the repository
git clone https://github.com/Aliserag/pepethegame.git
cd pepethegame

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
cp .env.example .env

# Add your environment variables
# DEPLOYER_PRIVATE_KEY=your_private_key_here
# NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to play locally.

## Smart Contract Deployment

### Deploy to Base Sepolia Testnet

```bash
# Ensure you have testnet ETH in your deployer wallet
# Get free testnet ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

node scripts/deploy-simple.js baseSepolia
```

### Deploy to Base Mainnet

```bash
node scripts/deploy-simple.js base
```

### Verify Contract on Basescan

```bash
# Get verification instructions
node scripts/verify.js baseSepolia

# Follow the instructions to manually verify on Basescan
```

Or verify directly on Basescan:
1. Visit the contract on [BaseScan](https://sepolia.basescan.org/address/0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c)
2. Click "Contract" → "Verify and Publish"
3. Compiler: v0.8.20+commit.a1b79de6
4. Optimization: Yes (200 runs)
5. Paste code from `contracts/FlowPepeLeaderboard.sol`

## Game Mechanics

### Gameplay
- Click/tap to make Pepe jump
- Avoid red candlestick obstacles
- Score increases with each obstacle passed
- Game speed increases 10% every 5 points

### Scoring System
- **Local Storage:** Tracks total score and high score per Farcaster FID
- **On-Chain:** Submit high scores to blockchain leaderboard
- **Leaderboard:** View top 10 players on-chain

### Controls
- **Click/Tap:** Jump
- **Mute Button:** Toggle sound
- **Connect Wallet:** Auto-connects via Farcaster

## Farcaster Integration

FlowPepe is a fully integrated Farcaster Mini App:

- Auto-detects Farcaster environment
- Displays user's Farcaster username
- One-click wallet connection via Farcaster connector
- Manifest at `/.well-known/farcaster.json`
- Optimized meta tags for sharing

### Farcaster Manifest

Account Association verified for domain: `flowpepe.com`
FID: 873429

## Project Structure

```
pepethegame/
├── components/
│   ├── Game.tsx              # Main game component
│   ├── FlappyBird.tsx        # Pepe character
│   ├── Pipes.tsx             # Obstacles
│   ├── Leaderboard.tsx       # On-chain leaderboard display
│   ├── WalletConnect.tsx     # Wallet connection UI
│   └── FarcasterProvider.tsx # Farcaster SDK wrapper
├── contracts/
│   └── FlowPepeLeaderboard.sol # Smart contract
├── hooks/
│   ├── useGame.tsx           # Game state management
│   ├── useScores.tsx         # Local score tracking
│   ├── useOnChainScore.tsx   # Blockchain interactions
│   └── ...
├── lib/
│   └── wagmi.ts              # Wagmi configuration
├── pages/
│   ├── index.tsx             # Home page
│   ├── _app.tsx              # App wrapper
│   └── _document.tsx         # Meta tags & manifest
├── scripts/
│   ├── deploy-simple.js      # Contract deployment
│   └── verify.js             # Verification helper
└── public/
    ├── .well-known/
    │   └── farcaster.json    # Farcaster manifest
    └── assets...
```

## Development

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
npm run export
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS`
4. Deploy
5. Add custom domain: flowpepe.com

### Environment Variables

Required for production:
- `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS` - Contract address

Required for deployment only (not in Vercel):
- `DEPLOYER_PRIVATE_KEY` - Private key for contract deployment

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Links

- **Live Game:** https://www.flowpepe.com
- **GitHub:** https://github.com/Aliserag/pepethegame
- **Farcaster:** Search "FlowPepe" in Mini Apps
- **Base Sepolia Contract:** [0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c](https://sepolia.basescan.org/address/0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c)

## Support

- **Issues:** [GitHub Issues](https://github.com/Aliserag/pepethegame/issues)
- **Farcaster:** Tag @flowpepe (coming soon)

---

**Built with ❤️ for the Farcaster and Base communities**

*WAGMI! 🐸🚀*
