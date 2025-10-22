import { useState, useCallback, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
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
  }
] as const;

export default function useDegenMode() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const { data: walletClient } = useWalletClient();

  const [isEntering, setIsEntering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasPlayed, setHasPlayed] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [currentPool, setCurrentPool] = useState("0");
  const [entryFee, setEntryFee] = useState("0.002");
  const [potentialReward, setPotentialReward] = useState("0");
  const [currentDay, setCurrentDay] = useState(0);
  const [hallOfFame, setHallOfFame] = useState<{ address: string; earnings: string }[]>([]);
  const [lifetimeEarnings, setLifetimeEarnings] = useState("0");
  const [claimableRewards, setClaimableRewards] = useState<{ day: number; amount: string }[]>([]);

  // Contract address - will be set after deployment
  const contractAddress = (process.env.NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

  /**
   * Load initial data
   */
  const loadData = useCallback(async () => {
    if (!publicClient || !address || contractAddress === "0x0000000000000000000000000000000000000000") {
      return;
    }

    try {
      // Get entry fee
      const fee = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "entryFee",
      }) as bigint;
      setEntryFee(formatEther(fee));

      // Get current pool
      const pool = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "getCurrentPool",
      }) as bigint;
      setCurrentPool(formatEther(pool));

      // Get current day
      const day = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "getCurrentDay",
      }) as bigint;
      setCurrentDay(Number(day));

      // Check if played today
      const played = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "hasPlayedToday",
        args: [address],
      }) as boolean;
      setHasPlayed(played);

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

    } catch (err) {
      console.error("Error loading DEGEN data:", err);
      setError("Failed to load contract data. Please refresh.");
    }
  }, [publicClient, address, contractAddress]);

  useEffect(() => {
    loadData();
    // Removed auto-refresh to prevent infinite loops and reduce RPC calls
    // Users can manually refresh using the refresh buttons on components
  }, [publicClient, address, contractAddress]);

  /**
   * Enter game (pay entry fee)
   */
  const enterGame = useCallback(async (): Promise<boolean> => {
    if (!walletClient || !address || !publicClient) {
      const errorMsg = `Wallet not connected: walletClient=${!!walletClient}, address=${!!address}, publicClient=${!!publicClient}`;
      console.error(errorMsg);
      setError("Wallet not connected");
      return false;
    }

    setIsEntering(true);
    setError(null);

    try {
      const fee = parseEther(entryFee);
      console.log("Entering game with fee:", entryFee, "ETH (", fee.toString(), "wei)");
      console.log("Contract address:", contractAddress);
      console.log("Wallet address:", address);

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "enterGame",
        value: fee,
        chain: baseSepolia,
      });

      console.log("Entry transaction sent:", hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);

      if (receipt.status === "success") {
        setHasEntered(true);
        setHasPlayed(true);
        await loadData();
        setIsEntering(false);
        return true;
      } else {
        console.error("Transaction failed with status:", receipt.status);
        setError("Entry transaction failed");
        setIsEntering(false);
        return false;
      }
    } catch (err: any) {
      console.error("Error entering game - Full error:", err);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Error details:", JSON.stringify(err, null, 2));

      if (err.message?.includes("rate limit")) {
        setError("RPC rate limit reached. Please wait a moment and try again, or configure an Alchemy API key.");
      } else if (err.message?.includes("Already played today")) {
        setError("You've already played today. Come back tomorrow!");
      } else if (err.message?.includes("rejected") || err.message?.includes("User rejected")) {
        setError("Transaction cancelled");
      } else if (err.message?.includes("insufficient funds")) {
        setError("Insufficient ETH balance");
      } else {
        setError(`Failed to enter game: ${err.message || "Unknown error"}`);
      }
      setIsEntering(false);
      return false;
    }
  }, [walletClient, address, publicClient, contractAddress, entryFee, loadData]);

  /**
   * Submit score after game ends
   */
  const submitScore = useCallback(async (score: number): Promise<boolean> => {
    if (!walletClient || !address || !publicClient) {
      setError("Wallet not connected");
      return false;
    }

    if (!hasEntered) {
      setError("Must enter game first");
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "submitScore",
        args: [BigInt(score)],
        chain: baseSepolia,
      });

      console.log("Score submission transaction sent:", hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        // Calculate potential reward
        const reward = await publicClient.readContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "calculateReward",
          args: [address, BigInt(currentDay)],
        }) as bigint;
        setPotentialReward(formatEther(reward));

        setIsSubmitting(false);
        return true;
      } else {
        setError("Score submission failed");
        setIsSubmitting(false);
        return false;
      }
    } catch (err: any) {
      console.error("Error submitting score:", err);
      setError("Failed to submit score");
      setIsSubmitting(false);
      return false;
    }
  }, [walletClient, address, publicClient, contractAddress, hasEntered, currentDay]);

  /**
   * Claim rewards from a previous day
   */
  const claimReward = useCallback(async (day: number): Promise<boolean> => {
    if (!walletClient || !address || !publicClient) {
      setError("Wallet not connected");
      return false;
    }

    setIsClaiming(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "claimReward",
        args: [BigInt(day)],
        chain: baseSepolia,
      });

      console.log("Claim transaction sent:", hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        await loadData();
        setIsClaiming(false);
        return true;
      } else {
        setError("Claim transaction failed");
        setIsClaiming(false);
        return false;
      }
    } catch (err: any) {
      console.error("Error claiming reward:", err);
      if (err.message?.includes("No reward")) {
        setError("No reward to claim");
      } else {
        setError("Failed to claim reward");
      }
      setIsClaiming(false);
      return false;
    }
  }, [walletClient, address, publicClient, contractAddress, loadData]);

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
    if (!walletClient || !address || !publicClient) {
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
      // Claim each day sequentially
      for (const { day } of claimableRewards) {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: degenAbi,
          functionName: "claimReward",
          args: [BigInt(day)],
          chain: baseSepolia,
        });

        console.log(`Claim transaction for day ${day} sent:`, hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status !== "success") {
          setError(`Failed to claim reward for day ${day}`);
          setIsClaiming(false);
          return false;
        }
      }

      await loadData();
      setIsClaiming(false);
      return true;
    } catch (err: any) {
      console.error("Error claiming all rewards:", err);
      setError("Failed to claim all rewards");
      setIsClaiming(false);
      return false;
    }
  }, [walletClient, address, publicClient, contractAddress, claimableRewards, loadData]);

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
    isEntering,
    isSubmitting,
    isClaiming,
    error,

    // Functions
    enterGame,
    submitScore,
    claimReward,
    claimAllRewards,
    getPlayerRank,
    calculateMultiplier,
    calculatePotentialEarnings,
    loadData,
    clearError: () => setError(null),
  };
}
