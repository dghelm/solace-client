import { withBackoffRetries, range, getContract } from '../utils'
import { getPoliciesConfig } from '../utils/configs'
import { useWallet } from '../context/WalletManager'
import { PolicyStatus } from '../constants/enums'
import { BigNumber } from 'ethers'

export interface Policy {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionContract: string
  expirationBlock: string
  coverAmount: string
  price: string
  status: PolicyStatus
  positionName: string
}

export const usePolicyGetter = () => {
  const wallet = useWallet()

  const checkInit = async () => {
    if (!getPoliciesConfig[String(wallet.chainId)].initialized) {
      const tokens = getPoliciesConfig[String(wallet.chainId)].tokens
      const contract = getContract(
        getPoliciesConfig[String(wallet.chainId)].policyManagerAddr,
        getPoliciesConfig[String(wallet.chainId)].policyManagerAbi,
        wallet.library
      )
      const positionNames = tokens?.reduce(
        (names: any, token: any) => ({ ...names, [token.token.address.toLowerCase()]: token.underlying.symbol }),
        {}
      )
      getPoliciesConfig[String(wallet.chainId)] = {
        ...getPoliciesConfig[String(wallet.chainId)],
        policyManagerContract: contract,
        positionNames,
        initialized: true,
      }
    }
  }

  const getPolicies = async (policyHolder?: string, product?: string) => {
    await checkInit()
    let policies = await (policyHolder ? getUserPolicies(policyHolder) : getAllPolicies())
    policies = policies.filter((policy: any) => policy.policyId >= 0)
    if (product) policies = policies.filter((policy: any) => policy.productAddress.equalsIgnoreCase(product))
    policies.sort((a: any, b: any) => b.policyId - a.policyId) // newest first
    policies.forEach(
      (policy: any) =>
        (policy.positionName =
          getPoliciesConfig[String(wallet.chainId)].positionNames[policy.positionContract.toLowerCase()])
    )
    return policies
  }

  const getUserPolicies = async (policyHolder: string): Promise<any> => {
    const [blockNumber, policyIds] = await Promise.all([
      wallet.library.getBlockNumber(),
      getPoliciesConfig[String(wallet.chainId)].policyManagerContract.listPolicies(policyHolder),
    ])
    const policies = await Promise.all(policyIds.map((policyId: BigNumber) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const getAllPolicies = async (): Promise<any> => {
    const [blockNumber, totalPolicyCount] = await Promise.all([
      wallet.library.getBlockNumber(),
      getPoliciesConfig[String(wallet.chainId)].policyManagerContract.totalPolicyCount(),
    ])
    const policyIds = range(totalPolicyCount.toNumber())
    const policies = await Promise.all(policyIds.map((policyId) => queryPolicy(policyId, blockNumber)))
    return policies
  }

  const queryPolicy = async (policyId: any, blockNumber: any) => {
    try {
      if (!getPoliciesConfig[String(wallet.chainId)].policyManagerContract)
        return {
          policyId: -1,
        }
      const policy = await withBackoffRetries(async () =>
        getPoliciesConfig[String(wallet.chainId)].policyManagerContract.getPolicyInfo(policyId)
      )
      return {
        policyId: Number(policyId),
        policyholder: policy.policyholder,
        productAddress: policy.product,
        productName: getPoliciesConfig[String(wallet.chainId)].productsRev[policy.product],
        positionContract: policy.positionContract,
        expirationBlock: policy.expirationBlock.toString(),
        coverAmount: policy.coverAmount.toString(),
        price: policy.price.toString(),
        status: policy.expirationBlock.lt(blockNumber) ? 'Expired' : 'Active',
        positionName: '',
      }
    } catch (err) {
      return {
        policyId: -1,
      }
    }
  }

  return { getPolicies, getUserPolicies, getAllPolicies }
}