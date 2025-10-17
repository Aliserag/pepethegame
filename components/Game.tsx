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
import _ from "lodash";

export default function Game() {
  const { user } = useFarcaster();
  const userId = user?.fid?.toString() || "anonymous";
  const { totalScore, topScore, saveScore } = useScores(userId);

  const {
    handleWindowClick,
    startGame,
    isReady,
    isStarted,
    rounds,
    isGameOver,
    resetGame,
  } = useGame();
  const [ref, window] = useElementSize();
  const [isMuted, setIsMuted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
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
    handleWindowClick();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    if (isGameOver) {
      setShowGameOver(true);
      // Save the score when game is over
      const currentRound = _.last(rounds);
      if (currentRound) {
        saveScore(currentRound.score);
      }
    }
  }, [isGameOver]);

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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black bg-opacity-90 p-4 z-50">
          <h1
            className="text-white text-6xl font-bold mb-4"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            You Jeeted Too Soon!
          </h1>
          <button
            onClick={handleTryAgainClick}
            className="bg-red-700 hover:bg-red-900 text-white font-bold py-3 px-6 rounded-lg flex items-center text-2xl"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            <span className="mr-3">Try Again</span>
            <svg
              className="w-6 h-6"
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
