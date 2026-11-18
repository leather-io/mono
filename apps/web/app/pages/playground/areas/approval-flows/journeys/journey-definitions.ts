import type { JourneyDefinition, JourneyStep } from './journey-types';

const appTransactionFee = { amount: '0.003', symbol: 'STX' };
const bitcoinTransactionFee = { amount: '0.000012', symbol: 'BTC' };
const illustrativeContractNote =
  'Illustrative request and contract name. This playground does not connect to the app, sign a payload or submit a transaction.';

const bitcoinMessageSteps: JourneyStep[] = [
  {
    id: 'connect',
    kind: 'connect',
    title: 'Connect your Bitcoin account',
    primaryLabel: 'Connect',
    method: 'getAddresses',
    chain: 'bitcoin',
    movements: [],
    note: 'Share the selected account’s public addresses. Connecting does not sign a message or move funds.',
  },
  {
    id: 'sign-message',
    kind: 'message',
    title: 'Prove you own this Bitcoin address',
    primaryLabel: 'Sign message',
    method: 'signMessage · BIP-322',
    chain: 'bitcoin',
    movements: [],
    message:
      'Sign in to the demo marketplace.\nPurpose: prove control of the connected Bitcoin address.\nNonce: demo-bitcoin-session\nThis example does not authorize a transaction.',
    note: 'A message signature is returned to the app. There is no network fee or broadcast.',
    protection:
      'Read the complete message. A signature can authorize an app action even when no coins move.',
  },
];

const stacksMessageSteps: JourneyStep[] = [
  {
    id: 'connect',
    kind: 'connect',
    title: 'Connect your Stacks account',
    primaryLabel: 'Connect',
    method: 'getAddresses',
    chain: 'stacks',
    movements: [],
    note: 'Share the selected public account. Connecting does not grant permission to spend.',
  },
  {
    id: 'sign-message',
    kind: 'message',
    title: 'Sign in with your Stacks account',
    primaryLabel: 'Sign message',
    method: 'stx_signMessage',
    chain: 'stacks',
    movements: [],
    message:
      'Sign in to the demo marketplace.\nPurpose: prove control of the connected Stacks account.\nNonce: demo-stacks-session\nThis example does not authorize a transaction.',
    note: 'Return a message signature to the app. No transaction is broadcast and no network fee is charged.',
    protection:
      'The connected account signs this message; changing Leather’s active account does not change the requester’s account.',
  },
];

function copyJourneySteps(steps: JourneyStep[]): JourneyStep[] {
  return steps.map(step => ({
    ...step,
    movements: step.movements.map(movement => ({ ...movement })),
    fee: step.fee ? { ...step.fee } : undefined,
  }));
}

const stacksStructuredMessageSteps: JourneyStep[] = [
  {
    id: 'connect',
    kind: 'connect',
    title: 'Connect your Stacks account',
    primaryLabel: 'Connect',
    method: 'getAddresses',
    chain: 'stacks',
    movements: [],
    note: 'Share the selected public account with the demo marketplace. No message is signed at this step.',
  },
  {
    id: 'sign-structured-message',
    kind: 'message',
    title: 'Sign structured Stacks data',
    primaryLabel: 'Sign structured data',
    method: 'stx_signStructuredMessage · SIP-018',
    chain: 'stacks',
    movements: [],
    message:
      'Domain: Demo marketplace\nVersion: 1\nNetwork: Stacks mainnet\nAction: Join the demo community\nAccount: the connected Stacks account\nNonce: demo-structured-session',
    note: 'Readable illustrative typed data, not a serialized signing payload. The app receives a structured-message signature; there is no network fee or transaction broadcast.',
    protection:
      'The domain binds the signature to the named application context. Read the action as well as the domain; structured data can authorize an app action even when no assets move now.',
  },
];

function internalBitcoinSendSteps(): JourneyStep[] {
  return [
    {
      id: 'send',
      kind: 'transaction',
      title: 'Send 0.001 BTC',
      primaryLabel: 'Send',
      method: 'Leather · Bitcoin transfer',
      recipient: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      chain: 'bitcoin',
      movements: [{ symbol: 'BTC', amount: '0.001', direction: 'out', fiat: '$109.78' }],
      fee: { ...bitcoinTransactionFee },
      note: 'Recipient: a demo external Bitcoin address selected in Leather’s send form.',
      protection:
        'The recipient amount and network fee are reviewed before signing. Confirmation makes the send irreversible.',
      waits: 'After submission, the send remains pending until Bitcoin confirms it.',
    },
  ];
}

function internalStacksSendSteps(symbol: 'STX' | 'sBTC'): JourneyStep[] {
  const isStx = symbol === 'STX';
  const amount = isStx ? '25' : '0.001';
  const fiat = isStx ? '$20.31' : '$109.78';
  return [
    {
      id: 'send',
      kind: 'transaction',
      title: `Send ${amount} ${symbol}`,
      primaryLabel: 'Send',
      method: isStx ? 'Leather · STX transfer' : 'Leather · SIP-010 transfer',
      recipient: 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB',
      chain: 'stacks',
      movements: [{ symbol, amount, direction: 'out', fiat }],
      fee: { ...appTransactionFee },
      functionName: isStx ? undefined : 'transfer',
      contractName: isStx ? undefined : 'sbtc-token-demo',
      note: 'The recipient and amount were entered in Leather’s send form. All values are illustrative. The network fee is paid separately in STX.',
      protection:
        'Review the recipient and exact asset amount. Sending sBTC on Stacks does not send native Bitcoin.',
      waits: 'After submission, the send remains pending until Stacks confirms it.',
    },
  ];
}

function psbtSteps(shouldBroadcast: boolean): JourneyStep[] {
  const step: JourneyStep = {
    id: 'sign-psbt',
    kind: shouldBroadcast ? 'transaction' : 'sign',
    title: shouldBroadcast
      ? 'Sign and broadcast the marketplace transaction'
      : 'Sign the marketplace transaction',
    primaryLabel: shouldBroadcast ? 'Sign and broadcast' : 'Sign transaction',
    method: shouldBroadcast ? 'signPsbt · broadcast requested' : 'signPsbt · sign only',
    chain: 'bitcoin',
    movements: [{ symbol: 'BTC', amount: '0.002', direction: 'out', fiat: '$219.56' }],
    fee: { amount: '0.000018', symbol: 'BTC' },
    note: shouldBroadcast
      ? 'The app requests both signing and submission. This illustrative PSBT is complete once your signature is added, so Leather can finalize and broadcast it. A partial PSBT could not be broadcast yet.'
      : 'Amounts describe what the reviewed transaction would do when broadcast. The app receives the signed PSBT; this step does not broadcast it.',
    protection:
      'Review every relevant output and the signature scope. Signing authorizes the exact reviewed transaction, not an editable draft.',
    waits: shouldBroadcast
      ? 'Signing is followed by submission. The transaction remains pending until Bitcoin confirms it.'
      : undefined,
  };
  return [connectStep('bitcoin'), step];
}

function stacksVaultSteps(): JourneyStep[] {
  return [
    {
      id: 'propose',
      kind: 'proposal',
      title: 'Propose a 1,500 STX vault send',
      primaryLabel: 'Propose',
      method: 'Vault · SIP-018 proposal commitment',
      chain: 'stacks',
      movements: [{ symbol: 'STX', amount: '1,500', direction: 'out', fiat: '$1,218.60' }],
      fee: { amount: '0.0042', symbol: 'STX' },
      message:
        'Demo commitment to the proposed vault transaction. The selected member signs the commitment, not an on-chain transfer.',
      note: 'The movement and fee are proposed, not spent. This step submits a proposal and does not count as a transaction signature.',
      protection:
        'The proposal must bind the full transaction reviewed by the member. A bare hash alone cannot explain the proposed spend.',
      waits:
        'Wait for promotion from the queue. The coordinator assigns the Stacks transaction nonce before co-signing.',
    },
    {
      id: 'cosign',
      kind: 'sign',
      title: 'Add your signature to the vault send',
      primaryLabel: 'Add signature',
      method: 'stx_signTransaction · vault co-sign',
      chain: 'stacks',
      movements: [{ symbol: 'STX', amount: '1,500', direction: 'out', fiat: '$1,218.60' }],
      fee: { amount: '0.0042', symbol: 'STX' },
      note: 'Team Treasury owns the funds. Your eligible personal account supplies one transaction signature. Another member’s signature is simulated to reach 2 of 3.',
      protection:
        'Validate the assigned nonce, exact payload and eligible signer again. A changed transaction requires a fresh review.',
      waits:
        'The transaction is ready to broadcast when the required signatures are collected. Reaching the threshold is not confirmation.',
    },
    {
      id: 'broadcast',
      kind: 'broadcast',
      title: 'Broadcast the vault send',
      primaryLabel: 'Broadcast',
      method: 'Vault · submit signed Stacks transaction',
      chain: 'stacks',
      movements: [{ symbol: 'STX', amount: '1,500', direction: 'out', fiat: '$1,218.60' }],
      fee: { amount: '0.0042', symbol: 'STX' },
      note: 'The vault pays the fee. Broadcasting submits the already-signed transaction; it does not add another member signature.',
      protection: 'Check that this is still the exact transaction the members signed.',
      waits: 'The vault send remains pending until Stacks confirms it.',
    },
  ];
}

function bitcoinVaultSteps(): JourneyStep[] {
  return [
    {
      id: 'propose',
      kind: 'proposal',
      title: 'Propose a 0.01 BTC vault send',
      primaryLabel: 'Propose',
      method: 'Vault · BIP-322 proposal commitment',
      chain: 'bitcoin',
      movements: [{ symbol: 'BTC', amount: '0.01', direction: 'out', fiat: '$1,097.78' }],
      fee: { amount: '0.00002', symbol: 'BTC' },
      message:
        'Illustrative BIP-322 commitment to the proposed Bitcoin vault PSBT. The selected parent account signs the proposal commitment, not the vault transaction.',
      note: 'Team Treasury is a demo 2-of-3 Bitcoin vault. This proposes a payment and its fee; it does not spend BTC or add a transaction signature.',
      protection:
        'Bind the commitment to the full reviewed PSBT, recipient, change and fee. Do not approve an unexplained hash.',
      waits:
        'Wait for the coordinator to make the proposal available for co-signing. Bitcoin inputs are checked again before signing; no Stacks transaction nonce is involved.',
    },
    {
      id: 'cosign',
      kind: 'sign',
      title: 'Add your signature to the Bitcoin vault send',
      primaryLabel: 'Add signature',
      method: 'signPsbt · 2-of-3 vault co-sign · sign only',
      chain: 'bitcoin',
      movements: [{ symbol: 'BTC', amount: '0.01', direction: 'out', fiat: '$1,097.78' }],
      fee: { amount: '0.00002', symbol: 'BTC' },
      note: 'Your eligible member account adds partial signatures to the controlled inputs. Other members’ actions are simulated; one more member signature satisfies the 2-of-3 policy. No transaction is broadcast at this step.',
      protection:
        'Verify the exact inputs, outputs, change, fee and vault descriptor. Ledger may first require wallet-policy registration; this is distinct from signing the transaction.',
      waits:
        'Collect the required signatures for each input. The coordinator can finalize only when the vault policy is satisfied.',
    },
    {
      id: 'broadcast',
      kind: 'broadcast',
      title: 'Broadcast the Bitcoin vault send',
      primaryLabel: 'Broadcast',
      method: 'Vault · finalize and submit signed Bitcoin transaction',
      chain: 'bitcoin',
      movements: [{ symbol: 'BTC', amount: '0.01', direction: 'out', fiat: '$1,097.78' }],
      fee: { amount: '0.00002', symbol: 'BTC' },
      note: 'The required member signatures are already collected in this demo. Finalize the PSBT and submit the transaction. The fee comes from the vault’s Bitcoin inputs; this step adds no member signature.',
      protection:
        'Recheck that the reviewed inputs remain unspent and the finalized outputs match what the members signed.',
      waits: 'The vault send remains pending until Bitcoin confirms it.',
    },
  ];
}

function connectStep(chain: JourneyStep['chain'] = 'stacks'): JourneyStep {
  return {
    id: 'connect',
    kind: 'connect',
    title: 'Connect your account',
    primaryLabel: 'Connect',
    method: 'getAddresses',
    chain,
    movements: [],
    note: 'Share public account information with this app. Every later signature requires its own review.',
  };
}

export const journeyDefinitions: JourneyDefinition[] = [
  {
    id: 'connect',
    title: 'Connect to an app',
    category: 'wallet',
    appName: 'Demo app',
    origin: 'https://app.example',
    description: 'One request to share a public account with an illustrative app.',
    goal: 'Understand which app receives which account, without suggesting that connecting moves funds.',
    steps: [connectStep()],
  },
  {
    id: 'message',
    title: 'Sign a message',
    category: 'wallet',
    appName: 'Demo marketplace',
    origin: 'https://market.example',
    description:
      'Connect, then sign a message. Switch between Bitcoin BIP-322, plain Stacks and structured Stacks variants.',
    goal: 'Distinguish a message signature from a transaction and identify the account that signs.',
    steps: copyJourneySteps(bitcoinMessageSteps),
    variants: [
      { id: 'bitcoin', label: 'Bitcoin · BIP-322', steps: copyJourneySteps(bitcoinMessageSteps) },
      { id: 'stacks', label: 'Stacks · message', steps: copyJourneySteps(stacksMessageSteps) },
      {
        id: 'stacks-structured',
        label: 'Stacks · structured data',
        steps: copyJourneySteps(stacksStructuredMessageSteps),
      },
    ],
  },
  {
    id: 'internal-send',
    title: 'Send from Leather',
    category: 'wallet',
    appName: 'Leather',
    origin: 'https://app.leather.io',
    description:
      'An in-wallet send after entering a recipient and amount. Switch between BTC, STX and sBTC; all values are illustrative.',
    goal: 'Review the recipient, amount and fee before Leather signs and submits the send.',
    steps: internalBitcoinSendSteps(),
    variants: [
      { id: 'bitcoin', label: 'Bitcoin', steps: internalBitcoinSendSteps() },
      { id: 'stx', label: 'STX', steps: internalStacksSendSteps('STX') },
      { id: 'sbtc', label: 'sBTC', steps: internalStacksSendSteps('sBTC') },
    ],
  },
  {
    id: 'app-btc-send',
    title: 'Send Bitcoin for an app',
    category: 'apps',
    appName: 'Demo checkout',
    origin: 'https://checkout.example',
    description:
      'Connect a Bitcoin account, then review an app-requested payment. No real checkout is contacted.',
    goal: 'See the app’s requested payment separately from Leather’s fee and selected funding account.',
    steps: [
      connectStep('bitcoin'),
      {
        id: 'pay',
        kind: 'transaction',
        title: 'Pay 0.0005 BTC',
        primaryLabel: 'Send',
        method: 'sendTransfer',
        chain: 'bitcoin',
        movements: [{ symbol: 'BTC', amount: '0.0005', direction: 'out', fiat: '$54.89' }],
        fee: bitcoinTransactionFee,
        note: 'The app supplies the demo payment recipient. Leather selects and signs the funding inputs.',
        protection:
          'Review the payment destination and change. No additional app permission is granted.',
        waits: 'Payment is submitted in this example, then waits for Bitcoin confirmation.',
      },
    ],
  },
  {
    id: 'psbt-sign',
    title: 'Sign an app-built Bitcoin transaction',
    category: 'apps',
    appName: 'Demo marketplace',
    origin: 'https://market.example',
    description:
      'Connect and inspect an illustrative PSBT’s effects. Compare returning a signature with an explicit request to sign and broadcast.',
    goal: 'Recognize that signing a PSBT can authorize a later spend even when Leather does not submit it.',
    steps: psbtSteps(false),
    variants: [
      { id: 'sign-only', label: 'Sign only', steps: psbtSteps(false) },
      { id: 'sign-and-broadcast', label: 'Sign and broadcast', steps: psbtSteps(true) },
    ],
  },
  {
    id: 'app-stacks-tx',
    title: 'Sign an app-built Stacks transaction',
    category: 'apps',
    appName: 'Demo treasury app',
    origin: 'https://treasury.example',
    description:
      'Connect and review a serialized Stacks transaction. The demo returns a signature without broadcasting.',
    goal: 'Separate signing from submission and explain the app-provided transaction fields.',
    steps: [
      connectStep(),
      {
        id: 'sign-stacks',
        kind: 'sign',
        title: 'Sign a 250 STX transfer',
        primaryLabel: 'Sign transaction',
        method: 'stx_signTransaction · sign only',
        chain: 'stacks',
        movements: [{ symbol: 'STX', amount: '250', direction: 'out', fiat: '$203.10' }],
        fee: appTransactionFee,
        note: 'The app provides the transaction, recipient, fee and nonce. The signed transaction is returned to the app, which decides when to submit it.',
        protection:
          'These are transaction effects if it is submitted. A successful signature is not a confirmed transfer.',
      },
    ],
  },
  {
    id: 'internal-swap',
    title: 'Swap inside Leather',
    category: 'wallet',
    appName: 'Leather',
    origin: 'https://app.leather.io',
    description: 'Review an illustrative in-wallet STX-to-sBTC swap after choosing a quote.',
    goal: 'Distinguish the quoted receipt, enforced minimum, network fee and provider.',
    steps: [
      {
        id: 'swap',
        kind: 'transaction',
        title: 'Swap 100 STX for sBTC',
        primaryLabel: 'Swap',
        method: 'Leather · Stacks contract call',
        chain: 'stacks',
        movements: [
          { symbol: 'STX', amount: '100', direction: 'out', fiat: '$81.24' },
          { symbol: 'sBTC', amount: '0.00073', direction: 'in', fiat: '$80.14' },
        ],
        fee: appTransactionFee,
        functionName: 'swap',
        contractName: 'demo-swap-router',
        note: 'The receiving amount is an illustrative quote, not a live price. The minimum received is 0.00072 sBTC.',
        protection:
          'If the minimum cannot be met, the call stops. A confirmed failed call can still charge the network fee.',
        waits: 'The swap waits for Stacks confirmation after submission.',
      },
    ],
  },
  {
    id: 'vault',
    title: 'Propose, co-sign and broadcast a vault spend',
    category: 'vaults',
    appName: 'Leather vault',
    origin: 'https://app.leather.io',
    description:
      'Three distinct decisions for an illustrative 2-of-3 vault. Compare Stacks and Bitcoin; other members’ actions are simulated.',
    goal: 'Tell the proposal commitment, transaction signature and network submission apart.',
    steps: stacksVaultSteps(),
    variants: [
      { id: 'stacks', label: 'Stacks · 2 of 3', steps: stacksVaultSteps() },
      { id: 'bitcoin', label: 'Bitcoin · 2 of 3', steps: bitcoinVaultSteps() },
    ],
  },
  {
    id: 'bitcoin-staking',
    title: 'Lock Bitcoin and register the bond',
    category: 'staking',
    appName: 'Bitcoin staking',
    origin: 'https://staking.stacks.co',
    description:
      'An illustrative two-chain staking sequence: lock BTC, wait, then register the bond on Stacks.',
    goal: 'Recognize two separate approvals, two fees and the lock that remains even if registration fails.',
    steps: [
      connectStep('bitcoin'),
      {
        id: 'lock',
        kind: 'transaction',
        title: 'Lock 0.01 BTC for the bond',
        primaryLabel: 'Lock Bitcoin',
        method: 'signPsbt · staking lock and submit',
        chain: 'bitcoin',
        movements: [{ symbol: 'BTC', amount: '0.01', direction: 'neutral', fiat: '$1,097.78' }],
        fee: { amount: '0.00002', symbol: 'BTC' },
        note: 'The BTC goes into a time-locked output. Bond terms, addresses and amounts are illustrative; no real bond is created.',
        protection:
          'Registering later is a separate transaction. Failure or cancellation of registration does not undo the Bitcoin lock.',
        waits:
          'Wait for the required Bitcoin confirmations before the Stacks registration becomes available.',
      },
      {
        id: 'register',
        kind: 'transaction',
        title: 'Register the bond on Stacks',
        primaryLabel: 'Register bond',
        method: 'stx_callContract · bond registration',
        chain: 'stacks',
        movements: [{ symbol: 'STX', amount: '3,400', direction: 'neutral', fiat: '$2,762.16' }],
        fee: appTransactionFee,
        functionName: 'register-for-bond',
        contractName: 'pox-5-demo',
        note: 'This illustrative registration links the confirmed Bitcoin lock and locks the required STX. The BTC is already locked at this stage.',
        protection:
          'Review the registration deadline and staking lock terms. If registration misses its deadline, BTC remains locked until its unlock condition.',
        waits: 'Wait for Stacks confirmation before treating the bond as registered.',
      },
    ],
  },
  {
    id: 'zest-supply',
    title: 'Supply and withdraw on Zest',
    category: 'apps',
    appName: 'Zest',
    origin: 'https://app.zestprotocol.com',
    description:
      'An illustrative supply followed by a later withdrawal. Contract names and amounts are demo fixtures.',
    goal: 'Understand the supplied asset, position received and the separate decision required to withdraw.',
    steps: [
      connectStep(),
      {
        id: 'supply',
        kind: 'transaction',
        title: 'Supply 0.01 sBTC',
        primaryLabel: 'Supply',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [
          { symbol: 'sBTC', amount: '0.01', direction: 'out', fiat: '$1,097.78' },
          { symbol: 'z-sBTC', amount: '0.01', direction: 'in' },
        ],
        fee: appTransactionFee,
        functionName: 'supply',
        contractName: 'zest-pool-demo',
        note: illustrativeContractNote,
        protection:
          'A supply position is a protocol claim, not sBTC still held in this wallet. No yield rate is promised by this demo.',
        waits: 'Confirm the supply before continuing to the illustrative later withdrawal.',
      },
      {
        id: 'withdraw',
        kind: 'transaction',
        title: 'Withdraw 0.004 sBTC',
        primaryLabel: 'Withdraw',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [
          { symbol: 'z-sBTC', amount: '0.004', direction: 'out' },
          { symbol: 'sBTC', amount: '0.004', direction: 'in', fiat: '$439.11' },
        ],
        fee: appTransactionFee,
        functionName: 'withdraw',
        contractName: 'zest-pool-demo',
        note: 'A separate, later request. The example assumes sufficient position balance and protocol liquidity. z-sBTC is an illustrative position marker, not a live token identifier.',
        protection:
          'The actual withdrawable amount depends on the live position, liquidity and any collateral constraints.',
        waits: 'The withdrawal is complete only after confirmation.',
      },
    ],
  },
  {
    id: 'zest-borrow',
    title: 'Borrow and repay on Zest',
    category: 'apps',
    appName: 'Zest',
    origin: 'https://app.zestprotocol.com',
    description:
      'An illustrative collateralized borrow followed by full repayment. Existing collateral is a demo precondition.',
    goal: 'See the debt created by borrowing and the separate asset payment that repays it.',
    steps: [
      connectStep(),
      {
        id: 'borrow',
        kind: 'transaction',
        title: 'Borrow 100 USDCx',
        primaryLabel: 'Borrow',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [
          { symbol: 'USDCx', amount: '100', direction: 'in', fiat: '$100.00' },
          { symbol: 'USDCx debt', amount: '100', direction: 'neutral' },
        ],
        fee: appTransactionFee,
        functionName: 'borrow',
        contractName: 'zest-borrow-demo',
        note: 'Illustrative asset and pool support. This example starts with an existing eligible collateral position; it does not silently add collateral.',
        protection:
          'Borrowing creates debt and liquidation exposure. A supplied position may remain constrained until debt is repaid.',
        waits:
          'Wait for the borrow to confirm. Time and interest are simulated before the repayment step.',
      },
      {
        id: 'repay',
        kind: 'transaction',
        title: 'Repay 100.10 USDCx',
        primaryLabel: 'Repay',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [
          { symbol: 'USDCx', amount: '100.10', direction: 'out', fiat: '$100.10' },
          { symbol: 'USDCx debt', amount: '100.10', direction: 'neutral' },
        ],
        fee: appTransactionFee,
        functionName: 'repay',
        contractName: 'zest-borrow-demo',
        note: 'The 0.10 USDCx interest is an illustrative scenario value, not a live debt quote. This step assumes the wallet can pay the full debt.',
        protection:
          'Review the current debt and repayment amount. A partial repayment does not necessarily release all collateral.',
        waits:
          'The debt is repaid when the repayment confirms; collateral withdrawal would be a separate request.',
      },
    ],
  },
  {
    id: 'bns-register',
    title: 'Register a BNS name',
    category: 'apps',
    appName: 'BNS One',
    origin: 'https://bns.one',
    description:
      'An illustrative preorder and registration sequence for fab-demo.btc. The origin and contracts are demo fixtures.',
    goal: 'Understand that the commitment and name registration are separate paid transactions.',
    steps: [
      connectStep(),
      {
        id: 'preorder',
        kind: 'transaction',
        title: 'Preorder fab-demo.btc',
        name: 'fab-demo.btc',
        primaryLabel: 'Preorder',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [{ symbol: 'STX', amount: '2', direction: 'out', fiat: '$1.62' }],
        fee: appTransactionFee,
        functionName: 'name-preorder',
        contractName: 'bns-demo',
        note: 'Illustrative commitment-based name registration. No real name availability, contract version or registration price is claimed.',
        protection:
          'The preorder commits to a name; it does not yet make this account its registered owner.',
        waits: 'Wait for the preorder and the protocol’s reveal conditions before registering.',
      },
      {
        id: 'register',
        kind: 'transaction',
        title: 'Register fab-demo.btc',
        name: 'fab-demo.btc',
        primaryLabel: 'Register name',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [],
        fee: appTransactionFee,
        functionName: 'name-register',
        contractName: 'bns-demo',
        note: 'Reveal the illustrative preorder and register the name to the connected account. Only the network fee is paid in this example step.',
        protection:
          'Verify the exact name and owning account. A successful name registration does not verify a person’s identity.',
        waits: 'Wait for confirmation before showing the name as owned.',
      },
    ],
  },
  {
    id: 'bitflow-swap',
    title: 'Swap through Bitflow',
    category: 'apps',
    appName: 'Bitflow',
    origin: 'https://app.bitflow.finance',
    description: 'Connect to Bitflow, then review an illustrative STX-to-sBTC contract call.',
    goal: 'Distinguish an app estimate from the minimum enforced by the transaction.',
    steps: [
      connectStep(),
      {
        id: 'swap',
        kind: 'transaction',
        title: 'Swap 1,000 STX for sBTC',
        primaryLabel: 'Approve swap',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [
          { symbol: 'STX', amount: '1,000', direction: 'out', fiat: '$812.40' },
          { symbol: 'sBTC', amount: '0.00741', direction: 'in', fiat: '$813.44' },
        ],
        fee: appTransactionFee,
        functionName: 'swap-helper-a',
        contractName: 'xyk-swap-helper-demo',
        note: 'Illustrative quote: 0.00741 sBTC. Minimum received: 0.00735 sBTC. Neither value is a live market quote.',
        protection:
          'The transaction stops if the enforced minimum is not met. A confirmed failed call can still spend its network fee.',
        waits: 'Wait for Stacks confirmation to learn the actual sBTC received.',
      },
    ],
  },
  {
    id: 'stack',
    title: 'Stack STX with a pool',
    category: 'staking',
    appName: 'Demo stacking pool',
    origin: 'https://pool.example',
    description: 'Connect, then approve an illustrative STX staking lock with explicit terms.',
    goal: 'Distinguish locked funds from an outgoing transfer and understand the lock duration.',
    steps: [
      connectStep(),
      {
        id: 'stack',
        kind: 'transaction',
        title: 'Lock 5,000 STX with the pool',
        primaryLabel: 'Stack',
        method: 'stx_callContract · staking',
        chain: 'stacks',
        movements: [{ symbol: 'STX', amount: '5,000', direction: 'neutral', fiat: '$4,062.00' }],
        fee: appTransactionFee,
        functionName: 'stake',
        contractName: 'pox-5-demo',
        note: 'Illustrative terms: up to 12 cycles, starting at cycle 146. The STX stays owned by this account but becomes unavailable while locked.',
        protection:
          'Review the exact pool, staking amount and cycle limits. This example does not approve an unlimited recurring permission.',
        waits:
          'The staking change becomes effective according to the confirmed transaction and cycle rules.',
      },
    ],
  },
  {
    id: 'unstack',
    title: 'End a stacking arrangement',
    category: 'staking',
    appName: 'Leather',
    origin: 'https://app.leather.io',
    description: 'Review an illustrative request to stop renewing an existing STX staking lock.',
    goal: 'Understand when the STX becomes available and avoid implying an instant unlock.',
    steps: [
      {
        id: 'unstack',
        kind: 'transaction',
        title: 'Stop stacking 5,000 STX',
        primaryLabel: 'Unstack',
        method: 'stx_callContract · staking change',
        chain: 'stacks',
        movements: [{ symbol: 'STX', amount: '5,000', direction: 'neutral', fiat: '$4,062.00' }],
        fee: appTransactionFee,
        functionName: 'unstake',
        contractName: 'pox-5-demo',
        note: 'An existing stacking position is assumed. This illustrative action ends future stacking; the current lock does not disappear when the button is pressed.',
        protection:
          'STX is available only after the applicable unlock condition or cycle boundary. No reward amount is promised.',
        waits: 'Wait for the request to confirm, then for the position’s unlock boundary.',
      },
    ],
  },
  {
    id: 'claim',
    title: 'Claim staking rewards',
    category: 'staking',
    appName: 'Demo stacking pool',
    origin: 'https://pool.example',
    description: 'Connect and claim an illustrative sBTC reward through the pool’s signer manager.',
    goal: 'See the reward received and STX fee paid without implying that claiming unlocks the stake.',
    sourceUrl: 'https://github.com/leather-io/mono/issues/2692#issuecomment-5625304304',
    steps: [
      connectStep(),
      {
        id: 'claim',
        kind: 'transaction',
        title: 'Claim 0.00025 sBTC',
        primaryLabel: 'Claim rewards',
        method: 'stx_callContract',
        chain: 'stacks',
        movements: [{ symbol: 'sBTC', amount: '0.00025', direction: 'in', fiat: '$27.44' }],
        fee: appTransactionFee,
        functionName: 'claim-rewards',
        contractName: 'signer-manager-demo',
        note: 'The reward and claimable balance are illustrative. The selected account pays the STX network fee; the underlying stake is unchanged.',
        protection:
          'Receive the claimed reward without granting the pool permission to spend other assets.',
        waits:
          'After confirmation, activity shows the sBTC received and the STX fee actually paid.',
      },
    ],
  },
  {
    id: 'generic-limits',
    title: 'Unmapped call with spending limits',
    category: 'generic',
    appName: 'Unmapped demo app',
    origin: 'https://contracts.example',
    description:
      'Review a contract Leather has no dedicated action mapping for, with explicit enforced limits.',
    goal: 'Understand the spend without needing to recognize a raw function name.',
    sourceUrl: 'https://github.com/leather-io/mono/issues/2692#issuecomment-5625304304',
    steps: [
      connectStep(),
      {
        id: 'call',
        kind: 'transaction',
        title: 'Call mint on city-coins-nft-demo',
        primaryLabel: 'Approve',
        method: 'stx_callContract · deny mode',
        chain: 'stacks',
        movements: [{ symbol: 'STX', amount: '50', direction: 'out', fiat: '$40.62' }],
        fee: appTransactionFee,
        functionName: 'mint',
        contractName: 'city-coins-nft-demo',
        note: 'A demo NFT mint with a 50 STX spend limit. No NFT outcome is guaranteed by the displayed fungible-token limit.',
        protection:
          'Post conditions constrain asset movements on chain. The network fee is separate and may be charged even if a confirmed call fails.',
        waits:
          'Wait for confirmation before showing actual amounts and any minted NFT in activity details.',
      },
    ],
  },
  {
    id: 'generic-multiasset',
    title: 'Unmapped call affecting several assets',
    category: 'generic',
    appName: 'Unmapped demo app',
    origin: 'https://contracts.example',
    description:
      'An illustrative payout involving three fungible assets, without a protocol-specific mapping.',
    goal: 'Review every asset while keeping the later activity-row summary compact and deterministic.',
    sourceUrl: 'https://github.com/leather-io/mono/issues/2692#issuecomment-5625304304',
    steps: [
      connectStep(),
      {
        id: 'call',
        kind: 'transaction',
        title: 'Claim a three-asset payout',
        primaryLabel: 'Approve',
        method: 'stx_callContract · deny mode',
        chain: 'stacks',
        movements: [
          { symbol: 'STX', amount: '125', direction: 'in', fiat: '$101.55' },
          { symbol: 'sBTC', amount: '0.00025', direction: 'in', fiat: '$27.44' },
          { symbol: 'USDCx', amount: '20', direction: 'in', fiat: '$20.00' },
        ],
        fee: appTransactionFee,
        functionName: 'distribute',
        contractName: 'rewards-distributor-demo',
        note: 'These are illustrative expected receipts, not confirmed balances. This account pays 0.003 STX separately, so its confirmed net STX change would be 124.997 STX if these receipts execute.',
        protection:
          'Review the transaction’s enforced limits separately from expected receipts. A displayed expected receipt is not itself an on-chain guarantee.',
        waits:
          'After confirmation, summarize the account’s net changes using BTC, STX, sBTC, USDCx, then other assets as priority.',
      },
    ],
  },
  {
    id: 'generic-unrestricted',
    title: 'Unmapped call without spending limits',
    category: 'generic',
    appName: 'Unmapped demo app',
    origin: 'https://contracts.example',
    description:
      'An illustrative unrestricted contract call with no reliable asset-movement estimate.',
    goal: 'Understand that the shown network fee does not cap what the contract can move.',
    steps: [
      connectStep(),
      {
        id: 'call',
        kind: 'transaction',
        title: 'Call execute without spending limits',
        primaryLabel: 'Approve without limits',
        method: 'stx_callContract · allow mode',
        chain: 'stacks',
        movements: [],
        outcomeMovements: [{ symbol: 'STX', amount: '25', direction: 'out' }],
        fee: appTransactionFee,
        functionName: 'execute',
        contractName: 'unmapped-contract-demo',
        note: 'No reliable effect estimate is available in this demo. An empty movement list means unknown, not zero. The fee is the only known cost shown.',
        protection:
          'No post-condition spending limits protect this call. It may move assets beyond the fee; approve only if you understand and accept the contract’s authority.',
        waits:
          'Actual balance changes are available only after confirmation. Rejecting before signing avoids this request.',
      },
    ],
  },
];

export function findJourneyDefinition(id: string) {
  return journeyDefinitions.find(journey => journey.id === id);
}
