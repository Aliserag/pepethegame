import React from "react";

export type GameMode = "fun" | "degen";

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-50 overflow-y-auto">
      <div className="text-center p-3 sm:p-6 max-w-2xl mx-auto w-full">
        <h1
          className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Choose Mode
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-8">
          {/* Fun Mode Card */}
          <div
            onClick={() => onSelectMode("fun")}
            className="bg-gradient-to-br from-blue-900 to-blue-700 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 sm:border-4 border-blue-500 cursor-pointer hover:scale-105 transition-transform shadow-2xl"
          >
            <div className="text-2xl sm:text-3xl mb-2">🎮</div>
            <h2
              className="text-white text-base sm:text-xl font-bold mb-2"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Fun Mode
            </h2>
            <p className="text-blue-200 text-xs sm:text-sm mb-2 sm:mb-3">
              Free play, compete on leaderboard!
            </p>
            <ul className="text-left text-blue-100 text-xs space-y-1 mb-3 sm:mb-4">
              <li>✓ Unlimited plays</li>
              <li>✓ Free to play</li>
              <li>✓ Top score</li>
            </ul>
            <div
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-lg text-xs sm:text-sm text-center"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Play Free
            </div>
          </div>

          {/* DEGEN Mode Card */}
          <div
            onClick={() => onSelectMode("degen")}
            className="bg-gradient-to-br from-green-900 to-emerald-700 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 sm:border-4 border-green-500 cursor-pointer hover:scale-105 transition-transform shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-yellow-500 text-black px-2 py-0.5 text-[10px] sm:text-xs font-bold rotate-12 transform translate-x-1 -translate-y-1">
              EARN $
            </div>
            <div className="text-2xl sm:text-3xl mb-2">💰</div>
            <h2
              className="text-white text-base sm:text-xl font-bold mb-2"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              DEGEN Mode
            </h2>
            <p className="text-green-200 text-xs sm:text-sm mb-2 sm:mb-3">
              Play to earn! $5 entry, prize pool!
            </p>
            <ul className="text-left text-green-100 text-xs space-y-1 mb-3 sm:mb-4">
              <li>✓ $5 entry/play</li>
              <li>✓ Win from pool</li>
              <li>✓ Exp. multipliers</li>
            </ul>
            <div
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-lg text-xs sm:text-sm text-center animate-pulse"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Play for $$$
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-6 text-gray-400 text-[10px] sm:text-xs max-w-md mx-auto px-2">
          <p>
            💡 Higher scores + faster speed = more earnings!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
