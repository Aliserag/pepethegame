const fs = require('fs');
const path = require('path');

// Simple verification instructions script
async function main() {
  const network = process.argv[2] || 'baseSepolia';

  const deploymentFile = path.join(__dirname, '..', 'deployments', `${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.error('Deploy the contract first using: node scripts/deploy-simple.js');
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));

  console.log('\n🔍 Contract Verification Information\n');
  console.log('Network:', deployment.network);
  console.log('Contract Address:', deployment.contractAddress);
  console.log('Deployer:', deployment.deployer);
  console.log('Block Number:', deployment.blockNumber);
  console.log('Transaction Hash:', deployment.transactionHash);

  const explorerUrl = network === 'base'
    ? `https://basescan.org/address/${deployment.contractAddress}`
    : `https://sepolia.basescan.org/address/${deployment.contractAddress}`;

  console.log('\n🔗 Explorer URL:', explorerUrl);

  console.log('\n📝 To verify on Basescan:');
  console.log('1. Visit:', explorerUrl);
  console.log('2. Click "Contract" tab');
  console.log('3. Click "Verify and Publish"');
  console.log('4. Select "Solidity (Single file)"');
  console.log('5. Compiler version: v0.8.20+commit.a1b79de6');
  console.log('6. Optimization: Yes (200 runs)');
  console.log('7. Paste the contract code from: contracts/FlowPepeLeaderboard.sol');
  console.log('8. Click "Verify and Publish"\n');
}

main();
