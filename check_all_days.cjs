const { createPublicClient, http } = require('viem');
const { baseSepolia } = require('viem/chains');

const contractAddress = '0x806e4d33f36886ca9439f2c407505de936498d0e';

const degenAbi = [
  {
    "inputs": [],
    "name": "getCurrentDay",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "day", "type": "uint256"}],
    "name": "getDayStats",
    "outputs": [
      {"internalType": "uint256", "name": "highScore", "type": "uint256"},
      {"internalType": "address", "name": "highScorer", "type": "address"},
      {"internalType": "uint256", "name": "totalPool", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPlayers", "type": "uint256"},
      {"internalType": "uint256", "name": "dayStart", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "day", "type": "uint256"},
      {"internalType": "uint256", "name": "limit", "type": "uint256"}
    ],
    "name": "getDayLeaderboard",
    "outputs": [
      {"internalType": "address[]", "name": "addresses", "type": "address[]"},
      {"internalType": "uint256[]", "name": "scores", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "multipliers", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "rewards", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function checkAllDays() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  console.log('Checking all days in DEGEN Mode contract...\n');

  const currentDay = await client.readContract({
    address: contractAddress,
    abi: degenAbi,
    functionName: 'getCurrentDay'
  });

  console.log('Current Day:', currentDay.toString());
  console.log('Checking days 0 through', currentDay.toString(), '...\n');

  // Check day 0 (previous day)
  for (let dayNum = 0; dayNum <= Number(currentDay); dayNum++) {
    const day = BigInt(dayNum);
    console.log('\n======= DAY', dayNum, '=======');

    try {
      const [highScore, highScorer, totalPool, totalPlayers, dayStart] = await client.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: 'getDayStats',
        args: [day]
      });

      if (totalPlayers === 0n) {
        console.log('No players this day');
        continue;
      }

      console.log('High Score:', highScore.toString());
      console.log('High Scorer:', highScorer);
      console.log('Total Pool:', (Number(totalPool) / 1e18).toFixed(4), 'ETH');
      console.log('Total Players:', totalPlayers.toString());
      console.log('Day Start:', dayStart > 0 ? new Date(Number(dayStart) * 1000).toISOString() : 'Not started');

      // Get leaderboard for this day
      const [addresses, scores, multipliers, rewards] = await client.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: 'getDayLeaderboard',
        args: [day, 100n]
      });

      console.log('\nLeaderboard:');
      addresses.forEach((addr, i) => {
        console.log('  #' + (i + 1) + ':', addr);
        console.log('     Score:', scores[i].toString());
        console.log('     Reward:', (Number(rewards[i]) / 1e18).toFixed(4), 'ETH');
      });

    } catch (err) {
      console.log('Error loading day:', err.message);
    }
  }
}

checkAllDays().catch(console.error);
