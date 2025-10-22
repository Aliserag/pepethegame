import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import useDegenMode from "../hooks/useDegenMode";

interface DayStats {
  highScore: number;
  highScorer: string;
  totalPool: string;
  totalPlayers: number;
  dayStart: number;
}

interface DailyLeaderboardProps {
  day?: number; // If not provided, uses current day
}

const DailyLeaderboard: React.FC<DailyLeaderboardProps> = ({ day }) => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const { currentDay, getPlayerRank } = useDegenMode();
  const [dayStats, setDayStats] = useState<DayStats | null>(null);
  const [playerRank, setPlayerRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const contractAddress = (process.env.NEXT_PUBLIC_DEGEN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
  const targetDay = day !== undefined ? day : currentDay;

  const degenAbi = [
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
    }
  ] as const;

  useEffect(() => {
    loadDayStats();
  }, [targetDay, address]);

  async function loadDayStats() {
    if (!publicClient || contractAddress === "0x0000000000000000000000000000000000000000") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get day stats
      const stats = await publicClient.readContract({
        address: contractAddress,
        abi: degenAbi,
        functionName: "getDayStats",
        args: [BigInt(targetDay)],
      }) as [bigint, string, bigint, bigint, bigint];

      setDayStats({
        highScore: Number(stats[0]),
        highScorer: stats[1],
        totalPool: (Number(stats[2]) / 1e18).toFixed(4),
        totalPlayers: Number(stats[3]),
        dayStart: Number(stats[4]),
      });

      // Get player's rank if they have an address
      if (address && getPlayerRank) {
        const rank = await getPlayerRank(targetDay);
        setPlayerRank(rank);
      }
    } catch (error) {
      console.error("Error loading daily stats:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white">
        <h2
          className="text-xl font-bold mb-4 text-center"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Daily Stats
        </h2>
        <p className="text-center text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!dayStats) {
    return (
      <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white">
        <h2
          className="text-xl font-bold mb-4 text-center"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Daily Stats
        </h2>
        <p className="text-center text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const isCurrentDay = targetDay === currentDay;
  const isPastDay = targetDay < currentDay;

  return (
    <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white shadow-xl">
      <h2
        className="text-xl font-bold mb-2 text-center text-blue-400"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        {isCurrentDay ? "📊 Today's Stats" : `📅 Day ${targetDay} Stats`}
      </h2>

      {dayStats.dayStart > 0 && (
        <p className="text-xs text-gray-400 text-center mb-4">
          {formatTime(dayStats.dayStart)}
        </p>
      )}

      <div className="space-y-3">
        {/* Prize Pool */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Prize Pool</span>
            <span
              className="text-lg text-green-400 font-bold"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {dayStats.totalPool} ETH
            </span>
          </div>
        </div>

        {/* Total Players */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Players</span>
            <span
              className="text-lg text-blue-400 font-bold"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {dayStats.totalPlayers}
            </span>
          </div>
        </div>

        {/* High Score */}
        {dayStats.highScore > 0 && (
          <div className="bg-yellow-900 border-2 border-yellow-500 p-3 rounded">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-300">High Score</span>
                <span
                  className="text-lg text-yellow-300 font-bold"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  {dayStats.highScore}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-yellow-200">Leader</span>
                <span className="text-xs text-yellow-200 font-mono">
                  {formatAddress(dayStats.highScorer)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Player's Rank (if applicable) */}
        {playerRank && playerRank.rank > 0 && (
          <div className="bg-purple-900 border-2 border-purple-500 p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-300">Your Rank</span>
              <span
                className="text-lg text-purple-300 font-bold"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                #{playerRank.rank}
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1 text-center">
              You placed {playerRank.rank} out of {playerRank.totalPlayers} players!
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="text-center">
          {isCurrentDay && (
            <span className="inline-block bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">
              🟢 LIVE
            </span>
          )}
          {isPastDay && (
            <span className="inline-block bg-gray-600 text-white px-3 py-1 rounded text-xs font-bold">
              ⏱️ ENDED
            </span>
          )}
        </div>
      </div>

      <button
        onClick={loadDayStats}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        Refresh
      </button>
    </div>
  );
};

export default DailyLeaderboard;
