import {
    Checksum256Type,
    LoginContext,
    PermissionLevelType,
    PromptArgs,
    TransactContext,
    UserInterfaceLoginResponse,
} from '@wharfkit/session'
import {Writable, writable} from 'svelte/store'

// Reset data in all stores
export function resetState() {
    active.set(false)

    props.set({...defaultUserInterfaceProps})
    router.set({...defaultUserInterfaceRouter})
    prompt.reset()

    cancelablePromises.set([])
    transactContext.set(undefined)

    loginContext.set(undefined)
    loginPromise.set(undefined)
    loginResponse.set({...defaultLoginResponse})

    errorDetails.set(undefined)
}

/** Whether or not the interface is active in the browser */
export const active = writable<boolean>(false)

/** The properties of the UserInterface */
export interface UserInterfaceProps {
    error?: Error
    language: string
    subtitle: string
    title: string
}

export const defaultUserInterfaceProps: UserInterfaceProps = {
    language: 'en',
    subtitle: 'Status Message',
    title: 'Wharf',
}

export const props = writable<UserInterfaceProps>(defaultUserInterfaceProps)

/** The router for the sections of the UserInterface */
export interface UserInterfaceRouter {
    path: string
    history: string[]
}

export const defaultUserInterfaceRouter: UserInterfaceRouter = {
    path: '',
    history: [],
}

export interface Router extends Writable<UserInterfaceRouter> {
    back: () => void
    push: (path: string) => void
}

export const initRouter = (): Router => {
    const {set, subscribe, update} = writable<UserInterfaceRouter>(defaultUserInterfaceRouter)
    return {
        // Method to go one back in history
        back: () =>
            update((current: UserInterfaceRouter) => ({
                ...current,
                path: current.history[current.history.length - 1],
                history: current.history.slice(0, -1),
            })),
        // Push a new path on to history
        push: (path: string) =>
            update((current) => ({
                ...current,
                path,
                history: [...current.history, current.path],
            })),
        set,
        subscribe,
        update,
    }
}

export const router = initRouter()

/** Cancelable promises that the router needs to track in order to cancel on quit */
type CancelCallback = (reason: string, silent: boolean) => void
export const cancelablePromises = writable<CancelCallback[]>([])

export const transactContext = writable<TransactContext | undefined>(undefined)

export type UserInterfacePrompt = {
    args: PromptArgs
    reject: (error: Error) => void
    resolve: (response: UserInterfaceLoginResponse) => void
}

export interface Prompt extends Writable<UserInterfacePrompt | undefined> {
    reset: () => void
}

export const initPrompt = (): Prompt => {
    const {set, subscribe, update} = writable<UserInterfacePrompt | undefined>(undefined)
    return {
        reset: () => set(undefined),
        set,
        subscribe,
        update,
    }
}

export const prompt = initPrompt()

export interface UserInterfaceLoginData {
    chainId?: Checksum256Type
    permissionLevel?: PermissionLevelType
    walletPluginIndex?: number
}

export interface LoginPromise {
    reject: (error: Error) => void
    resolve: (response: UserInterfaceLoginResponse) => void
}

export const defaultLoginResponse = {
    chainId: undefined,
    permissionLevel: undefined,
    walletPluginIndex: undefined,
}

export const loginContext = writable<LoginContext | undefined>(undefined)
export const loginPromise = writable<LoginPromise | undefined>(undefined)
export const loginResponse = writable<UserInterfaceLoginData>({...defaultLoginResponse})

export const errorDetails = writable<string | undefined>(undefined)
