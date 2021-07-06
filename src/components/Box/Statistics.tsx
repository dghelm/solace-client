/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import wallet
    import utils

    Statistics function
      useRef variables
      Hook variables
      useState variables
      Contract functions
      Local helper functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useRef, useState } from 'react'

/* import packages */
import { formatEther, parseEther } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'

/* import constants */
import { GAS_LIMIT, CHAIN_ID } from '../../constants'
import { TransactionCondition, FunctionName, Unit, PolicyStatus } from '../../constants/enums'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useToasts } from '../../context/NotificationsManager'
import { useUserData } from '../../context/UserDataManager'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemValue, BoxItemTitle, BoxItemUnits } from './index'
import { Button } from '../Button'

/* import hooks */
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useSolaceBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'

/* import wallet */
import { WalletConnectButton } from '../Button/WalletConnect'

/* import utils */
import { getAllPolicies } from '../../utils/policyGetter'
import { fixed, getGasValue, floatEther, truncateBalance } from '../../utils/formatting'

export const Statistics = () => {
  /************************************************************************************* 

    useRef variables 

  *************************************************************************************/
  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()

  /*************************************************************************************

  Hook variables

  *************************************************************************************/
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm, lpToken } = useContracts()
  const { errors, makeTxToast } = useToasts()
  const { addLocalTransactions } = useUserData()
  const capitalPoolSize = useCapitalPoolSize()
  const solaceBalance = useSolaceBalance()
  const totalUserRewards = useTotalPendingRewards()
  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)

  /*************************************************************************************

  useState variables

  *************************************************************************************/
  const [totalValueLocked, setTotalValueLocked] = useState<string>('0.00')
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<number>(0.0)
  const [totalActivePolicies, setTotalActivePolicies] = useState<number>(0.0)

  /*************************************************************************************

  Contract functions

  *************************************************************************************/
  const claimRewards = async () => {
    if (!masterContract.current) return
    const txType = FunctionName.WITHDRAW_REWARDS
    try {
      const tx = await masterContract.current.withdrawRewards({
        gasPrice: getGasValue(wallet.gasPrices.options[1].value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      addLocalTransactions({
        hash: txHash,
        type: txType,
        value: totalUserRewards,
        status: TransactionCondition.PENDING,
        unit: Unit.SOLACE,
      })
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      wallet.reload()
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      if (err?.code === 4001) {
        console.log('Transaction rejected.')
      } else {
        console.log(`Transaction failed: ${err.message}`)
      }
      makeTxToast(txType, TransactionCondition.CANCELLED)
      wallet.reload()
    }
  }

  /*************************************************************************************

  Local helper functions

  *************************************************************************************/
  const getTotalValueLocked = () => {
    const formattedTVL = formatEther(parseEther(cpPoolValue).add(parseEther(lpPoolValue)))
    setTotalValueLocked(formattedTVL)
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/
  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    lpTokenContract.current = lpToken
    masterContract.current = master
    solaceContract.current = solace
    vaultContract.current = vault

    getTotalValueLocked()
  }, [master, vault, solace, cpFarm, lpFarm, lpToken])

  useEffect(() => {
    getTotalValueLocked()
  }, [cpPoolValue, lpPoolValue])

  useEffect(() => {
    try {
      const fetchPolicies = async () => {
        const policies = await getAllPolicies(Number(CHAIN_ID))
        const activePolicies = policies.filter(({ status }) => status === PolicyStatus.ACTIVE)

        let activeCoverAmount = 0
        activePolicies.forEach(({ coverAmount }) => {
          try {
            activeCoverAmount += parseFloat(coverAmount)
          } catch (e) {
            console.log(e)
          }
        })

        setTotalActiveCoverAmount(activeCoverAmount)
        setTotalActivePolicies(activePolicies.length)
      }
      fetchPolicies()
    } catch (err) {
      console.log(err)
    }
  }, [])

  return (
    <BoxRow>
      {wallet.initialized && wallet.account ? (
        <Box>
          <BoxItem>
            <BoxItemTitle h3>My Balance</BoxItemTitle>
            <BoxItemValue h2>
              {`${truncateBalance(parseFloat(solaceBalance), 6)} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>My Rewards</BoxItemTitle>
            <BoxItemValue h2>
              {`${truncateBalance(parseFloat(totalUserRewards), 6)} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <Button disabled={errors.length > 0 || fixed(parseFloat(totalUserRewards), 6) <= 0} onClick={claimRewards}>
              Claim
            </Button>
          </BoxItem>
        </Box>
      ) : (
        <Box>
          <BoxItem>
            <WalletConnectButton />
          </BoxItem>
        </Box>
      )}
      <Box purple>
        <BoxItem>
          <BoxItemTitle h3>Capital Pool Size</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {`${truncateBalance(floatEther(parseEther(capitalPoolSize)), 1)} `}
            <BoxItemUnits h3>{Unit.ETH}</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Value Locked</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {`${truncateBalance(parseFloat(totalValueLocked), 1)} `}
            <BoxItemUnits h3>{Unit.ETH}</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {`${fixed(parseFloat(formatEther(totalActiveCoverAmount.toString())), 2)} `}
            <BoxItemUnits h3>{Unit.ETH}</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Active Policies</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {totalActivePolicies}
          </BoxItemValue>
        </BoxItem>
      </Box>
    </BoxRow>
  )
}
