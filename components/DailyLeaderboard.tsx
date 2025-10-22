import React, { useState, useEffect } from "react";

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
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Calculate time remaining until day ends
  useEffect(() => {
    const updateCountdown = () => {
      if (!dayStats || dayStats.dayStart === 0) {
        setTimeRemaining("");
        return;
      }

      const dayStartTimestamp = dayStats.dayStart;
      const dayEndTimestamp = dayStartTimestamp + (24 * 60 * 60); // +1 day in seconds
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const remaining = dayEndTimestamp - now;

      if (remaining <= 0) {
        setTimeRemaining("Period ended");
        return;
      }

      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [dayStats]);

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
        className="text-xl font-bold mb-2 text-center text-green-400"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        {isCurrentDay ? "📊 Today's Stats" : `📅 Day ${targetDay} Stats`}
      </h2>

      {dayStats.dayStart > 0 && (
        <p className="text-xs text-gray-400 text-center mb-1">
          {formatTime(dayStats.dayStart)}
        </p>
      )}

      {/* Countdown Timer */}
      {isCurrentDay && timeRemaining && (
        <div className="bg-yellow-900 border border-yellow-600 p-2 rounded mb-4">
          <div className="text-xs text-yellow-200 text-center mb-1">
            ⏱️ Time Remaining
          </div>
          <div
            className="text-yellow-300 text-sm font-bold text-center"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            {timeRemaining}
          </div>
        </div>
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
              className="text-lg text-white font-bold"
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
          <div className="bg-green-900 border-2 border-green-500 p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-300">Your Rank</span>
              <span
                className="text-lg text-green-300 font-bold"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                #{playerRank.rank}
              </span>
            </div>
            <p className="text-xs text-green-200 mt-1 text-center">
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
        className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-xs transition-colors"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        Refresh
      </button>
    </div>
  );
};

export default DailyLeaderboard;
