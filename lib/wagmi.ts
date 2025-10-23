import { http, createConfig, createStorage, noopStorage } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Use only the Farcaster Mini App connector
// This prevents browser extension polling that causes runtime errors
// The Farcaster client provides wallet connectivity through the SDK
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp(),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
  },
  // Prevent auto-reconnection and wallet polling
  ssr: true,
  multiInjectedProviderDiscovery: false,
  storage: createStorage({ storage: noopStorage }), // Don't persist connections
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
