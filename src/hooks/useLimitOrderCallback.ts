import { BIPS_BASE, EIP_1559_ACTIVATION_BLOCK } from '../constants'
import { LimitOrder, ChainId, Currency, CurrencyAmount, CoreDAO, JSBI, Percent, TradeSmart } from '@cryptoscalper/sdk'
import { arrayify, hexlify, splitSignature } from '@ethersproject/bytes'
import { isAddress, isZero } from '../functions/validate'
import { useLimitOrderContract } from './useContract'

import { BigNumber } from '@ethersproject/bignumber'
import Common from '@ethereumjs/common'
import { SignatureData } from './useERC20Permit'
import { TransactionFactory } from '@ethereumjs/tx'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import approveAmountCalldata from '../functions/approveAmountCalldata'
import { calculateGasMargin, getGasPrice } from '../functions/trade'
import { keccak256 } from '@ethersproject/keccak256'
import { shortenAddress } from '../functions/format'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useArgentWalletContract } from './useArgentWalletContract'
import { useBlockNumber } from '../state/application/hooks'
import useENS from './useENS'
import { useMemo } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'
import useTransactionDeadline from './useTransactionDeadline'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  address: string
  calldata: string
  value: string
}

interface SwapCallEstimate {
  call: SwapCall
}

export interface SuccessfulCall extends SwapCallEstimate {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall extends SwapCallEstimate {
  call: SwapCall
  error: Error
}

export type EstimatedSwapCall = SuccessfulCall | FailedCall

function bnToHex(n: bigint) {
  return '0x' + n.toString(16)
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param signatureData the signature data of the permit of the input token amount, if available
 */
export function useLimitOrderCallArguments(
  inputAmount: CurrencyAmount<Currency>,
  outputAmount: CurrencyAmount<Currency>,
  coinsToMaker: string,
  coinsToTaker: string,
  dueTime80: string,
  r: string,
  s: string,
  v: number,
  version: number
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React()

  const limitOrderContract = useLimitOrderContract()
  const argentWalletContract = useArgentWalletContract()

  return useMemo(() => {
    if (
      !inputAmount ||
      !outputAmount ||
      !coinsToMaker ||
      !coinsToTaker ||
      !dueTime80 ||
      !r ||
      !s ||
      !v ||
      !version ||
      !library ||
      !account ||
      !chainId
    )
      return []

    if (!limitOrderContract) return []
    const methods = []

    const dueTime80_v8_version8 = bnToHex((BigInt(dueTime80) << 16n) | (BigInt(v) << 8n) | BigInt(version))

    // console.log('coinsToMaker:          ', coinsToMaker)
    // console.log('coinsToTaker:          ', coinsToTaker)
    // console.log('r:                     ', r)
    // console.log('s:                     ', s)

    // console.log('dueTime80:             ', dueTime80)
    // console.log('dueTime80 hex:         ', bnToHex(BigInt(dueTime80)))
    // console.log('dueTime80 << 16n hex:  ', bnToHex(BigInt(dueTime80) << 16n))

    // console.log('v:                     ', v)
    // console.log('v hex:                 ', bnToHex(BigInt(v)))
    // console.log('v << 8n hex:           ', bnToHex(BigInt(v) << 8n))

    // console.log('version:               ', version)
    // console.log('version hex:           ', bnToHex(BigInt(version)))

    // console.log('dueTime80_v8_version8: ', dueTime80_v8_version8)

    methods.push(
      LimitOrder.directExchangeCallParameters(
        inputAmount,
        outputAmount,
        coinsToMaker,
        coinsToTaker,
        dueTime80,
        r,
        s,
        v,
        version
      )
    )

    // console.log('methods: ', methods)

    return methods.map(({ methodName, args, value }) => {
      if (argentWalletContract && inputAmount.currency.isToken) {
        return {
          address: argentWalletContract.address,
          calldata: argentWalletContract.interface.encodeFunctionData('wc_multiCall', [
            [
              approveAmountCalldata(inputAmount, limitOrderContract.address),
              {
                to: limitOrderContract.address,
                value: value,
                data: limitOrderContract.interface.encodeFunctionData(methodName, args),
              },
            ],
          ]),
          value: '0x0',
        }
      } else {
        // console.log({ methodName, args })
        return {
          address: limitOrderContract.address,
          calldata: limitOrderContract.interface.encodeFunctionData(methodName, args),
          value,
        }
      }
    })
  }, [
    account,
    argentWalletContract,
    chainId,
    library,
    limitOrderContract,
    inputAmount,
    outputAmount,
    coinsToMaker,
    coinsToTaker,
    dueTime80,
    r,
    s,
    v,
    version,
  ])
}

/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
export function swapErrorToUserReadableMessage(error: any): string {
  let reason: string | undefined

  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }

  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)

  switch (reason) {
    case 'UniswapV2Router: EXPIRED':
      return t`The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.`
    case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
    case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
      return t`This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.`
    case 'TransferHelper: TRANSFER_FROM_FAILED':
      return t`The input token cannot be transferred. There may be an issue with the input token.`
    case 'UniswapV2: TRANSFER_FAILED':
      return t`The output token cannot be transferred. There may be an issue with the output token.`
    case 'UniswapV2: K':
      return t`The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.`
    case 'Too little received':
    case 'Too much requested':
    case 'STF':
      return t`This transaction will not succeed due to price movement. Try increasing your slippage tolerance.`
    case 'TF':
      return t`The output token cannot be transferred. There may be an issue with the output token.`
    default:
      if (reason?.indexOf('undefined is not an object') !== -1) {
        console.error(error, reason)
        return t`An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note fee on transfer and rebase tokens are incompatible with Uniswap V3.`
      }
      return t`Unknown error${reason ? `: "${reason}"` : ''}. Try increasing your slippage tolerance.`
  }
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useLimitOrderCallback(
  inputAmount: CurrencyAmount<Currency>,
  outputAmount: CurrencyAmount<Currency>,
  coinsToMaker: string,
  coinsToTaker: string,
  dueTime80: string,
  r: string,
  s: string,
  v: number,
  version: number
): {
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useActiveWeb3React()

  const blockNumber = useBlockNumber()

  const eip1559 =
    EIP_1559_ACTIVATION_BLOCK[chainId] == undefined ? false : blockNumber >= EIP_1559_ACTIVATION_BLOCK[chainId]

  // const swapCalls = useLimitOrderCallArguments(trade, allowedSlippage, feePercent, signatureData)

  const swapCalls = useLimitOrderCallArguments(
    inputAmount,
    outputAmount,
    coinsToMaker,
    coinsToTaker,
    dueTime80,
    r,
    s,
    v,
    version
  )

  const addTransaction = useTransactionAdder()

  const recipient = account

  return useMemo(() => {
    if (
      !inputAmount ||
      !outputAmount ||
      !coinsToMaker ||
      !coinsToTaker ||
      !dueTime80 ||
      !r ||
      !s ||
      !v ||
      !version ||
      !library ||
      !account ||
      !chainId
    ) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!recipient) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: 'Invalid recipient',
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
          swapCalls.map((call) => {
            const { address, calldata, value } = call

            const tx =
              !value || isZero(value)
                ? { from: account, to: address, data: calldata }
                : {
                    from: account,
                    to: address,
                    data: calldata,
                    value,
                  }

            // console.log('Estimate gas for valid swap')

            // library.getGasPrice().then((gasPrice) => console.log({ gasPrice }))

            return library
              .estimateGas(tx)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                }
              })
              .catch((gasError) => {
                console.debug('Gas estimate failed, trying eth_call to extract error', call)

                return library
                  .call(tx)
                  .then((result) => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return {
                      call,
                      error: new Error('Unexpected issue with estimating the gas. Please try again.'),
                    }
                  })
                  .catch((callError) => {
                    console.debug('Call threw error', call, callError)
                    return {
                      call,
                      error: new Error(swapErrorToUserReadableMessage(callError)),
                    }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        // check if any calls errored with a recognizable error
        if (!bestCallOption) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          const firstNoErrorCall = estimatedCalls.find<SwapCallEstimate>(
            (call): call is SwapCallEstimate => !('error' in call)
          )
          if (!firstNoErrorCall) throw new Error('Unexpected error. Could not estimate gas for the swap.')
          bestCallOption = firstNoErrorCall
        }

        const {
          call: { address, calldata, value },
        } = bestCallOption

        // console.log({ bestCallOption })
        console.log('gasEstimate' in bestCallOption ? { gasLimit: calculateGasMargin(bestCallOption.gasEstimate) } : {})
        return library
          .getSigner()
          .sendTransaction({
            from: account,
            to: address,
            data: calldata,
            // let the wallet try if we can't estimate the gas
            ...('gasEstimate' in bestCallOption ? { gasLimit: calculateGasMargin(bestCallOption.gasEstimate) } : {}),
            ...(value && !isZero(value) ? { value } : {}),
            gasPrice: getGasPrice(),
          })
          .then((response) => {
            const inputSymbol = inputAmount.currency.symbol
            const outputSymbol = outputAmount.currency.symbol
            const inputAmountStr = inputAmount.toSignificant(4)
            const outputAmountStr = outputAmount.toSignificant(4)

            const base = `Swap ${inputAmountStr} ${inputSymbol} for ${outputAmountStr} ${outputSymbol}`
            const withRecipient = base

            addTransaction(response, {
              summary: withRecipient,
            })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, address, calldata, value)

              throw new Error(`Swap failed: ${swapErrorToUserReadableMessage(error)}`)
            }
          })
      },
      error: null,
    }
  }, [
    inputAmount,
    outputAmount,
    coinsToMaker,
    coinsToTaker,
    dueTime80,
    r,
    s,
    v,
    version,
    library,
    account,
    chainId,
    recipient,
    swapCalls,
    addTransaction,
  ])
}
