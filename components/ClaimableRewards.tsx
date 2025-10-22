import React, { useState } from "react";
import useDegenMode from "../hooks/useDegenMode";

const ClaimableRewards: React.FC = () => {
  const {
    claimableRewards,
    lifetimeEarnings,
    claimReward,
    claimAllRewards,
    isClaiming,
    error,
    loadData
  } = useDegenMode();

  const [claimingDay, setClaimingDay] = useState<number | null>(null);

  const handleClaimSingle = async (day: number) => {
    setClaimingDay(day);
    const success = await claimReward(day);
    if (success) {
      await loadData();
    }
    setClaimingDay(null);
  };

  const handleClaimAll = async () => {
    const success = await claimAllRewards();
    if (success) {
      await loadData();
    }
  };

  function formatEarnings(earnings: string) {
    const value = parseFloat(earnings);
    if (value === 0) return "0 ETH";
    if (value < 0.0001) return "< 0.0001 ETH";
    return `${value.toFixed(4)} ETH`;
  }

  const totalClaimable = claimableRewards.reduce(
    (sum, reward) => sum + parseFloat(reward.amount),
    0
  );

  return (
    <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 text-white shadow-xl">
      <h2
        className="text-xl font-bold mb-2 text-center text-green-400"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        💰 Your Rewards
      </h2>

      {/* Lifetime Earnings */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 border-2 border-purple-500 p-4 rounded mb-4">
        <p className="text-xs text-purple-200 text-center mb-1">
          Lifetime Earnings
        </p>
        <p
          className="text-2xl text-center text-yellow-300 font-bold"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          {formatEarnings(lifetimeEarnings)}
        </p>
      </div>

      {/* Claimable Rewards Section */}
      {claimableRewards.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm mb-2">No pending rewards</p>
          <p className="text-xs text-gray-500">
            Play DEGEN Mode and score above 80% of the high score to earn rewards! 🐸
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 p-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Claimable</span>
              <span
                className="text-lg text-green-400 font-bold"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {formatEarnings(totalClaimable.toString())}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {claimableRewards.map((reward) => (
              <div
                key={reward.day}
                className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
              >
                <div className="flex flex-col">
                  <span
                    className="text-sm text-blue-400 font-bold"
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                  >
                    Day {reward.day}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {formatEarnings(reward.amount)}
                  </span>
                </div>
                <button
                  onClick={() => handleClaimSingle(reward.day)}
                  disabled={isClaiming}
                  className={`px-3 py-2 rounded text-xs font-bold transition-colors ${
                    isClaiming && claimingDay === reward.day
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  {isClaiming && claimingDay === reward.day ? "..." : "Claim"}
                </button>
              </div>
            ))}
          </div>

          {/* Claim All Button */}
          {claimableRewards.length > 1 && (
            <button
              onClick={handleClaimAll}
              disabled={isClaiming}
              className={`w-full py-3 rounded font-bold transition-colors ${
                isClaiming
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              }`}
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {isClaiming ? "Claiming..." : `Claim All (${claimableRewards.length} Days)`}
            </button>
          )}
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900 border-2 border-red-500 rounded">
          <p className="text-xs text-red-200 text-center">{error}</p>
        </div>
      )}

      {/* Info Text */}
      <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded">
        <p className="text-xs text-blue-200 leading-relaxed">
          💡 <strong>Tip:</strong> Rewards never expire! You can claim them whenever you want.
          Each successful claim adds to your lifetime earnings and Hall of Fame ranking.
        </p>
      </div>
    </div>
  );
};

export default ClaimableRewards;
