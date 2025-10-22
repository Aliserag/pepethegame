import React from "react";

interface DayStats {
  highScore: number;
  highScorer: string;
  totalPool: string;
  totalPlayers: number;
  dayStart: number;
}

interface DailyLeaderboardProps {
  currentDay: number;
  dayStats: DayStats | null;
  playerRank: { rank: number; totalPlayers: number } | null;
  loading: boolean;
  onRefresh?: () => void;
  day?: number; // If not provided, uses current day
}

const DailyLeaderboard: React.FC<DailyLeaderboardProps> = ({
  currentDay,
  dayStats,
  playerRank,
  loading,
  onRefresh,
  day
}) => {
  const targetDay = day !== undefined ? day : currentDay;

  const handleRefresh = () => {
    onRefresh?.();
  };

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
        onClick={handleRefresh}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        Refresh
      </button>
    </div>
  );
};

export default DailyLeaderboard;
