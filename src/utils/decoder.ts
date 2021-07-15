import { ethers } from 'ethers'
import { ContractSources } from '../constants/types'

const getInterface = (toAddress: string, contractArray: ContractSources[]) => {
  const matchingContract = contractArray.find((contract) => contract.addr.toLowerCase() == toAddress)
  return new ethers.utils.Interface(matchingContract?.abi)
}

export const decodeInput = (tx: any, chainId: number, contractArray: ContractSources[]) => {
  const inter = getInterface(tx.to, contractArray)
  const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
  const function_name = decodedInput.name.charAt(0).toUpperCase() + decodedInput.name.slice(1)
  return {
    function_name,
  }
}
