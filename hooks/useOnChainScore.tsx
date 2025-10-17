import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import leaderboardAbi from "../deployments/FlowPepeLeaderboard.abi.json";

export default function useOnChainScore() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const contractAddress = process.env
    .NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS as `0x${string}`;

  /**
   * Get the current on-chain score for the connected wallet
   */
  const getOnChainScore = useCallback(async (): Promise<number> => {
    if (!publicClient || !contractAddress || !address) {
      return 0;
    }

    try {
      const score = (await publicClient.readContract({
        address: contractAddress,
        abi: leaderboardAbi,
        functionName: "getScore",
        args: [address],
        chainId: baseSepolia.id,
      })) as bigint;

      return Number(score);
    } catch (error) {
      console.error("Error reading on-chain score:", error);
      return 0;
    }
  }, [publicClient, contractAddress, address]);

  /**
   * Submit a new score to the blockchain
   * Only updates if the new score is higher than the current on-chain score
   */
  const submitScore = useCallback(
    async (score: number): Promise<boolean> => {
      if (!isConnected || !address || !walletClient || !contractAddress) {
        setSubmissionError("Please connect your wallet first");
        return false;
      }

      if (score <= 0) {
        setSubmissionError("Score must be greater than 0");
        return false;
      }

      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        // Check current on-chain score
        const currentScore = await getOnChainScore();

        if (score <= currentScore) {
          setSubmissionError(
            `Score ${score} is not higher than your current record of ${currentScore}`
          );
          setIsSubmitting(false);
          return false;
        }

        // Submit transaction
        const { request } = await publicClient!.simulateContract({
          account: address,
          address: contractAddress,
          abi: leaderboardAbi,
          functionName: "submitScore",
          args: [BigInt(score)],
          chainId: baseSepolia.id,
        });

        const hash = await walletClient.writeContract(request);

        console.log("Transaction sent:", hash);

        // Wait for transaction confirmation
        const receipt = await publicClient!.waitForTransactionReceipt({
          hash,
        });

        if (receipt.status === "success") {
          console.log("Score submitted successfully!");
          setIsSubmitting(false);
          return true;
        } else {
          setSubmissionError("Transaction failed");
          setIsSubmitting(false);
          return false;
        }
      } catch (error: any) {
        console.error("Error submitting score:", error);

        // Handle user rejection
        if (error.message?.includes("User rejected")) {
          setSubmissionError("Transaction cancelled");
        } else if (error.message?.includes("Score must be higher")) {
          setSubmissionError("Score must be higher than your current record");
        } else {
          setSubmissionError(
            error.shortMessage || error.message || "Failed to submit score"
          );
        }

        setIsSubmitting(false);
        return false;
      }
    },
    [isConnected, address, walletClient, contractAddress, publicClient, getOnChainScore]
  );

  /**
   * Clear submission error
   */
  const clearError = useCallback(() => {
    setSubmissionError(null);
  }, []);

  return {
    submitScore,
    getOnChainScore,
    isSubmitting,
    submissionError,
    clearError,
    isConnected,
    address,
  };
}
