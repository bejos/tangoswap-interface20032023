import { ChainId } from '@tangoswapcash/sdk'

const CoreDao = 'https://raw.githubusercontent.com/tangoswap-cash/icons/master/network/smartbch.jpg'
const CoreDaoAmber = 'https://raw.githubusercontent.com/tangoswap-cash/icons/master/network/smartbch_amber.jpg'

export const NETWORK_ICON = {
  [ChainId.COREDAO]: CoreDao,
  [ChainId.COREDAO_AMBER]: CoreDaoAmber,
}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
  [ChainId.COREDAO]: 'coreDAO',
  [ChainId.COREDAO_AMBER]: 'Amber Testnet',
}
