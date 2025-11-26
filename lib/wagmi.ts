import { http, createConfig, createStorage, noopStorage, createConnector } from 'wagmi'
import { flowMainnet, flowTestnet } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Simple MetaMask/injected wallet connector for Flow
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
      if (typeof window === 'undefined') return flowTestnet.id
      const provider = (window as any).ethereum
      if (!provider) return flowTestnet.id
      const chainId = await provider.request({ method: 'eth_chainId' })
      return parseInt(chainId, 16)
    },
    async isAuthorized() {
      // Always return false to prevent auto-reconnection
      // User must explicitly click "Connect Wallet"
      return false
    },
    async getProvider() {
      if (typeof window === 'undefined') return undefined
      return (window as any).ethereum
    },
    async switchChain({ chainId }) {
      if (typeof window === 'undefined') throw new Error('Window not available')
      const provider = (window as any).ethereum
      if (!provider) throw new Error('No injected provider found')

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }]
        })
      } catch (switchError: any) {
        // This error code indicates the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          const chain = config.chains.find(c => c.id === chainId)
          if (chain) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${chainId.toString(16)}`,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls.default.http[0]],
                blockExplorerUrls: chain.blockExplorers ? [chain.blockExplorers.default.url] : undefined
              }]
            })
          }
        } else {
          throw switchError
        }
      }
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

// Support both Farcaster Mini App and browser wallets on Flow
export const config = createConfig({
  chains: [flowMainnet, flowTestnet],
  connectors: [
    farcasterMiniApp(),
    metaMaskConnector(),
  ],
  transports: {
    [flowMainnet.id]: http(process.env.NEXT_PUBLIC_FLOW_RPC || 'https://mainnet.evm.nodes.onflow.org'),
    [flowTestnet.id]: http(process.env.NEXT_PUBLIC_FLOW_TESTNET_RPC || 'https://testnet.evm.nodes.onflow.org'),
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
