import { constants } from 'ethers'

export const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY

export const REGISTRY_CONTRACT_ADDRESS = process.env.REACT_APP_REGISTRY_CONTRACT_ADDRESS
export const SOLACE_CONTRACT_ADDRESS = process.env.REACT_APP_SOLACE_CONTRACT_ADDRESS
export const WETH_CONTRACT_ADDRESS = process.env.REACT_APP_WETH_CONTRACT_ADDRESS
export const MASTER_CONTRACT_ADDRESS = process.env.REACT_APP_MASTER_CONTRACT_ADDRESS
export const VAULT_CONTRACT_ADDRESS = process.env.REACT_APP_VAULT_CONTRACT_ADDRESS
export const CPFARM_CONTRACT_ADDRESS = process.env.REACT_APP_CPFARM_CONTRACT_ADDRESS
export const UNISWAP_FACTORY_CONTRACT_ADDRESS = process.env.REACT_APP_UNISWAP_FACTORY_CONTRACT_ADDRESS
export const UNISWAP_ROUTER_CONTRACT_ADDRESS = process.env.REACT_APP_UNISWAP_ROUTER_CONTRACT_ADDRESS
export const UNISWAP_LPTOKEN_CONTRACT_ADDRESS = process.env.REACT_APP_UNISWAP_LPTOKEN_CONTRACT_ADDRESS
export const UNISWAP_POOL_CONTRACT_ADDRESS = process.env.REACT_APP_UNISWAP_POOL_CONTRACT_ADDRESS
export const LPFARM_CONTRACT_ADDRESS = process.env.REACT_APP_LPFARM_CONTRACT_ADDRESS
export const TREASURY_CONTRACT_ADDRESS = process.env.REACT_APP_TREASURY_CONTRACT_ADDRESS
export const CLAIMS_ESCROW_CONTRACT_ADDRESS = process.env.REACT_APP_CLAIMS_ESCROW_CONTRACT_ADDRESS
export const CLAIMS_ADJUSTOR_CONTRACT_ADDRESS = process.env.REACT_APP_CLAIMS_ADJUSTOR_CONTRACT_ADDRESS

export const NUM_BLOCKS_PER_DAY = 6500
export const NUM_DAYS_PER_MONTH = 30
export const DAYS_PER_YEAR = 365

export const TOKEN_NAME = 'Solace CP Token'
export const TOKEN_SYMBOL = 'SCP'
export const DEADLINE = constants.MaxUint256
export const ZERO = constants.Zero
export const ADDRESS_ZERO = constants.AddressZero

export const CP_ROI = '150.5%'
export const LP_ROI = '6.0%'