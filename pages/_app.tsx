import { AppProps } from "next/app";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { FarcasterProvider } from "../components/FarcasterProvider";
import { config } from "../lib/wagmi";
import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#22c55e', // Green accent to match game theme
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <FarcasterProvider>
            <Component {...pageProps} />
          </FarcasterProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
