import React from "react";

interface LeaderboardEntry {
  address: string;
  score: number;
  multiplier: number;
  reward: string;
}

interface DegenLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  userAddress?: string;
  playerRank: { rank: number; totalPlayers: number } | null;
  userReward?: string;
}

const DegenLeaderboard: React.FC<DegenLeaderboardProps> = ({
  leaderboard,
  userAddress,
  playerRank,
  userReward = "0",
}) => {
  // Find user's entry in leaderboard
  const userEntry = userAddress
    ? leaderboard.find(
        (entry) => entry.address.toLowerCase() === userAddress.toLowerCase()
      )
    : null;

  // Show top 10
  const top10 = leaderboard.slice(0, 10);

  // If user is not in top 10, show them separately
  const showUserSeparately =
    userAddress &&
    userEntry &&
    !top10.some(
      (entry) => entry.address.toLowerCase() === userAddress.toLowerCase()
    );

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatMultiplier = (mult: number) => {
    return (mult / 100).toFixed(2) + "x";
  };

  return (
    <div className="bg-gray-900 border-2 border-gray-700 p-4 rounded-lg">
      <h3
        className="text-green-400 text-sm font-bold mb-3 text-center"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        🏆 Daily Leaderboard
      </h3>

      {leaderboard.length === 0 ? (
        <div className="text-gray-400 text-xs text-center py-4">
          No scores yet. Be the first to play!
        </div>
      ) : (
        <>
          {/* Top 10 */}
          <div className="space-y-2 mb-4">
            {top10.map((entry, index) => {
              const isUser =
                userAddress &&
                entry.address.toLowerCase() === userAddress.toLowerCase();
              return (
                <div
                  key={entry.address}
                  className={`p-2 rounded border-2 transition-all ${
                    isUser
                      ? "bg-yellow-900 bg-opacity-30 border-yellow-500"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank */}
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded font-bold text-xs ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-400 text-black"
                          : index === 2
                          ? "bg-orange-700 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                      style={
                        index < 3
                          ? { fontFamily: "'Press Start 2P', cursive" }
                          : {}
                      }
                    >
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </div>

                    {/* Address */}
                    <div className="flex-1 ml-3">
                      <div
                        className={`text-xs font-mono ${
                          isUser ? "text-yellow-300 font-bold" : "text-gray-300"
                        }`}
                      >
                        {formatAddress(entry.address)}
                        {isUser && (
                          <span className="ml-2 text-yellow-400 text-xs">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Score: {entry.score} • {formatMultiplier(entry.multiplier)}
                      </div>
                    </div>

                    {/* Reward */}
                    <div
                      className={`text-right ${
                        isUser ? "text-yellow-300" : "text-green-400"
                      }`}
                    >
                      <div
                        className="text-sm font-bold"
                        style={{ fontFamily: "'Press Start 2P', cursive" }}
                      >
                        {parseFloat(entry.reward).toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-400">ETH</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User's position if not in top 10 */}
          {showUserSeparately && userEntry && playerRank && (
            <>
              <div className="border-t border-gray-700 my-3"></div>
              <div className="text-gray-400 text-xs text-center mb-2">
                Your Rank
              </div>
              <div className="p-2 rounded border-2 bg-yellow-900 bg-opacity-30 border-yellow-500">
                <div className="flex items-center justify-between">
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-700 text-gray-300 font-bold text-xs">
                    #{playerRank.rank}
                  </div>

                  {/* Address */}
                  <div className="flex-1 ml-3">
                    <div className="text-xs font-mono text-yellow-300 font-bold">
                      {formatAddress(userEntry.address)}
                      <span className="ml-2 text-yellow-400 text-xs">
                        (You)
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Score: {userEntry.score} • {formatMultiplier(userEntry.multiplier)}
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="text-right text-yellow-300">
                    <div
                      className="text-sm font-bold"
                      style={{ fontFamily: "'Press Start 2P', cursive" }}
                    >
                      {parseFloat(userEntry.reward).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-400">ETH</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Info note */}
          <div className="mt-3 p-2 bg-gray-800 border border-gray-700 rounded">
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 Leaderboard updates in real-time. Rewards are calculated based
              on score, multiplier, and pool size.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DegenLeaderboard;
