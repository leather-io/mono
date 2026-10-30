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
      'The global "Add wallet" sheet (features/wallet-manager/add-wallet/add-wallet-sheet.tsx), mounted in the root layout on addWalletSheetRef (global-sheet-provider.tsx), so it opens signed out and signed in. It shows a sticker, the heading "Add wallet" and two cells: "Create new wallet" / "Generate new Secret Key for self-custody" (OnboardingSelectors.CreateNewWalletSheetButton) navigates to /create-new-wallet and "Restore wallet" / "Import existing accounts from self-custody" (OnboardingSelectors.RestoreWalletSheetButton) to /recover-wallet; both close the sheet after navigating. With release_waitlist_features (useWaitlistFlag) a third "More options" cell renders whose press only toggles local state that hides its ellipsis icon. Its presenters are the home-no-wallet "Add account" card, the "Add wallet" list item and empty-state button of settings-wallet, and the add-account-sheet "Add to new wallet" cell, which nothing presents today.',
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
      'The "Back up your Secret Key" screen (app/create-new-wallet.tsx), reachable signed out or signed in. On mount it generates a mnemonic and writes it to the temporary mnemonic store (temp-mnemonic-store.ts, which first deletes any previous temporary mnemonic and passphrase), so a bare deep link works and every visit shows a new Secret Key. The body reads "Your Secret Key grants you access to your wallet and its assets. Store it securely since it can never be recovered if lost or stolen." above the numbered words under a blur with "Tap to view Secret Key" / "For your eyes only" (OnboardingSelectors.WalletCreationTapToReveal); tapping it removes the overlay for the rest of the visit. "Copy" (OnboardingSelectors.WalletCreationCopyButton) copies the phrase and shows the "Copied to clipboard" toast; with release_waitlist_features (useWaitlistFlag) a "Save to..." button opens the waitlist sheet. "I\'ve backed it up" (OnboardingSelectors.WalletCreationBackedUpButton) stays disabled until the reveal and calls navigateAndCreateWallet (use-create-wallet.ts): with securityLevelPreference \'not-selected\' it goes to secure-your-wallet, otherwise it calls createWallet with the stored preference and goes to generating-wallet. Back goes to the previous screen, or to / without history; the temporary mnemonic is deleted only after a successful restore, so backing out leaves it in the secure store until the next set. temp-mnemonic-store.spec.ts covers the store round trip, not the screen.',
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
      'The "Secure your wallet" screen (app/secure-your-wallet.tsx), shown by navigateAndCreateWallet only while securityLevelPreference is \'not-selected\'; createWallet then stores \'secure\' or \'insecure\' and later wallet creations skip it. It reads "Use your device PIN, Face ID or other biometrics to secure your wallets" above a lock sticker. "Enable device security" (OnboardingSelectors.SecureYourWalletEnableButton) runs callIfEnrolled (use-authentication.ts): when the device has no PIN or biometrics it shows the error toast "App is not protected with device-level PIN or biometrics." and stays, otherwise it calls createWallet({ biometrics: true }). "Skip for now" (OnboardingSelectors.SecureYourWalletSkipButton) opens the secure-your-wallet-skip-sheet. Not deep-linkable: createWallet sets the preference first and does nothing further without a temporary mnemonic, so a bare link on a fresh install only flips the security preference, and a mnemonic left over from an abandoned create or restore would be added instead. Back goes to the previous screen. legacy-flows/restore-wallet.yaml tapped "Skip for now" here.',
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
      'The "Continue without security" warning sheet (skip-secure-wallet-sheet.tsx, a critical WarningSheetLayout rendered by the secure-your-wallet screen). It reads "Proceed with caution since your wallet will not be protected by your device’s native security mechanism." "Continue" (OnboardingSelectors.SkipSecureWalletContinueButton) closes the sheet and calls createWallet({ biometrics: false }), which stores securityLevelPreference \'insecure\' and continues to generating-wallet when a temporary mnemonic exists; "Cancel" (OnboardingSelectors.SkipSecureWalletCancelButton) dismisses it. legacy-flows/restore-wallet.yaml tapped "Proceed" here, a label the sheet no longer has.',
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
      'The "Adding wallet..." interstitial (app/generating-wallet.tsx, OnboardingSelectors.GeneratingWalletText) over the wallet-generation animation; it has no header, no back button and no logic of its own. createWallet (use-create-wallet.ts) navigates here when a temporary mnemonic exists and awaits keyStore.restoreWalletFromMnemonic (key-store.ts), which throws WALLET_ALREADY_EXISTS when the fingerprint is already in the wallet list and otherwise stores the mnemonic and passphrase with mnemonicStore(fingerprint).setMnemonic (biometric-protected when biometrics is true) and adds a software wallet with its Bitcoin and Stacks keychains. On success it shows the "Wallet added" toast, dismisses every screen and replaces the route with / (home entry), then deletes the temporary mnemonic. An existing wallet shows the error toast "Wallet added already" and goes back; any other error shows "An error occurred" and goes back; in both cases the temporary mnemonic stays in the secure store. Not deep-linkable: a bare link renders the animation forever because nothing on the screen navigates away. mnemonic-store.spec.ts and secure-store-keys.spec.ts cover the store the restore writes to, not the screen.',
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
      'The "Enter your Secret Key" screen (app/recover-wallet.tsx rendering features/recover-wallet/recover-wallet.tsx), reachable signed out or signed in. Under "Paste or type Secret Key to add wallet" a focused multiline input with placeholder "Enter your Secret Key" (OnboardingSelectors.RestoreWalletTextInput) holds the phrase; "Paste" (OnboardingSelectors.RestoreWalletPasteButton) shows only while the input is empty and fills it with the trimmed clipboard. "Continue" (OnboardingSelectors.RestoreWalletContinue) is enabled while isValidMnemonic passes; on blur, words outside the BIP39 list show "Invalid words: <comma-separated words>" and disable it, while a blur with no invalid word clears the error and enables it even when the checksum fails, in which case Continue does nothing because onSubmit re-checks isValidMnemonic. "Advanced options" (OnboardingSelectors.RestoreWalletAdvancedOptions) reveals the "BIP39 passphrase" cell reading "Enabled" or "Disabled" (OnboardingSelectors.RestoreWalletPassphraseCell, visible only after expanding), which opens the recover-wallet-passphrase-sheet. Continue stores the phrase and passphrase in the temporary mnemonic store and calls navigateAndCreateWallet: secure-your-wallet while securityLevelPreference is \'not-selected\', else generating-wallet. Back goes to the previous screen, or to / without history. temp-mnemonic-store.spec.ts covers the mnemonic-plus-passphrase handoff. legacy-flows/restore-wallet.yaml walked this screen: "Advanced options", the passphrase sheet, "Invalid words: definitely, not, a, mnemonic", then "Paste" and "Continue".',
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
      'The "BIP39 passphrase" input sheet of the restore screen (recover-wallet-sheet.tsx, an InputSheetLayout owned by recover-wallet.layout.tsx). It has an autofocused input with placeholder "Passphrase" (OnboardingSelectors.RestoreWalletPassphraseInput) and a "Confirm" button (OnboardingSelectors.RestoreWalletPassphraseConfirm) that closes the sheet and stores the text, empty included, as the restore passphrase; the cell then reads "Enabled" for a non-empty value, else "Disabled". The input keeps its own state and only "Confirm" writes it back. The passphrase reaches the temporary mnemonic store on "Continue" and changes the wallet fingerprint derived by restoreWalletFromMnemonic.',
  },
] as const satisfies readonly MobileFeatureEntry[];
