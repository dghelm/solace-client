/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components

    Quote function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { MultiStepForm } from './MultiStepForm'
import { Heading1 } from '../../components/atoms/Typography'
import { WalletConnectButton } from '../../components/molecules/WalletConnect'
import { HeroContainer } from '../../components/atoms/Layout'

function Quote(): any {
  /*************************************************************************************
    
  custom hooks

  *************************************************************************************/
  const wallet = useWallet()

  /************************************************************************************** 
      
  Render

  *************************************************************************************/

  return !wallet.isActive || !wallet.account ? (
    <HeroContainer>
      <Heading1>Please connect your wallet to buy quotes</Heading1>
      <WalletConnectButton />
    </HeroContainer>
  ) : (
    <MultiStepForm />
  )
}

export default Quote
