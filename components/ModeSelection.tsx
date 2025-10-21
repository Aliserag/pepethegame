import React from "react";

export type GameMode = "fun" | "degen";

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-50">
      <div className="text-center p-6 max-w-2xl mx-auto">
        <h1
          className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Choose Your Mode
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Fun Mode Card */}
          <div
            onClick={() => onSelectMode("fun")}
            className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-xl border-4 border-blue-500 cursor-pointer hover:scale-105 transition-transform shadow-2xl"
          >
            <div className="text-4xl mb-4">🎮</div>
            <h2
              className="text-white text-2xl font-bold mb-3"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Fun Mode
            </h2>
            <p className="text-blue-200 text-sm mb-4">
              Play for free, compete on the leaderboard, and have fun!
            </p>
            <ul className="text-left text-blue-100 text-xs space-y-2 mb-6">
              <li>✓ Unlimited plays</li>
              <li>✓ Free to play</li>
              <li>✓ Compete for top score</li>
              <li>✓ Normal speed progression</li>
            </ul>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Play Free
            </button>
          </div>

          {/* DEGEN Mode Card */}
          <div
            onClick={() => onSelectMode("degen")}
            className="bg-gradient-to-br from-green-900 to-emerald-700 p-6 rounded-xl border-4 border-green-500 cursor-pointer hover:scale-105 transition-transform shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-yellow-500 text-black px-3 py-1 text-xs font-bold rotate-12 transform translate-x-2 -translate-y-2">
              EARN $$$
            </div>
            <div className="text-4xl mb-4">💰</div>
            <h2
              className="text-white text-2xl font-bold mb-3"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              DEGEN Mode
            </h2>
            <p className="text-green-200 text-sm mb-4">
              Play to earn! $5 entry, win from the prize pool!
            </p>
            <ul className="text-left text-green-100 text-xs space-y-2 mb-6">
              <li>✓ $5 entry fee per day</li>
              <li>✓ Win from prize pool</li>
              <li>✓ Exponential multipliers</li>
              <li>✓ 2x faster speed</li>
              <li>✓ Higher scores = more $</li>
            </ul>
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-sm animate-pulse"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Play for $$$
            </button>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-xs max-w-md mx-auto">
          <p className="mb-2">
            💡 <strong>DEGEN Mode:</strong> Fair play-to-earn with daily resets
          </p>
          <p>
            The farther you go and the faster your speed, the more you can earn
            from the prize pool!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
