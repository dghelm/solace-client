/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import utils

    Dashboard function
      useState hooks
      custom hooks
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState } from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { Policy } from '../../constants/types'

/* import components */
import { HeroContainer, Content } from '../../components/Layout'
import { Heading1 } from '../../components/Text'
import { ManageModal } from './ManageModal'
import { ClaimModal } from './ClaimModal'
import { MyPolicies } from './MyPolicies'
import { MyClaims } from './MyClaims'

/* import utils */
import { MyInvestments } from './MyInvestments'
import { useGetLatestBlockNumber } from '../../hooks/useGetLatestBlockNumber'

function Dashboard(): any {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/

  const [showClaimModal, setShowClaimModal] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { setSelectedProtocolByName } = useContracts()
  const latestBlock = useGetLatestBlockNumber()
  const wallet = useWallet()

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  const openClaimModal = async (policy: Policy) => {
    setShowClaimModal((prev) => !prev)
    setPolicy(policy)
  }

  const openManageModal = async (policy: Policy) => {
    setShowManageModal((prev) => !prev)
    setPolicy(policy)
  }

  const setPolicy = (policy: Policy) => {
    setSelectedProtocolByName(policy.productName)
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
  }

  const closeModal = () => {
    setShowClaimModal(false)
    setShowManageModal(false)
    document.body.style.overflowY = 'scroll'
  }

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {!wallet.account ? (
        <HeroContainer>
          <Heading1>Please connect wallet to view dashboard</Heading1>
        </HeroContainer>
      ) : (
        <Fragment>
          <ManageModal
            closeModal={closeModal}
            isOpen={showManageModal}
            latestBlock={latestBlock}
            selectedPolicy={selectedPolicy}
          />
          <ClaimModal
            closeModal={closeModal}
            isOpen={showClaimModal}
            latestBlock={latestBlock}
            selectedPolicy={selectedPolicy}
          />
          <Content>
            <Heading1>Your Policies</Heading1>
            {!showManageModal && !showClaimModal && (
              <MyPolicies latestBlock={latestBlock} openClaimModal={openClaimModal} openManageModal={openManageModal} />
            )}
          </Content>
          {!showManageModal && !showClaimModal && <MyClaims />}
          <MyInvestments />
        </Fragment>
      )}
    </Fragment>
  )
}

export default Dashboard
