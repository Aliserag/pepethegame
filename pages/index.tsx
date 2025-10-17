import type { NextPage } from "next";
import Head from "next/head";
import Game from "../components/Game";
import { GameProvider } from "../hooks/useGame";
import useWindowSize from "../hooks/useWindowSize";

const Home: NextPage = () => {
  const { height } = useWindowSize();

  return (
    <div
      className="w-full flex items-center justify-center bg-zinc-800 p-5"
      style={{
        height: height > 0 ? `${height}px` : "100vh",
      }}
    >
      <Head>
        <title>FlowPepe - WAGMI! Help Pepe Make It 🐸</title>
        <link rel="icon" href="pepe.gif" />
      </Head>

      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
};

export default Home;
