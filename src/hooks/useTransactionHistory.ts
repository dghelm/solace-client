import { DEFAULT_CHAIN_ID } from '../constants'
import { fetchEtherscanTxHistoryByAddress } from '../utils/etherscan'
import { useContractArray } from './useContract'
import { useState, useEffect } from 'react'
import { useUserData } from '../context/UserDataManager'
import { useWallet } from '../context/WalletManager'
import { FunctionName } from '../constants/enums'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
import { formatTransactionContent } from '../utils/formatting'

export const useTransactionDetails = (): { txHistory: any; amounts: string[] } => {
  const { library, chainId } = useWallet()
  const [amounts, setAmounts] = useState<string[]>([])
  const contractArray = useContractArray()
  const txHistory = useFetchTxHistoryByAddress()

  const getTransactionAmount = async (
    function_name: string,
    tx: any,
    provider: Web3Provider | Provider
  ): Promise<string> => {
    const receipt = await provider.getTransactionReceipt(tx.hash)
    if (!receipt) return '0'
    if (receipt.status == 0) return '0'
    const logs = receipt.logs
    if (!logs) return '0'
    const topics = logs[logs.length - 1].topics

    switch (function_name) {
      case FunctionName.DEPOSIT:
      case FunctionName.WITHDRAW:
      case FunctionName.SUBMIT_CLAIM:
        if (!topics || topics.length <= 0) return '0'
        return topics[topics.length - 1]
      case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
        if (!topics || topics.length <= 0) return '0'
        return topics[1]
      case FunctionName.BUY_POLICY:
      case FunctionName.EXTEND_POLICY:
      case FunctionName.CANCEL_POLICY:
      case FunctionName.DEPOSIT_ETH:
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_ETH:
      case FunctionName.WITHDRAW_REWARDS:
      case FunctionName.DEPOSIT_LP:
      case FunctionName.WITHDRAW_LP:
      default:
        if (!logs || logs.length <= 0) return '0'
        const data = logs[logs.length - 1].data
        if (!data) return '0'
        return logs[logs.length - 1].data
    }
  }

  const getTransactionAmounts = async () => {
    if (txHistory) {
      const currentAmounts = []
      for (let tx_i = 0; tx_i < txHistory.length; tx_i++) {
        const function_name = decodeInput(txHistory[tx_i], chainId ?? DEFAULT_CHAIN_ID, contractArray).function_name
        const amount: string = await getTransactionAmount(function_name, txHistory[tx_i], library)
        currentAmounts.push(`${formatTransactionContent(function_name, amount)}`)
      }
      setAmounts(currentAmounts)
    }
  }

  useEffect(() => {
    getTransactionAmounts()
  }, [txHistory])

  return { txHistory, amounts }
}

export const useFetchTxHistoryByAddress = (): any => {
  const { account, dataVersion, reload, chainId } = useWallet()
  const { deleteLocalTransactions } = useUserData()
  const [txHistory, setTxHistory] = useState<any>([])
  const contractAddrs = useContractArray()

  const fetchTxHistoryByAddress = async (account: string) => {
    await fetchEtherscanTxHistoryByAddress(chainId ?? DEFAULT_CHAIN_ID, account, contractAddrs).then((result) => {
      deleteLocalTransactions(result.txList)
      setTxHistory(result.txList.slice(0, 30))
      reload()
    })
  }

  useEffect(() => {
    account ? fetchTxHistoryByAddress(account) : setTxHistory([])
  }, [account, dataVersion, chainId])

  return txHistory
}