import React from "react";
import useDegenMode from "../hooks/useDegenMode";

interface HallOfFameProps {
  onRefresh?: () => void;
}

const HallOfFame: React.FC<HallOfFameProps> = ({ onRefresh }) => {
  const { hallOfFame, loadData } = useDegenMode();

  const handleRefresh = async () => {
    await loadData();
    onRefresh?.();
  };

  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatEarnings(earnings: string) {
    const value = parseFloat(earnings);
    if (value === 0) return "0 ETH";
    if (value < 0.0001) return "< 0.0001 ETH";
    return `${value.toFixed(4)} ETH`;
  }

  return (
    <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white shadow-xl">
      <h2
        className="text-xl font-bold mb-4 text-center text-yellow-400"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        🏆 Hall of Fame
      </h2>
      <p className="text-xs text-gray-400 text-center mb-4">
        Top 10 All-Time Earners
      </p>

      {hallOfFame.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          No earners yet. Be the first to win! 🐸
        </p>
      ) : (
        <div className="space-y-2">
          {hallOfFame.map((entry, index) => {
            const rank = index + 1;
            return (
              <div
                key={entry.address}
                className={`flex items-center justify-between p-3 rounded ${
                  rank === 1
                    ? "bg-yellow-900 border-2 border-yellow-500"
                    : rank === 2
                    ? "bg-gray-700 border-2 border-gray-400"
                    : rank === 3
                    ? "bg-orange-900 border-2 border-orange-600"
                    : "bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-bold ${
                      rank === 1
                        ? "text-yellow-300"
                        : rank === 2
                        ? "text-gray-300"
                        : rank === 3
                        ? "text-orange-400"
                        : "text-gray-400"
                    }`}
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                  >
                    #{rank}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-300 font-mono">
                      {formatAddress(entry.address)}
                    </span>
                    {rank <= 3 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {rank === 1 ? "👑 Champion" : rank === 2 ? "🥈 Legend" : "🥉 Master"}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className="text-green-400 font-bold text-sm"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  {formatEarnings(entry.earnings)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleRefresh}
        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        Refresh
      </button>
    </div>
  );
};

export default HallOfFame;
