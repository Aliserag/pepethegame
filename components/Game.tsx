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
import { useAccount } from "wagmi";
import _ from "lodash";

export default function Game() {
  const { user } = useFarcaster();
  const { address, isConnected: isWalletConnected } = useAccount();

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
  } = useGame();
  const [ref, window] = useElementSize();
  const [isMuted, setIsMuted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (window.width > 0 && window.height > 0) {
      startGame(window);
    }
  }, [window, ref]);

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
    handleWindowClick();
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

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    if (isGameOver) {
      setShowGameOver(true);
      // Save the score when game is over (use bestClickCount which is the latest game's score)
      if (bestClickCount > 0) {
        saveScore(bestClickCount);
        setFinalScore(bestClickCount);
        setScoreSubmitted(false);
      }
    }
  }, [isGameOver, bestClickCount]);

  return (
    <div className="relative w-full h-full">
      <audio ref={audioRef} src="/jeet.m4a" />
      {showIntro && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="text-center p-4 max-w-sm mx-auto">
            <h1
              className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              FlowPepe
            </h1>
            <h2
              className="text-yellow-400 text-lg mb-3"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Help Pepe Make It
            </h2>
            {user?.username && (
              <div
                className="text-green-400 text-xs mb-4"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                @{user.username}
              </div>
            )}
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
            <WalletConnect />
            <div
              className="mt-4 text-white text-sm"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Total Score: {totalScore}
            </div>
            <div
              className="mt-2 text-white text-sm"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Top Score: {topScore}
            </div>
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
              className="text-yellow-400 text-2xl md:text-3xl text-center"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Score: {finalScore}
            </div>

            {/* Show if it's a new high score */}
            {isConnected && isNewHighScore && !scoreSubmitted && (
              <div
                className="text-green-400 text-lg text-center animate-pulse"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                🎉 New High Score! 🎉
              </div>
            )}

            {/* Current on-chain record */}
            {isConnected && currentOnChainScore > 0 && (
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

            {/* On-chain submission */}
            {!isConnected && (
              <div
                className="text-gray-400 text-xs text-center"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Connect wallet to submit score on-chain
              </div>
            )}

            {isConnected && finalScore > 0 && (
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

            {/* Leaderboard */}
            <div className="w-full flex justify-center">
              <Leaderboard />
            </div>
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
