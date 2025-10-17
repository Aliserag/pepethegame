import { http, createConfig, createConnector } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Create a simple injected connector for MetaMask/browser wallets
function createInjectedConnector() {
  return createConnector((config) => ({
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
      // Injected wallets don't have a disconnect method
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
      if (accounts.length === 0) this.onDisconnect?.()
      else this.onConnect?.({ accounts: accounts as `0x${string}`[] })
    },
    onChainChanged(chain) {
      this.onConnect?.({ chainId: parseInt(chain as string, 16) })
    },
    onDisconnect() {
      this.onDisconnect?.()
    },
    async setup() {
      if (typeof window === 'undefined') return

      const provider = (window as any).ethereum
      if (!provider) return

      provider.on('accountsChanged', this.onAccountsChanged.bind(this))
      provider.on('chainChanged', this.onChainChanged.bind(this))
      provider.on('disconnect', this.onDisconnect.bind(this))
    }
  }))
}

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp(),
    createInjectedConnector(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
