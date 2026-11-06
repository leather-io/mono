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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'The "Wallets" screen (app/settings/wallet/index.tsx). With at least one wallet it shows the portfolio header ("Portfolio" with a question icon that opens the description-sheet, and the total balance), then one wallet card per wallet (wallet-card.tsx): a name row that collapses and expands the card, a gear button labelled "Open wallet settings" (WalletListSettingsButton) that navigates to settings-configure-wallet with { fingerprint, wallet }, one account card per active account (WalletListAccountCard; every card on the screen carries the same id, so select by index) with the account name, balance and the address for the account display preference, the current account outlined, which navigates to settings-configure-account with { fingerprint, wallet, account }. The card ends with a ghost "Add account" button (AddAccountButton) that calls createNewAccountOfWallet (key-store.ts: reads the wallet mnemonic from the secure store, derives the next account index and dispatches userAddsAccount), reading "Adding account..." while pending and toasting "Account created" or "Account creation failed". Each avatar carries defaultAccountIcon_<icon> (SharedSelectors.DefaultAccountIcon). Below, a "Hidden accounts" row (HiddenAccountsButton, only when at least one account is hidden) with the caption "# hidden account" or "# hidden accounts" navigates to settings-hidden-accounts, and an "Add wallet" row (AddWalletButton) presents the add-wallet-sheet. With no wallet the screen shows the empty state instead (a sticker, "View and manage all your wallets in one place" and an "Add wallet" button, EmptyWalletsAddWalletButton, presenting the same sheet). Balances, addresses and BNS names are fetched live; the cards show skeletons while loading. Back goes to the previous screen, or to Home without history. legacy-flows/rename-wallet.yaml, wallet-add-account.yaml and wallet-multi-wallet.yaml walked it: the tap "Wallets and accounts Add, configure and remove" still matches the Settings row, but "Hidden accounts 1 hidden accounts" no longer matches the singular caption.',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.WalletListAccountCard,
      others: [SharedSelectors.DefaultAccountIcon, SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Hidden accounts" screen (app/settings/wallet/hidden-accounts.tsx) renders the wallet list with the "hidden" variant. With no hidden account in any wallet it shows the eyes sticker and "View and manage your hidden accounts" and no card, so WalletListAccountCard (the ready selector) needs an account hidden beforehand from settings-configure-account. Otherwise a wallet without hidden accounts renders nothing, and a wallet with hidden accounts shows its name row with the expand chevron but no gear and no "Add account" button, then one account card per hidden account (WalletListAccountCard, shared id, select by index; avatar id defaultAccountIcon_<icon>) that navigates to settings-configure-account, where "Reveal account" un-hides it; nothing on this screen un-hides an account directly. Back goes to the Wallets screen. legacy-flows/hide-account.yaml tapped "Hidden accounts 1 hidden accounts" (the caption is now "1 hidden account") and "Un-hide account" (now "Reveal account").',
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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'The "Configure wallet" screen (app/settings/wallet/configure/[wallet]/index.tsx). It parses the search params as { fingerprint } and ignores the [wallet] segment: the wallet card navigates with { fingerprint, wallet }, so a bare leather:// link carrying only the segment throws in render and lands in the root ErrorBoundary ("Something went wrong", "Drag to refresh"); a fingerprint that matches no wallet renders a blank screen without a header. It shows the wallet name, then "View Secret Key" (ViewSecretKeyButton, navigates to settings-view-secret-key with { fingerprint, wallet }), "Rename wallet" (RenameWalletButton, presents the wallet-name-sheet) and "Remove wallet" (RemoveWalletButton, red trash icon, presents the remove-wallet-sheet). Only with release_waitlist_features (useWaitlistFlag) on, an "Advanced options" accordion (AdvancedOptionsAccordion) lists "Address reuse", "Address scan range", "Address types", "Export xPub" and "Export key"; none is a real control: each presents a notify-user sheet with the row title, "This feature is not available yet, but we can notify you when ready." and an "I\'m interested" button that tracks submit_feature_waitlist. Below a divider, "Creation date" shows the wallet creation date as "D MMM YYYY". Renaming with an empty name shows the error toast "Wallet name cannot be empty" and keeps the sheet open; otherwise it dispatches userRenamesWallet. Removing with the secure preference first runs device authentication (with nothing enrolled it toasts "App is not protected with device-level PIN or biometrics.", at once replaced by "Authentication failed", and removes nothing; a failed prompt toasts "Authentication failed"); on success, or with the insecure preference, it goes back first, moves the current account to account 0 of the first remaining wallet (or null) when it belonged to this wallet, then dispatches userRemovesWallet, which drops the wallet, its accounts and its keychains from the store. It does not delete the mnemonic (useWallets().remove, the only caller of deleteMnemonic, is unused), so the mnemonic stays in the secure store. Back goes to the Wallets screen. legacy-flows/wallet-management.yaml and secure/delete-wallet.yaml tapped "Proceed" on the remove sheet, whose button now reads "Continue".',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.ViewSecretKeyDoneButton,
      others: [SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Your Secret Key" screen (app/settings/wallet/configure/[wallet]/view-secret-key.tsx). It reads params.fingerprint, which settings-configure-wallet passes next to the [wallet] segment, and throws "No fingerprint is passed to ViewSecretKeyScreen" without it, so a bare leather:// link lands in the ErrorBoundary fallback "Something went wrong". useMnemonic (storage-persistors.ts) reads the mnemonic once on mount through mnemonicStore(fingerprint).getMnemonic(), which searches the secure store from the newest key version down with the prompt "Allow app to access secure storage"; the app does not call authenticate() itself, so whether the OS prompts for biometrics depends on how the item was written (setMnemonic adds requireAuthentication when biometrics is true, which createNewSoftwareWallet always passes). Until the read resolves the screen is an empty box with no header; when no mnemonic is stored, the schema parse rejects inside the async effect and the screen stays blank. Once loaded it shows the title, "Your Secret Key grants you access to your wallet and its assets. Store it securely since it can never be recovered if lost or stolen." and the numbered word tiles (mnemonic-display.tsx) with no tap-to-reveal, "BIP39 passphrase" with its value when one is stored, a "Copy" button (toast "Copied to clipboard") and, only with release_waitlist_features on, a "Save to..." button that presents the notify sheet. The footer "Done" (ViewSecretKeyDoneButton) goes back, as does the header back button.',
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
    preconditions: { session: 'signed-in', mocks: [] },
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
      'The "Configure account" screen (app/settings/wallet/configure/[wallet]/[account]/index.tsx). It parses the search params as { fingerprint, account } and ignores the [wallet] segment: the account cards navigate with { fingerprint, wallet, account }, so a bare leather:// link without fingerprint throws in render and lands in the ErrorBoundary fallback "Something went wrong"; a pair that matches no account renders null. It shows a non-pressable account card with the avatar (defaultAccountIcon_<icon>), the address for the account display preference, the balance, the account name and the wallet name as caption, then three rows: "Name" with the current name as caption (AccountNameCell) presents the account-name-sheet; "Avatar" (AvatarCell) navigates to settings-choose-avatar; for an active account "Hide account" (HideAccountCell), for a hidden one "Reveal account" (RevealAccountCell), both dispatching userTogglesHideAccount, so the row swaps in place and the screen stays; after hiding, the card is gone from the Wallets screen and listed under Hidden accounts. Renaming with an empty name toasts "Account name cannot be empty" and keeps the sheet open; otherwise userRenamesAccount is dispatched. Back goes to the list it came from. legacy-flows/rename-account.yaml, hide-account.yaml and change-account-icon.yaml walked it; their "Un-hide account" text is now "Reveal account".',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.ChooseAvatarSaveButton,
      others: [SharedSelectors.DefaultAccountIcon, SharedSelectors.BackButton],
    },
    actions: [],
    specs: [],
    description:
      'The choose avatar screen (app/settings/wallet/configure/[wallet]/[account]/choose-avatar.tsx). It reads the wallet and account segments (throwing "No wallet fingerprint is passed in parameters", "No account is passed in parameters" or "No account is found") and looks the account up by index. The layout gets no title, so the header centre and page title are empty. It shows a large preview of the pending icon (the picked one, else the account icon), the label "Icons" and one tile per key of accountIconMap (avatar-button.tsx, testID defaultAccountIcon_<icon>, SharedSelectors.DefaultAccountIcon plus "_" and the key), in order pizza, sparkles, piggyBank, orange, car, alien, saturn, bank, rocket, folder, smile, code, zap, gift, colorPalette, home, space, box, heart and flag, the current one outlined. Tapping a tile only updates the preview and the outline; the footer "Save" (ChooseAvatarSaveButton) is disabled until a tile has been tapped (the current icon enables it too), then dispatches userUpdatesAccountIcon and goes back. Back discards the pick. An account with no saved icon shows the one derived from its id (deriveIconFromAccountId; store/accounts/utils.spec.ts unit-tests only that derivation). legacy-flows/change-account-icon.yaml tapped defaultAccountIcon_alien and then "Confirm", a button that is now "Save".',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.WalletChangeNameSheetInput,
      others: [WalletSettingsSelectors.WalletChangeNameSheetSaveButton],
    },
    actions: [],
    specs: [],
    description:
      'The wallet rename sheet (wallet-name-sheet.tsx, an InputSheetLayout presented by settings-configure-wallet): title "Change name", a focused input prefilled with the wallet name and placeholder "Name" (WalletChangeNameSheetInput), and a "Save" button (WalletChangeNameSheetSaveButton); an empty value shows the error toast "Wallet name cannot be empty" and leaves the sheet open, any other value dispatches userRenamesWallet and closes it. There is no cancel button. legacy-flows/rename-wallet.yaml walked it (tap walletChangeNameSheetInput, eraseText, type, tap "Save").',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.RemoveWalletContinueButton,
      others: [WalletSettingsSelectors.RemoveWalletCancelButton],
    },
    actions: [],
    specs: [],
    description:
      'The remove wallet confirmation (remove-wallet-sheet.tsx, a critical WarningSheetLayout presented by settings-configure-wallet): title "Remove wallet", a question-mark icon that opens the remove-wallet guide in the Browser tab, the text "Proceed with caution since the wallet will be removed entirely from this device and its assets will not be recoverable unless you’ve stored its Secret Key elsewhere securely.", a danger "Continue" button (RemoveWalletContinueButton) that runs the screen\'s onRemoveWallet (device authentication first when the security preference is secure, then back and userRemovesWallet, see settings-configure-wallet) and a ghost "Cancel" button (RemoveWalletCancelButton) that dismisses the sheet. Continue does not close the sheet itself; leaving the screen unmounts it. legacy-flows/wallet-management.yaml and secure/delete-wallet.yaml tapped "Proceed", a label the sheet no longer has.',
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
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: {
      ready: WalletSettingsSelectors.AccountChangeNameSheetInput,
      others: [WalletSettingsSelectors.AccountChangeNameSheetSaveButton],
    },
    actions: [],
    specs: [],
    description:
      'The account rename sheet (account-name-sheet.tsx, an InputSheetLayout presented by settings-configure-account): title "Account label", a focused input prefilled with the account name and placeholder "Name" (AccountChangeNameSheetInput), and a "Save" button (AccountChangeNameSheetSaveButton); an empty value shows the error toast "Account name cannot be empty" and leaves the sheet open, any other value dispatches userRenamesAccount and closes it. There is no cancel button. legacy-flows/rename-account.yaml walked it (tap walletListAccountCard, walletSettingsAccountNameCell, accountChangeNameSheetInput, eraseText, type, tap "Save").',
  },
] as const satisfies readonly MobileFeatureEntry[];
