const { createPublicClient, http, formatEther } = require('viem');
const { flowMainnet } = require('viem/chains');
const path = require('path');

const abi = require(path.join(__dirname, '../lib/FlowPepeDegen.abi.json'));

const client = createPublicClient({
  chain: flowMainnet,
  transport: http(process.env.NEXT_PUBLIC_FLOW_RPC || 'https://mainnet.evm.nodes.onflow.org')
});

const contractAddress = process.env.NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS || '0xb5060b6a8a2C59f2B161F7AD2591fCafDEbfB00c';

async function main() {
  try {
    // Get current day
    const currentDay = await client.readContract({
      address: contractAddress,
      abi,
      functionName: 'getCurrentDay'
    });
    console.log('Current Day:', currentDay.toString());
    console.log('Checking all days from 0 to', Number(currentDay) - 1, '...\n');

    // Check all days
    for (let day = 0; day <= Number(currentDay); day++) {
      const stats = await client.readContract({
        address: contractAddress,
        abi,
        functionName: 'getDayStats',
        args: [BigInt(day)]
      });

      const pool = formatEther(stats[0]);
      const highScore = stats[1].toString();
      const entryCount = stats[2].toString();
      const playerCount = stats[3].toString();
      const dayStart = Number(stats[4]) > 0 ? new Date(Number(stats[4]) * 1000).toISOString() : 'Not started';

      // Only show days with activity
      if (pool !== '0' || entryCount !== '0') {
        console.log('=== Day', day, '===');
        console.log('  Pool:', pool, 'FLOW');
        console.log('  High Score:', highScore);
        console.log('  Entries:', entryCount);
        console.log('  Players:', playerCount);
        console.log('  Started:', dayStart);

        // Get leaderboard for this day
        const leaderboard = await client.readContract({
          address: contractAddress,
          abi,
          functionName: 'getDayLeaderboard',
          args: [BigInt(day), BigInt(10)]
        });

        const addresses = leaderboard[0];
        const scores = leaderboard[1];
        const multipliers = leaderboard[2];

        console.log('  Leaderboard:');
        for (let i = 0; i < addresses.length; i++) {
          if (addresses[i] !== '0x0000000000000000000000000000000000000000') {
            // Calculate reward
            let reward = '0';
            try {
              const rewardWei = await client.readContract({
                address: contractAddress,
                abi,
                functionName: 'calculateReward',
                args: [addresses[i], BigInt(day)]
              });
              reward = formatEther(rewardWei);
            } catch (e) {
              reward = 'Error';
            }
            console.log('    ' + (i + 1) + '. ' + addresses[i].slice(0, 10) + '...' + addresses[i].slice(-6) + ' | Score: ' + scores[i] + ' | Reward: ' + reward + ' FLOW');
          }
        }
        console.log('');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
