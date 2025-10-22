import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import FlappyBird from "./FlappyBird";
import Footer from "./Footer";
import Background from "./Background";
import useGame from "../hooks/useGame";
import Pipes from "./Pipes";
import useElementSize from "../hooks/useElementSize";
import { useFarcaster } from "../components/FarcasterProvider";
import WalletConnect from "./WalletConnect";
import useScores from "../hooks/useScores";
import useOnChainScore from "../hooks/useOnChainScore";
import Leaderboard from "./Leaderboard";
import { useAccount, useConnect } from "wagmi";
import _ from "lodash";
import ModeSelection, { GameMode } from "./ModeSelection";
import useDegenMode from "../hooks/useDegenMode";
import HallOfFame from "./HallOfFame";
import DailyLeaderboard from "./DailyLeaderboard";
import ClaimableRewards from "./ClaimableRewards";
import PayoutBreakdown from "./PayoutBreakdown";
import DegenLeaderboard from "./DegenLeaderboard";

export default function Game() {
  const { user } = useFarcaster();
  const { address, isConnected: isWalletConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Find Farcaster connector
  const farcasterConnector = connectors.find(
    (connector) => connector.id === "farcasterMiniApp"
  );

  // Prioritize Farcaster FID if available, otherwise use wallet address
  const userId = user?.fid?.toString() || address || "anonymous";
  const { totalScore, topScore, saveScore } = useScores(userId);
  const {
    submitScore: submitOnChainScore,
    getOnChainScore,
    isSubmitting,
    submissionError,
    clearError,
    isConnected,
  } = useOnChainScore();

  // DEGEN Mode integration
  const {
    hasPlayed,
    hasEntered,
    currentPool,
    entryFee,
    potentialReward,
    currentDay,
    isEntering,
    isSubmitting: isSubmittingDegen,
    isClaiming,
    error: degenError,
    processingMessage: degenProcessingMessage,
    enterGame,
    submitScore: submitDegenScore,
    claimReward,
    claimAllRewards,
    calculateMultiplier,
    calculatePotentialEarnings,
    loadData: loadDegenData,
    resetEntry,
    clearError: clearDegenError,
    hallOfFame,
    claimableRewards,
    lifetimeEarnings,
    dayStats,
    playerRank,
    loadingStats,
    playerCurrentDayScore,
    leaderboard,
  } = useDegenMode();

  const {
    handleWindowClick,
    startGame,
    isReady,
    isStarted,
    rounds,
    isGameOver,
    resetGame,
    clickCount,
    bestClickCount,
    lastGameScore,
  } = useGame();
  const [ref, window] = useElementSize();
  const [isMuted, setIsMuted] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);


  useEffect(() => {
    if (window.width > 0 && window.height > 0 && selectedMode) {
      startGame(window, selectedMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.width, window.height, selectedMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      if (isStarted && !isMuted) {
        audioRef.current.play().catch((error) => console.log(error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isStarted, isMuted]);

  const handleStartClick = () => {
    setShowIntro(false);
    handleWindowClick();
  };

  const handleTryAgainClick = () => {
    // Reset all game state first
    setFinalScore(0);
    setShowGameOver(false);
    setScoreSubmitted(false);
    setIsNewHighScore(false);
    setCurrentOnChainScore(0);
    setDegenScoreSubmitted(false);
    setActiveTab("results");
    clearError();
    clearDegenError();
    resetGame(); // Reset game state last to ensure clean state

    // In DEGEN mode, require entry fee payment again
    if (selectedMode === "degen") {
      resetEntry(); // Reset DEGEN entry state
      setShowIntro(true); // Show intro screen to require entry payment
    } else {
      // Fun mode: restart immediately
      handleWindowClick();
    }
  };

  const [currentOnChainScore, setCurrentOnChainScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Fetch user's on-chain score when connected (for intro screen display)
  useEffect(() => {
    const fetchUserScore = async () => {
      if (isConnected && selectedMode === "fun") {
        const onChainScore = await getOnChainScore();
        setCurrentOnChainScore(onChainScore);
      }
    };
    fetchUserScore();
  }, [isConnected, selectedMode, getOnChainScore]);

  // Check if this is a new high score when game ends
  useEffect(() => {
    const checkHighScore = async () => {
      if (isGameOver && isConnected && finalScore > 0) {
        const onChainScore = await getOnChainScore();
        setCurrentOnChainScore(onChainScore);
        setIsNewHighScore(finalScore > onChainScore);
      }
    };
    checkHighScore();
  }, [isGameOver, isConnected, finalScore, getOnChainScore]);

  const handleSubmitOnChain = async () => {
    if (finalScore > 0 && !scoreSubmitted) {
      const success = await submitOnChainScore(finalScore);
      if (success) {
        setScoreSubmitted(true);
      }
    }
  };

  const handleConnectWallet = () => {
    // Connect to Farcaster wallet if available, otherwise show connector selection
    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleSubmitDegenScore = async () => {
    if (finalScore > 0 && !degenScoreSubmitted && selectedMode === "degen") {
      // Prevent submission if score is not better than current best
      if (finalScore <= playerCurrentDayScore) {
        clearDegenError();
        return;
      }

      clearDegenError(); // Clear any previous errors
      const success = await submitDegenScore(finalScore);
      if (success) {
        setDegenScoreSubmitted(true);
        // Reload data to update payout breakdown and player's current score
        await loadDegenData();
      }
    }
  };

  const handleModeSelection = async (mode: GameMode) => {
    // Clear any previous errors
    clearError();
    clearDegenError();

    setSelectedMode(mode);
    setShowModeSelection(false);

    if (mode === "fun") {
      // For Fun Mode, go directly to intro screen
      setShowIntro(true);
    } else {
      // For DEGEN Mode, show intro screen (no once-per-day restriction)
      setShowIntro(true);
    }
  };

  const handleDegenEntry = async () => {
    if (!isWalletConnected) {
      // Connect wallet first
      handleConnectWallet();
      return;
    }

    // Ensure game state is reset before entry
    setShowGameOver(false);
    setFinalScore(0);
    resetGame();

    const success = await enterGame();
    if (success) {
      // Entry successful, can now start game
      setShowIntro(false);
      handleWindowClick();
    }
  };

  const [degenScoreSubmitted, setDegenScoreSubmitted] = useState(false);
  const [showAlreadyPlayedModal, setShowAlreadyPlayedModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "leaderboard" | "rewards">("results");
  const [, setCountdownTick] = useState(0); // Force countdown updates
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      setShowGameOver(true);
      // Save the score when game is over (use lastGameScore which is the current game's score)
      if (lastGameScore > 0) {
        // Always save to localStorage
        saveScore(lastGameScore);
        setFinalScore(lastGameScore);
        setScoreSubmitted(false);
        // Don't reset degenScoreSubmitted here - only reset when starting new game

        // For DEGEN mode, reload data to get latest player score
        if (selectedMode === "degen") {
          loadDegenData();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, lastGameScore, selectedMode]);

  // Update countdown every second
  useEffect(() => {
    if (selectedMode === "degen" && showGameOver) {
      const interval = setInterval(() => {
        setCountdownTick(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedMode, showGameOver]);

  return (
    <div className="relative w-full h-full">
      <audio ref={audioRef} src="/jeet.m4a" />

      {/* Mode Selection Screen */}
      {showModeSelection && (
        <ModeSelection onSelectMode={handleModeSelection} />
      )}

      {/* Already Played Today Modal */}
      {showAlreadyPlayedModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-[100]">
          <div className="bg-gradient-to-br from-orange-900 to-red-900 p-8 rounded-xl border-4 border-orange-500 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h2
                className="text-white text-2xl md:text-3xl font-bold mb-4"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Already Played!
              </h2>
              <p className="text-orange-200 text-sm mb-6 leading-relaxed">
                This modal should not appear anymore. If you see this, please report it as a bug.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowAlreadyPlayedModal(false);
                    handleModeSelection("fun");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  Play Fun Mode Instead
                </button>
                <button
                  onClick={() => setShowAlreadyPlayedModal(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-sm"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIntro && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="text-center p-4 max-w-sm mx-auto space-y-4">
            <h1
              className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              FlowPepe
            </h1>
            <h2
              className={`text-lg mb-3 ${selectedMode === "degen" ? "text-green-400" : "text-yellow-400"}`}
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {selectedMode === "degen" ? "DEGEN Mode 💰" : "Help Pepe Make It"}
            </h2>
            {user?.username && (
              <div
                className="text-green-400 text-xs mb-4"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                @{user.username}
              </div>
            )}

            {/* DEGEN Mode specific UI */}
            {selectedMode === "degen" && (
              <div className="space-y-3 mb-4">
                <div className="bg-green-900 bg-opacity-50 border-2 border-green-500 p-3 rounded-lg">
                  <div className="text-green-300 text-xs mb-1">Prize Pool</div>
                  <div className="text-white text-xl font-bold">
                    {currentPool === "0" && !isWalletConnected ? "Connect wallet to view" : `${currentPool} ETH`}
                  </div>
                </div>
                <div className="bg-yellow-900 bg-opacity-50 border-2 border-yellow-500 p-3 rounded-lg">
                  <div className="text-yellow-300 text-xs mb-1">Entry Fee</div>
                  <div className="text-white text-xl font-bold">{entryFee} ETH</div>
                </div>
                {degenError && (
                  <div className="text-red-400 text-xs">{degenError}</div>
                )}
              </div>
            )}

            {/* Start/Entry buttons based on mode */}
            {selectedMode === "fun" && (
              <button
                onClick={handleStartClick}
                className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center text-sm w-full"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                <span className="mr-2">START</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14m-7-7v14"
                  />
                </svg>
              </button>
            )}

            {selectedMode === "degen" && !hasEntered && (
              <>
                <button
                  onClick={handleDegenEntry}
                  disabled={isEntering}
                  className={`${
                    isEntering ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
                  } text-white font-bold py-3 px-6 rounded-lg text-sm w-full`}
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  {isEntering ? "Processing..." : `Pay ${entryFee} ETH to Enter`}
                </button>
                {degenProcessingMessage && (
                  <div className="text-blue-400 text-xs text-center animate-pulse bg-blue-900 bg-opacity-30 p-2 rounded">
                    ⏳ {degenProcessingMessage}
                  </div>
                )}
              </>
            )}

            {selectedMode === "degen" && hasEntered && (
              <button
                onClick={handleStartClick}
                className="bg-green-700 hover:bg-green-900 text-white font-bold py-3 px-6 rounded-lg text-sm w-full animate-pulse"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                START GAME
              </button>
            )}

            <WalletConnect />

            {selectedMode === "fun" && (
              <div
                className="mt-4 text-white text-sm"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {isConnected && currentOnChainScore > 0 ? (
                  <>Your Best: {currentOnChainScore}</>
                ) : isConnected ? (
                  <>Your Best: 0</>
                ) : (
                  <>Local Best: {topScore}</>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={() => {
                  clearError();
                  clearDegenError();
                  setShowIntro(false);
                  setShowModeSelection(true);
                  setSelectedMode(null);
                }}
                className="text-gray-400 text-xs hover:text-white"
              >
                ← Back to Mode Selection
              </button>

              {/* Leaderboard Button - Below Back button (DEGEN Mode only) */}
              {selectedMode === "degen" && (
                <button
                  onClick={() => setShowLeaderboardModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}
                >
                  🏆 Today's Leaderboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-[60] p-4">
          <div className="bg-gray-900 border-4 border-green-500 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-green-400 text-lg font-bold"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Today's Leaderboard
              </h2>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <DegenLeaderboard
              leaderboard={leaderboard}
              userAddress={address}
              playerRank={playerRank}
              userReward={potentialReward}
            />

            <button
              onClick={() => setShowLeaderboardModal(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 p-4 z-50 overflow-y-auto">
          <div className="max-w-md w-full space-y-6 flex flex-col items-center">
            <h1
              className="text-white text-4xl md:text-5xl font-bold text-center"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Game Over!
            </h1>

            <div
              className={`text-2xl md:text-3xl text-center ${selectedMode === "degen" ? "text-green-400" : "text-yellow-400"}`}
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Score: {finalScore}
            </div>

            {/* DEGEN Mode: Show if new high score for the day */}
            {selectedMode === "degen" && finalScore > playerCurrentDayScore && finalScore > 0 && (
              <div
                className="text-yellow-400 text-lg text-center animate-pulse"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                🎉 New Daily Best! 🎉
              </div>
            )}

            {/* DEGEN Mode specific info */}
            {selectedMode === "degen" && (
              <div className="w-full space-y-4">
                {/* Show warning if score is lower than current best */}
                {finalScore > 0 && finalScore <= playerCurrentDayScore && !degenScoreSubmitted && (
                  <div className="bg-yellow-900 bg-opacity-30 border-2 border-yellow-600 p-3 rounded-lg">
                    <div className="text-yellow-300 text-xs text-center font-bold mb-1">
                      ⚠️ Lower Score
                    </div>
                    <div className="text-gray-300 text-xs text-center">
                      Your current best today is {playerCurrentDayScore}. Only your highest score counts for rewards.
                    </div>
                  </div>
                )}

                {/* Primary Action Area */}
                {!degenScoreSubmitted ? (
                  <>
                    <button
                      onClick={handleSubmitDegenScore}
                      disabled={isSubmittingDegen || (finalScore > 0 && finalScore <= playerCurrentDayScore)}
                      className={`${
                        isSubmittingDegen || (finalScore > 0 && finalScore <= playerCurrentDayScore)
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-bold py-3 px-6 rounded-lg text-base w-full transition-all`}
                      style={{ fontFamily: "'Press Start 2P', cursive" }}
                    >
                      {isSubmittingDegen
                        ? "Processing..."
                        : finalScore > 0 && finalScore <= playerCurrentDayScore
                        ? "Score Not Better Than Current Best"
                        : "Submit Score 🏆"}
                    </button>
                    {degenProcessingMessage && (
                      <div className="text-blue-400 text-xs text-center animate-pulse bg-blue-900 bg-opacity-30 p-2 rounded">
                        ⏳ {degenProcessingMessage}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-500 p-4 rounded-lg">
                    <div className="text-green-400 text-sm text-center font-bold mb-2">
                      ✅ Score Submitted!
                    </div>
                    {potentialReward !== "0" && (
                      <div className="text-center">
                        <div className="text-gray-400 text-xs mb-1">Potential Earnings</div>
                        <div className="text-yellow-300 text-2xl font-bold">{potentialReward} ETH</div>
                        <div className="text-gray-500 text-xs mt-1">Claimable after period ends</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b-2 border-gray-700">
                  <button
                    onClick={() => setActiveTab("results")}
                    className={`flex-1 py-2 text-xs font-bold transition-all ${
                      activeTab === "results"
                        ? "text-green-400 border-b-2 border-green-400 -mb-[2px]"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                  >
                    Results
                  </button>
                  <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`flex-1 py-2 text-xs font-bold transition-all ${
                      activeTab === "leaderboard"
                        ? "text-green-400 border-b-2 border-green-400 -mb-[2px]"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setActiveTab("rewards")}
                    className={`flex-1 py-2 text-xs font-bold transition-all ${
                      activeTab === "rewards"
                        ? "text-green-400 border-b-2 border-green-400 -mb-[2px]"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                  >
                    {claimableRewards.length > 0 && (
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                    )}
                    Rewards
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px] max-h-[350px] overflow-y-auto">
                  {activeTab === "results" && (
                    <div className="space-y-4 p-3">
                      {/* Current Rank and Anticipated Earnings - Most Important */}
                      {playerRank && playerRank.rank > 0 && (
                        <div
                          className="bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-500 p-4 rounded-lg relative group"
                          title="Your current rank and projected earnings based on scores so far. This can change if other players score higher."
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="text-green-300 text-xs mb-1">Current Rank</div>
                              <div className="text-white text-2xl font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                #{playerRank.rank}
                              </div>
                            </div>
                            <div className="flex-1 text-right">
                              <div className="text-green-300 text-xs mb-1">Anticipated Earnings</div>
                              <div className="text-yellow-300 text-2xl font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                                {potentialReward || "0"} ETH
                              </div>
                            </div>
                          </div>
                          {/* Tooltip on hover */}
                          <div className="absolute hidden group-hover:block bottom-full left-0 right-0 mb-2 bg-gray-900 border border-green-500 p-2 rounded text-xs text-gray-300 z-10">
                            💡 Projected earnings based on current scores. This can change if other players score higher before the period ends.
                          </div>
                        </div>
                      )}

                      {/* Countdown Timer */}
                      {dayStats && dayStats.dayStart > 0 && (
                        <div className="bg-yellow-900 border-2 border-yellow-600 p-3 rounded-lg">
                          <div className="text-xs text-yellow-200 text-center mb-1">
                            ⏱️ Time Remaining
                          </div>
                          <div
                            className="text-yellow-300 text-base font-bold text-center"
                            style={{ fontFamily: "'Press Start 2P', cursive" }}
                          >
                            {(() => {
                              const dayEndTimestamp = dayStats.dayStart + (24 * 60 * 60);
                              const now = Math.floor(Date.now() / 1000);
                              const remaining = dayEndTimestamp - now;

                              if (remaining <= 0) return "Period ended";

                              const hours = Math.floor(remaining / 3600);
                              const minutes = Math.floor((remaining % 3600) / 60);
                              const seconds = remaining % 60;

                              return `${hours}h ${minutes}m ${seconds}s`;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "leaderboard" && (
                    <div className="p-2">
                      <DegenLeaderboard
                        leaderboard={leaderboard}
                        userAddress={address}
                        playerRank={playerRank}
                        userReward={potentialReward}
                      />
                    </div>
                  )}

                  {activeTab === "rewards" && (
                    <div className="p-2">
                      <ClaimableRewards
                        claimableRewards={claimableRewards}
                        lifetimeEarnings={lifetimeEarnings}
                        claimReward={claimReward}
                        claimAllRewards={claimAllRewards}
                        isClaiming={isClaiming}
                        error={degenError}
                      />
                    </div>
                  )}
                </div>

                {degenError && !isClaiming && !degenScoreSubmitted && !degenProcessingMessage && (
                  <div className="text-red-400 text-xs text-center bg-red-900 bg-opacity-30 p-2 rounded">
                    ❌ {degenError}
                  </div>
                )}
              </div>
            )}

            {/* Show if it's a new high score (Fun Mode only) */}
            {selectedMode === "fun" && isConnected && isNewHighScore && !scoreSubmitted && (
              <div
                className="text-green-400 text-lg text-center animate-pulse"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                🎉 New High Score! 🎉
              </div>
            )}

            {/* Current on-chain record (Fun Mode only) */}
            {selectedMode === "fun" && isConnected && currentOnChainScore > 0 && (
              <div
                className="text-gray-400 text-sm text-center"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Your Record: {currentOnChainScore}
              </div>
            )}

            <button
              onClick={handleTryAgainClick}
              className="bg-red-700 hover:bg-red-900 text-white font-bold py-3 px-6 rounded-lg text-xl md:text-2xl"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Try Again
            </button>

            {/* On-chain submission (Fun Mode only) */}
            {selectedMode === "fun" && !isConnected && (
              <button
                onClick={handleConnectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm w-full max-w-md"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Connect Wallet to Submit Score 🏆
              </button>
            )}

            {selectedMode === "fun" && isConnected && finalScore > 0 && (
              <div className="w-full flex flex-col items-center space-y-3">
                {!scoreSubmitted ? (
                  <>
                    {isNewHighScore && (
                      <div
                        className="text-white text-sm text-center"
                        style={{ fontFamily: "'Press Start 2P', cursive" }}
                      >
                        Save your new record to the blockchain!
                      </div>
                    )}
                    <button
                      onClick={handleSubmitOnChain}
                      disabled={isSubmitting || !isNewHighScore}
                      className={`${
                        isSubmitting || !isNewHighScore
                          ? "bg-gray-600"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-bold py-3 px-6 rounded-lg text-sm md:text-base w-full max-w-md`}
                      style={{ fontFamily: "'Press Start 2P', cursive" }}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : isNewHighScore
                        ? "Submit to Leaderboard 🏆"
                        : "Score not higher than record"}
                    </button>
                  </>
                ) : (
                  <div
                    className="text-green-400 text-sm md:text-base text-center"
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                  >
                    ✅ Score Submitted!
                  </div>
                )}
                {submissionError && (
                  <div className="text-red-400 text-xs text-center">
                    {submissionError}
                  </div>
                )}
              </div>
            )}

            {/* Leaderboards */}
            {selectedMode === "fun" && (
              <div className="w-full flex justify-center">
                <Leaderboard />
              </div>
            )}

            {/* Home Button - Navigate back to mode selection */}
            {selectedMode === "degen" && (
              <button
                onClick={() => {
                  setShowGameOver(false);
                  setShowModeSelection(true);
                  setSelectedMode(null);
                  resetGame();
                  resetEntry();
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                🏠 Home
              </button>
            )}

            {/* Home Button for Fun Mode */}
            {selectedMode === "fun" && (
              <button
                onClick={() => {
                  setShowGameOver(false);
                  setShowModeSelection(true);
                  setSelectedMode(null);
                  resetGame();
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                🏠 Home
              </button>
            )}
          </div>
        </div>
      )}
      <motion.main
        layout
        className="m-auto overflow-hidden flex flex-col max-w-[480px] border-8 border-zinc-200 rounded-xl bg-[#ded895] relative max-h-[800px] w-full h-full"
      >
        <Background />
        <motion.div
          ref={ref}
          key={_.last(rounds)?.key || "initial"}
          className="h-[calc(100%-7rem)] z-10 flex relative overflow-hidden cursor-pointer"
          onClick={showIntro || showGameOver ? undefined : handleWindowClick}
        >
          {isStarted && isReady && (
            <>
              <Pipes />
              <FlappyBird />
            </>
          )}
        </motion.div>
        <Footer isMuted={isMuted} toggleMute={toggleMute} />
      </motion.main>
    </div>
  );
}
