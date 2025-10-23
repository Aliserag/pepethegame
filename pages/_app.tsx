import { AppProps } from "next/app";
import { useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FarcasterProvider } from "../components/FarcasterProvider";
import { config } from "../lib/wagmi";
import "../styles/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Suppress browser extension connection errors
    // These occur when extensions try to inject providers but fail
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const errorMsg = args[0]?.toString() || '';

      // Suppress chrome extension errors
      if (
        errorMsg.includes('Could not establish connection') ||
        errorMsg.includes('Receiving end does not exist') ||
        errorMsg.includes('runtime.lastError')
      ) {
        return; // Silently ignore
      }

      // Log all other errors normally
      originalError.apply(console, args);
    };

    // Suppress unhandled promise rejections from extensions
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      if (
        reason.includes('Could not establish connection') ||
        reason.includes('Receiving end does not exist')
      ) {
        event.preventDefault(); // Suppress the error
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

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
