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
    enterGame,
    submitScore: submitDegenScore,
    claimReward,
    calculateMultiplier,
    calculatePotentialEarnings,
    loadData: loadDegenData,
    clearError: clearDegenError,
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
    resetGame();
    setShowGameOver(false);
    setScoreSubmitted(false);
    setIsNewHighScore(false);
    setCurrentOnChainScore(0);
    clearError();
    clearDegenError();

    // For DEGEN mode, go back to mode selection (can only play once per day)
    if (selectedMode === "degen") {
      setShowIntro(false);
      setShowModeSelection(true);
      setSelectedMode(null);
    } else {
      // For Fun mode, restart immediately
      handleWindowClick();
    }
  };

  const [currentOnChainScore, setCurrentOnChainScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

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
      console.log("Connecting to Farcaster wallet...");
      connect({ connector: farcasterConnector });
    } else if (connectors.length > 0) {
      console.log("Connecting to first available wallet...");
      connect({ connector: connectors[0] });
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
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
      // For DEGEN Mode, check if already entered today
      if (hasPlayed) {
        // Already played today - show message and go back to mode selection
        alert("You've already played DEGEN Mode today! Come back tomorrow or play Fun Mode.");
        setShowModeSelection(true);
        setSelectedMode(null);
      } else if (hasEntered) {
        // Already entered (paid) but haven't played yet - go to intro
        setShowIntro(true);
      } else {
        // Need to pay entry fee - show intro with payment option
        setShowIntro(true);
      }
    }
  };

  const handleDegenEntry = async () => {
    if (!isWalletConnected) {
      // Connect wallet first
      handleConnectWallet();
      return;
    }

    const success = await enterGame();
    if (success) {
      // Entry successful, can now start game
      setShowIntro(false);
      handleWindowClick();
    }
  };

  useEffect(() => {
    if (isGameOver) {
      setShowGameOver(true);
      // Save the score when game is over (use lastGameScore which is the current game's score)
      if (lastGameScore > 0) {
        // Always save to localStorage for Fun mode
        saveScore(lastGameScore);
        setFinalScore(lastGameScore);
        setScoreSubmitted(false);

        // For DEGEN mode, also submit to smart contract
        if (selectedMode === "degen" && hasEntered) {
          (async () => {
            try {
              await submitDegenScore(lastGameScore);
            } catch (error) {
              console.error("Error submitting DEGEN score:", error);
            }
          })();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, lastGameScore, selectedMode, hasEntered]);

  return (
    <div className="relative w-full h-full">
      <audio ref={audioRef} src="/jeet.m4a" />

      {/* Mode Selection Screen */}
      {showModeSelection && (
        <ModeSelection onSelectMode={handleModeSelection} />
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
              <button
                onClick={handleDegenEntry}
                disabled={isEntering}
                className={`${
                  isEntering ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
                } text-white font-bold py-3 px-6 rounded-lg text-sm w-full`}
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {isEntering ? "Entering..." : `Pay ${entryFee} ETH to Enter`}
              </button>
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
                Top Score: {topScore}
              </div>
            )}

            <button
              onClick={() => {
                clearError();
                clearDegenError();
                setShowIntro(false);
                setShowModeSelection(true);
                setSelectedMode(null);
              }}
              className="text-gray-400 text-xs hover:text-white mt-2"
            >
              ← Back to Mode Selection
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

            {/* DEGEN Mode specific info */}
            {selectedMode === "degen" && (
              <div className="w-full space-y-3">
                <div className="bg-green-900 bg-opacity-50 border-2 border-green-500 p-3 rounded-lg">
                  <div className="text-green-300 text-xs mb-1">Speed Multiplier</div>
                  <div className="text-white text-xl font-bold">{calculateMultiplier(finalScore).toFixed(2)}x</div>
                </div>
                <div className="bg-yellow-900 bg-opacity-50 border-2 border-yellow-500 p-3 rounded-lg">
                  <div className="text-yellow-300 text-xs mb-1">Potential Earnings</div>
                  <div className="text-white text-xl font-bold">
                    {isSubmittingDegen ? "Calculating..." : potentialReward === "0" ? "Calculating..." : `${potentialReward} ETH`}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {potentialReward !== "0" ? "Check back tomorrow to claim rewards!" : "Rewards calculated after score submission"}
                  </div>
                </div>
                <div className="text-orange-400 text-sm text-center p-3 bg-orange-900 bg-opacity-30 rounded-lg">
                  ⚠️ You've played today! Come back tomorrow for another chance.
                </div>
                {isSubmittingDegen && (
                  <div className="text-blue-400 text-xs text-center">
                    Submitting score to blockchain...
                  </div>
                )}
                {degenError && (
                  <div className="text-red-400 text-xs text-center">
                    {degenError}
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
              {selectedMode === "degen" ? "Back to Menu" : "Try Again"}
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

            {/* Leaderboard (Fun Mode only) */}
            {selectedMode === "fun" && (
              <div className="w-full flex justify-center">
                <Leaderboard />
              </div>
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
