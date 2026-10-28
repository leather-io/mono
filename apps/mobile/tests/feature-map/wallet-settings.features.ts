import { AppRoutes } from '@/shared/app-routes';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';
import { WalletSettingsSelectors } from '@/shared/selectors/wallet-settings.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

export const walletSettingsFeatures = [
  {
    id: 'settings-wallet',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsWallet],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the Home tab tap the header gear (HomeSelectors.SettingsButton)',
          'On Settings tap "Wallets and accounts" (SettingsSelectors.WalletAndAccountsButton)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Or open the add-account sheet (add-account-sheet entry) and tap "Add to existing wallet", which calls router.navigate("/settings/wallet") and closes the sheet',
        ],
      },
      { kind: 'deepLink', steps: ['Open leather://settings/wallet'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.WalletListSettingsButton,
      others: [
        WalletSettingsSelectors.WalletListAccountCard,
        WalletSettingsSelectors.AddAccountButton,
        WalletSettingsSelectors.AddWalletButton,
        WalletSettingsSelectors.HiddenAccountsButton,
        WalletSettingsSelectors.EmptyWalletsAddWalletButton,
        SharedSelectors.DefaultAccountIcon,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Wallets" screen (app/settings/wallet/index.tsx, SettingsLayout: header back button, the title as the header centre label and as a page title). With at least one wallet it shows the PortfolioHeader (features/account/components/portfolio-header.tsx: "Portfolio" plus a question icon that presents the description sheet "Your total tokens across all your accounts.", and the TotalBalance), then WalletsList variant "active" (features/settings/wallet-and-accounts/wallets-list.tsx), one WalletCard per wallet (wallet-card.tsx): a name row that collapses and expands the card (chevron), a gear IconButton labelled "Open wallet settings" (WalletListSettingsButton) that navigates to the configure wallet screen with params { fingerprint, wallet }, one AccountCard per active account (WalletListAccountCard; every card on the screen carries the same id, so select by index) showing the account name, its AccountBalance and AccountAddress (the address follows the account display preference: Stacks, native segwit, taproot or BNS name, hooks/use-account-display-address.ts) with the current account outlined, which navigates to the configure account screen with params { fingerprint, wallet, account: accountIndex }, and a ghost "Add account" button (AddAccountButton) that calls keys.createNewAccountOfWallet(fingerprint) (store/key-store.ts: reads the wallet mnemonic from SecureStore through mnemonicStore(fingerprint).getMnemonic(), derives the next account index and dispatches userAddsAccount); while pending it reads "Adding account..." with a spinner and is disabled, then a toast "Account created" (success) or "Account creation failed" (error). The account avatar carries defaultAccountIcon_<icon> (SharedSelectors.DefaultAccountIcon plus "_" and the icon key, AccountCard iconTestID). Below a Divider a SettingsList shows a "Hidden accounts" row (HiddenAccountsButton, conditional: only when useAccounts("hidden") lists at least one account) with the caption "# hidden account" or "# hidden accounts" that navigates to /settings/wallet/hidden-accounts, and an "Add wallet" row (AddWalletButton) that presents the add-wallet sheet (add-wallet-sheet entry). With no wallet the screen shows EmptyWalletsScreen instead (components/empty-wallets-screen.tsx: a sticker, "View and manage all your wallets in one place" and an "Add wallet" button, EmptyWalletsAddWalletButton, conditional on having no wallet, which presents the same sheet). Balances, addresses and BNS names are fetched live; the cards show skeletons while loading. The back button (SharedSelectors.BackButton, HeaderBackButton) goes back when the router can, else to Home. No Maestro flow or unit spec covers it; legacy-flows/wallet-management.yaml, rename-wallet.yaml, wallet-add-account.yaml and wallet-multi-wallet.yaml walked it before they rotted: rename-wallet.yaml\'s tap "Wallets and accounts Add, configure and remove" still matches the Settings row, but "Hidden accounts 1 hidden accounts" no longer matches the singular caption and the texts "Add or create wallet", "View and manage your wallets all in one place" and "Choose existing leather wallet" no longer exist in the sources.',
  },
  {
    id: 'settings-hidden-accounts',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsHiddenAccounts],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the Wallets screen (settings-wallet entry) with at least one hidden account and tap "Hidden accounts" (WalletSettingsSelectors.HiddenAccountsButton)',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open leather://settings/wallet/hidden-accounts; without a hidden account it shows the empty state',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.WalletListAccountCard,
      others: [SharedSelectors.DefaultAccountIcon, SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Hidden accounts" screen (app/settings/wallet/hidden-accounts.tsx) renders WalletsList with variant "hidden" (features/settings/wallet-and-accounts/wallets-list.tsx). With no hidden account in any wallet it shows EmptyHiddenAccounts (components/empty-hidden-accounts.tsx: the eyes sticker and "View and manage your hidden accounts") and no card, so WalletListAccountCard (the ready selector) needs an account hidden beforehand from its configure account screen. Otherwise it renders one WalletCard per wallet (wallet-card.tsx): a wallet without hidden accounts renders nothing (its name row is skipped and its list is empty); a wallet with hidden accounts shows its name row with the expand chevron but no gear and no "Add account" button, then one AccountCard per hidden account (WalletListAccountCard, shared id, select by index; avatar id defaultAccountIcon_<icon>) that navigates to the configure account screen, where "Reveal account" un-hides it; nothing on this screen un-hides an account directly. The back button goes back to the Wallets screen. No flow covers it; legacy-flows/hide-account.yaml and wallet-multi-wallet.yaml walked it before they rotted, tapping "Hidden accounts 1 hidden accounts" (the caption is now "1 hidden account") and "Un-hide account" (now "Reveal account").',
  },
  {
    id: 'settings-configure-wallet',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsConfigureWallet],
    deepLinkable: false,
    params: [{ name: 'wallet', example: '24682ead' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the Wallets screen (settings-wallet entry) and tap the gear of a wallet card (WalletSettingsSelectors.WalletListSettingsButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.ViewSecretKeyButton,
      others: [
        WalletSettingsSelectors.RenameWalletButton,
        WalletSettingsSelectors.RemoveWalletButton,
        WalletSettingsSelectors.AdvancedOptionsAccordion,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Configure wallet" screen (app/settings/wallet/configure/[wallet]/index.tsx; the Lingui title breaks over two lines). ConfigureWalletScreen parses the search params with zod as { fingerprint: string } and ignores the [wallet] segment: the wallet card navigates with params { fingerprint, wallet }, so a bare leather:// link carrying only the segment fails the parse and throws in render, which the ErrorBoundary around the Stack in app/_layout.tsx catches with components/error/error.tsx ("Something went wrong", "Drag to refresh" and the error message); a fingerprint that matches no wallet makes WalletLoader (store/wallets/wallets.read.ts) render null, a blank screen without a header. It shows the wallet name, then "View Secret Key" (ViewSecretKeyButton, navigates to the view secret key screen with { fingerprint, wallet }), "Rename wallet" (RenameWalletButton, presents the wallet-name-sheet) and "Remove wallet" (RemoveWalletButton, red trash icon, presents the remove-wallet-sheet). Only while release_waitlist_features (useWaitlistFlag) is on, an "Advanced options" Accordion (AdvancedOptionsAccordion, conditional on that flag) lists "Address reuse", "Address scan range", "Address types", "Export xPub" and "Export key"; none is a real control: each presents NotifyUserSheetLayout (components/sheets/notify-user-sheet.layout.tsx) with the row title, "This feature is not available yet, but we can notify you when ready." and an "I\'m interested" button that tracks submit_feature_waitlist with the WaitlistIds id and dismisses. After a Divider, "Creation date" shows dayjs(wallet.createdOn).format("D MMM YYYY"). Renaming with an empty name shows the error toast "Wallet name cannot be empty" and keeps the sheet open; otherwise it dispatches userRenamesWallet. Removing: with securityLevelPreference "secure" it first calls useAuthentication().authenticate() (expo-local-authentication; with no device PIN or biometrics enrolled it toasts "App is not protected with device-level PIN or biometrics.", immediately replaced by the "Authentication failed" toast, and removes nothing, on a failed prompt it toasts "Authentication failed"); on success, or with the insecure preference, removeWallet() calls router.back() first, moves the current account to account 0 of the first remaining wallet (or null when none is left) if it belonged to this wallet, then dispatches userRemovesWallet, which drops the wallet, its accounts and its keychains from the store; it does not call mnemonicStore(fingerprint).deleteMnemonic() (useWallets().remove, the only caller of it, is unused), so the mnemonic stays in SecureStore. The back button goes back to the Wallets screen. No flow covers it; legacy-flows/wallet-management.yaml, wallet-multi-wallet.yaml and secure/delete-wallet.yaml walked it before they rotted and tapped "Proceed" on the remove sheet, whose button now reads "Continue".',
  },
  {
    id: 'settings-view-secret-key',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsViewSecretKey],
    deepLinkable: false,
    params: [{ name: 'wallet', example: '24682ead' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the configure wallet screen (settings-configure-wallet entry) tap "View Secret Key" (WalletSettingsSelectors.ViewSecretKeyButton)',
          'Wait for the words: the footer "Done" button (WalletSettingsSelectors.ViewSecretKeyDoneButton) appears once the mnemonic has been read from SecureStore',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.ViewSecretKeyDoneButton,
      others: [SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Your Secret Key" screen (app/settings/wallet/configure/[wallet]/view-secret-key.tsx). ViewSecretKeyScreen reads params.fingerprint, which the configure wallet screen passes next to the [wallet] segment, and throws "No fingerprint is passed to ViewSecretKeyScreen" without it (a bare leather:// link lands in the ErrorBoundary fallback "Something went wrong"). useMnemonic({ fingerprint }) (store/storage-persistors.ts) calls mnemonicStore(fingerprint).getMnemonic() once on mount (store/secure-store/mnemonic-store.ts): searchForMnemonic (secure-store-access.ts) reads the mnemonic and passphrase keys from the newest key version down with SecureStore.getItemAsync and getBasicSecureStoreConfig() (authenticationPrompt "Allow app to access secure storage", keychainAccessible WHEN_UNLOCKED_THIS_DEVICE_ONLY, no requireAuthentication on the read); the app does not call authenticate() itself, so whether the OS prompts for biometrics depends on how the item was written: setMnemonic stores it with getSecureStoreConfig(biometrics), which adds requireAuthentication when biometrics is true (createNewSoftwareWallet in store/key-store.ts always passes true; a mnemonic found under an older key is re-saved with the current security preference). Until the read resolves the screen is an empty Box with no header; when no mnemonic is stored, mnemonicSchema.parse in getMnemonic rejects with a ZodError inside the async effect (useMnemonic\'s own "No mnemonic found for this fingerprint" throw is never reached) and the screen stays blank. Once loaded it shows the title, "Your Secret Key grants you access to your wallet and its assets. Store it securely since it can never be recovered if lost or stolen." and MnemonicDisplay (features/wallet-manager/create-new-wallet/mnemonic-display.tsx): the words in numbered MnemonicWordBox tiles with no tap-to-reveal, "BIP39 passphrase" with its value when one is stored, a "Copy" button (Clipboard.setStringAsync, toast "Copied to clipboard") and, only with release_waitlist_features on, a "Save to..." button that presents the notify sheet. The footer "Done" (ViewSecretKeyDoneButton) calls router.back(); the header back button goes back as well. No flow or spec covers it, and none of the legacy flows tapped "View Secret Key".',
  },
  {
    id: 'settings-configure-account',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsConfigureAccount],
    deepLinkable: false,
    params: [
      { name: 'wallet', example: '24682ead' },
      { name: 'account', example: '0' },
    ],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the Wallets screen (settings-wallet entry) and tap an account card (WalletSettingsSelectors.WalletListAccountCard)',
          'Or open the Hidden accounts screen (settings-hidden-accounts entry) and tap a hidden account card (same id)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.AccountNameCell,
      others: [
        WalletSettingsSelectors.AvatarCell,
        WalletSettingsSelectors.HideAccountCell,
        WalletSettingsSelectors.RevealAccountCell,
        SharedSelectors.DefaultAccountIcon,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Configure account" screen (app/settings/wallet/configure/[wallet]/[account]/index.tsx; the Lingui title breaks over two lines). ConfigureAccountScreen parses the search params with zod as { fingerprint: string, account: string -> Number } and ignores the [wallet] segment: the account cards navigate with { fingerprint, wallet, account: accountIndex }, so a bare leather:// link without fingerprint throws in render and lands in the ErrorBoundary fallback "Something went wrong"; a pair that matches no account makes AccountLoader (store/accounts/accounts.ts, useAccountByIndex, which includes hidden accounts) render null. It shows a non-pressable AccountCard with the account avatar (defaultAccountIcon_<icon> via iconTestID), the AccountAddress for the account display preference, the AccountBalance, the account name and the wallet name as caption (WalletLoader), then three rows: "Name" with the current name as caption (AccountNameCell) presents the account-name-sheet; "Avatar" (AvatarCell) navigates to the choose avatar screen with params { wallet: fingerprint, account: accountIndex }; for an active account "Hide account" (HideAccountCell), for a hidden one "Reveal account" (RevealAccountCell), both dispatching userTogglesHideAccount (store/accounts/accounts.write.ts flips status between active and hidden), so the row swaps in place and the screen stays; after hiding, the card is gone from the Wallets screen and listed under Hidden accounts. There is no address or identifier row beyond the card. Renaming with an empty name toasts "Account name cannot be empty" and keeps the sheet open; otherwise userRenamesAccount is dispatched for makeAccountIdentifer(fingerprint, accountIndex). The back button goes back to the list it came from. No flow covers it; legacy-flows/rename-account.yaml, hide-account.yaml and change-account-icon.yaml walked it before they rotted, and their "Un-hide account" text is now "Reveal account".',
  },
  {
    id: 'settings-choose-avatar',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SettingsChooseAvatar],
    params: [
      { name: 'wallet', example: '24682ead' },
      { name: 'account', example: '0' },
    ],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the configure account screen (settings-configure-account entry) tap "Avatar" (WalletSettingsSelectors.AvatarCell)',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open leather://settings/wallet/configure/<wallet>/<account>/choose-avatar for an account that exists; the screen reads both segments itself, and a pair that matches no account throws "No account is found" into the ErrorBoundary fallback',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.ChooseAvatarSaveButton,
      others: [SharedSelectors.DefaultAccountIcon, SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The choose avatar screen (app/settings/wallet/configure/[wallet]/[account]/choose-avatar.tsx). ChooseAvatarScreen reads the wallet and account segments (throwing "No wallet fingerprint is passed in parameters", "No account is passed in parameters" or "No account is found") and looks the account up with useAccountByIndex. SettingsLayout gets no title, so the header centre and page title are empty; navigation.setOptions sets the native header title to the account name, but the root Stack renders with headerShown false. It shows a large SquircleBox preview of the pending icon (the picked one, else the account icon), the label "Icons" and Avatars (features/settings/choose-avatar/avatars.tsx): one AvatarButton (avatar-button.tsx, a Pressable with testID defaultAccountIcon_<icon>, SharedSelectors.DefaultAccountIcon plus "_" and the key) per key of accountIconMap, in order pizza, sparkles, piggyBank, orange, car, alien, saturn, bank, rocket, folder, smile, code, zap, gift, colorPalette, home, space, box, heart and flag, the current one outlined in ink.action-primary-default. Tapping a tile only updates the preview and the outline; the footer "Save" (ChooseAvatarSaveButton) is disabled until a tile has been tapped (tapping the current icon enables it too), then dispatches userUpdatesAccountIcon and calls router.back(). The back button discards the pick. An account with no saved icon shows the one derived from its id by deriveIconFromAccountId (store/accounts/utils.ts; store/accounts/utils.spec.ts unit-tests only that derivation). No flow covers it; legacy-flows/change-account-icon.yaml walked it before it rotted, tapping defaultAccountIcon_alien and then "Confirm", a button that is now "Save".',
  },
  {
    id: 'wallet-name-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'WalletSettingsSelectors.WalletChangeNameSheetInput',
        'WalletSettingsSelectors.WalletChangeNameSheetSaveButton',
      ],
    },
    routes: [],
    startRoute: AppRoutes.SettingsConfigureWallet,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the configure wallet screen (settings-configure-wallet entry) tap "Rename wallet" (WalletSettingsSelectors.RenameWalletButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.WalletChangeNameSheetInput,
      others: [WalletSettingsSelectors.WalletChangeNameSheetSaveButton],
    },
    actions: [],
    specs: [],
    description:
      'The wallet rename sheet (features/settings/wallet-and-accounts/wallet-name-sheet.tsx), an InputSheetLayout (components/sheets/input-sheet.layout.tsx) presented from a ref by the configure wallet screen: title "Change name", a focused TextInput prefilled with the wallet name and placeholder "Name" (WalletChangeNameSheetInput), and a "Save" button (WalletChangeNameSheetSaveButton) that calls setName with the field value; an empty value shows the error toast "Wallet name cannot be empty" and leaves the sheet open, any other value dispatches userRenamesWallet for the wallet fingerprint and closes the sheet. There is no cancel button in the layout. No flow covers it; legacy-flows/rename-wallet.yaml walked it before it rotted (tap walletChangeNameSheetInput, eraseText, type, tap "Save").',
  },
  {
    id: 'remove-wallet-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'WalletSettingsSelectors.RemoveWalletContinueButton',
        'WalletSettingsSelectors.RemoveWalletCancelButton',
      ],
    },
    routes: [],
    startRoute: AppRoutes.SettingsConfigureWallet,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the configure wallet screen (settings-configure-wallet entry) tap "Remove wallet" (WalletSettingsSelectors.RemoveWalletButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.RemoveWalletContinueButton,
      others: [WalletSettingsSelectors.RemoveWalletCancelButton],
    },
    actions: [],
    specs: [],
    description:
      'The remove wallet confirmation (features/settings/wallet-and-accounts/remove-wallet-sheet.tsx), a WarningSheetLayout with the critical variant (components/sheets/warning-sheet.layout.tsx): title "Remove wallet", a question-mark icon on the right that opens the in-app browser at LEATHER_GUIDES_MOBILE_REMOVE_WALLET (the guides URL plus /mobile-remove-wallet; useOpenUrl dismisses presented screens and navigates to /browser?url=), the text "Proceed with caution since the wallet will be removed entirely from this device and its assets will not be recoverable unless you’ve stored its Secret Key elsewhere securely." (curly apostrophe in the source), a danger "Continue" button (RemoveWalletContinueButton) that runs the configure wallet screen\'s onRemoveWallet (device authentication first when the security preference is secure, then router.back() and userRemovesWallet, see settings-configure-wallet) and a ghost "Cancel" button (RemoveWalletCancelButton) that dismisses the sheet. Continue does not close the sheet itself; leaving the screen unmounts it. No flow covers it; legacy-flows/wallet-management.yaml, wallet-multi-wallet.yaml and secure/delete-wallet.yaml tapped "Proceed" and wallet-management.yaml asserted an older warning text, neither of which exists in the sources now.',
  },
  {
    id: 'account-name-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'WalletSettingsSelectors.AccountChangeNameSheetInput',
        'WalletSettingsSelectors.AccountChangeNameSheetSaveButton',
      ],
    },
    routes: [],
    startRoute: AppRoutes.SettingsConfigureAccount,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the configure account screen (settings-configure-account entry) tap "Name" (WalletSettingsSelectors.AccountNameCell)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-in', accountType: 'software', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.AccountChangeNameSheetInput,
      others: [WalletSettingsSelectors.AccountChangeNameSheetSaveButton],
    },
    actions: [],
    specs: [],
    description:
      'The account rename sheet (features/settings/wallet-and-accounts/account-name-sheet.tsx), an InputSheetLayout presented from a ref by the configure account screen: title "Account label", a focused TextInput prefilled with the account name and placeholder "Name" (AccountChangeNameSheetInput), and a "Save" button (AccountChangeNameSheetSaveButton) that calls setName with the field value; an empty value shows the error toast "Account name cannot be empty" and leaves the sheet open, any other value dispatches userRenamesAccount for makeAccountIdentifer(fingerprint, accountIndex) and closes the sheet. There is no cancel button in the layout. No flow covers it; legacy-flows/rename-account.yaml walked it before it rotted (tap walletListAccountCard, walletSettingsAccountNameCell, accountChangeNameSheetInput, eraseText, type, tap "Save").',
  },
] as const satisfies readonly MobileFeatureEntry[];
