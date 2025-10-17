import React from "react";
import { motion } from "framer-motion";
import useGame from "../hooks/useGame";

// Define the prop types for the Footer component
interface FooterProps {
  isMuted: boolean;
  toggleMute: () => void;
}

const Footer: React.FC<FooterProps> = ({ isMuted, toggleMute }) => {
  const {
    clickCount,
    bestClickCount,
    pipe: { distance },
  } = useGame();

  return (
    <footer className="w-full h-28 bg-[#ded895] relative rounded-b-lg">
      <div className="bg-green-500 border-y-4 relative border-green-600 h-10">
        <motion.div
          style={{
            backgroundImage: `linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.2) 25%,
              transparent 25%,
              transparent 50%,
              rgba(255, 255, 255, 0.2) 50%,
              rgba(255, 255, 255, 0.2) 75%,
              transparent 75%,
              transparent
            )`,
            backgroundSize: "50px 50px",
          }}
          className="absolute w-full h-full"
        ></motion.div>
      </div>
      <div className="flex p-2 uppercase font-mono font-semibold items-center justify-around h-[calc(100%-2.5rem)] text-xl text-green-900 flex-wrap">
        <div>Best: {bestClickCount}</div>
        <div>Points: {clickCount}</div>
        <div className="w-full text-center text-lg">
          Speed: {(distance / 10).toFixed(1)}
        </div>
        <button
          className="absolute right-2 bottom-2"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5v14l-5-5H3v-4h1l5-5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9l-3 3 3 3m3-3h2m-4 0a9 9 0 0118 0"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5v14l-5-5H3v-4h1l5-5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9l-3 3 3 3m3-3h2m-4 0a9 9 0 0118 0"
              />
            </svg>
          )}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
