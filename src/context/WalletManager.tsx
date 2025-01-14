import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { WalletConnector, SUPPORTED_WALLETS } from '../wallet'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ReactProvider } from '@web3-react/core'
import { JsonRpcProvider } from '@ethersproject/providers'
import getLibrary from '../utils/getLibrary'
import { Error as AppError } from '../constants/enums'
import { ErrorData } from '../constants/types'
import { WalletModal } from '../components/organisms/WalletModal'
import { useNetwork } from './NetworkManager'
import { MetamaskConnector } from '../wallet/wallet-connectors/MetaMask'
import { useGeneral } from './GeneralProvider'
import { getTokens as gT0 } from '../products/sushiswap/positionGetter/getTokens'
import { getTokens as gT1 } from '../products/yearn/positionGetter/getTokens'
import { getTokens as gT2 } from '../products/curve/positionGetter/getTokens'
import { getTokens as gT3 } from '../products/uniswapV2/positionGetter/getTokens'
import { getTokens as gT4 } from '../products/uniswapV3/positionGetter/getTokens'
import { getTokens as gT5 } from '../products/aave/positionGetter/getTokens'

import { getBalances as gB0 } from '../products/sushiswap/positionGetter/getBalances'
import { getBalances as gB1 } from '../products/yearn/positionGetter/getBalances'
import { getBalances as gB2 } from '../products/curve/positionGetter/getBalances'
import { getBalances as gB3 } from '../products/uniswapV2/positionGetter/getBalances'
import { getBalances as gB4 } from '../products/uniswapV3/positionGetter/getBalances'
import { getBalances as gB5 } from '../products/aave/positionGetter/getBalances'

import { ETHERSCAN_API_KEY } from '../constants'
import { withBackoffRetries } from '../utils/time'
/*

This Manager keeps track of the user's wallet and details, including the wallet type and account, 
as well as provide the functions to connect and disconnect the wallet.

SUPPORTED_WALLETS contains connectors that the application allows, if the user's connected wallet is included,
the connect function is called.

The user's selected wallet connector is then stored into storage so when they come into the web app again,
the connection will be automatic.

*/

export const WalletConnectors = SUPPORTED_WALLETS

export type ContextWallet = {
  initialized: boolean
  connecting?: WalletConnector
  isActive: boolean
  account?: string
  name?: string
  library?: any
  connector?: AbstractConnector
  activeWalletConnector?: WalletConnector
  openWalletModal: () => void
  changeWallet: (walletConnector: WalletConnector) => void
  connect: (connector: WalletConnector, args?: Record<string, any>) => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<ContextWallet>({
  initialized: false,
  connecting: undefined,
  isActive: false,
  account: undefined,
  name: undefined,
  library: undefined,
  connector: undefined,
  activeWalletConnector: undefined,
  openWalletModal: () => undefined,
  changeWallet: () => undefined,
  connect: () => Promise.reject(),
  disconnect: () => undefined,
})

const WalletProvider: React.FC = (props) => {
  const web3React = useWeb3React()
  const { activeNetwork } = useNetwork()
  const [selectedProvider, setSelectedProvider, removeSelectedProvider] = useLocalStorage<string | undefined>(
    'sol_wallet_0'
  )
  const [activeConnector, setActiveConnector] = useState<WalletConnector | undefined>()
  const [connecting, setConnecting] = useState<WalletConnector | undefined>(undefined)
  const [initialized, setInitialized] = useState<boolean>(false)
  const connectingRef = useRef<WalletConnector | undefined>(connecting)
  connectingRef.current = connecting
  const [walletModal, setWalletModal] = useState<boolean>(false)
  const { addErrors, removeErrors } = useGeneral()
  const [name, setName] = useState<string | undefined>(undefined)
  const ethProvider = useMemo(() => new JsonRpcProvider(activeNetwork.rpc.httpsUrl), [activeNetwork])

  const date = Date.now()
  const ContextErrors = [
    AppError.NO_PROVIDER,
    AppError.UNSUPPORTED_NETWORK,
    AppError.NO_ACCESS,
    AppError.WALLET_NETWORK_UNSYNC,
    AppError.UNKNOWN_WALLET_ERROR,
  ]

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setWalletModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setWalletModal(false)
  }, [])

  const changeWallet = useCallback((walletConnector: WalletConnector) => {
    // there were cases where changing wallets without changing the network does not pull data correctly in that network
    setSelectedProvider(walletConnector.id)
    window.location.reload()
  }, [])

  const disconnect = useCallback(() => {
    web3React.deactivate()
    setConnecting(undefined)
    setActiveConnector(undefined)
    removeSelectedProvider()
  }, [web3React, removeSelectedProvider, setConnecting])

  const connect = useCallback(
    async (walletConnector: WalletConnector, args?: Record<string, any>): Promise<void> => {
      // if a connector is trying to connect, do not try to connect again
      if (connectingRef.current) return

      connectingRef.current = walletConnector
      setConnecting(walletConnector)
      const connector = walletConnector.getConnector(activeNetwork, args)

      // when connecting via metamask, if app not initialized yet,
      // set wallet network to app network before activation
      if (connector instanceof MetamaskConnector && activeNetwork.metamaskChain && !initialized) {
        try {
          await connector.switchChain({
            chainId: activeNetwork.metamaskChain.chainId,
          })
        } catch (e) {
          if (e.code === 4902) {
            await connector.addChain(activeNetwork.metamaskChain)
          }
        }
      }

      await web3React.activate(connector, undefined, true).then(onSuccess).catch(onError)

      function onSuccess() {
        if (!connectingRef.current) return
        removeErrors(ContextErrors)
        walletConnector.onConnect?.(connector, args)
        setActiveConnector(walletConnector)
        setSelectedProvider(walletConnector.id)
      }

      function onError(error: Error) {
        const walletErrors: ErrorData[] = []
        if (error instanceof NoEthereumProviderError) {
          walletErrors.push({ type: AppError.NO_PROVIDER, metadata: 'n/a', uniqueId: `${AppError.NO_PROVIDER}` })
        } else if (error instanceof UnsupportedChainIdError) {
          walletErrors.push({ type: AppError.UNSUPPORTED_NETWORK, metadata: `not supported`, uniqueId: `${date}` })
        } else if (
          error instanceof UserRejectedRequestErrorInjected ||
          error instanceof UserRejectedRequestErrorWalletConnect
        ) {
          walletErrors.push({ type: AppError.NO_ACCESS, metadata: `no access`, uniqueId: `${date}` })
        } else {
          const err = walletConnector.onError?.(error)
          walletErrors.push({ type: AppError.UNKNOWN_WALLET_ERROR, metadata: `${String(err)}`, uniqueId: `${date}` })
          console.log(err)
        }
        addErrors(walletErrors)
      }

      setConnecting(undefined)
    },
    [web3React, activeNetwork, connectingRef, setConnecting, setSelectedProvider, addErrors]
  )

  useEffect(() => {
    if (
      selectedProvider == 'metamask' &&
      web3React.chainId &&
      activeNetwork.chainId &&
      web3React.chainId !== activeNetwork.chainId &&
      connecting
    ) {
      addErrors([
        {
          type: AppError.WALLET_NETWORK_UNSYNC,
          metadata: `not matching to chain ${activeNetwork.chainId}`,
          uniqueId: `${date}`,
        },
      ])
    }
  }, [activeNetwork, web3React, selectedProvider, connecting])

  useEffect(() => {
    // If the user has a local provider already
    ;(async () => {
      if (selectedProvider) {
        const walletConnector = WalletConnectors.find((c) => c.id === selectedProvider)
        if (walletConnector) await connect(walletConnector)
      }
      setInitialized(true)
    })()
  }, [web3React])

  useEffect(() => {
    if (!web3React.account || !web3React.library) return
    const checkForENS = async () => {
      const network = await web3React.library.getNetwork()
      if (!network.ensAddress) return
      const name = await web3React.library.lookupAddress(web3React.account)
      if (!name) return
      const address = await web3React.library.resolveName(name)
      if (!address) return
      if (address == web3React.account) setName(name)
    }
    checkForENS()
  }, [web3React.account, web3React.library])

  useEffect(() => {
    const testMainnet = async () => {
      const provider = new JsonRpcProvider(
        `https://eth-mainnet.alchemyapi.io/v2/${String(process.env.REACT_APP_ALCHEMY_API_KEY)}`
      )
      const aaveU = '0x11BB97923209Df97E8c9839E1e394798cb0C0336'
      const sushiU = '0x55f4b291E26d2143721C7EBeB1C44660A9A5Eb5E'
      const curveU2 = '0x53C40473DcdFd927C4201cCFE24E314a7D7C3584'
      const curveU3 = '0xfcb85d4139123b1ec6746d1c487a2201045b9f72'
      const curveU4 = '0x18C64fAf2DF0286E1520B2F0F2d3841bcF865116'
      const curveU5 = '0xbF7D65D769E82E7B862df338223263ba33F72623'
      const uniV2U = '0xC04F63Ea1E2E2FFEACAde7839E0596E2B886f6A4'
      const uniV3U = '0xAc32EAfcCAd3C8577FB2e842dCE8e441D9A7dB85'
      const yearnU = '0x2b5989Dd16eA2a11053F35B8c08b1E313C4E5cbB'
      const user = curveU5
      const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${user}&startblock=0&endblock=latest&apikey=${String(
        ETHERSCAN_API_KEY
      )}`
      const transferHistory = await withBackoffRetries(async () => fetch(url))
        .then((res) => res.json())
        .then((result) => result.result)
        .then((result) => {
          if (result != 'Max rate limit reached') return result
          return []
        })
      // const cachedTokens = await gT0(provider, activeNetwork, { user, transferHistory })
      // const cachedTokens = await gT1(provider, activeNetwork, { user, transferHistory })
      const cachedTokens = await gT2(provider, activeNetwork, { user, transferHistory })
      // const cachedTokens = await gT3(provider, activeNetwork, { user, transferHistory })
      // const cachedTokens = await gT4(provider, activeNetwork, { user, transferHistory })
      // const cachedTokens = await gT5(provider, activeNetwork, { user, transferHistory })
      console.log(cachedTokens)
      // const balances = await gB0(user, provider, activeNetwork, cachedTokens)
      //const balances = await gB1(user, provider, activeNetwork, cachedTokens)
      const balances = await gB2(user, provider, activeNetwork, cachedTokens)
      //const balances = await gB3(user, provider, activeNetwork, cachedTokens)
      // const balances = await gB4(user, provider, activeNetwork, cachedTokens)
      // const balances = await gB5(user, provider, activeNetwork, cachedTokens)
      console.log(balances)
      // console.log('fetched balances', balances)
    }
    // testMainnet()
  }, [])

  const value = useMemo<ContextWallet>(
    () => ({
      initialized,
      connecting,
      isActive: web3React.active,
      account: web3React.account ?? undefined,
      name,
      library: web3React.account ? web3React.library : ethProvider,
      connector: web3React.connector,
      activeWalletConnector: activeConnector,
      openWalletModal: openModal,
      changeWallet,
      connect,
      disconnect,
    }),
    [web3React, ethProvider, initialized, activeConnector, connecting, disconnect, connect]
  )

  return (
    <WalletContext.Provider value={value}>
      <WalletModal closeModal={closeModal} isOpen={walletModal} />
      {props.children}
    </WalletContext.Provider>
  )
}

// To get access to this Manager, import this into your component or hook
export function useWallet(): ContextWallet {
  return useContext(WalletContext)
}

const WalletManager: React.FC = (props) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <WalletProvider>{props.children}</WalletProvider>
    </Web3ReactProvider>
  )
}

export default WalletManager
