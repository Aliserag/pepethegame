import React from "react";

interface PayoutBreakdownProps {
  dayStats: {
    highScore: number;
    totalPool: string;
  } | null;
  playerScore: number;
  multiplier: number;
  minScoreThreshold: number; // 80% of high score
}

const PayoutBreakdown: React.FC<PayoutBreakdownProps> = ({
  dayStats,
  playerScore,
  multiplier,
  minScoreThreshold,
}) => {
  if (!dayStats || dayStats.highScore === 0) {
    return (
      <div className="bg-gray-900 border-2 border-gray-700 p-4 rounded-lg">
        <h3
          className="text-green-400 text-sm font-bold mb-3 text-center"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          💰 Payout Breakdown
        </h3>
        <p className="text-gray-400 text-xs text-center">
          No scores yet. Be the first to play!
        </p>
      </div>
    );
  }

  const poolAmount = parseFloat(dayStats.totalPool);
  const highScore = dayStats.highScore;
  const threshold = Math.floor(highScore * 0.8);

  // Calculate example payouts for different score levels
  const calculatePayout = (score: number, scoreMultiplier: number) => {
    if (score < threshold) return 0;

    // Base reward: (Score / High Score) × Pool
    const baseReward = (score / highScore) * poolAmount;

    // Apply multiplier (in basis points, 100 = 1.0x)
    const multipliedReward = (baseReward * scoreMultiplier) / 100;

    // Cap at 50% of pool
    const maxPayout = poolAmount * 0.5;
    return Math.min(multipliedReward, maxPayout);
  };

  // Example scores to show
  const examples = [
    {
      label: "High Score",
      score: highScore,
      multiplier: 100 + highScore * 4,
      color: "text-yellow-300",
      bgColor: "bg-yellow-900 border-yellow-600",
    },
    {
      label: "95% of High",
      score: Math.floor(highScore * 0.95),
      multiplier: 100 + Math.floor(highScore * 0.95) * 4,
      color: "text-green-300",
      bgColor: "bg-green-900 border-green-600",
    },
    {
      label: "90% of High",
      score: Math.floor(highScore * 0.9),
      multiplier: 100 + Math.floor(highScore * 0.9) * 4,
      color: "text-green-300",
      bgColor: "bg-green-900 border-green-600",
    },
    {
      label: "80% (Min)",
      score: threshold,
      multiplier: 100 + threshold * 4,
      color: "text-gray-300",
      bgColor: "bg-gray-800 border-gray-600",
    },
  ];

  // Check if player qualifies
  const playerQualifies = playerScore >= threshold;
  const playerPayout = calculatePayout(playerScore, multiplier);

  return (
    <div className="bg-gray-900 border-2 border-gray-700 p-4 rounded-lg">
      <h3
        className="text-green-400 text-sm font-bold mb-3 text-center"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        💰 Projected Payouts
      </h3>

      {/* Player's Projected Earnings */}
      {playerScore > 0 && (
        <div
          className={`mb-4 p-3 rounded-lg border-2 ${
            playerQualifies
              ? "bg-green-900 bg-opacity-30 border-green-500"
              : "bg-red-900 bg-opacity-30 border-red-500"
          }`}
        >
          <div className="text-xs text-gray-300 mb-1 text-center">
            Your Projected Earnings
          </div>
          {playerQualifies ? (
            <div
              className="text-green-300 text-lg font-bold text-center"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              ~{playerPayout.toFixed(4)} ETH
            </div>
          ) : (
            <div className="text-center">
              <div className="text-red-300 text-xs font-bold mb-1">
                Below 80% Threshold
              </div>
              <div className="text-gray-400 text-xs">
                Need {threshold - playerScore} more points to qualify
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threshold Info */}
      <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 p-2 rounded mb-3">
        <div className="text-yellow-200 text-xs text-center">
          ⚠️ Must score ≥{threshold} ({(80).toFixed(0)}% of high score) to earn
        </div>
      </div>

      {/* Example Payouts */}
      <div className="space-y-2">
        <div className="text-gray-400 text-xs mb-2">Example Payouts:</div>
        {examples.map((example, index) => {
          const payout = calculatePayout(example.score, example.multiplier);
          return (
            <div
              key={index}
              className={`p-2 rounded border ${example.bgColor}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-300 text-xs">{example.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    Score: {example.score} • {(example.multiplier / 100).toFixed(
                      2
                    )}x
                  </div>
                </div>
                <div
                  className={`${example.color} text-sm font-bold`}
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  {payout > 0 ? `~${payout.toFixed(4)} ETH` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pool Info */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Total Pool</span>
          <span className="text-green-400 font-bold">
            {dayStats.totalPool} ETH
          </span>
        </div>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-gray-400">Max Payout (50%)</span>
          <span className="text-yellow-300 font-bold">
            {(poolAmount * 0.5).toFixed(4)} ETH
          </span>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-3 p-2 bg-gray-800 border border-gray-700 rounded">
        <p className="text-xs text-gray-400 leading-relaxed">
          💡 Payouts are proportional to your score and multiplier. Higher
          scores earn exponentially more!
        </p>
      </div>
    </div>
  );
};

export default PayoutBreakdown;
