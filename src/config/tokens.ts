import { ChainId, TANGO_ADDRESS, BAR_ADDRESS, Token, WBCH} from '@cryptoscalper/sdk'

export const FLEXUSD = new Token(ChainId.COREDAO, '0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72', 18, 'flexUSD', 'flexUSD')
export const LAWUSD = new Token(ChainId.COREDAO, '0xE1E655BE6F50344e6dd708c27BD8D66492d6ecAf', 18, 'lawUSD', 'LAW US Dollar')
export const LAW = new Token(ChainId.COREDAO, '0x0b00366fBF7037E9d75E4A569ab27dAB84759302', 18, 'LAW', 'LAW')
export const BCUSDT = new Token(ChainId.COREDAO, '0xBc2F884680c95A02cea099dA2F524b366d9028Ba', 18, 'bcUSDT', 'BlockNG-Peg USDT Token');
export const BCBCH = new Token(ChainId.COREDAO, '0xBc9bD8DDe6C5a8e1CBE293356E02f5984693b195', 18, 'bcBCH', 'BlockNG-Peg BCH Token');
export const GOC = new Token(ChainId.COREDAO, '0x4b85a666dec7c959e88b97814e46113601b07e57', 18, 'GOC', 'GoCrypto');

export const XTANGO: ChainTokenMap = {
    [ChainId.COREDAO]: new Token(ChainId.COREDAO, BAR_ADDRESS[ChainId.COREDAO], 18, 'xTANGO', 'TangoBar'),
    [ChainId.COREDAO_AMBER]: new Token(ChainId.COREDAO_AMBER, BAR_ADDRESS[ChainId.COREDAO_AMBER], 18, 'xTANGO', 'TangoBar'),
}

type ChainTokenMap = {
  readonly [chainId in ChainId]?: Token
}

export const TANGO: ChainTokenMap = {
  [ChainId.COREDAO]: new Token(ChainId.COREDAO, TANGO_ADDRESS[ChainId.COREDAO], 18, 'TANGO', 'TangoToken'),
  [ChainId.COREDAO_AMBER]: new Token(ChainId.COREDAO_AMBER, TANGO_ADDRESS[ChainId.COREDAO_AMBER], 18, 'TANGO', 'TangoToken'),
}

export const WBCH_EXTENDED: { [chainId: number]: Token } = {
  ...WBCH,
}

type ChainTokenMapList = {
  readonly [chainId in ChainId]?: Token[]
}

// These are available for migrate
export const BENSWAP_TOKENS: ChainTokenMapList = {
  [ChainId.COREDAO]: [
  ],
  [ChainId.COREDAO_AMBER]: [
    new Token(ChainId.COREDAO_AMBER, '0x842692f8A4D0743e942dF5D52155a037327d4f3f', 18, 'EBENS/BCH LP Token', 'EBEN-BCH'),
  ],
}
