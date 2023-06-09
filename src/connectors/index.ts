import { BscConnector } from '@binance-chain/bsc-connector'
import { ChainId } from '@cryptoscalper/sdk'
import { FortmaticConnector } from '../entities/FortmaticConnector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '../entities/NetworkConnector'
import { PortisConnector } from '@web3-react/portis-connector'
import { TorusConnector } from '@web3-react/torus-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { Web3Provider } from '@ethersproject/providers'
import RPC from '../config/rpc';

export function getNetwork(defaultChainId, urls = RPC) {
  return new NetworkConnector({
    defaultChainId,
    urls,
  })
}

export const network = new NetworkConnector({
  defaultChainId: ChainId.COREDAO,
  urls: RPC,
})

let networkLibrary: Web3Provider | undefined

export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

const supportedChainIds = Object.values(ChainId) as number[]

export const injected = new InjectedConnector({
  supportedChainIds,
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: RPC,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  supportedChainIds: [
    ChainId.COREDAO,
    ChainId.COREDAO_AMBER,
  ],
  chainId: network.provider.chainId
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: process.env.NEXT_PUBLIC_FORTMATIC_API_KEY ?? '',
  chainId: ChainId.COREDAO,
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: process.env.NEXT_PUBLIC_PORTIS_ID ?? '',
  networks: [ChainId.COREDAO],
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: RPC[ChainId.COREDAO],
  appName: 'TangoSwap',
  appLogoUrl: 'https://raw.githubusercontent.com/tangoswap-cash/art/master/TANGO/logo-256x256.png',
})

// mainnet only
export const torus = new TorusConnector({
  chainId: ChainId.COREDAO,
})

// binance only
export const binance = new BscConnector({ supportedChainIds: [56] })
