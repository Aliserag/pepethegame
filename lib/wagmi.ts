import { http, createConfig, createStorage, noopStorage, createConnector } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Simple MetaMask/injected wallet connector
function metaMaskConnector() {
  return createConnector((config) => ({
    id: 'injected',
    name: 'MetaMask',
    type: 'injected',
    async connect() {
      if (typeof window === 'undefined') throw new Error('Window not available')
      const provider = (window as any).ethereum
      if (!provider) throw new Error('No injected provider found')

      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const chainId = await provider.request({ method: 'eth_chainId' })

      return {
        accounts: [accounts[0]],
        chainId: parseInt(chainId, 16)
      }
    },
    async disconnect() {},
    async getAccounts() {
      if (typeof window === 'undefined') return []
      const provider = (window as any).ethereum
      if (!provider) return []
      return await provider.request({ method: 'eth_accounts' })
    },
    async getChainId() {
      if (typeof window === 'undefined') return baseSepolia.id
      const provider = (window as any).ethereum
      if (!provider) return baseSepolia.id
      const chainId = await provider.request({ method: 'eth_chainId' })
      return parseInt(chainId, 16)
    },
    async isAuthorized() {
      if (typeof window === 'undefined') return false
      const provider = (window as any).ethereum
      if (!provider) return false
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts.length > 0
    },
    async getProvider() {
      if (typeof window === 'undefined') return undefined
      return (window as any).ethereum
    },
    async switchChain({ chainId }) {
      if (typeof window === 'undefined') throw new Error('Window not available')
      const provider = (window as any).ethereum
      if (!provider) throw new Error('No injected provider found')

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
      return config.chains.find(c => c.id === chainId)!
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect')
      } else {
        config.emitter.emit('change', { accounts: accounts as `0x${string}`[] })
      }
    },
    onChainChanged(chain) {
      config.emitter.emit('change', { chainId: parseInt(chain as string, 16) })
    },
    onDisconnect() {
      config.emitter.emit('disconnect')
    },
  }))
}

// Support both Farcaster Mini App and browser wallets
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp(),
    metaMaskConnector(),
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
