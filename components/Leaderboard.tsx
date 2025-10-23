import React, { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import leaderboardAbi from "../lib/FlowPepeLeaderboard.abi.json";

interface LeaderboardEntry {
  address: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  refreshTrigger?: number; // When this changes, refresh the leaderboard
}

const Leaderboard: React.FC<LeaderboardProps> = ({ refreshTrigger }) => {
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient({ chainId: baseSepolia.id });

  // Hardcode the contract address as fallback if env var doesn't work
  const contractAddress = (process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS || "0xb5060b6a8a2c59f2b161f7ad2591fcafdebfb00c") as `0x${string}`;

  useEffect(() => {
    console.log("=== Leaderboard Debug ===");
    console.log("Contract Address:", contractAddress);
    console.log("Public Client:", !!publicClient);
    loadLeaderboard();
  }, []);

  // Auto-refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      console.log("Leaderboard: Auto-refreshing due to trigger change");
      loadLeaderboard();
    }
  }, [refreshTrigger]);

  async function loadLeaderboard() {
    if (!publicClient || !contractAddress) {
      console.log("Leaderboard: Missing publicClient or contractAddress");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Leaderboard: Fetching top scores...");

      // Read top 10 scores from contract
      const result = (await publicClient.readContract({
        address: contractAddress,
        abi: leaderboardAbi,
        functionName: "getTopScores",
        args: [10n],
      })) as [readonly string[], readonly bigint[]];

      const [addresses, scores] = result;
      console.log("Leaderboard: Fetched", addresses.length, "scores");

      // Format leaderboard data
      const leaderboard: LeaderboardEntry[] = addresses.map(
        (address, index) => ({
          address,
          score: Number(scores[index]),
          rank: index + 1,
        })
      );

      console.log("Leaderboard data:", leaderboard);
      setTopScores(leaderboard);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  if (loading) {
    return (
      <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white">
        <h2
          className="text-xl font-bold mb-4 text-center"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Leaderboard
        </h2>
        <p className="text-center text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!contractAddress) {
    return (
      <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white">
        <h2
          className="text-xl font-bold mb-4 text-center"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Leaderboard
        </h2>
        <p className="text-center text-gray-400 text-sm">
          Contract not configured
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white shadow-xl">
      <h2
        className="text-xl font-bold mb-4 text-center text-green-400"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        🏆 Top Scores
      </h2>

      {topScores.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          No scores yet. Be the first! 🐸
        </p>
      ) : (
        <div className="space-y-2">
          {topScores.map((entry) => (
            <div
              key={entry.address}
              className={`flex items-center justify-between p-3 rounded ${
                entry.rank === 1
                  ? "bg-yellow-900 border-2 border-yellow-500"
                  : entry.rank === 2
                  ? "bg-gray-700 border-2 border-gray-400"
                  : entry.rank === 3
                  ? "bg-orange-900 border-2 border-orange-600"
                  : "bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-bold ${
                    entry.rank === 1
                      ? "text-yellow-300"
                      : entry.rank === 2
                      ? "text-gray-300"
                      : entry.rank === 3
                      ? "text-orange-400"
                      : "text-gray-400"
                  }`}
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  #{entry.rank}
                </span>
                <span className="text-sm text-gray-300 font-mono">
                  {formatAddress(entry.address)}
                </span>
              </div>
              <span
                className="text-green-400 font-bold text-lg"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={loadLeaderboard}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        Refresh
      </button>
    </div>
  );
};

export default Leaderboard;
