import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { flowMainnet } from "wagmi/chains";
import leaderboardAbi from "../lib/FlowPepeLeaderboard.abi.json";

export default function useOnChainScore() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: flowMainnet.id });
  const { data: walletClient } = useWalletClient(); // Don't specify chainId here - get client for current chain
  const { switchChainAsync } = useSwitchChain();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Contract address for Flow Mainnet
  const contractAddress = (process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS || "") as `0x${string}`;

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
      console.log("=== Submit Score Debug ===");
      console.log("isConnected:", isConnected);
      console.log("address:", address);
      console.log("chainId:", chainId);
      console.log("expected chainId:", flowMainnet.id);
      console.log("walletClient:", !!walletClient);
      console.log("publicClient:", !!publicClient);
      console.log("contractAddress:", contractAddress);

      if (!isConnected) {
        setSubmissionError("Wallet not connected");
        return false;
      }

      if (!address) {
        setSubmissionError("No wallet address found");
        return false;
      }

      // Auto-switch to Flow Mainnet if on wrong network
      if (chainId !== flowMainnet.id) {
        console.log(`Wrong network detected (${chainId}), switching to Flow Mainnet...`);
        setSubmissionError("Switching to Flow Mainnet network...");
        try {
          await switchChainAsync({ chainId: flowMainnet.id });
          console.log("Successfully switched to Flow Mainnet");
          setSubmissionError(null); // Clear the switching message

          // Wait a moment for wallet client to update after chain switch
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          console.error("Error switching chain:", error);
          if (error.message?.includes("rejected") || error.message?.includes("denied")) {
            setSubmissionError(`Network switch cancelled. Please switch to Flow Mainnet in your wallet.`);
          } else {
            setSubmissionError(`Failed to switch network. Please switch to Flow Mainnet manually in your wallet.`);
          }
          setIsSubmitting(false);
          return false;
        }
      }

      if (!walletClient) {
        console.log("Wallet client details:", { walletClient, isConnected, address, chainId });
        setSubmissionError("Wallet client not ready. Please try again in a moment.");
        setIsSubmitting(false);
        return false;
      }

      if (!contractAddress) {
        setSubmissionError("Contract address not configured");
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

        // Submit transaction - explicitly specify chain
        const { request } = await publicClient!.simulateContract({
          account: address,
          address: contractAddress,
          abi: leaderboardAbi,
          functionName: "submitScore",
          args: [BigInt(score)],
          chain: flowMainnet, // Explicitly set chain to Flow Mainnet
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
    [isConnected, address, chainId, walletClient, contractAddress, publicClient, getOnChainScore, switchChainAsync]
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
