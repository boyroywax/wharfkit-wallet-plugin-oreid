/* eslint-disable no-console */
import {
    AbstractWalletPlugin,
    Bytes,
    cancelable,
    Cancelable,
    KeyType,
    LoginContext,
    PermissionLevel,
    ResolvedSigningRequest,
    Serializer,
    Signature,
    SigningRequest,
    TransactContext,
    Transaction,
    UserInterfaceTranslateOptions,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginSignResponse,
} from '@wharfkit/session'

import {AuthProvider, OreId, OreIdOptions, PopupPluginAuthSuccessResults} from 'oreid-js'
import {WebPopup} from 'oreid-webpopup'

import {autoLogin, popupLogin} from './login'
import {allowAutosign, autoSign, popupTransact} from './sign'
import {OreIdLoginResponse, OreIdSigningResponse} from './types'
import {validateModifications} from './utils'
import defaultTranslations from './translations.json'

export interface WalletPluginOreIdOptions {
    supportedChains?: string[]
    loginTimeout?: number
}

export class WalletPluginOreId extends AbstractWalletPlugin implements WalletPlugin {
    /**
     * The unique identifier for the wallet plugin.
     */
    id = 'wallet-plugin-oreid'

    /**
     * The translations for this plugin
     */
    translations = defaultTranslations

    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: WalletPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: true,
        // Should the user interface display a permission selector?
        requiresPermissionSelect: false,
        // The blockchains this WalletPlugin supports
        supportedChains: [
            '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4', // WAX (Mainnet)
            'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12', // WAX (Testnet)
            '8fc6dce7942189f842170de953932b1f66693ad3788f766e777b6f9d22335c02', // UXNetwork (Mainnet)
            '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11', // TELOS (Mainnet)
            'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', // EOS (Mainnet)
            'a6df478d5593b4efb1ea20d13ba8a3efc1364ee0bf7dbd85d8d756831c0e3256', // ORE (Testnet)
        ],
    }

    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = {
        name: 'ORE ID',
        description: 'Jump On Board!',
        logo: `data:image/png;base64,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
        N26NMLzSESPnQcBXYADZQmb7r+SVxI1bMyzU/
        /X/oBPEPTPQWjgAAAABJRU5ErkJggg==`,
        homepage: 'https://www.oreid.io',
        download: 'https://www.oreid.io',
    }

    /**
     * ORE ID Configuration
     */
    public loginTimeout = 300000 // 5 minutes

    readonly oreIdConfig: OreIdOptions = {
        appName: 'ORE ID Wharf Kit Sample App',
        appId: 't_515b4ffcfdbf42a986a927481e6baf82',
        oreIdUrl: 'https://service.oreid.io',
        plugins: {
            popup: WebPopup(),
        },
    }

    /**
     * ORE ID Object
     */
    public oreId = new OreId(this.oreIdConfig)

    /**
     * Constructor to allow overriding of plugin configuration.
     */
    constructor(options?: WalletPluginOreIdOptions) {
        super()
        if (options?.supportedChains) {
            this.config.supportedChains = options.supportedChains
        }
        if (options?.loginTimeout) {
            this.loginTimeout = options.loginTimeout
        }
    }
    /**
     * Performs the wallet logic required to login and return the chain and permission level to use.
     *
     * @param options WalletPluginLoginOptions
     * @returns Promise<WalletPluginLoginResponse>
     */
    login(context: LoginContext): Cancelable<WalletPluginLoginResponse> {
        const promise = this.waxLogin(context)
        return cancelable(promise, (canceled) => {
            throw canceled
        })
    }
    async waxLogin(context: LoginContext): Promise<WalletPluginLoginResponse> {
        await this.oreId.init().then(() => {
            console.log('initialized')
        })
        if (!context.chain) {
            throw new Error('A chain must be selected to login with.')
        }

        // Retrieve translation helper from the UI, passing the app ID
        const t = context.ui.getTranslate(this.id)

        let response: OreIdLoginResponse | undefined = undefined
        try {
            // Attempt automatic login
            context.ui.status(t('connecting', {default: 'Connecting to ORE ID'}))
            response = await autoLogin(t, this.oreId)

            if (response === undefined) {
                // Fallback to popup login
                // if (!this.oreId.auth.isLoggedIn) {
                    context.ui.status(t('login.popup', {default: 'Login with the ORE ID popup window'}))
                    // eslint-disable-next-line prefer-const
                    response = await popupLogin(t, this.oreId, context.chain)

                    console.log('response: ', response)
            }
        }
        catch (e) {
            console.log('failed logging in with ORE ID: ', e)
        }

        

        // If failed due to no response or no verified response, throw error
        if (!response || response === undefined) {
            throw new Error(t('login.error.response', {default: 'Cloud Wallet failed to respond'}))
        }

        if (!response.verified) {
            throw new Error(
                t('error.closed', {
                    default: 'Cloud Wallet closed before the login was completed',
                })
            )
        }

        // Save our whitelisted contracts
        // this.data.whitelist = response.whitelistedContracts

        return new Promise((resolve) => {
            if (!context.chain) {
                throw new Error('A chain must be selected to login with.')
            }
            // Return to session's transact call
            resolve({
                chain: context.chain.id,
                permissionLevel: PermissionLevel.from({
                    actor: response.account,
                    permission: 'active',
                }),
            })
        })
    }
    /**
     * Performs the wallet logic required to sign a transaction and return the signature.
     *
     * @param chain ChainDefinition
     * @param resolved ResolvedSigningRequest
     * @returns Promise<Signature>
     */
    sign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Cancelable<WalletPluginSignResponse> {
        const promise = this.waxSign(resolved, context)

        // Prints the resolved and context data
        console.log('resolved: ', resolved, '\ncontext: ', context)
        return cancelable(promise, (canceled) => {
            throw canceled
        })
    }

    async waxSign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Promise<WalletPluginSignResponse> {
        if (!context.ui) {
            throw new Error('A UserInterface must be defined to sign transactions.')
        }

        // Retrieve translation helper from the UI, passing the app ID
        const t = context.ui.getTranslate(this.id)

        // Perform WAX Cloud Wallet signing
        const response = await this.getWalletResponse(resolved, context, t)

        // Determine if there are any fees to accept
        const hasFees = response.Fee || response.ramFee
        if (hasFees) {
            throw new Error(
                'The transaction requires a fee, and the fee interface is not yet implemented.'
            )
        }

        // The response to return to the Session Kit
        const result: WalletPluginSignResponse = {
            signatures: response.signatures,
        }

        // If a transaction was returned by the WCW
        if (response.serializedTransaction) {
            // Convert the serialized transaction from the WCW to a Transaction object
            const responseTransaction = Serializer.decode({
                data: response.serializedTransaction,
                type: Transaction,
            })

            // Determine if the transaction changed from the requested transaction
            if (!responseTransaction.equals(resolved.transaction)) {
                // Evalutate whether modifications are valid, if not throw error
                validateModifications(resolved.transaction, responseTransaction)
                // If changed, add the modified request returned by WCW to the response
                result.request = await SigningRequest.create(
                    {
                        transaction: responseTransaction,
                    },
                    context.esrOptions
                )
            }
        }

        return new Promise((resolve) => resolve(result))
    }

    async getWalletResponse(
        resolved: ResolvedSigningRequest,
        context: TransactContext,
        t: (key: string, options?: UserInterfaceTranslateOptions) => string
    ): Promise<OreIdSigningResponse> {
        let response: OreIdSigningResponse
        if (!context.ui) {
            throw new Error('The Cloud Wallet requires a UI to sign transactions.')
        }

        // Check if automatic signing is allowed
        // If automatic is not allowed use the popup
        context.ui.status(t('transact.popup', {default: 'Sign with ORE ID popup window'}))
        response = await popupTransact(t, resolved, 3000000, this.oreId, context.chain)
        // }
        console.log('signing response: ', response)
        // const mockData = new Bytes(new Uint8Array([0,1,0,1,1,0,1,]))
        // response = {
        //     "signatures":[ new Signature(KeyType.R1, mockData)],
        //     "type": 'transfer',
        //     "verified": true,
        //     whitelistedContracts: []
        // }

        // Catch unknown errors where no response is returned
        if (!response) {
            throw new Error(t('login.error.response', {default: 'ORE ID failed to respond'}))
        }

        // Ensure the response is verified, if not the user most likely cancelled the request
        if (!response.verified) {
            throw new Error(
                t('error.closed', {
                    default: 'ORE ID was closed before the request was completed',
                })
            )
        }

        // Save our whitelisted contracts
        // this.data.whitelist = response.whitelistedContracts

        // Return the response from the API
        return response
    }
}
