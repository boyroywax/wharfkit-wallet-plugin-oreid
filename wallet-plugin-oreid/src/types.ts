import {Asset, Name, NameType, PublicKeyType, Signature, Struct, UInt32} from '@wharfkit/session'

// ABI Definitions to decode data
@Struct.type('buyrambytes')
export class Buyrambytes extends Struct {
    @Struct.field(Name) payer!: Name
    @Struct.field(Name) receiver!: Name
    @Struct.field(UInt32) bytes!: UInt32
}

@Struct.type('transfer')
export class Transfer extends Struct {
    @Struct.field(Name) from!: Name
    @Struct.field(Name) to!: Name
    @Struct.field(Asset) quantity!: Asset
    @Struct.field('string') memo!: string
}

interface OreIdResponse {
    verified: boolean
    whitelistedContracts: []
}

export interface OreIdLoginResponse extends OreIdResponse {
    autoLogin: boolean
    isTemp?: boolean
    pubKeys: PublicKeyType[]
    account: NameType
}

export interface OreIdSigningResponse extends OreIdResponse {
    cpu?: number
    estimatorWorking?: boolean
    net?: number
    ram?: number
    ramFee?: number
    serializedTransaction?: Uint8Array
    signatures: Signature[]
    type: string
    Fee?: number
}
