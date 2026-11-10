import { AccountSelectors } from '@tests/selectors/account.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const multiwalletSpec = 'apps/extension/tests/specs/switch-account/multiwallet.spec.ts';
const switchAccountSpec = 'apps/extension/tests/specs/switch-account/switch-account.spec.ts';
const multiwalletIntegritySpec =
  'apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts';
const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

export const switchAccountFeatures = [
  {
    id: 'add-wallet',
    anchor: { kind: 'route' },
    routes: [RouteUrls.AddWallet],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the account switcher from the Home header (SettingsSelectors.SigningAccountCard)',
          'Click "Add wallet" then the "Restore wallet" menu item; in popup mode this opens /add-wallet in a full-page tab and closes the popup',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/add-wallet with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: OnboardingSelectors.SignInBtn,
      others: [
        OnboardingSelectors.SignInSeedError,
        OnboardingSelectors.NewPasswordInput,
        OnboardingSelectors.SetPasswordBtn,
      ],
    },
    actions: [
      'SwitchAccountPage.open',
      'SwitchAccountPage.openAddWalletMenu',
      'SwitchAccountPage.restoreWallet',
      'SwitchAccountPage.submitNewWalletPassword',
      'SwitchAccountPage.getWalletCount',
    ],
    specs: [multiwalletSpec],
    description:
      'Adds a second software wallet from a Secret Key. The page reuses the /sign-in mnemonic form (word inputs mnemonic-input-1 … mnemonic-input-24, 24 by default; "Have a 12-word Secret Key?" switches to 12) and then the password step, titled "Enter your Password" when a software wallet already exists ("Set a password" with strength validation for a Ledger-only user; set-password.tsx); the password must match the existing wallets\' password or the form shows "The password you entered doesn\'t match". A key already on the device shows "A wallet with this Secret Key has already been added to this device.", and a key already added as a Ledger wallet shows the cross-type error (wallet.selectors.ts getAddWalletError). On success the new wallet appears as its own group in the account switcher and the app returns home (HomePageContainer). multiwallet.spec also registers mockBnsV2NamesRequestEmpty again in beforeEach (setupMockApis already does) so account names stay "Account N".',
  },
  {
    id: 'create-wallet',
    anchor: { kind: 'route' },
    routes: [RouteUrls.CreateWallet],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open the account switcher from the Home header (SettingsSelectors.SigningAccountCard)',
          'Click "Add wallet" then the "Create new wallet" menu item; in popup mode this opens /create-wallet in a full-page tab and closes the popup',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/create-wallet with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: OnboardingSelectors.BackUpSecretKeyBtn,
      others: [
        SettingsSelectors.ShowSecretKeyBtn,
        SettingsSelectors.CopyKeyToClipboardBtn,
        OnboardingSelectors.NewPasswordInput,
        OnboardingSelectors.SetPasswordBtn,
      ],
    },
    actions: [
      'SwitchAccountPage.open',
      'SwitchAccountPage.createNewWallet',
      'SwitchAccountPage.addNewWallet',
      'SwitchAccountPage.submitNewWalletPassword',
      'SwitchAccountPage.getWalletCount',
    ],
    specs: [
      multiwalletSpec,
      switchAccountSpec,
      multiwalletIntegritySpec,
      'apps/extension/tests/specs/settings/sign-out-multiwallet.spec.ts',
    ],
    description:
      'Generates a new Secret Key for an additional software wallet. It is the same BackUpSecretKeyPage as onboarding, mounted behind the AccountGate instead of the OnboardingGate: back up the words, confirm, then enter the existing wallet password on a step titled "Enter your Password" ("Set a password" with strength validation for a Ledger-only user; set-password.tsx). A mismatch shows "The password you entered doesn\'t match", and the check derives a key so it is slow on CI. A new key is generated each time the page mounts. The wallet count in persisted state grows by one and the app returns home (HomePageContainer). multiwallet.spec, switch-account.spec and multiwallet-integrity.spec also register mockBnsV2NamesRequestEmpty again in beforeEach (setupMockApis already does) so account names stay "Account N"; sign-out-multiwallet.spec overrides the Stacks balance endpoints with inline page.route zero balances.',
  },
  {
    id: 'switch-account-sheet',
    anchor: { kind: 'selectors', objects: ['SwitchAccountSelectors'] },
    routes: [],
    startRoute: RouteUrls.Home,
    open: ['SwitchAccountPage.open'],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On Home click the account card in the header (SettingsSelectors.SigningAccountCard)',
          'Or open the header settings menu and click "Manage wallets" (SettingsSelectors.SwitchAccountMenuItem) on Home, any page-header screen or /unlock while unlocked',
          'In request popups the account header opens it too: PopupHeader with showSwitchAccount (psbt-signer, rpc-sign-stacks-message, rpc-sign-bip322-message) and the account displayer of getAddresses, btc_addAccount and stx_addAccount',
          'The "Select account" sheet lists every wallet with its accounts; "Manage" switches to "Manage wallets" with rename, hide, show and remove actions, "Done" returns',
          'Escape or clicking outside closes it; selecting an account closes it and makes that account active',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: SwitchAccountSelectors.WalletHeaderName,
      others: [
        AccountSelectors.SwitchAccountSheetAccountName,
        SettingsSelectors.SwitchAccountItemIndex,
        SettingsSelectors.SwitchAccountPolicyItem,
        SwitchAccountSelectors.CreateAccountBtn,
        SwitchAccountSelectors.WalletActionMenuTrigger,
        SwitchAccountSelectors.AccountActionMenuTrigger,
        SwitchAccountSelectors.WalletHeaderLedgerIndicator,
        SwitchAccountSelectors.RenameWalletInput,
        SwitchAccountSelectors.RenameWalletSaveBtn,
        SwitchAccountSelectors.RenameAccountInput,
        SwitchAccountSelectors.RenameAccountSaveBtn,
        SwitchAccountSelectors.RemoveWalletConfirmBtn,
        SwitchAccountSelectors.PolicyActionMenuTrigger,
        SwitchAccountSelectors.RenamePolicyInput,
        SwitchAccountSelectors.RenamePolicySaveBtn,
        SwitchAccountSelectors.RemovePolicyConfirmBtn,
      ],
    },
    actions: [
      'SwitchAccountPage.open',
      'SwitchAccountPage.close',
      'SwitchAccountPage.selectAccount',
      'SwitchAccountPage.addAccount',
      'SwitchAccountPage.enterManageMode',
      'SwitchAccountPage.exitManageMode',
      'SwitchAccountPage.openWalletMenu',
      'SwitchAccountPage.openAccountMenu',
      'SwitchAccountPage.renameWallet',
      'SwitchAccountPage.renameAccount',
      'SwitchAccountPage.removeWallet',
      'SwitchAccountPage.hideAccount',
      'SwitchAccountPage.showAccount',
      'SwitchAccountPage.viewSecretKey',
      'SwitchAccountPage.policyRow',
      'SwitchAccountPage.openPolicyMenu',
      'SwitchAccountPage.renamePolicy',
      'SwitchAccountPage.removePolicy',
      'HomePage.switchAccount',
    ],
    specs: [
      multiwalletSpec,
      switchAccountSpec,
      multiwalletIntegritySpec,
      'apps/extension/tests/specs/switch-account/policy-accounts.spec.ts',
      'apps/extension/tests/specs/settings/settings.spec.ts',
      'apps/extension/tests/specs/settings/sign-out-multiwallet.spec.ts',
      'apps/extension/tests/specs/ledger/ledger.spec.ts',
      'apps/extension/tests/specs/bns-names/bns-names.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses.spec.ts',
      'apps/extension/tests/specs/rpc-get-addresses/get-addresses-policy.spec.ts',
    ],
    description:
      'The account switcher sheet ("Select account"; "Manage wallets" in manage mode). It has no URL. The account card that opens it is rendered only by the Home header (home.header.tsx); elsewhere it opens from the settings menu\'s "Manage wallets" item and from the account header of request popups. Each software or Ledger wallet is a group headed by its name (SwitchAccountSelectors.WalletHeaderName, with WalletHeaderLedgerIndicator for hardware wallets) followed by its accounts and, for software wallets only, an "Add account" row (SwitchAccountSelectors.CreateAccountBtn; switch-account-sheet.utils.ts). Account rows have the test id switch-account-item-<accountIndex> (SettingsSelectors.SwitchAccountItemIndex is a template, replace [index]); the index is per wallet, so with several wallets the id is not unique, and the same id is the fallback of the shared AccountListItemLayout, which the request popups\' current-account displayer and the send recipient-accounts dialog (also titled "Select account") render too, so scope the locator to the sheet. The account name inside a row is AccountSelectors.SwitchAccountSheetAccountName, also a template (replace {index}, or use SwitchAccountPage.accountName). Policy (multisig) rows sit under their parent account with the test id switch-account-policy-<policyId> (SettingsSelectors.SwitchAccountPolicyItem, replace [id]); they are filtered to the current network and left out entirely when the opener sets allowPolicyAccounts false (getAddresses sets it from the request; switch-account-sheet.tsx). Their own menu renders only in manage mode. Hidden accounts are left out outside manage mode. Manage mode exposes per-wallet "Rename", "View Secret Key" (software wallets only) and "Remove wallet" (only while more than one wallet exists; confirmed in a nested dialog) from wallet-action-menu.tsx, and per-account "Rename" and "Hide"/"Show"; "Hide" is not offered for the active account or for a wallet\'s last visible account (canHideAccount, account-action-menu.tsx; multiwallet.spec tests this). "Add wallet" opens a menu with "Create new wallet" (/create-wallet), "Restore wallet" (/add-wallet) and "Connect hardware wallet". The Ledger indicator needs OnboardingPage.signInWithLedgerAccount or signInWithMixedSoftwareAndLedgerWallets; policy rows need a seeded policy: policy-accounts.spec passes policyStateOverrides({ policies: [makeBitcoinPolicy()] }) (or a Stacks policy) to OnboardingPage.signInWithTestAccount. The switch-account specs register mockBnsV2NamesRequestEmpty again in beforeEach (setupMockApis already does) so names stay "Account N". settings.spec opens the sheet from "Manage wallets"; ledger.spec opens it with a Ledger wallet.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
