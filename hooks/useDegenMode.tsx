import { useState, useCallback, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { parseEther, formatEther } from "viem";

// ABI will be added after contract deployment
const degenAbi = [
  {
    "inputs": [],
    "name": "enterGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "score", "type": "uint256"}],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "hasPlayedToday",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentPool",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentDay",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "player", "type": "address"},
      {"internalType": "uint256", "name": "day", "type": "uint256"}
    ],
    "name": "calculateReward",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "day", "type": "uint256"}],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "entryFee",
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
    "inputs": [],
    "name": "getMyScore",
    "outputs": [
      {"internalType": "uint256", "name": "score", "type": "uint256"},
      {"internalType": "uint256", "name": "multiplier", "type": "uint256"},
      {"internalType": "bool", "name": "claimed", "type": "bool"}
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
  },
  {
    "inputs": [
      {"internalType": "address", "name": "player", "type": "address"},
      {"internalType": "uint256", "name": "day", "type": "uint256"}
    ],
    "name": "getPlayerRank",
    "outputs": [
      {"internalType": "uint256", "name": "rank", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPlayers", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getClaimableRewards",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "lifetimeEarnings",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
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
] as const;

export default function useDegenMode() {
  const { address, isConnected, chain, status } = useAccount();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const { data: walletClient, refetch: refetchWalletClient } = useWalletClient({
    chainId: baseSepolia.id
  });
  const { switchChainAsync } = useSwitchChain();

  const [isEntering, setIsEntering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  const [hasPlayed, setHasPlayed] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [currentPool, setCurrentPool] = useState("0");
  const [entryFee, setEntryFee] = useState("0.002");
  const [potentialReward, setPotentialReward] = useState("0");
  const [currentDay, setCurrentDay] = useState(0);
  const [hallOfFame, setHallOfFame] = useState<{ address: string; earnings: string }[]>([]);
  const [lifetimeEarnings, setLifetimeEarnings] = useState("0");
  const [claimableRewards, setClaimableRewards] = useState<{ day: number; amount: string }[]>([]);
  const [dayStats, setDayStats] = useState<{ highScore: number; highScorer: string; totalPool: string; totalPlayers: number; dayStart: number } | null>(null);
  const [playerRank, setPlayerRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [playerCurrentDayScore, setPlayerCurrentDayScore] = useState<number>(0); // Track player's current score for the day
  const [leaderboard, setLeaderboard] = useState<{ address: string; score: number; multiplier: number; reward: string }[]>([]);

  // Contract address - hardcoded as fallback since env vars may not work in production
  const contractAddress = (
    process.env.NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS ||
    "0x806e4d33f36886ca9439f2c407505de936498d0e" // FlowPepeDegen contract on Base Sepolia
  ) as `0x${string}`;

  console.log("DEGEN Contract Address:", contractAddress);

  /**
   * Load initial data
   */
  const loadData = useCallback(async () => {
    if (!publicClient || !address || contractAddress === "0x0000000000000000000000000000000000000000") {
      return;
    }

    setLoadingStats(true);

    // Helper function to add delay between calls to prevent RPC rate limiting (300ms between each call)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Get entry fee
      const fee = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "entryFee",
      }) as bigint;
      setEntryFee(formatEther(fee));

      await delay(300);

      // Get current pool with error handling
      try {
        console.log("Fetching current pool from contract...");
        const pool = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "getCurrentPool",
        }) as bigint;
        console.log("Current pool (bigint):", pool.toString());
        const poolFormatted = formatEther(pool);
        console.log("Current pool (ETH):", poolFormatted);
        setCurrentPool(poolFormatted);
      } catch (poolErr) {
        console.error("Error loading current pool:", poolErr);
        // Don't set to "0" if it fails, keep previous value or set to loading indicator
        console.warn("Failed to fetch pool, keeping previous value");
      }

      await delay(300);

      // Get current day
      const day = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "getCurrentDay",
      }) as bigint;
      setCurrentDay(Number(day));

      await delay(300);

      // Check if played today
      const played = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "hasPlayedToday",
        args: [address],
      }) as boolean;
      setHasPlayed(played);

      await delay(300);

      // Get Hall of Fame (top 10) - handle empty case
      try {
        const [addresses, earnings] = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "getTopEarners",
          args: [BigInt(10)],
        }) as [readonly `0x${string}`[], readonly bigint[]];

        const hallOfFameData = addresses.map((addr, i) => ({
          address: addr,
          earnings: formatEther(earnings[i]),
        }));
        setHallOfFame(hallOfFameData);
      } catch (hofErr) {
        console.error("Error loading Hall of Fame:", hofErr);
        setHallOfFame([]);
      }

      // Get user's lifetime earnings
      try {
        const userEarnings = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "lifetimeEarnings",
          args: [address],
        }) as bigint;
        setLifetimeEarnings(formatEther(userEarnings));
      } catch (earningsErr) {
        console.error("Error loading lifetime earnings:", earningsErr);
        setLifetimeEarnings("0");
      }

      // Get claimable rewards
      try {
        const [claimableDays, claimableAmounts] = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "getClaimableRewards",
          args: [address],
        }) as [readonly bigint[], readonly bigint[]];

        const claimableData = claimableDays.map((dayNum, i) => ({
          day: Number(dayNum),
          amount: formatEther(claimableAmounts[i]),
        }));
        setClaimableRewards(claimableData);
      } catch (claimErr) {
        console.error("Error loading claimable rewards:", claimErr);
        setClaimableRewards([]);
      }

      // Get current day stats
      try {
        const stats = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "getDayStats",
          args: [BigInt(Number(day))],
        }) as [bigint, string, bigint, bigint, bigint];

        setDayStats({
          highScore: Number(stats[0]),
          highScorer: stats[1],
          totalPool: (Number(stats[2]) / 1e18).toFixed(4),
          totalPlayers: Number(stats[3]),
          dayStart: Number(stats[4]),
        });
      } catch (statsErr) {
        console.error("Error loading day stats:", statsErr);
        setDayStats(null);
      }

      // Get player's rank for current day
      try {
        const [rank, totalPlayers] = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "getPlayerRank",
          args: [address, BigInt(Number(day))],
        }) as [bigint, bigint];

        setPlayerRank({
          rank: Number(rank),
          totalPlayers: Number(totalPlayers),
        });
      } catch (rankErr) {
        console.error("Error loading player rank:", rankErr);
        setPlayerRank(null);
      }

      // Get player's current score for the day
      try {
        const [score, multiplier, claimed] = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "getMyScore",
        }) as [bigint, bigint, boolean];

        setPlayerCurrentDayScore(Number(score));
      } catch (scoreErr) {
        console.error("Error loading player score:", scoreErr);
        setPlayerCurrentDayScore(0);
      }

      // Get leaderboard for current day
      try {
        const [addresses, scores, multipliers, rewards] = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "getDayLeaderboard",
          args: [BigInt(Number(day)), BigInt(100)], // Get top 100 players
        }) as [readonly `0x${string}`[], readonly bigint[], readonly bigint[], readonly bigint[]];

        const leaderboardData = addresses.map((addr, i) => ({
          address: addr,
          score: Number(scores[i]),
          multiplier: Number(multipliers[i]),
          reward: formatEther(rewards[i]),
        }));
        setLeaderboard(leaderboardData);

        // Also update playerCurrentDayScore and potentialReward from leaderboard if we find the user
        const userEntry = leaderboardData.find(
          entry => entry.address.toLowerCase() === address.toLowerCase()
        );
        if (userEntry) {
          console.log("Setting playerCurrentDayScore from leaderboard:", userEntry.score);
          console.log("Setting potentialReward from leaderboard:", userEntry.reward);
          setPlayerCurrentDayScore(userEntry.score);
          setPotentialReward(userEntry.reward);
        }
      } catch (leaderboardErr) {
        console.error("Error loading leaderboard:", leaderboardErr);
        setLeaderboard([]);
      }

      setLoadingStats(false);

    } catch (err) {
      console.error("Error loading DEGEN data:", err);
      setError("Failed to load contract data. Please refresh.");
      setLoadingStats(false);
    }
  }, [publicClient, address, contractAddress]);

  useEffect(() => {
    console.log("=== useDegenMode useEffect Triggered ===");
    console.log("publicClient:", !!publicClient);
    console.log("address:", address);
    console.log("contractAddress:", contractAddress);

    // Only load data if we have all required dependencies and address just became available
    if (publicClient && address && contractAddress !== "0x0000000000000000000000000000000000000000") {
      console.log("✅ All conditions met, calling loadData()");
      loadData();
    } else {
      console.warn("❌ Conditions not met for loadData:");
      console.warn("  - publicClient:", !!publicClient);
      console.warn("  - address:", address);
      console.warn("  - contractAddress valid:", contractAddress !== "0x0000000000000000000000000000000000000000");
    }
    // Deliberately NOT including loadData to prevent re-runs when publicClient reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, contractAddress]);

  /**
   * Enter game (pay entry fee)
   */
  const enterGame = useCallback(async (): Promise<boolean> => {
    if (!address || !publicClient) {
      const errorMsg = `Wallet not connected: address=${!!address}, publicClient=${!!publicClient}`;
      console.error(errorMsg);
      setError("Wallet not connected");
      return false;
    }

    setIsEntering(true);
    setError(null);
    setProcessingMessage("Preparing transaction...");

    try {
      // 1. Check account status
      if (!isConnected || !address) {
        setError("Wallet not connected. Please connect your wallet.");
        setIsEntering(false);
        setProcessingMessage(null);
        return false;
      }

      // 2. Check if we need to switch chains
      if (chain?.id !== baseSepolia.id) {
        setProcessingMessage("Switching to Base Sepolia network...");
        console.log(`Current chain: ${chain?.id}, switching to Base Sepolia (${baseSepolia.id})`);

        try {
          await switchChainAsync({ chainId: baseSepolia.id });

          // 3. Refetch wallet client to get updated client for new chain
          setProcessingMessage("Verifying network switch...");
          await refetchWalletClient();

          // 4. Wait for wallet client to be on correct chain (active polling instead of fixed delay)
          let chainSwitched = false;
          for (let i = 0; i < 30; i++) { // 3 seconds max (30 * 100ms)
            await new Promise(resolve => setTimeout(resolve, 100));
            const { data: freshClient } = await refetchWalletClient();
            if (freshClient?.chain?.id === baseSepolia.id) {
              chainSwitched = true;
              console.log("✅ Wallet client confirmed on Base Sepolia");
              break;
            }
          }

          if (!chainSwitched) {
            setError("Network switch timeout. Please try again.");
            setIsEntering(false);
            setProcessingMessage(null);
            return false;
          }

          setProcessingMessage("Network switched successfully!");
          await new Promise(resolve => setTimeout(resolve, 200)); // Brief stabilization
        } catch (switchErr: any) {
          console.error("Error switching chain:", switchErr);
          if (switchErr.message?.includes("rejected") || switchErr.message?.includes("User rejected")) {
            setError("Network switch cancelled");
          } else {
            setError("Failed to switch to Base Sepolia network. Please switch manually.");
          }
          setIsEntering(false);
          setProcessingMessage(null);
          return false;
        }
      }

      // 5. Get fresh wallet client (should be on correct chain now)
      const { data: freshWalletClient } = await refetchWalletClient();

      if (!freshWalletClient) {
        setError("Wallet client not ready. Please try again.");
        setIsEntering(false);
        setProcessingMessage(null);
        return false;
      }

      // 6. Verify we're on the correct chain before transaction
      if (freshWalletClient.chain?.id !== baseSepolia.id) {
        setError(`Chain mismatch detected (on ${freshWalletClient.chain?.id}, expected ${baseSepolia.id}). Please try again.`);
        setIsEntering(false);
        setProcessingMessage(null);
        return false;
      }

      // 7. Simulate and execute transaction
      const fee = parseEther(entryFee);
      console.log("Entering game with fee:", entryFee, "ETH (", fee.toString(), "wei)");
      console.log("Contract address:", contractAddress);
      console.log("Wallet address:", address);

      // Simulate transaction first to catch errors before user signs
      setProcessingMessage("Validating transaction...");

      const { request } = await publicClient.simulateContract({
        account: address,
        address: contractAddress,
        abi: degenAbi,
        functionName: "enterGame",
        value: fee,
        chain: baseSepolia,
      });

      setProcessingMessage("Confirm transaction in wallet...");

      const hash = await freshWalletClient.writeContract(request);

      console.log("Entry transaction sent:", hash);
      setProcessingMessage("Transaction submitted. Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);

      if (receipt.status === "success") {
        setProcessingMessage("Success! Loading game data...");
        setHasEntered(true);
        setHasPlayed(true);
        await loadData();
        setIsEntering(false);
        setProcessingMessage(null);
        return true;
      } else {
        console.error("Transaction failed with status:", receipt.status);
        setError("Entry transaction failed");
        setIsEntering(false);
        setProcessingMessage(null);
        return false;
      }
    } catch (err: any) {
      console.error("Error entering game:", err);
      setProcessingMessage(null);

      if (err.message?.includes("Already played today")) {
        setError("You've already played today. Come back tomorrow!");
      } else if (err.message?.includes("rejected") || err.message?.includes("User rejected")) {
        setError("Transaction cancelled");
      } else if (err.message?.includes("insufficient funds")) {
        setError("Insufficient ETH balance");
      } else if (err.message?.includes("Chain")) {
        setError("Network error. Please ensure you're on Base Sepolia and try again.");
      } else {
        setError(`Failed to enter game: ${err.message || "Unknown error"}`);
      }
      setIsEntering(false);
      return false;
    }
  }, [address, publicClient, contractAddress, entryFee, loadData, chain, switchChainAsync, refetchWalletClient, status]);

  /**
   * Submit score after game ends
   */
  const submitScore = useCallback(async (score: number): Promise<boolean> => {
    if (!address || !publicClient) {
      setError("Wallet not connected");
      return false;
    }

    if (!hasEntered) {
      setError("Must enter game first");
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    setProcessingMessage("Preparing score submission...");

    try {
      // 1. Get fresh wallet client
      const { data: freshWalletClient } = await refetchWalletClient();

      if (!freshWalletClient) {
        setError("Wallet client not ready. Please try again.");
        setIsSubmitting(false);
        setProcessingMessage(null);
        return false;
      }

      // 2. Verify we're on the correct chain
      if (freshWalletClient.chain?.id !== baseSepolia.id) {
        setError(`Chain mismatch detected. Please switch to Base Sepolia and try again.`);
        setIsSubmitting(false);
        setProcessingMessage(null);
        return false;
      }

      // 3. Simulate transaction first
      setProcessingMessage("Validating transaction...");

      const { request } = await publicClient.simulateContract({
        account: address,
        address: contractAddress,
        abi: degenAbi,
        functionName: "submitScore",
        args: [BigInt(score)],
        chain: baseSepolia,
      });

      setProcessingMessage("Confirm transaction in wallet...");

      const hash = await freshWalletClient.writeContract(request);

      console.log("Score submission transaction sent:", hash);
      setProcessingMessage("Transaction submitted. Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        setProcessingMessage("Success! Calculating rewards...");
        // Calculate potential reward
        const reward = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "calculateReward",
          args: [address, BigInt(currentDay)],
        }) as bigint;
        setPotentialReward(formatEther(reward));

        setIsSubmitting(false);
        setProcessingMessage(null);
        return true;
      } else {
        setError("Score submission failed");
        setIsSubmitting(false);
        setProcessingMessage(null);
        return false;
      }
    } catch (err: any) {
      console.error("Error submitting score:", err);
      setProcessingMessage(null);

      if (err.message?.includes("rejected") || err.message?.includes("User rejected")) {
        setError("Transaction cancelled");
      } else if (err.message?.includes("insufficient funds")) {
        setError("Insufficient gas");
      } else if (err.message?.includes("Chain")) {
        setError("Network error. Please ensure you're on Base Sepolia and try again.");
      } else {
        setError(`Failed to submit score: ${err.message || "Unknown error"}`);
      }
      setIsSubmitting(false);
      return false;
    }
  }, [address, publicClient, contractAddress, hasEntered, currentDay, refetchWalletClient]);

  /**
   * Claim rewards from a previous day
   */
  const claimReward = useCallback(async (day: number): Promise<boolean> => {
    if (!address || !publicClient) {
      setError("Wallet not connected");
      return false;
    }

    setIsClaiming(true);
    setError(null);

    try {
      // 1. Check if we need to switch chains
      if (chain?.id !== baseSepolia.id) {
        console.log(`Current chain: ${chain?.id}, switching to Base Sepolia (${baseSepolia.id})`);

        try {
          await switchChainAsync({ chainId: baseSepolia.id });

          // Wait for wallet client to update
          await refetchWalletClient();

          let chainSwitched = false;
          for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const { data: freshClient } = await refetchWalletClient();
            if (freshClient?.chain?.id === baseSepolia.id) {
              chainSwitched = true;
              console.log("✅ Wallet client confirmed on Base Sepolia");
              break;
            }
          }

          if (!chainSwitched) {
            setError("Network switch timeout. Please try again.");
            setIsClaiming(false);
            return false;
          }
        } catch (switchErr: any) {
          console.error("Error switching chain:", switchErr);
          if (switchErr.message?.includes("rejected") || switchErr.message?.includes("User rejected")) {
            setError("Network switch cancelled");
          } else {
            setError("Failed to switch to Base Sepolia network. Please switch manually.");
          }
          setIsClaiming(false);
          return false;
        }
      }

      // 2. Get fresh wallet client
      const { data: freshWalletClient } = await refetchWalletClient();

      if (!freshWalletClient) {
        setError("Wallet client not ready. Please try again.");
        setIsClaiming(false);
        return false;
      }

      // 3. Verify chain
      if (freshWalletClient.chain?.id !== baseSepolia.id) {
        setError(`Chain mismatch. Please try again.`);
        setIsClaiming(false);
        return false;
      }

      // 4. Simulate and execute
      const { request } = await publicClient.simulateContract({
        account: address,
        address: contractAddress,
        abi: degenAbi,
        functionName: "claimReward",
        args: [BigInt(day)],
        chain: baseSepolia,
      });

      const hash = await freshWalletClient.writeContract(request);

      console.log("Claim transaction sent:", hash);
      console.log("🔗 View on block explorer: https://sepolia.basescan.org/tx/" + hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);

      if (receipt.status === "success") {
        console.log("✅ Claim successful! Transaction:", hash);
        console.log("Gas used:", receipt.gasUsed.toString());
        console.log("Block number:", receipt.blockNumber.toString());
        await loadData();
        setIsClaiming(false);
        return true;
      } else {
        console.error("❌ Claim transaction failed. Receipt:", receipt);
        setError("Claim transaction failed");
        setIsClaiming(false);
        return false;
      }
    } catch (err: any) {
      console.error("Error claiming reward:", err);

      if (err.message?.includes("No reward")) {
        setError("No reward to claim");
      } else if (err.message?.includes("rejected") || err.message?.includes("User rejected")) {
        setError("Transaction cancelled");
      } else if (err.message?.includes("Chain")) {
        setError("Network error. Please ensure you're on Base Sepolia and try again.");
      } else {
        setError("Failed to claim reward");
      }
      setIsClaiming(false);
      return false;
    }
  }, [address, publicClient, contractAddress, loadData, chain, switchChainAsync, refetchWalletClient]);

  /**
   * Calculate speed multiplier for DEGEN mode
   * Increases 0.1x every 2.5 points (2x faster than Fun Mode)
   */
  const calculateMultiplier = useCallback((score: number): number => {
    // Formula: 1.0 + (score * 0.04)
    // score * 0.04 = 0.1x every 2.5 points
    return 1.0 + (score * 0.04);
  }, []);

  /**
   * Calculate potential earnings
   */
  const calculatePotentialEarnings = useCallback((score: number, highScore: number, pool: string): string => {
    if (score === 0 || highScore === 0) return "0";

    const poolAmount = parseFloat(pool);
    const multiplier = calculateMultiplier(score);

    // Base reward: (Your Score / High Score) × Pool
    const baseReward = (score / highScore) * poolAmount;

    // Apply multiplier
    const multipliedReward = baseReward * multiplier;

    // Cap at 50% of pool
    const maxPayout = poolAmount * 0.5;
    const finalReward = Math.min(multipliedReward, maxPayout);

    // Check 80% threshold
    const threshold = highScore * 0.8;
    if (score < threshold) return "0";

    return finalReward.toFixed(4);
  }, [calculateMultiplier]);

  /**
   * Get player's rank for a specific day
   */
  const getPlayerRank = useCallback(async (day: number): Promise<{ rank: number; totalPlayers: number } | null> => {
    if (!publicClient || !address) return null;

    try {
      const [rank, totalPlayers] = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "getPlayerRank",
        args: [address, BigInt(day)],
      }) as [bigint, bigint];

      return {
        rank: Number(rank),
        totalPlayers: Number(totalPlayers),
      };
    } catch (err) {
      console.error("Error getting player rank:", err);
      return null;
    }
  }, [publicClient, address, contractAddress]);

  /**
   * Claim all available rewards
   */
  const claimAllRewards = useCallback(async (): Promise<boolean> => {
    if (!address || !publicClient) {
      setError("Wallet not connected");
      return false;
    }

    if (claimableRewards.length === 0) {
      setError("No rewards to claim");
      return false;
    }

    setIsClaiming(true);
    setError(null);

    try {
      // Use the fixed claimReward function for each day
      for (const { day } of claimableRewards) {
        // Reset error before each claim
        setError(null);

        const success = await claimReward(day);
        if (!success) {
          setIsClaiming(false);
          return false;
        }

        // Brief delay between claims to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setIsClaiming(false);
      return true;
    } catch (err: any) {
      console.error("Error claiming all rewards:", err);
      setError("Failed to claim all rewards");
      setIsClaiming(false);
      return false;
    }
  }, [address, publicClient, claimableRewards, claimReward]);

  /**
   * Reset entry state (for "Try Again" functionality)
   */
  const resetEntry = useCallback(() => {
    setHasEntered(false);
    setPotentialReward("0");
    setError(null);
  }, []);

  return {
    // State
    hasPlayed,
    hasEntered,
    currentPool,
    entryFee,
    potentialReward,
    currentDay,
    hallOfFame,
    lifetimeEarnings,
    claimableRewards,
    dayStats,
    playerRank,
    loadingStats,
    isEntering,
    isSubmitting,
    isClaiming,
    error,
    processingMessage,
    playerCurrentDayScore,
    leaderboard,

    // Functions
    enterGame,
    submitScore,
    claimReward,
    claimAllRewards,
    getPlayerRank,
    calculateMultiplier,
    calculatePotentialEarnings,
    loadData,
    resetEntry,
    clearError: () => setError(null),
  };
}
