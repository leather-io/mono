import { ConnectSelectors } from '@tests/selectors/connect.selectors';
import { MultisigSelectors } from '@tests/selectors/multisig.selectors';
import { RouteUrls } from '~/route-urls';

import type { WebFeatureEntry } from './web-feature-entry';

const seededMockMode = ['successHandlers', 'seedMultisigMockSessions'] as const;
const mockVaultId = 'vault-stx-1';

export const multisigFeatures = [
  {
    id: 'multisig-dashboard',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Multisig],
    params: [],
    entry: [
      { kind: 'nav', steps: ['Click "Multisig" in the left navigation'] },
      {
        kind: 'deepLink',
        steps: [
          'Open /multisig with a session (mock mode seeds one for every network); /multisig?invite=<vaultId> opens the invitation sheet for that vault',
        ],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'The multisig dashboard (pages/multisig/multisig.route.tsx, meta title "Multisig – Leather"), client-only with MultisigDashboardSkeleton as the fallback. Without a BTC or STX session MultisigIndex navigates (replace) to /multisig/onboarding, forwarding ?invite=. MultisigDashboardPage renders MultisigPage "Multisig" (the header carries the NetworkModeSwitcher and MultisigConnectDropdown, multisig-session entry) with "My vaults": skeleton rows while the vault lists resolve, "No vaults yet" with a "Create vault" button when both lists are empty, otherwise a VaultCard per vault across both chains with invited vaults first (badges "Invitation", "Pending"/"N pending invites", "Cancelled", or the fiat and crypto balance of its accounts), a dashed "Create new vault" tile, and a ConnectChainPrompt "Connect Bitcoin to see more vaults" / "Connect Stacks to see more vaults" for a chain without a session; clicking an invited vault opens InvitationModal ("You\'re invited to a vault", "Accept invitation" / "Decline"), any other joined vault goes to /multisig/vault/<id> (a cancelled vault\'s card is disabled). The "Activity" column lists useDashboardActivity items ("Transactions across your vaults will appear here." when empty) linking to /multisig/vault/<vaultId>/tx/<txId>. An ?invite= param matching a listed vault opens its invitation sheet and is removed from the URL. In mock mode multisigHandlers return "Team Treasury" and the invited "Bear Market Buying" for stx:mainnet, "Vault One" for btc:mainnet and "Testnet Playground" for stx:testnet; localStorage leather:mock:scenario = "empty" returns no vaults. No test ids and no spec.',
  },
  {
    id: 'multisig-onboarding',
    anchor: { kind: 'route' },
    routes: [RouteUrls.MultisigOnboarding],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open any /multisig route without a BTC or STX session; the layout redirects here once hydration and the session restore settle',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open /multisig/onboarding; with a session it navigates to /multisig (keeping ?invite=); in mock mode entry.client.tsx re-seeds leather:multisig:sessions on every load, so instead sign out both chains from the connect dropdown ("Disconnect Bitcoin" and "Disconnect Stacks")',
        ],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: ['successHandlers'] },
    selectors: {
      ready: ConnectSelectors.ConnectCard,
      others: [ConnectSelectors.MockWalletResolveButton],
    },
    actions: [],
    specs: [],
    description:
      'The multisig sign-in page (pages/multisig/onboarding/onboarding.route.tsx, meta title "Get started – Leather Multisig"), client-only. With any session it navigates (replace) to /multisig. It renders a Page with header "Multisig", the OutdatedExtensionCallout ("Update your Leather extension" when the installed Leather reports a version below 6.112.0), a blurred inert MultisigOnboardingBackdrop of sample vaults ("Treasury", "Grants", "Ops reserve") and activity, and the ConnectCard "Get started with Leather Multisig" / "Connect a wallet on each chain you want to use." with an OnboardingConnectRow per chain: "Connect Bitcoin" ("Sign PSBT-based BTC vaults") and "Connect Stacks" ("Sign on-chain STX & sBTC vaults"), each with a "Connect" button that reads "Connecting…" while pending (the row\'s connected variant, "Connected to <chain>" with a "Signed in" badge and "Sign out", never renders here because the page navigates to /multisig as soon as either session exists). The footer reads "Don\'t have Leather yet? Install the extension ↗". useSignIn builds a sign-in message for the chain network, calls walletSignIn (features/multisig/auth/wallet-sign-in.ts: requires window.LeatherProvider else "Leather wallet not detected. Install the Leather extension to connect."; getAddresses for that chain through the version-gated multisigLeather client; a wallet on the wrong network fails with "Your Leather wallet is on testnet, but this is a mainnet vault. Switch the extension to mainnet and try again."; then signMessage for BTC or stx_signMessage for STX), rejects a message older than five minutes ("Sign-in expired. The message has a 5-minute expiry, so please try again.") and stores the session returned by getSignInService().signIn under the sessions atom. Errors render in red under the row. The mock wallet dialog answers the signing methods with an empty result, so a mock sign-in ends with "Active wallet account changed during sign-in. Please try again."; the seeded sessions are the mock-mode path into multisig. No spec.',
  },
  {
    id: 'multisig-create-vault',
    anchor: { kind: 'route' },
    routes: [RouteUrls.MultisigCreateVault],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /multisig click "Create vault" in the empty state or the "Create new vault" tile under the vault list',
        ],
      },
      { kind: 'deepLink', steps: ['Open /multisig/create-vault with a session'] },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'The create-vault form (pages/multisig/create-vault/create-vault.route.tsx, meta title "Create vault – Leather Multisig"), client-only, MultisigPage "Create vault" with a back arrow to /multisig. Sections: "Vault name" (placeholder "e.g. Team treasury"), "Chain" (ChainPicker "Bitcoin multisig" / "Stacks multisig", each marked "Connected" or "Disconnected"; a chain without a session shows the "Connect your Bitcoin wallet to continue" callout with a "Connect Bitcoin" button running useSignIn), "Theme" (ThemePicker) and "Members" (MemberRows: the signed-in address is added first and cannot be entered again, two empty rows to start; on Stacks mainnet BNS names resolve both ways with the statuses "Not a valid BNS name." and "BNS name does not match address."; address errors are "Enter a Stacks mainnet address (SP…).", "Testnet addresses are not allowed in mainnet vaults.", "Taproot addresses aren\'t supported. Enter a native SegWit address (bc1q…).", "Enter a native SegWit address for this network (bc1q…).", "You\'re added automatically — enter another member\'s address." and "This address is already added."). The sticky VaultPreviewCard holds the submit button; validation after the first attempt reads "Connect your <chain> wallet to continue.", "Give your vault a name to continue.", "Add at least one other member to continue.", "Waiting for BNS names to resolve…" or "Fix the highlighted member addresses.", and a 409 from the API reads "A vault with this exact set of members already exists on this network. Add or remove a member to create a separate vault.". Success toasts "Vault “<name>” created" and navigates to /multisig/vault/<id>. multisigHandlers mock no vault-creation endpoint, so submitting in mock mode reaches the live API. No spec.',
  },
  {
    id: 'multisig-settings',
    anchor: { kind: 'route' },
    routes: [RouteUrls.MultisigSettings],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: ['Open /multisig/settings with a session; no link in the app points here'],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'A static settings page (pages/multisig/settings/settings.route.tsx, meta title "Settings – Leather Multisig"), MultisigPage "Multisig settings" with a back arrow to /multisig. It renders "Notifications & display" (marked "Stored locally") with "Daily activity digest", "Sort vaults by" (a select with "Recent activity", "Largest balance", "Created date") and "Default landing tab" ("Dashboard", "Latest activity"), then "Bitcoin settings" and "Stacks settings" with "Transaction proposal alerts" and "Threshold-met alerts". The SettingsRow switches hold local component state, the selects are uncontrolled and nothing is persisted; multisigPaths.settings is not linked from any component. No spec.',
  },
  {
    id: 'multisig-vault',
    anchor: { kind: 'route' },
    routes: [RouteUrls.MultisigVault],
    params: [{ name: 'vaultId', example: mockVaultId }],
    entry: [
      { kind: 'nav', steps: ['On /multisig click a joined vault card'] },
      { kind: 'deepLink', steps: ['Open /multisig/vault/vault-stx-1 (a mock stx:mainnet vault)'] },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'The vault detail (pages/multisig/vault/vault.route.tsx, meta title "Vault – Leather Multisig"), client-only. The page finds which chain\'s vault list contains :vaultId, loads it, and shows skeleton rows while hydration, session restore, the lists or the detail resolve, or the MultisigErrorState "Not in this session" / "No vault found. It may not exist, or you may not be a member." / "Back to Multisig". With a vault: MultisigPage titled with the vault name and a back arrow to /multisig; an invited member sees the callout "You\'ve been invited to this vault" with "Accept invite" and "Decline" (decline returns to /multisig); the VaultBalanceHero; "Vault accounts" (AccountsSection with an account card per vault account linking to /multisig/vault/<id>/account/<accountId>, a "Create new account" tile when the creator can create (all members joined, not cancelled, under the per-threshold limit, badge "N of M accounts"), otherwise the reason "Only the vault creator can create accounts.", "All members must accept their invitation before accounts can be created.", "A member declined, so this vault can\'t add accounts. The creator can cancel and start over." or "This vault has been cancelled."); "Vault members" (MembersSection: "Creator" pill, "Invited" badge with "Share invite", "Declined" badge, inline rename on every row for the creator and on their own row for each member); the sidebar "<Name> details" VaultStatusCard (edit pencil for the creator while not cancelled, a "Share N pending invites" button whenever invites are outstanding, and "Cancel vault" for a pending vault the user created) and "Activity" (VaultTransactions). Sheets: CreateAccountModal ("Create vault account" with name, icon and "Signing threshold", then "Account created"), EditVaultModal "Edit vault", ShareInvitationsModal "Share invitations" (copies the invite link https://app.leather.io/multisig?invite=<id>, toasting "Invite link copied", or a per-member message, toasting "Invite message copied") and CancelVaultModal "Cancel “<name>”?" ("Keep vault" or confirm, which toasts "“<name>” cancelled" and returns to /multisig). In mock mode vault-stx-1 "Team Treasury" has one account "Cold storage" (acct-cold-vault-stx-1, 2 of 3). No test ids and no spec.',
  },
  {
    id: 'multisig-account',
    anchor: { kind: 'route' },
    routes: [RouteUrls.MultisigAccount],
    params: [
      { name: 'vaultId', example: mockVaultId },
      { name: 'accountId', example: 'acct-cold-vault-stx-1' },
    ],
    entry: [
      { kind: 'nav', steps: ['On /multisig/vault/<vaultId> click an account card'] },
      {
        kind: 'deepLink',
        steps: ['Open /multisig/vault/vault-stx-1/account/acct-cold-vault-stx-1 in mock mode'],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: { others: [MultisigSelectors.ProposeTransactionSheet] },
    actions: [],
    specs: [],
    description:
      'The vault account detail (pages/multisig/account/account.route.tsx, meta title "Account – Leather Multisig"), client-only, resolving the vault and account the same way as the vault page (skeleton rows, then "No account found. It may not exist, or you may not be a member."). MultisigPage titled with the account name and a back arrow to the vault; a MultisigHero with the crypto and fiat balance (useVaultAccountBalance); InlineTabs "Transactions" (the SendTransactionButton "Send" / "Transfer BTC from this account" or "Transfer STX or a token from this account", which opens the propose sheet, then AccountTransactions) and "Assets" (AccountAssets rows opening the AssetDetailModal with "Token details", "Recent activity" and Send/Receive actions; Send reopens the propose sheet with that asset preselected, Receive opens ReceiveModal "Receive to <account>" with a QR code and "Assets sent to this address require N of M signatures to move. Only send BTC network assets."). The sidebar "Account details" AccountDetailsCard lists the signers and offers "Add account to wallet" (btcAddAccount with the multisig descriptor or stxAddAccount with the ordered signing pubkeys and threshold through multisigLeather; needs Leather installed, else the toast "Leather wallet not detected. Install the Leather extension to add this account."; success is remembered in localStorage leather:multisig:added-accounts and the button becomes "Added to your Leather extension") and "Edit account" for the creator (EditAccountModal "Edit account"). After a proposal succeeds the page navigates to /multisig/vault/<vaultId>/tx/<txId> with router state { autoSign: true }. No spec.',
  },
  {
    id: 'multisig-activity-detail',
    anchor: { kind: 'route' },
    routes: [RouteUrls.MultisigActivityDetail],
    params: [
      { name: 'vaultId', example: mockVaultId },
      { name: 'accountId', example: 'acct-cold-vault-stx-1' },
      {
        name: 'txid',
        example: '0x1111111111111111111111111111111111111111111111111111111111111111',
      },
    ],
    entry: [
      {
        kind: 'nav',
        steps: ['On an account page open an on-chain item of the "Transactions" tab'],
      },
      {
        kind: 'deepLink',
        steps: ['Open /multisig/vault/<vaultId>/account/<accountId>/activity/<txid>'],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'An on-chain activity detail for a vault account (pages/multisig/activity/activity-detail.route.tsx, meta title "Activity – Leather Multisig"), client-only. MultisigPage "Activity" (maxWidth 685px) whose back control goes to the account page, or calls navigate(-1) when the page was reached in-app (location.key !== "default"). It resolves the vault and account like the vault page and loads the activity for the account addresses by :txid with useBlockchainActivityByTxIdDetailQuery; skeleton rows while resolving, otherwise "No activity found for this transaction." or the VaultActivityDetail (hero, detail table with the fee in fiat from useMarketDataQuery, explorer link). The on-chain rows of the account "Transactions" tab come from the blockchain activity feed, which has no MSW handler, so in mock mode an in-app path to a real item depends on the live activity for the mock multisig addresses. No spec.',
  },
  {
    id: 'multisig-transaction',
    anchor: { kind: 'route' },
    routes: [RouteUrls.MultisigTransaction],
    params: [
      { name: 'vaultId', example: mockVaultId },
      { name: 'txId', example: 'tx-1' },
    ],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Propose a transaction from an account page (the app navigates here with { autoSign: true }), or open a pending item in the dashboard "Activity" column or an account\'s "Transactions" tab',
        ],
      },
      { kind: 'deepLink', steps: ['Open /multisig/vault/<vaultId>/tx/<txId>'] },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: {
      ready: MultisigSelectors.SignerRollcall,
      others: [
        MultisigSelectors.SignTransactionButton,
        MultisigSelectors.CancelTransactionButton,
        MultisigSelectors.BroadcastTransactionButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'The proposal detail (pages/multisig/tx/tx.route.tsx, meta title "Transaction – Leather Multisig"), client-only. MultisigPage "Transaction details" whose back control goes to the account page, or navigate(-1) when reached in-app. It resolves the vault, the transaction (useMultisigTransaction), its account, the current user, market data, the on-chain detail once the proposal has a txId and the decoded proposal payload; skeleton rows until all of that settles, then "No transaction found. It may not exist, or you may not be a member." or the VaultActivityDetail with the proposal block: the status reconciled with the chain (an on-chain success becomes "confirmed", a failure "failed"), "Proposed <relative time> by <proposer>" or "Broadcast <relative time>", the txid and memo. The sidebar "Signatures" is the SignerRollcall (multisig-cosign entry). Router state { autoSign: true } from the propose sheet triggers one signing attempt as soon as the data loads and the current user has not signed, then clears the state. The ready selector is the rollcall card, which only renders once the transaction resolved. multisigHandlers serve no transaction detail, so in mock mode a txId under a mock vault stays on the skeleton rows (the transaction query errors and detailResolving never clears); only a vaultId in neither mock vault list reaches the not-found state. No spec.',
  },
  {
    id: 'multisig-previews',
    anchor: { kind: 'route' },
    routes: [
      RouteUrls.MultisigTransactionPreview,
      RouteUrls.MultisigSidebarPreview,
      RouteUrls.MultisigContextPreview,
    ],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Open /multisig/transaction-preview, /multisig/sidebar-preview or /multisig/context-preview on a build whose import.meta.env.MODE is not "production" (pnpm dev); production builds do not register these routes and answer with the not-found page',
        ],
      },
    ],
    gate: 'none',
    flags: ['nonProductionBuild'],
    preconditions: { session: 'uninstalled', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'Three design-review routes declared in pages/multisig/multisig.routes.ts inside previewRoutes, which is an empty array when import.meta.env.MODE === "production" (Vite strips the branch), so they are absent from the production bundle and from the react-router typegen Pages type. They sit under the /multisig prefix but outside the multisig layout, so no session is required and the NetworkGate allows them on testnet. Each is client-only and renders mock data with the real components: /multisig/transaction-preview ("Transaction feed — local preview (on #2435)") shows the TransactionList in the account main column and the compact dashboard/vault sidebar; /multisig/sidebar-preview ("Sidebar contents — local preview (on #2435)") stacks the sidebar panels at the current scale; /multisig/context-preview ("Activity in context — local preview (on #2435)") places the feed in ContextFrames labelled "Dashboard", "Account" and "Vault". No spec.',
  },
  {
    id: 'multisig-propose-sheet',
    anchor: {
      kind: 'selectors',
      objects: [
        'MultisigSelectors.ProposeTransactionSheet',
        'MultisigSelectors.ProposeTransactionButton',
      ],
    },
    routes: [],
    startRoute: RouteUrls.MultisigAccount,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /multisig/vault/<vaultId>/account/<accountId> click "Send" in the Transactions tab, or open an asset in the Assets tab and click its Send action',
          'Fill "Recipient" and "Amount", pick a network fee and press "Propose transaction"; on success the app navigates to the new transaction page with autoSign',
        ],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: {
      ready: MultisigSelectors.ProposeTransactionSheet,
      others: [MultisigSelectors.ProposeTransactionButton],
    },
    actions: [],
    specs: [],
    description:
      'ProposeTransactionModal (pages/multisig/account/components/propose-transaction-modal.tsx) is a Sheet headed "Send from <account>" with a close button; the test id sits on the Box inside the sheet. A BTC account gets BtcProposeForm, a Stacks account StxProposeForm with an AssetSelectorToggle and AssetSelectorSheet for STX or a SIP-10 token. Both share ProposeFormFields: "Proposing a transaction notifies all <N> members. They\'ll need to sign for it to broadcast.", a "Recipient" TextField (placeholder "bc1q… address" or "Stacks address"; errors "Enter a valid address", "Cannot send to yourself" and, for Stacks, "Recipient must be a mainnet address"/"Recipient must be a testnet address"), an "Amount" input with the unit or asset toggle and "Available: <balance>" (errors "Enter a valid amount", "Amount exceeds available balance"), the "Network fee" group with low, standard and high FeeOptionButtons plus "Custom fee" / "Set your own" (CustomBitcoinFeeField with a sats/vB rate, error "Enter a positive fee rate", or CustomStacksFeeField with a minimum fee) and the status copy "Enter a valid recipient and amount to see estimated fees.", "Estimating network fees…", "Fee estimation is paused. Check your connection to continue." or "Fee estimates are unavailable." with "Retry fee estimates"; "Low, Standard, and High currently have the same estimated fee." when the tiers match, a Stacks high-fee alert "This fee exceeds <amount>. Check the amount before proposing. A higher fee does not guarantee faster confirmation.", "Threshold" "<n> of <m> signers required", then "Cancel" and "Propose transaction" (reads "Proposing…" while pending; disabled until recipient, amount and fee validate). Submitting builds the unsigned transfer (buildUnsignedMultisigBtcTransfer, buildUnsignedMultisigStxTransfer or buildUnsignedMultisigSip10Transfer) and posts it with useProposeTransaction; API errors toast their detail, build errors toast the message or "Failed to build transaction". The fee queries and the proposal endpoint have no MSW handlers, so in mock mode they reach the live services. No spec.',
  },
  {
    id: 'multisig-cosign',
    anchor: {
      kind: 'selectors',
      objects: [
        'MultisigSelectors.SignerRollcall',
        'MultisigSelectors.SignTransactionButton',
        'MultisigSelectors.CancelTransactionButton',
        'MultisigSelectors.BroadcastTransactionButton',
      ],
    },
    routes: [],
    startRoute: RouteUrls.MultisigTransaction,
    open: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open /multisig/vault/<vaultId>/tx/<txId> for a pending proposal as one of its signers; the "Signatures" card lists the signers',
          'Press "Sign" on your own row (the extension signs the PSBT or Stacks transaction), "Cancel transaction" to cancel, or "Broadcast transaction" once the threshold is met',
        ],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: {
      ready: MultisigSelectors.SignerRollcall,
      others: [
        MultisigSelectors.SignTransactionButton,
        MultisigSelectors.CancelTransactionButton,
        MultisigSelectors.BroadcastTransactionButton,
      ],
    },
    actions: [],
    specs: [],
    description:
      'SignerRollcall (pages/multisig/tx/components/signer-rollcall.tsx) renders on the transaction page under "Signatures": a queued transaction shows the banner "Queued behind an active transaction" / "You can sign this once this account\'s active transaction is broadcast or cancelled."; then one row per signer ordered by signerIndex, named from the vault member or the truncated address with " (me)" for the current user, whose trailing lane shows the solid "Sign" button only on the current user\'s row while the status is "pending" and they have not signed, "Signed <date>" in green once signed, or "Not signed yet". While signing a blue banner reads "Verifying transaction…" / "Re-deriving the multisig script and checking signer order. The wallet popup will open once this completes.". The footer appears for queued, pending and signed transactions: "Cancel transaction" (hidden for a "signed" transaction unless the current user proposed it or created the vault; reads "Cancelling…") and "Broadcast transaction" (disabled until the signatures reach the account threshold; reads "Broadcasting…"). The tx page wires them to useSignTransaction (signBtcTransaction or signStxTransaction through the extension, then addTransactionSignatures; toasts "Signature added", or "Your wallet did not add a signature. Make sure the account active in the extension is the one that joined this vault, then try again." when the wallet returned none), useCancelTransaction ("Transaction cancelled") and useBroadcastTransaction ("Broadcasting transaction"); other errors toast through formatTransactionActionError. No spec.',
  },
  {
    id: 'multisig-session',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open any /multisig route: the layout restores expired sessions, redirects to onboarding without one, and swaps the header wallet button for the network switcher and the multisig connect dropdown',
          'Use the dropdown ("Connect wallet" then the "Bitcoin" or "Stacks" item, or the connected menu with "Disconnect Bitcoin"/"Disconnect Stacks", "Sign in to <other chain>" and "Open extension") and the "Change network" switcher (Mainnet / Testnet)',
        ],
      },
    ],
    gate: 'multisigLayout',
    flags: [],
    preconditions: { session: 'mock-installed', mocks: [...seededMockMode] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'Sessions are per AuthNetworkId (stx:mainnet, btc:mainnet, stx:testnet, btc:testnet, btc:regtest) in the jotai sessionsAtom persisted under localStorage leather:multisig:sessions (features/multisig/auth/sessions.atom.ts). MultisigLayout (pages/multisig/multisig.layout.tsx) runs useSessionBootstrap once, refreshing any session whose JWT expired through getSignInService().refreshSession (the mocked POST /v1/auth/refresh re-issues a token) and clearing it on failure; after hydration, when neither the BTC nor the STX session of the active network exists and the path is not /multisig/onboarding, it navigates (replace) to /multisig/onboarding. useMultisigNetworks maps the app network to the mainnet or testnet pair, so the header NetworkModeSwitcher ("Change network", items "Mainnet" and "Testnet" with their stx/btc ids, a green dot while connected, a yellow tone and the NetworkModeGlow on testnet) changes which sessions and vaults the whole area reads; the MultisigConnectDropdown shows InstallLeatherButton without a wallet, a solid "Connect wallet" button with "Choose a chain to connect" / "Multisig uses chain-native signing — connect each chain independently." before any sign-in, and afterwards the chain avatars with the BNS name or truncated address and a menu with each connected chain, "Disconnect Bitcoin"/"Disconnect Stacks" (sign out and return to /multisig), "Sign in to <chain>" for the other chain and "Open extension". Every multisig RPC call goes through multisigLeather, a proxy that reads the extension version and rejects with OutdatedExtensionError below 6.112.0 while the OutdatedExtensionCallout warns "Update your Leather extension". In mock mode entry.client.tsx calls seedMultisigMockSessions before hydration, writing a session that expires a year out for all five networks with the identities in mocks/api/leather.io/multisig.ts (stx:mainnet SP3XKZE3J9YDEEY2KZ925AAJHSY6P0AJBNYTH53Z, btc:mainnet bc1q9z3kfn8gz7jx5sd6f2h0u3sxnmke7vu44lq2x9), and when CLOUDFLARE_ENV is not "production" the layout also mounts the DevToolsPanel ("Open dev tools": "Preview data" Live / Populated / Empty, which toggles mock mode and leather:mock:scenario and reloads, plus Propose / Sign / Broadcast / Cancel transaction tools). No spec.',
  },
] as const satisfies readonly WebFeatureEntry[];
