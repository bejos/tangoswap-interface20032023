import { AddressZero } from '@ethersproject/constants'
import { ChainId, FLEXUSD_ADDRESS } from '@tangoswapcash/sdk'

type Currency = { address: string; decimals: number }

// Pricing currency
// TODO: Check decimals and finish table
export const USD_CURRENCY: { [chainId in ChainId]?: Currency } = {
  [ChainId.COREDAO]: {
    address: FLEXUSD_ADDRESS[ChainId.COREDAO],
    decimals: 18,
  },
  [ChainId.COREDAO_AMBER]: {
    address: FLEXUSD_ADDRESS[ChainId.COREDAO_AMBER],
    decimals: 18,
  },
}

export function getCurrency(chainId: ChainId): Currency {
  return (
    USD_CURRENCY[chainId] || {
      address: AddressZero,
      decimals: 18,
    }
  )
}
