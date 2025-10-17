import { AppProps } from "next/app";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FarcasterProvider } from "../components/FarcasterProvider";
import { config } from "../lib/wagmi";
import "../styles/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>
          <Component {...pageProps} />
        </FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
