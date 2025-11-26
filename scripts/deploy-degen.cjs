const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { flowTestnet, flowMainnet } = require('viem/chains');
require('dotenv').config();

async function main() {
  console.log('🚀 Deploying FlowPepeDegen contract...\n');

  // Get network from command line (default to flowTestnet)
  const network = process.argv[2] || 'flowTestnet';
  const chain = network === 'flowMainnet' ? flowMainnet : flowTestnet;

  console.log(`Network: ${network} (Chain ID: ${chain.id})`);

  // Check for private key
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.error('❌ Error: DEPLOYER_PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  // Read contract source and dependencies
  const contractPath = path.join(__dirname, '..', 'contracts', 'FlowPepeDegen.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  console.log('📝 Compiling contract...');

  // Compile contract with OpenZeppelin dependencies
  const input = {
    language: 'Solidity',
    sources: {
      'FlowPepeDegen.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  // Add function to find and load imports
  function findImports(importPath) {
    try {
      const nodeModulesPath = path.join(__dirname, '..', 'node_modules', importPath);
      const content = fs.readFileSync(nodeModulesPath, 'utf8');
      return { contents: content };
    } catch (error) {
      return { error: 'File not found' };
    }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  // Check for errors
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Compilation errors:');
      errors.forEach(err => console.error(err.formattedMessage));
      process.exit(1);
    }
  }

  const contract = output.contracts['FlowPepeDegen.sol']['FlowPepeDegen'];
  const abi = contract.abi;
  const bytecode = '0x' + contract.evm.bytecode.object;

  console.log('✅ Contract compiled successfully\n');

  // Setup account and clients
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(formattedKey);
  console.log(`Deploying from: ${account.address}`);

  const publicClient = createPublicClient({
    chain,
    transport: http()
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http()
  });

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${(Number(balance) / 1e18).toFixed(4)} FLOW\n`);

  if (balance === 0n) {
    console.error('❌ Error: Account has zero balance. Please fund your account first.');
    console.error(`   You can get testnet FLOW from: https://faucet.flow.com/`);
    process.exit(1);
  }

  console.log('🚀 Deploying contract...');

  // Deploy contract
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: []
  });

  console.log(`📝 Transaction hash: ${hash}`);
  console.log('⏳ Waiting for confirmation...\n');

  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === 'success') {
    console.log('✅ Contract deployed successfully!');
    console.log(`📍 Contract address: ${receipt.contractAddress}`);
    console.log(`🔗 Block: ${receipt.blockNumber}`);

    // Save deployment info
    const deploymentInfo = {
      network,
      chainId: chain.id,
      contractAddress: receipt.contractAddress,
      deployer: account.address,
      timestamp: new Date().toISOString(),
      blockNumber: Number(receipt.blockNumber),
      transactionHash: hash
    };

    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${network}-degen.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    // Save ABI to deployments folder
    const abiFile = path.join(deploymentsDir, 'FlowPepeDegen.abi.json');
    fs.writeFileSync(abiFile, JSON.stringify(abi, null, 2));

    // Also save ABI to lib folder (tracked in git)
    const libDir = path.join(__dirname, '..', 'lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }
    const libAbiFile = path.join(libDir, 'FlowPepeDegen.abi.json');
    fs.writeFileSync(libAbiFile, JSON.stringify(abi, null, 2));

    console.log(`\n📝 Deployment info saved to: ${deploymentFile}`);
    console.log(`📝 ABI saved to: ${abiFile}`);
    console.log(`📝 ABI also saved to: ${libAbiFile} (tracked in git)`);

    console.log('\n✨ Add this to your .env file:');
    console.log(`NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS=${receipt.contractAddress}`);

    if (network === 'flowTestnet') {
      console.log(`\n🔍 View on FlowScan: https://evm-testnet.flowscan.io/address/${receipt.contractAddress}`);
    } else {
      console.log(`\n🔍 View on FlowScan: https://evm.flowscan.io/address/${receipt.contractAddress}`);
    }

  } else {
    console.error('❌ Deployment failed');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
