import { http, createConfig, createStorage, noopStorage } from 'wagmi'
import { flowMainnet } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        rainbowWallet,
      ],
    },
  ],
  {
    appName: 'FlowPepe',
    projectId,
  }
)

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
