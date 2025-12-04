import { http, createConfig, createStorage, noopStorage } from 'wagmi'
import { flowMainnet } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'

// WalletConnect Cloud project ID - required for RainbowKit v2
// Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Vercel environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const connectors = projectId ? connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet,
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
      ],
    },
  ],
  {
    appName: 'FlowPepe',
    projectId,
  }
) : []

export const config = createConfig({
  chains: [flowMainnet], // Only Flow Mainnet
  connectors,
  transports: {
    [flowMainnet.id]: http(process.env.NEXT_PUBLIC_FLOW_RPC || 'https://mainnet.evm.nodes.onflow.org'),
  },
  ssr: true,
  storage: createStorage({ storage: noopStorage }),
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
