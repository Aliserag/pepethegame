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

    const yesterday = Number(currentDay) - 1;
    console.log('Yesterday (Day):', yesterday);

    if (yesterday < 0) {
      console.log('No previous day data available');
      return;
    }

    // Get yesterday's stats
    const yesterdayStats = await client.readContract({
      address: contractAddress,
      abi,
      functionName: 'getDayStats',
      args: [BigInt(yesterday)]
    });

    console.log('\n--- Yesterday Stats ---');
    console.log('Total Pool:', formatEther(yesterdayStats[0]), 'FLOW');
    console.log('High Score:', yesterdayStats[1].toString());
    console.log('Entry Count:', yesterdayStats[2].toString());
    console.log('Player Count:', yesterdayStats[3].toString());
    console.log('Day Start:', new Date(Number(yesterdayStats[4]) * 1000).toISOString());

    // Get yesterday's leaderboard
    const leaderboard = await client.readContract({
      address: contractAddress,
      abi,
      functionName: 'getDayLeaderboard',
      args: [BigInt(yesterday), BigInt(20)]
    });

    console.log('\n--- Yesterday Leaderboard ---');
    const addresses = leaderboard[0];
    const scores = leaderboard[1];
    const multipliers = leaderboard[2];

    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i] !== '0x0000000000000000000000000000000000000000') {
        // Calculate reward for this player
        let reward = '0';
        try {
          const rewardWei = await client.readContract({
            address: contractAddress,
            abi,
            functionName: 'calculateReward',
            args: [addresses[i], BigInt(yesterday)]
          });
          reward = formatEther(rewardWei);
        } catch (e) {
          reward = 'Error: ' + e.message;
        }

        console.log((i + 1) + '. ' + addresses[i] + ' - Score: ' + scores[i] + ' - Multiplier: ' + multipliers[i] + ' - Reward: ' + reward + ' FLOW');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
