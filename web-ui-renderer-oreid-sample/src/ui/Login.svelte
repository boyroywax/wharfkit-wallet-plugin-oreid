<script lang="ts">
    import {APIClient, ChainDefinition, UserInterfaceWalletPlugin} from '@wharfkit/session'
    import {createEventDispatcher, getContext} from 'svelte'
    import {derived, Readable} from 'svelte/store'
    import {onMount} from 'svelte'

    import {i18nType} from 'src/lib/translations'
    import {loginContext, loginResponse, props, UserInterfaceLoginData} from './state'

    import Blockchain from './login/Blockchain.svelte'
    import Permission from './login/Permission.svelte'
    import Wallet from './login/Wallet.svelte'

    const {t} = getContext<i18nType>('i18n')

    let completed = false

    const dispatch = createEventDispatcher<{
        complete: UserInterfaceLoginData
        cancel: void
    }>()

    enum Steps {
        done = 'done',
        enterPermission = 'enterPermission',
        selectChain = 'selectChain',
        selectPermission = 'selectPermission',
        selectWallet = 'selectWallet',
    }

    const chain: Readable<ChainDefinition | undefined> = derived(
        [loginContext, loginResponse],
        ([$currentContext, $currentResponse]) => {
            if (!$currentContext || $currentResponse.chainId === undefined) {
                return undefined
            }
            if ($currentContext.chain) {
                return $currentContext.chain
            }
            return $currentContext.chains.find((c) => c.id === $currentResponse.chainId)
        }
    )

    const client: Readable<APIClient | undefined> = derived(
        [chain, loginContext],
        ([$currentChain, $currentContext]) => {
            if (!$currentContext || $currentChain === undefined) {
                return undefined
            }
            return $currentContext.getClient($currentChain)
        }
    )

    const walletPlugin: Readable<UserInterfaceWalletPlugin | undefined> = derived(
        [loginContext, loginResponse],
        ([$currentContext, $currentResponse]) => {
            if (!$currentContext || $currentResponse.walletPluginIndex === undefined) {
                return undefined
            }
            return $currentContext.walletPlugins[$currentResponse.walletPluginIndex]
        }
    )

    let chains: Readable<ChainDefinition[]> = derived(
        [loginContext, walletPlugin],
        ([$currentContext, $currentWalletPlugin]) => {
            if (!$currentContext || !$currentWalletPlugin) {
                return []
            }
            // If the selected WalletPlugin has an array of supported chains, filter the list of chains
            if ($currentWalletPlugin.config.supportedChains) {
                return $currentContext.chains.filter((chain) => {
                    return (
                        !$currentWalletPlugin.config.supportedChains ||
                        $currentWalletPlugin.config.supportedChains.includes(String(chain.id))
                    )
                })
            }
            return $currentContext.chains
        }
    )

    loginContext.subscribe((currentContext) => {
        if (currentContext) {
            // If an appName is specified, set the title to it.
            $props.title = $t('login.title-app', {
                appName: currentContext.appName,
                default: 'Login to {{appName}}',
            })
            // If a chain is specified, set it on the response
            if (currentContext.chain) {
                $loginResponse.chainId = currentContext.chain.id
            }
            // If only one chain is provided, default to it
            if (currentContext.chains.length === 1) {
                $loginResponse.chainId = currentContext.chains[0].id
            }
            // If a permissionLevel is defined, set it on the response
            if (currentContext.permissionLevel) {
                $loginResponse.permissionLevel = currentContext.permissionLevel
            }
            // If only one wallet is provided, default to it
            if (currentContext.walletPlugins.length === 1) {
                $loginResponse.walletPluginIndex = 0
            }
        }
    })

    onMount(() => {
        $props.title = $t('login.title', {default: 'Login'})
    })

    const step = derived(
        [loginResponse, walletPlugin],
        ([$currentResponse, $currentWalletPlugin]) => {
            if (!$currentWalletPlugin) {
                $props.title = $t('login.select.wallet', {default: 'Select a Wallet'})
                return Steps.selectWallet
            }

            const {
                requiresChainSelect,
                requiresPermissionEntry,
                requiresPermissionSelect,
                supportedChains,
            } = $currentWalletPlugin.config

            if (!$currentResponse.chainId && supportedChains && supportedChains.length === 1) {
                $loginResponse.chainId = supportedChains[0]
                return Steps.selectPermission
            } else if (!$currentResponse.chainId && $loginContext && $loginContext.chain) {
                $loginResponse.chainId = $loginContext?.chain.id
                return Steps.selectPermission
            } else if (!$currentResponse.chainId && requiresChainSelect) {
                $props.title = $t('login.select.blockchain', {default: 'Select a Blockchain'})
                return Steps.selectChain
            } else if (!$currentResponse.permissionLevel && requiresPermissionSelect) {
                $props.title = $t('login.select.account', {default: 'Select an Account'})
                return Steps.selectPermission
            } else if (!$currentResponse.permissionLevel && requiresPermissionEntry) {
                $props.title = $t('login.enter.account', {default: 'Enter account name'})
                return Steps.enterPermission
            }

            // We have completed, return response to kit for the WalletPlugin to trigger
            complete()
        }
    )

    const selectChain = (e) => ($loginResponse.chainId = e.detail)
    const unselectChain = () => ($loginResponse.chainId = undefined)

    const selectPermission = (e) => ($loginResponse.permissionLevel = e.detail)
    const unselectPermission = () => ($loginResponse.permissionLevel = undefined)

    const selectWallet = (e) => ($loginResponse.walletPluginIndex = e.detail)
    const unselectWallet = () => ($loginResponse.walletPluginIndex = undefined)

    const complete = () => {
        if (!completed) {
            completed = true
            dispatch('complete', $loginResponse)
        }
    }

    const cancel = () => {
        dispatch('cancel')
    }
</script>

{#if $props && $loginContext}
    {#if $step === Steps.selectWallet}
        <Wallet on:select={selectWallet} on:cancel={cancel} wallets={$loginContext.walletPlugins} />
    {:else if $step === Steps.selectChain && $chains}
        <Blockchain on:select={selectChain} on:cancel={unselectWallet} chains={$chains} />
    {:else if $step === Steps.enterPermission && $client && $walletPlugin}
        <Permission
            on:select={selectPermission}
            on:cancel={unselectChain}
            client={$client}
            walletPlugin={$walletPlugin}
        />
    {:else if $step === Steps.selectPermission && $client && $walletPlugin}
        <Permission
            on:select={selectPermission}
            on:cancel={unselectChain}
            client={$client}
            walletPlugin={$walletPlugin}
        />
    {:else}
        <p>{$t('login.complete', {default: 'Complete the login using your selected wallet.'})}</p>
    {/if}
{:else}
    <p>{$t('loading', {default: 'Loading...'})}</p>
{/if}
