/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    ClaimModal function
      useState hooks
      custom hooks
      contract functions
      local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useCallback, useEffect, useState, useRef } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Modal } from '../molecules/Modal'
import { FormRow, FormCol } from '../atoms/Form'
import { Heading2, Heading3, Text2, Text3 } from '../atoms/Typography'
import { PolicyModalInfo } from '../molecules/PolicyModalInfo'
import { Loader } from '../atoms/Loader'
import { SmallBox, Box } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Table, TableBody, TableRow, TableData } from '../atoms/Table'

/* import constants */
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { GAS_LIMIT, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { Policy, ClaimAssessment } from '../../constants/types'

/* import hooks */
import { useGetCooldownPeriod } from '../../hooks/useClaimsEscrow'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getClaimAssessment } from '../../utils/paclas'
import { truncateBalance, getGasValue } from '../../utils/formatting'
import { timeToDateText } from '../../utils/time'

interface ClaimModalProps {
  closeModal: () => void
  isOpen: boolean
  latestBlock: number
  selectedPolicy: Policy | undefined
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ isOpen, selectedPolicy, closeModal, latestBlock }) => {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false)
  const [asyncLoading, setAsyncLoading] = useState<boolean>(false)
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null)
  const canLoadOverTime = useRef(false)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const cooldown = useGetCooldownPeriod()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useToasts()
  const { errors } = useWallet()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { width } = useWindowDimensions()

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

  const submitClaim = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    const { amountOut, deadline, signature } = assessment
    const txType = FunctionName.SUBMIT_CLAIM
    try {
      const tx = await selectedProtocol.submitClaim(selectedPolicy.policyId, amountOut, deadline, signature, {
        gasPrice: getGasValue(gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ID }
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        if (receipt.status) setClaimSubmitted(true)
        makeTxToast(txType, status, txHash)
        reload()
      })
      setModalLoading(false)
    } catch (err) {
      console.log('submitClaim:', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const handleClose = useCallback(() => {
    setClaimSubmitted(false)
    setModalLoading(false)
    closeModal()
  }, [closeModal])

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !isOpen) return
      setAsyncLoading(true)
      const assessment = await getClaimAssessment(String(selectedPolicy.policyId), activeNetwork.chainId)
      setAssessment(assessment)
      canLoadOverTime.current = true
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, activeNetwork])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Policy Claim'} disableCloseButton={modalLoading}>
      <Fragment>
        <PolicyModalInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} />
        {!modalLoading && !asyncLoading ? (
          <Fragment>
            <FormRow mb={0}>
              <FormCol>
                <Text3 autoAlign nowrap>
                  {width > MAX_MOBILE_SCREEN_WIDTH ? 'By submitting a claim, you receive' : null}
                </Text3>
              </FormCol>
              <FormCol></FormCol>
            </FormRow>
            <FormRow mb={0}>
              <FormCol>
                <Text3 autoAlign nowrap>
                  {width > MAX_MOBILE_SCREEN_WIDTH ? 'pre-exploit assets value equal to' : 'Receiving'}
                </Text3>
              </FormCol>
              <FormCol>
                <Heading2 autoAlign>
                  {truncateBalance(formatUnits(assessment?.amountOut || 0, currencyDecimals))}{' '}
                  {activeNetwork.nativeCurrency.symbol}
                </Heading2>
              </FormCol>
            </FormRow>
            <SmallBox transparent mt={!assessment?.lossEventDetected ? 10 : 0} collapse={assessment?.lossEventDetected}>
              <Text2 autoAlign error={!assessment?.lossEventDetected}>
                No loss event detected, unable to submit claims yet.
              </Text2>
            </SmallBox>
            {claimSubmitted ? (
              <Box purple mt={20} mb={20}>
                <Heading2 autoAlign>Claim has been validated and payout submitted to the escrow.</Heading2>
              </Box>
            ) : (
              <ButtonWrapper>
                <Button
                  widthP={100}
                  disabled={errors.length > 0 || !assessment?.lossEventDetected}
                  onClick={() => submitClaim()}
                >
                  Submit Claim
                </Button>
              </ButtonWrapper>
            )}
            <SmallBox transparent>
              <Heading3 warning textAlignCenter>
                Please wait for the cooldown period to elapse before withdrawing your payout.
              </Heading3>
            </SmallBox>
            <Table isHighlight>
              <TableBody>
                <TableRow>
                  <TableData t2>Current Cooldown Period</TableData>
                  <TableData t2 textAlignRight>
                    {timeToDateText(parseInt(cooldown) * 1000)}
                  </TableData>
                </TableRow>
              </TableBody>
            </Table>
          </Fragment>
        ) : (
          <Loader />
        )}
      </Fragment>
    </Modal>
  )
}