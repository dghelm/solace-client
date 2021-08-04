/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    LiquidityPool function
      custom hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { LP_ROI, ZERO } from '../../constants'

/* import components */
import { Content } from '../atoms/Layout'
import { Heading1 } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button } from '../atoms/Button'

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { useDepositedLpBalance } from '../../hooks/useBalance'

interface LiquidityPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const LiquidityPool: React.FC<LiquidityPoolProps> = ({ openModal }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { account, errors } = useWallet()
  const { lpFarm } = useContracts()

  const lpRewardsPerDay = useRewardsPerDay(2)
  const lpUserRewardsPerDay = useUserRewardsPerDay(2, lpFarm, account)
  const lpUserRewards = useUserPendingRewards(lpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)
  const lpUserStakeValue = useUserStakedValue(lpFarm, account)
  // const depositedLpTokenInfo = useDepositedLpBalance()

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Content>
      <Heading1>SOLACE Liquidity Pool</Heading1>
      <Table isHighlight textAlignCenter>
        <TableHead>
          <TableRow>
            {account ? <TableHeader width={100}>Your Stake</TableHeader> : null}
            <TableHeader>Total Assets</TableHeader>
            <TableHeader width={100}>ROI (1Y)</TableHeader>
            {account ? <TableHeader>My Rewards</TableHeader> : null}
            {account ? <TableHeader>My Daily Rewards</TableHeader> : null}
            <TableHeader>Daily Rewards</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {/* {account ? (
              <TableData width={100}>
                {truncateBalance(
                  formatEther(depositedLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO).toString()),
                  2
                )}
              </TableData>
            ) : null} */}
            {account ? <TableData width={100}>{truncateBalance(parseFloat(lpUserStakeValue), 2)}</TableData> : null}
            <TableData>{truncateBalance(parseFloat(lpPoolValue), 2)}</TableData>
            <TableData width={100}>{LP_ROI}</TableData>
            {account ? <TableData>{truncateBalance(parseFloat(lpUserRewards), 2)}</TableData> : null}
            {account ? <TableData>{truncateBalance(parseFloat(lpUserRewardsPerDay), 2)}</TableData> : null}
            <TableData>{truncateBalance(parseFloat(lpRewardsPerDay), 2)}</TableData>
            {account ? (
              <TableData textAlignRight>
                <TableDataGroup width={200}>
                  <Button
                    disabled={errors.length > 0}
                    onClick={() => openModal(FunctionName.DEPOSIT_SIGNED, 'Deposit')}
                  >
                    Deposit
                  </Button>
                  <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw')}>
                    Withdraw
                  </Button>
                </TableDataGroup>
              </TableData>
            ) : null}
          </TableRow>
        </TableBody>
      </Table>
    </Content>
  )
}
