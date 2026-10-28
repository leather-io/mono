import { AppRoutes } from '@/shared/app-routes';
import { HomeSelectors } from '@/shared/selectors/home.selectors';
import { OnboardingSelectors } from '@/shared/selectors/onboarding.selectors';
import { SettingsSelectors } from '@/shared/selectors/settings.selectors';
import { SharedSelectors } from '@/shared/selectors/shared.selectors';

import type { MobileFeatureEntry } from './mobile-feature-entry';

const tempMnemonicStoreSpec = 'apps/mobile/src/store/secure-store/temp-mnemonic-store.spec.ts';
const mnemonicStoreSpec = 'apps/mobile/src/store/secure-store/mnemonic-store.spec.ts';
const secureStoreKeysSpec = 'apps/mobile/src/store/secure-store/secure-store-keys.spec.ts';

export const onboardingFeatures = [
  {
    id: 'add-wallet-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'OnboardingSelectors.CreateNewWalletSheetButton',
        'OnboardingSelectors.RestoreWalletSheetButton',
      ],
    },
    routes: [],
    startRoute: AppRoutes.Home,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'With no wallet (home-no-wallet), tap the "Add account" card on the Home tab (HomeSelectors.CreateWalletCard)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Tap the Home header gear (HomeSelectors.SettingsButton)',
          'Tap "Wallets and accounts" (SettingsSelectors.WalletAndAccountsButton) to open settings-wallet',
          'Tap "Add wallet" at the bottom of the wallet list (WalletSettingsSelectors.AddWalletButton), or the "Add wallet" button of the empty state when there is no wallet (WalletSettingsSelectors.EmptyWalletsAddWalletButton)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'From add-account-sheet tap "Add to new wallet" (no code presents that sheet today, see the description)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: OnboardingSelectors.CreateNewWalletSheetButton,
      others: [
        OnboardingSelectors.RestoreWalletSheetButton,
        HomeSelectors.CreateWalletCard,
        HomeSelectors.SettingsButton,
        SettingsSelectors.WalletAndAccountsButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The global "Add wallet" sheet (features/wallet-manager/add-wallet/add-wallet-sheet.tsx and add-wallet-sheet.layout.tsx), mounted unconditionally in app/_layout.tsx and presented through addWalletSheetRef from core/global-sheet-provider.tsx, so it opens while signed out and while signed in. Three callers present it: the "Add account" card of components/home/home-without-account-screen.tsx (features/account/components/create-wallet-card.tsx, HomeSelectors.CreateWalletCard), the "Add wallet" list item and the empty-state "Add wallet" button (features/settings/wallet-and-accounts/components/empty-wallets-screen.tsx) of app/settings/wallet/index.tsx, and "Add to new wallet" in features/account/sheets/add-account-sheet.tsx; nothing in apps/mobile/src calls addAccountSheetRef.current?.present(), so the add-account path is unreachable. The sheet shows a sticker, the heading "Add wallet" and two cells (add-wallet-cell.tsx, a pressable Cell.Root forwarding testID): "Create new wallet" / "Generate new Secret Key for self-custody" (OnboardingSelectors.CreateNewWalletSheetButton) navigates to /create-new-wallet (create-new-wallet entry) and "Restore wallet" / "Import existing accounts from self-custody" (OnboardingSelectors.RestoreWalletSheetButton) navigates to /recover-wallet (recover-wallet entry); both close the sheet after navigating. The release_waitlist_features flag (useWaitlistFlag) adds a third "More options" cell whose press only toggles local moreOptionsVisible state, which changes nothing but hiding its ellipsis icon; the state resets on dismiss. The cells are not flag-gated. No Maestro flow covers the sheet: legacy-flows/restore-wallet.yaml opened it by text "Add Wallet" after the clean-up sub-flow, and legacy-flows/create-wallet-without-security.yaml and legacy-flows/secure/create-wallet.yaml runFlow ../shared/add-wallet.yaml, which no longer exists.',
  },
  {
    id: 'create-new-wallet',
    anchor: { kind: 'route' },
    routes: [AppRoutes.CreateNewWallet],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open add-wallet-sheet (with no wallet: tap the Home "Add account" card, HomeSelectors.CreateWalletCard)',
          'Tap "Create new wallet" (OnboardingSelectors.CreateNewWalletSheetButton)',
        ],
      },
      { kind: 'deepLink', steps: ['Open leather://create-new-wallet'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: OnboardingSelectors.WalletCreationTapToReveal,
      others: [
        OnboardingSelectors.WalletCreationCopyButton,
        OnboardingSelectors.WalletCreationBackedUpButton,
        SharedSelectors.BackButton,
        SharedSelectors.ToastContainer,
      ],
    },
    actions: [],
    specs: [tempMnemonicStoreSpec],
    description:
      'The "Back up your Secret Key" screen (app/create-new-wallet.tsx), reachable signed out or signed in. On mount it calls generateMnemonic() from @leather.io/crypto and writes the words to store/secure-store/temp-mnemonic-store.ts (setTemporaryMnemonic, which first deletes any previous temporary mnemonic and passphrase), so a bare deep link works and every visit shows a new Secret Key. The body reads "Your Secret Key grants you access to your wallet and its assets. Store it securely since it can never be recovered if lost or stolen." and shows the numbered words (features/wallet-manager/create-new-wallet/mnemonic-display.tsx, mnemonic-word-box.tsx) under a blur (iOS BlurView, Android a blurred image) with "Tap to view Secret Key" / "For your eyes only" (OnboardingSelectors.WalletCreationTapToReveal); tapping it removes the overlay for the rest of the visit. "Copy" (OnboardingSelectors.WalletCreationCopyButton) copies the phrase and shows the "Copied to clipboard" toast; with release_waitlist_features (useWaitlistFlag) a "Save to..." button opens a waitlist NotifyUserSheetLayout (WaitlistIds.saveMnemonic). "I\'ve backed it up" (OnboardingSelectors.WalletCreationBackedUpButton) stays disabled until the reveal and calls navigateAndCreateWallet from hooks/use-create-wallet.ts: with securityLevelPreference \'not-selected\' (the initial value in store/settings/settings.write.ts) it navigates to /secure-your-wallet (secure-your-wallet entry); with \'secure\' or \'insecure\' it calls createWallet({ biometrics: true | false }) directly, which goes to /generating-wallet (generating-wallet entry). The header back button goes back, or to / when there is no history; the temporary mnemonic is deleted only after a successful restoreWalletFromMnemonic, so backing out leaves it in the secure store until the next set. temp-mnemonic-store.spec.ts covers the set/get/delete round trip with and without a passphrase. No Maestro flow covers the screen; legacy-flows/restore-wallet.yaml tapped walletCreationTapToReveal and "Copy" here to seed the clipboard before restoring.',
  },
  {
    id: 'secure-your-wallet',
    anchor: { kind: 'route' },
    routes: [AppRoutes.SecureYourWallet],
    deepLinkable: false,
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'With securityLevelPreference still \'not-selected\' (fresh install), open create-new-wallet, tap "Tap to view Secret Key" (OnboardingSelectors.WalletCreationTapToReveal), then "I\'ve backed it up" (OnboardingSelectors.WalletCreationBackedUpButton)',
          'Or on recover-wallet enter a valid Secret Key and tap "Continue" (OnboardingSelectors.RestoreWalletContinue)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: OnboardingSelectors.SecureYourWalletEnableButton,
      others: [
        OnboardingSelectors.SecureYourWalletSkipButton,
        SharedSelectors.BackButton,
        SharedSelectors.ToastContainer,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The "Secure your wallet" screen (app/secure-your-wallet.tsx), shown by navigateAndCreateWallet (hooks/use-create-wallet.ts) only while securityLevelPreference is \'not-selected\'; once createWallet has run it stores \'secure\' or \'insecure\' and later wallet creations skip this screen. It reads "Use your device PIN, Face ID or other biometrics to secure your wallets" above a lock sticker. "Enable device security" (OnboardingSelectors.SecureYourWalletEnableButton) runs callIfEnrolled from hooks/use-authentication.ts: when expo-local-authentication reports SecurityLevel.NONE it shows the error toast "App is not protected with device-level PIN or biometrics." and stays, otherwise it calls createWallet({ biometrics: true }). "Skip for now" (OnboardingSelectors.SecureYourWalletSkipButton) presents secure-your-wallet-skip-sheet, whose "Continue" calls createWallet({ biometrics: false }). Not deep-linkable: createWallet first sets the preference, then reads tempMnemonicStore.getTemporaryMnemonic() and does nothing further when it is null, so a bare link on a fresh install only flips the security preference; if a previous create or restore was abandoned, the leftover temporary mnemonic would be added instead. The back button returns to the previous screen. No spec covers it; legacy-flows/restore-wallet.yaml tapped "Skip for now" here.',
  },
  {
    id: 'secure-your-wallet-skip-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'OnboardingSelectors.SkipSecureWalletContinueButton',
        'OnboardingSelectors.SkipSecureWalletCancelButton',
      ],
    },
    routes: [],
    startRoute: AppRoutes.SecureYourWallet,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          "Reach secure-your-wallet (create-new-wallet or recover-wallet with securityLevelPreference 'not-selected')",
          'Tap "Skip for now" (OnboardingSelectors.SecureYourWalletSkipButton)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: OnboardingSelectors.SkipSecureWalletContinueButton,
      others: [OnboardingSelectors.SkipSecureWalletCancelButton],
    },
    actions: [],
    specs: [],
    description:
      'The "Continue without security" warning (features/wallet-manager/secure-your-wallet/skip-secure-wallet-sheet.tsx), a critical WarningSheetLayout (components/sheets/warning-sheet.layout.tsx) rendered by app/secure-your-wallet.tsx. It reads "Proceed with caution since your wallet will not be protected by your device’s native security mechanism." "Continue" (OnboardingSelectors.SkipSecureWalletContinueButton, danger intent) closes the sheet and calls createWallet({ biometrics: false }) from hooks/use-create-wallet.ts, which stores securityLevelPreference \'insecure\' and continues to generating-wallet when a temporary mnemonic exists; "Cancel" (OnboardingSelectors.SkipSecureWalletCancelButton) dismisses it. No spec covers it; legacy-flows/restore-wallet.yaml tapped "Proceed" here, a label the sheet no longer has.',
  },
  {
    id: 'generating-wallet',
    anchor: { kind: 'route' },
    routes: [AppRoutes.GeneratingWallet],
    deepLinkable: false,
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Follow create-new-wallet or recover-wallet to its last button; with securityLevelPreference \'not-selected\' finish secure-your-wallet ("Enable device security", OnboardingSelectors.SecureYourWalletEnableButton, or secure-your-wallet-skip-sheet "Continue", OnboardingSelectors.SkipSecureWalletContinueButton)',
          'The screen shows while keyStore.restoreWalletFromMnemonic runs, then the app returns to Home',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: OnboardingSelectors.GeneratingWalletText,
      others: [SharedSelectors.ToastContainer],
    },
    actions: [],
    specs: [mnemonicStoreSpec, secureStoreKeysSpec],
    description:
      'The "Adding wallet..." interstitial (app/generating-wallet.tsx, OnboardingSelectors.GeneratingWalletText) over components/animations/wallet-generation; it has no header, no back button and no logic of its own. createWallet in hooks/use-create-wallet.ts navigates here when a temporary mnemonic exists, waits one animation frame and awaits keyStore.restoreWalletFromMnemonic (store/key-store.ts), which throws WALLET_ALREADY_EXISTS when the fingerprint is already in the wallet list, otherwise writes the mnemonic and passphrase with mnemonicStore(fingerprint).setMnemonic (store/secure-store/mnemonic-store.ts, biometric-protected when biometrics is true) and adds a software wallet with the derived Bitcoin and Stacks account keychains. On success it shows the "Wallet added" toast, calls router.dismissAll() and router.replace(\'/\') to land on Home (home entry), then deletes the temporary mnemonic. If the wallet exists it shows the error toast "Wallet added already" and router.back(); any other error shows "An error occurred" and router.back(); in both cases the temporary mnemonic stays in the secure store. Not deep-linkable: a bare link renders the animation forever because nothing on the screen navigates away. mnemonic-store.spec.ts covers the setMnemonic/getMnemonic/deleteMnemonic storage the restore writes to and secure-store-keys.spec.ts the per-fingerprint key names; nothing covers the screen itself.',
  },
  {
    id: 'recover-wallet',
    anchor: { kind: 'route' },
    routes: [AppRoutes.RecoverWallet],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open add-wallet-sheet (with no wallet: tap the Home "Add account" card, HomeSelectors.CreateWalletCard)',
          'Tap "Restore wallet" (OnboardingSelectors.RestoreWalletSheetButton)',
        ],
      },
      { kind: 'deepLink', steps: ['Open leather://recover-wallet'] },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: OnboardingSelectors.RestoreWalletTextInput,
      others: [
        OnboardingSelectors.RestoreWalletPasteButton,
        OnboardingSelectors.RestoreWalletAdvancedOptions,
        OnboardingSelectors.RestoreWalletPassphraseCell,
        OnboardingSelectors.RestoreWalletContinue,
        SharedSelectors.BackButton,
      ],
    },
    actions: [],
    specs: [tempMnemonicStoreSpec],
    description:
      'The "Enter your Secret Key" screen (app/recover-wallet.tsx rendering features/recover-wallet/recover-wallet.tsx and recover-wallet.layout.tsx, state in reducer.ts and actions.ts), reachable signed out or signed in and deep-linkable since it needs no prior state. Under "Paste or type Secret Key to add wallet" a focused multiline input with placeholder "Enter your Secret Key" (OnboardingSelectors.RestoreWalletTextInput) holds the phrase; a "Paste" button (OnboardingSelectors.RestoreWalletPasteButton) shows only while the input is empty and fills it with the trimmed clipboard. Every change enables "Continue" (OnboardingSelectors.RestoreWalletContinue) only when isValidMnemonic passes; on blur, a non-empty input with words outside the BIP39 list (utils.ts getInvalidMnemonicWords) shows "Invalid words: <comma-separated words>" (components/error-message.tsx) and disables Continue, while a blur with no invalid word clears the error and enables Continue even when the checksum fails; Continue then does nothing because onSubmit re-checks isValidMnemonic. The "Advanced options" accordion (OnboardingSelectors.RestoreWalletAdvancedOptions) reveals a "BIP39 passphrase" cell reading "Enabled" or "Disabled" (OnboardingSelectors.RestoreWalletPassphraseCell, visible only after expanding) that opens recover-wallet-passphrase-sheet. "Continue" re-checks isValidMnemonic, stores the phrase and passphrase with tempMnemonicStore.setTemporaryMnemonic and calls navigateAndCreateWallet (hooks/use-create-wallet.ts): secure-your-wallet when securityLevelPreference is \'not-selected\', else generating-wallet directly. The back button goes back, or to / without history. temp-mnemonic-store.spec.ts covers the mnemonic-plus-passphrase handoff; no Maestro flow covers the screen. legacy-flows/restore-wallet.yaml walked it before it rotted: "Advanced options", the passphrase sheet, "Invalid words: definitely, not, a, mnemonic" after typing an invalid phrase, then "Paste" and "Continue".',
  },
  {
    id: 'recover-wallet-passphrase-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'OnboardingSelectors.RestoreWalletPassphraseInput',
        'OnboardingSelectors.RestoreWalletPassphraseConfirm',
      ],
    },
    routes: [],
    startRoute: AppRoutes.RecoverWallet,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open recover-wallet (add-wallet-sheet, then "Restore wallet", OnboardingSelectors.RestoreWalletSheetButton)',
          'Tap "Advanced options" (OnboardingSelectors.RestoreWalletAdvancedOptions)',
          'Tap "BIP39 passphrase" (OnboardingSelectors.RestoreWalletPassphraseCell)',
        ],
      },
    ],
    gate: 'splashScreen',
    flags: [],
    preconditions: { session: 'signed-out', mocks: [] },
    selectors: {
      ready: OnboardingSelectors.RestoreWalletPassphraseInput,
      others: [OnboardingSelectors.RestoreWalletPassphraseConfirm],
    },
    actions: [],
    specs: [],
    description:
      'The BIP39 passphrase sheet of the restore screen (features/wallet-manager/recover-wallet/recover-wallet-sheet.tsx), an InputSheetLayout (components/sheets/input-sheet.layout.tsx) owned by recover-wallet.layout.tsx, not a separate recovery flow. It is titled "BIP39 passphrase" with an autofocused input, placeholder "Passphrase" (OnboardingSelectors.RestoreWalletPassphraseInput), and a "Confirm" button (OnboardingSelectors.RestoreWalletPassphraseConfirm) that closes the sheet and stores the text, empty included, as the recover-wallet passphrase; the cell then reads "Enabled" for a non-empty value, else "Disabled". The input keeps its own state, initialised from the passphrase prop with useState, and only "Confirm" writes it back. The passphrase reaches tempMnemonicStore.setTemporaryMnemonic on "Continue" and changes the wallet fingerprint derived in keyStore.restoreWalletFromMnemonic. No spec covers it; legacy-flows/restore-wallet.yaml opened it, asserted "Passphrase" and "Confirm", and confirmed an empty value.',
  },
] as const satisfies readonly MobileFeatureEntry[];
