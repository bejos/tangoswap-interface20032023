import {
    TANGO, XTANGO, LAWUSD, LAW, BCUSDT, BCBCH, GOC
} from '../config/tokens'
// a list of tokens by chain
import { ChainId, Currency, Token, WNATIVE, FLEXUSD } from '@cryptoscalper/sdk'

type ChainTokenList = {
  readonly [chainId: number]: Token[]
}

// List of all mirror's assets addresses.
// Last pulled from : https://whitelist.mirror.finance/eth/tokenlists.json
// TODO: Generate this programmatically ?
const MIRROR_ADDITIONAL_BASES: { [tokenAddress: string]: Token[] } = {
}

// TODO: SDK should have two maps, WETH map and WNATIVE map.
const WRAPPED_NATIVE_ONLY: ChainTokenList = {
  [ChainId.COREDAO]: [WNATIVE[ChainId.COREDAO]],
  [ChainId.COREDAO_AMBER]: [WNATIVE[ChainId.COREDAO_AMBER]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WRAPPED_NATIVE_ONLY,
  [ChainId.COREDAO]: [
    ...WRAPPED_NATIVE_ONLY[ChainId.COREDAO],
    FLEXUSD[ChainId.COREDAO],
    BCUSDT,
    BCBCH,
    LAWUSD,
    LAW,
    GOC,
    TANGO[ChainId.COREDAO]
  ],
  [ChainId.COREDAO_AMBER]: [...WRAPPED_NATIVE_ONLY[ChainId.COREDAO_AMBER]],
}

export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.COREDAO]: {
    ...MIRROR_ADDITIONAL_BASES,
  },
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] }
} = {}

/**
 * Shows up in the currency select for swap and add liquidity
 */
export const COMMON_BASES: ChainTokenList = {
  [ChainId.COREDAO]: [
    ...WRAPPED_NATIVE_ONLY[ChainId.COREDAO],
    TANGO[ChainId.COREDAO],
    FLEXUSD[ChainId.COREDAO],
    BCUSDT,
    BCBCH,
  ],
  [ChainId.COREDAO_AMBER]: [
    ...WRAPPED_NATIVE_ONLY[ChainId.COREDAO_AMBER],
    TANGO[ChainId.COREDAO_AMBER],
    FLEXUSD[ChainId.COREDAO_AMBER],
  ],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WRAPPED_NATIVE_ONLY,
  [ChainId.COREDAO]: [
    ...WRAPPED_NATIVE_ONLY[ChainId.COREDAO],
    TANGO[ChainId.COREDAO],
    FLEXUSD[ChainId.COREDAO],
    BCUSDT,
    BCBCH,
    LAWUSD,
    LAW,
  ],
  [ChainId.COREDAO_AMBER]: [...WRAPPED_NATIVE_ONLY[ChainId.COREDAO_AMBER]],
}

export const PINNED_PAIRS: {
  readonly [chainId in ChainId]?: [Token, Token][]
} = {
  [ChainId.COREDAO]: [
      [TANGO[ChainId.COREDAO], WNATIVE[ChainId.COREDAO]],
  ],
  [ChainId.COREDAO_AMBER]: [
      [TANGO[ChainId.COREDAO_AMBER], WNATIVE[ChainId.COREDAO_AMBER]]
  ],
}
