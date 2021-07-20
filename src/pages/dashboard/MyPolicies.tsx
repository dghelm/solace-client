/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import utils

    MyPolicies function
      custom hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import constants */
import { Policy } from '../../constants/types'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../../components/Table'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import { Heading2, Text } from '../../components/Typography'
import { PolicyState } from '../../constants/enums'
import { FlexRow } from '../../components/Layout'
import { PositionCardLogo } from '../../components/Position'

/* import utils */
import { getNativeTokenUnit, truncateBalance } from '../../utils/formatting'
import { getDays, getDateStringWithMonthName, getDateExtended } from '../../utils/time'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: number
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({ openClaimModal, openManageModal, latestBlock }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const wallet = useWallet()
  const { userPolicies } = useCachedData()

  /*************************************************************************************

    Local functions

  *************************************************************************************/
  const calculatePolicyExpirationDate = (expirationBlock: string): string => {
    const daysLeft = getDays(parseFloat(expirationBlock), latestBlock)
    return getDateStringWithMonthName(getDateExtended(daysLeft))
  }

  const shouldWarnUser = (policy: Policy): boolean => {
    return policy.status === PolicyState.ACTIVE && getDays(parseFloat(policy.expirationBlock), latestBlock) <= 1
  }

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {userPolicies.policiesLoading ? (
        <Loader />
      ) : userPolicies.userPolicies.length > 0 ? (
        <Table textAlignCenter>
          <TableHead>
            <TableRow>
              <TableHeader>Coverage Type</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Id</TableHeader>
              <TableHeader>Expiration Date</TableHeader>
              <TableHeader>Covered Amount</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {userPolicies.userPolicies.map((policy) => {
              return (
                <TableRow key={policy.policyId}>
                  <TableData>
                    {
                      <FlexRow>
                        <PositionCardLogo>
                          <img src={`https://assets.solace.fi/${policy.productName.toLowerCase()}.svg`} />
                        </PositionCardLogo>
                        <PositionCardLogo>
                          <img src={`https://assets.solace.fi/${policy.positionName.toLowerCase()}.svg`} />
                        </PositionCardLogo>
                        <Text autoAlign>
                          {policy.productName} - {policy.positionName}
                        </Text>
                      </FlexRow>
                    }
                  </TableData>
                  <TableData error={policy.status === PolicyState.EXPIRED} warning={shouldWarnUser(policy)}>
                    {policy.status}
                  </TableData>
                  <TableData>{policy.policyId}</TableData>
                  <TableData warning={shouldWarnUser(policy)}>
                    {calculatePolicyExpirationDate(policy.expirationBlock)}
                  </TableData>
                  <TableData>
                    {policy.coverAmount ? truncateBalance(parseFloat(formatEther(policy.coverAmount)), 2) : 0}{' '}
                    {getNativeTokenUnit(wallet.chainId)}
                  </TableData>

                  <TableData textAlignRight>
                    {policy.status === PolicyState.ACTIVE && (
                      <TableDataGroup>
                        <Button onClick={() => openClaimModal(policy)}>Claim</Button>
                        <Button onClick={() => openManageModal(policy)}>Manage</Button>
                      </TableDataGroup>
                    )}
                  </TableData>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <Heading2 textAlignCenter>You do not own any policies.</Heading2>
      )}
    </Fragment>
  )
}
