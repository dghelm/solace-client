import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TorusConnector } from '@web3-react/torus-connector'
import { AuthereumConnector } from '@web3-react/authereum-connector'

import { RPC_URLS, POLLING_INTERVAL, WALLET_CONNECT_BRIDGE } from '../../constants'

// browser extension
export const injected = new InjectedConnector({
  supportedChainIds: [4, 42],
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  pollingInterval: POLLING_INTERVAL,
  bridge: WALLET_CONNECT_BRIDGE,
  qrcode: true,
})

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  defaultChainId: 4,
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[4],
  appName: 'solace',
})

export const ledger = new LedgerConnector({ chainId: 4, url: RPC_URLS[4], pollingInterval: POLLING_INTERVAL })

export const torus = new TorusConnector({ chainId: 4 })

export const authereum = new AuthereumConnector({ chainId: 42 })
