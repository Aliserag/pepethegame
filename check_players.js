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
  },
  {
    "inputs": [{"internalType": "uint256", "name": "limit", "type": "uint256"}],
    "name": "getTopEarners",
    "outputs": [
      {"internalType": "address[]", "name": "addresses", "type": "address[]"},
      {"internalType": "uint256[]", "name": "earnings", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function checkPlayers() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  console.log('Checking DEGEN Mode contract...\n');

  // Get current day
  const currentDay = await client.readContract({
    address: contractAddress,
    abi: degenAbi,
    functionName: 'getCurrentDay'
  });
  console.log('Current Day:', currentDay.toString());

  // Get day stats
  const [highScore, highScorer, totalPool, totalPlayers, dayStart] = await client.readContract({
    address: contractAddress,
    abi: degenAbi,
    functionName: 'getDayStats',
    args: [currentDay]
  });

  console.log('\n=== Today\'s Stats ===');
  console.log('High Score:', highScore.toString());
  console.log('High Scorer:', highScorer);
  console.log('Total Pool:', (Number(totalPool) / 1e18).toFixed(4), 'ETH');
  console.log('Total Players:', totalPlayers.toString());
  console.log('Day Start:', new Date(Number(dayStart) * 1000).toISOString());

  // Get today's leaderboard
  console.log('\n=== Today\'s Leaderboard ===');
  const [addresses, scores, multipliers, rewards] = await client.readContract({
    address: contractAddress,
    abi: degenAbi,
    functionName: 'getDayLeaderboard',
    args: [currentDay, 100n]
  });

  if (addresses.length === 0) {
    console.log('No players yet today');
  } else {
    addresses.forEach((addr, i) => {
      console.log(`#${i + 1}: ${addr}`);
      console.log(`   Score: ${scores[i].toString()}`);
      console.log(`   Multiplier: ${Number(multipliers[i]) / 100}x`);
      console.log(`   Potential Reward: ${(Number(rewards[i]) / 1e18).toFixed(4)} ETH`);
    });
  }

  // Get Hall of Fame
  console.log('\n=== Hall of Fame (All-Time Earners) ===');
  const [hofAddresses, hofEarnings] = await client.readContract({
    address: contractAddress,
    abi: degenAbi,
    functionName: 'getTopEarners',
    args: [10n]
  });

  if (hofAddresses.length === 0) {
    console.log('No one has claimed rewards yet');
  } else {
    hofAddresses.forEach((addr, i) => {
      console.log(`#${i + 1}: ${addr} - ${(Number(hofEarnings[i]) / 1e18).toFixed(4)} ETH`);
    });
  }
}

checkPlayers().catch(console.error);
