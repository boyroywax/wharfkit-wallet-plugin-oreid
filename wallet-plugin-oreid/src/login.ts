import {Bytes, Name, PublicKeyType, UInt64, UserInterfaceTranslateOptions} from '@wharfkit/session'
import {OreIdLoginResponse} from './types'
import {isValidEvent, registerCloseListener} from './utils'
import { AuthProvider, OreId, PopupPluginAuthSuccessResults, UserPermissionForChainAccount } from 'oreid-js'
import { base58_to_binary } from 'base58-js'

export async function autoLogin(
    t: (key: string, options?: UserInterfaceTranslateOptions) => string,
    urlString: URL | string
): Promise<OreIdLoginResponse> {
    // TODO: Figure out what temp accounts are
    //
    // if (this.returnTempAccount) {
    //   url.search = "returnTemp=true";
    // } else {
    //   url.search = "";
    // }
    const url = new URL(urlString)
    const response = await fetch(String(url), {
        credentials: 'include',
        method: 'get',
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
    const data = await response.json()
    return data
}

export async function popupLogin(
    t: (key: string, options?: UserInterfaceTranslateOptions) => string,
    // urlString: URL | string,
    // timeout = 300000,
    oreId: OreId,
    chain: any
): Promise<OreIdLoginResponse> {
    // Open the ORE ID Auth popup window
    const response_raw: PopupPluginAuthSuccessResults = await oreId.popup.auth({provider: AuthProvider.Google})
    console.log('resposne raw: ', response_raw)

    console.log("chain: ", chain)

    let oreIDChainName: string

    switch(chain.name) {
        case('WAX (Testnet)'):
            oreIDChainName = 'wax_test'
            break;

        case('ORE (Testnet)'):
            oreIDChainName = 'ore_test'
            break;

        default:
            oreIDChainName = 'ore_test'
            break;
    }

    const signingAccount = response_raw.user.chainAccounts.find(
        (ca) => ca.chainNetwork === oreIDChainName
    );

    const pubKeys: UserPermissionForChainAccount[] | undefined = signingAccount?.permissions
    console.log('pubKeys: ', pubKeys)
    
    let publicKeys: PublicKeyType
    let compressed: any

    // try {
        if (pubKeys){
            // compressed = base58_to_binary(pubKeys[0].publicKey)
            compressed = pubKeys[0].publicKey

            publicKeys = {
                type: 'R1',
                compressed: compressed
            }
            console.log(publicKeys)
        }
    // }
    else {
        publicKeys = {
            type: 'R1',
            compressed: base58_to_binary("abc123")
        }
    }
    return({
        autoLogin: false,
        isTemp: false,
        pubKeys: [ publicKeys ],
        account: signingAccount?.chainAccount || "",
        verified: true,
        whitelistedContracts: []
    })
}

