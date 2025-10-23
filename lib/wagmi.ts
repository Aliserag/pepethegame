import { http, createConfig, createConnector, createStorage, noopStorage } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Create a simple injected connector for MetaMask/browser wallets
function createInjectedConnector() {
  return createConnector((config) => {
    let cleanupListeners: (() => void) | null = null;

    return {
      id: 'injected',
      name: 'Browser Wallet',
      type: 'injected',
      async connect() {
        if (typeof window === 'undefined') throw new Error('Window not available')

        const provider = (window as any).ethereum
        if (!provider) throw new Error('No injected provider found')

        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        })
        const account = accounts[0]
        const chainId = await provider.request({ method: 'eth_chainId' })

        return {
          accounts: [account],
          chainId: parseInt(chainId, 16)
        }
      },
      async disconnect() {
        // Clean up event listeners when disconnecting
        if (cleanupListeners) {
          cleanupListeners();
          cleanupListeners = null;
        }
      },
    async getAccounts() {
      if (typeof window === 'undefined') return []

      const provider = (window as any).ethereum
      if (!provider) return []
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts
    },
    async getChainId() {
      if (typeof window === 'undefined') throw new Error('Window not available')

      const provider = (window as any).ethereum
      if (!provider) throw new Error('No injected provider found')
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
      // Event handlers - wagmi will handle these internally
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
      async setup() {
        if (typeof window === 'undefined') return

        const provider = (window as any).ethereum
        if (!provider) return

        // Store bound handlers for cleanup
        const accountsChangedHandler = this.onAccountsChanged.bind(this)
        const chainChangedHandler = this.onChainChanged.bind(this)
        const disconnectHandler = this.onDisconnect.bind(this)

        provider.on('accountsChanged', accountsChangedHandler)
        provider.on('chainChanged', chainChangedHandler)
        provider.on('disconnect', disconnectHandler)

        // Store cleanup function for disconnect
        cleanupListeners = () => {
          provider.removeListener('accountsChanged', accountsChangedHandler)
          provider.removeListener('chainChanged', chainChangedHandler)
          provider.removeListener('disconnect', disconnectHandler)
        }
      }
    }
  })
}

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp(),
    createInjectedConnector(),
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
