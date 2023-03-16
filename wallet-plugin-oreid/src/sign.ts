import {
    API,
    Action,
    ActionFields,
    Bytes,
    KeyType,
    ResolvedSigningRequest,
    Signature,
    UserInterfaceTranslateOptions,
    WalletPluginData,
} from '@wharfkit/session'

import {OreIdSigningResponse} from './types'
import {getCurrentTime, isValidEvent, registerCloseListener} from './utils'
import { ChainNetwork, OreId, PopupPluginSignParams, PopupPluginSignResults, Transaction, TransactionData, TransactionSignOptions } from 'oreid-js'

import { Api, JsonRpc } from 'eosjs'
import {JsSignatureProvider} from 'eosjs/dist/eosjs-jssig'


export async function allowAutosign(
    request: ResolvedSigningRequest,
    data: WalletPluginData
): Promise<boolean> {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.search('chrome') === -1 && ua.search('safari') >= 0) {
        return false
    }

    try {
        if (!data) return false
        const whitelist = data.whitelist
        const {actions} = request.resolvedTransaction
        return actions.every((action) => {
            return whitelist.find((entry) => {
                if (action.account.equals(entry.contract)) {
                    if (
                        action.account.equals('eosio.token') &&
                        action.name &&
                        action.name.equals('transfer')
                    ) {
                        return entry.recipients.includes(String(action.data.to))
                    }
                    return true
                }
            })
        })
    } catch (e) {
        // console.log('error in canAutoSign', e)
    }

    return false
}

export async function autoSign(
    t: (key: string, options?: UserInterfaceTranslateOptions) => string,
    urlString: URL | string,
    request: ResolvedSigningRequest
): Promise<OreIdSigningResponse> {
    const url = new URL(urlString)
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5000)
    const response: any = await fetch(url, {
        body: JSON.stringify({
            feeFallback: true,
            freeBandwidth: true,
            transaction: request.serializedTransaction,
        }),
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        signal: controller.signal,
    })
    if (!response.ok) {
        throw new Error(
            t('error.endpoint', {
                default: `Login Endpoint Error {{status}} - {{statusText}}`,
                status: response.status,
                statusText: response.statusText,
            })
        )
    }
    const data: any = await response.json()
    if (data.processed && data.processed.except) {
        throw new Error(
            t('error.exception', {
                default: 'Signing exception occurred: {{exception}}',
                exception: JSON.stringify(data),
            })
        )
    }
    return data
}

export async function popupTransact(
    t: (key: string, options?: UserInterfaceTranslateOptions) => string,
    // urlString: URL | string,
    request: ResolvedSigningRequest,
    timeout = 300000,
    oreId: OreId,
    chain: any
): Promise<OreIdSigningResponse> {

    const mockTransactionDataForAction = {
        from: request.signer.actor.toString(),
        to: request.signer.actor.toString(),
        quantity: '0.00000001 WAX',
        memo: 'hello from ORE ID',
    }

    // const jsonRpc = new JsonRpc("https://waxtestnet.greymass.com")
    // const signatureProvider = new JsSignatureProvider(["5JN4DMQQDf1bB9VQnN76nn5EMhXXeW5WYzmKfH378qbQ8FD3JUw"])
    // const WAXApi = new Api({rpc: jsonRpc, signatureProvider: signatureProvider})

    const transactionToSign = {
        account: request.transaction.actions[0].account,
        name: request.transaction.actions[0].name.toString(),
        authorization: request.transaction.actions[0].authorization,
        // data: request.transaction.actions[0].data,
        data: mockTransactionDataForAction
    }

    const transactionFields: Action = new Action(transactionToSign)

    // const deserializedAction = await WAXApi.deserializeActions([transactionFields.toJSON()])
    // console.log('deserializedAction: ', deserializedAction)

    

    const signTransactionOptions: TransactionSignOptions = {
        broadcast: false,
        returnSignedTransaction: true,
    }

    const transactionData = {
        chainAccount: request.signer.actor.toString(),
        chainNetwork: ChainNetwork.WaxTest,
        // transaction: request.transaction.actions[0].toJSON(),
        transaction: transactionFields.toJSON(),
        // transaction: deserializedAction[0],
        signOptions: signTransactionOptions,
        // expireSeconds: (timeout)
    }

    console.log("transaction: ", transactionData )

    const transaction = await oreId.createTransaction(transactionData)

    console.log(transaction.data)

    const signParams: PopupPluginSignParams = {
        transaction
    }

    console.log('transaction_to_sign: ', transaction)

    const response_raw: PopupPluginSignResults = await oreId.popup.sign(signParams)
    console.log('response_raw: ', response_raw)
    // const url = new URL(urlString)
    const mockData = new Bytes(new Uint8Array([0,1,0,1,1,0,1,]))

    return({
        // serializedTransaction: new Uint8Array([response_raw.signedTransaction]),
        // serializedTransaction: [ response_raw.signedTransaction ],
        // signatures: [ new Signature(KeyType.R1, new Bytes(new Uint8Array(response_raw.signatures))) ],
        // signatures: response_raw.signatures,
        // type: 'transfer',
        // verified: true ,
        // whitelistedContracts: []

            "signatures":[ new Signature(KeyType.R1, mockData)],
            "type": 'transfer',
            "verified": true,
            whitelistedContracts: []

    })

    // const popup = await window.open(url, 'WalletPluginCloudWalletPopup', 'height=800,width=600')
    // if (!popup) {
    //     throw new Error(
    //         t('error.popup', {
    //             default:
    //                 'Unable to open the popup window. Check your browser settings and try again.',
    //         })
    //     )
    // }

    // return new Promise<OreIdSigningResponse>((resolve, reject) => {
    //     const closeListener = registerCloseListener(t, popup, reject)
    //     const handleEvent = (event: MessageEvent) => {
    //         if (!isValidEvent(event, url, popup)) {
    //             return
    //         }
    //         popup?.postMessage(
    //             {
    //                 feeFallback: true,
    //                 freeBandwidth: true,
    //                 startTime: getCurrentTime(),
    //                 transaction: request.serializedTransaction,
    //                 type: 'TRANSACTION',
    //             },
    //             String(urlString)
    //         )
    //         const handleSigning = (signingEvent: MessageEvent) => {
    //             if (!isValidEvent(signingEvent, url, popup)) {
    //                 return
    //             }
    //             try {
    //                 resolve(signingEvent.data)
    //             } catch (e) {
    //                 reject(e)
    //             } finally {
    //                 window.removeEventListener('message', handleEvent)
    //                 window.removeEventListener('message', handleSigning)
    //                 clearTimeout(autoCancel)
    //                 clearInterval(closeListener)
    //             }
    //         }
    //         window.addEventListener('message', handleSigning)
    //     }
    //     // Automatically cancel request after 5 minutes to cleanup windows/promises
    //     const autoCancel = setTimeout(() => {
    //         popup.close()
    //         window.removeEventListener('message', handleEvent)
    //         reject(
    //             new Error(
    //                 t('error.timeout', {
    //                     default:
    //                         'The request has timed out after {{timeout}} seconds. Please try again.',
    //                     timeout: timeout / 1000,
    //                 })
    //             )
    //         )
    //     }, timeout)
    //     // Add event listener awaiting WCW Response
    //     window.addEventListener('message', handleEvent)
    // })
}
