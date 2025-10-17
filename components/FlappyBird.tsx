import { motion } from "framer-motion";
import useGame from "../hooks/useGame";
import useInterval from "../hooks/useInterval";

export function Bird() {
  const {
    bird: {
      size: { height, width },
      isFlying,
    },
  } = useGame();
  return (
    <div
      style={{
        backgroundImage: "url(pepe.gif)",
        height,
        width,
        // backgroundPosition: frame,
        backgroundSize: "contain", // Adjust size to fit without repeating
        backgroundRepeat: "no-repeat", // Prevent repeating of the image
        transform: "scaleX(-1)", // Flip the image horizontally
        zIndex: 100,
      }}
    />
  );
}

export default function FlappyBird() {
  const {
    isStarted,
    bird: {
      fall: { delay },
      position,
      animate,
    },
    fall,
  } = useGame();
  useInterval(() => fall(), isStarted ? delay : null);
  return (
    <motion.div
      className={`m-auto absolute z-40 ${
        !isStarted && "animate-pulse"
      } w-20 h-10`}
      style={{
        ...position,
      }}
      animate={{
        ...position,
        ...animate,
      }}
      transition={{
        ease: "linear",
        duration: 0.25,
      }}
    >
      <Bird />
    </motion.div>
  );
}
