import { Contract } from '@ethersproject/contracts'
import { formatEther } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'

export const useUserStakedValue = (farm: Contract | null | undefined): string => {
  const { account, version } = useWallet()
  const [userStakedValue, setUserStakedValue] = useState<string>('0.00')

  useEffect(() => {
    const getUserStakedValue = async () => {
      if (!farm) return
      try {
        const user = await farm.userInfo(account)
        const staked = user.value
        const formattedUserStakedValue = formatEther(staked)
        setUserStakedValue(formattedUserStakedValue)
      } catch (err) {
        console.log('getUserStakedValue', err)
      }
    }
    getUserStakedValue()
  }, [account, version, farm])

  return userStakedValue
}

export const usePoolStakedValue = (farm: Contract | null | undefined): string => {
  const [poolValue, setPoolValue] = useState<string>('0.00')

  const { dataVersion } = useWallet()

  useEffect(() => {
    const getPoolStakedValue = async () => {
      if (!farm) return
      try {
        const poolValue = await farm.valueStaked()
        const formattedPoolValue = formatEther(poolValue)
        setPoolValue(formattedPoolValue)
      } catch (err) {
        console.log('getPoolValue', err)
      }
    }
    getPoolStakedValue()
  }, [farm, dataVersion])

  return poolValue
}