const shots = import.meta.glob<string>('./shots/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function shotUrl(name: string) {
  return shots[`./shots/${name}`];
}

export type FactValue = 'yes' | 'no' | 'partial' | 'na';

export const criteria = [
  { id: 'domain', label: 'Shows requesting domain', short: 'Requesting domain' },
  { id: 'walletTitle', label: 'Title set by wallet', short: 'Wallet-set title' },
  { id: 'network', label: 'Shows network', short: 'Network' },
  { id: 'fee', label: 'Fee shown is the fee signed', short: 'Fee from the payload' },
  { id: 'exact', label: 'Amounts unrounded', short: 'Unrounded amounts' },
  { id: 'raw', label: 'Raw payload viewable', short: 'Raw payload view' },
] as const;

export type CriterionId = (typeof criteria)[number]['id'];

interface Screen {
  method: string;
  detail: string;
  status: 'live' | 'deprecated';
  shot: string;
  note: string;
  facts: Record<CriterionId, FactValue>;
}

interface ScreenLayout {
  title: string;
  source: string;
  screens: Screen[];
  missing?: { title: string; body: string }[];
}

export const screenLayouts: ScreenLayout[] = [
  {
    title: 'Layout 1 — Approver via the shared request layout',
    source:
      'features/rpc-stacks-transaction-request/rpc-transaction-request.layout.tsx · the "Requested by" line comes from Approver context, so it is identical on every screen here',
    screens: [
      {
        method: 'stx_callContract',
        detail: 'no post conditions · BNS name-transfer',
        status: 'live',
        shot: '01-stx-call-contract.png',
        note: 'Title is set by the wallet ("Sign contract", or "Sign transaction" when the request carries post conditions). The caption shows the hostname only — note it reads localhost rather than localhost:3000, because it comes from new URL().hostname. Contract address, contract name and function name are each shown. Network is not.',
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'yes',
          exact: 'partial',
          raw: 'partial',
        },
      },
      {
        method: 'stx_callContract',
        detail: "postConditionMode: 'allow'",
        status: 'live',
        shot: '02-stx-call-contract-allow-mode.png',
        note: 'In allow mode the warning callout replaces the post-conditions section rather than sitting alongside it. So this screen has a warning and no list, where the previous one has a list and no warning.',
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'yes',
          exact: 'na',
          raw: 'partial',
        },
      },
      {
        method: 'stx_deployContract',
        detail: 'Clarity 3',
        status: 'live',
        shot: '03-stx-deploy-contract.png',
        note: 'The Clarity source is rendered inline and always visible — no tab, no drawer. The only screen in this layout that shows the whole payload it is signing.',
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'yes',
          exact: 'na',
          raw: 'yes',
        },
      },
      {
        method: 'stx_signTransaction',
        detail: 'single sig · 1.5 STX',
        status: 'live',
        shot: '04b-stx-sign-transaction-in-balance.png',
        note: "The request is a serialised transaction that already carries a fee and a nonce. The fee row displays the wallet's own estimate, and that estimate replaces the request's values on approve. The fee and nonce inside the payload aren't shown anywhere, and there's no view of the serialised bytes.",
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'partial',
          exact: 'yes',
          raw: 'no',
        },
      },
      {
        method: 'stx_signTransaction',
        detail: 'single sig · 1,234,999 STX',
        status: 'live',
        shot: '04-stx-sign-transaction.png',
        note: 'Amount formatting: 1,234,999 STX displays as "1.23M STX". Compact notation is the default above 1M in currency-formatter and signing screens don\'t opt out. Also visible: when the balance is insufficient both buttons are removed, so there\'s no Cancel — only closing the window.',
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'partial',
          exact: 'no',
          raw: 'no',
        },
      },
      {
        method: 'stx_signTransaction',
        detail: 'multisig · 2-of-2',
        status: 'live',
        shot: '05-stx-sign-transaction-multisig.png',
        note: "For a multisig transaction the fee row and the nonce row are both omitted, leaving a gap before the footer. Total spend reads $18.00, which is the wallet's fee estimate; the fee carried in this transaction is 100 µSTX. Neither number appears on screen. The amount is also excluded from Total spend, because this screen passes zero as the transaction amount.",
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'no',
          exact: 'no',
          raw: 'no',
        },
      },
      {
        method: 'stx_transferStx',
        detail: '1.5 STX · with memo',
        status: 'live',
        shot: '06b-stx-transfer-stx-in-balance.png',
        note: 'The most complete screen in this layout: account, amount, recipient, memo, fee, nonce, total, two buttons. The wallet builds this transaction itself, so the fee shown is the fee signed.',
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'yes',
          exact: 'yes',
          raw: 'na',
        },
      },
      {
        method: 'stx_transferStx',
        detail: '1,234,999 STX',
        status: 'live',
        shot: '06-stx-transfer-stx.png',
        note: 'Same screen, larger amount: "1.23M STX" and "$55.57B". The fiat column rounds too. The fee row is absent in this state.',
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'yes',
          exact: 'no',
          raw: 'na',
        },
      },
    ],
    missing: [
      {
        title: 'stx_transferSip10Ft and stx_transferSip9Nft — live, not captured here.',
        body: "Both are registered and routed, so a site can reach them today, but neither appears in the wallet's own supportedMethods response and neither has an integration test. Worth adding next.",
      },
    ],
  },
  {
    title: 'Layout 2 — Approver, assembled per page',
    source:
      'the same components as layout 1, but each page composes TransactionWrapper + Approver + TransactionHeader itself instead of using the shared layout',
    screens: [
      {
        method: 'sendTransfer',
        detail: 'bitcoin · testnet4',
        status: 'live',
        shot: '07-send-transfer.png',
        note: "Visually the same as layout 1. The difference sits behind it: this page re-implements the header's click wiring inline and doesn't render the \"Requesting window closed\" warning the shared layout provides. The request specified testnet4; the screen doesn't say so.",
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'yes',
          exact: 'yes',
          raw: 'na',
        },
      },
      {
        method: 'getAddresses',
        detail: 'the connect screen',
        status: 'live',
        shot: '08-get-addresses.png',
        note: "The only screen that describes what the site is being granted, in two fixed lines that don't vary by request: view balances and activity, request approval for transactions. It doesn't name the accounts being shared, the network, or which methods the site may call afterwards. Buttons here are Deny/Confirm; the transaction screens use Cancel/Approve.",
        facts: {
          domain: 'partial',
          walletTitle: 'yes',
          network: 'no',
          fee: 'na',
          exact: 'na',
          raw: 'na',
        },
      },
    ],
    missing: [
      {
        title: 'btc_addAccount and stx_addAccount — gated, not captured.',
        body: "Both sit behind the releaseAddAccount LaunchDarkly flag. With the flag off the popup opens and then rejects the request as unsupported, which is why they're absent here — and why the repo's own rpc-add-account.spec.ts currently fails 4 of 5 on this branch. They're origin-gated too: only POLICY_ALLOWED_ORIGINS can add an account, everyone else gets a read-only verify variant.",
      },
    ],
  },
  {
    title: 'Layout 3 — PopupHeader shell, caption built per page',
    source:
      'PopupHeader + a hand-written "Requested by …" string · two remaining builders, two different sentences — this was the legacy shell, and the legacy screens on it were deleted in #2612',
    screens: [
      {
        method: 'stx_signMessage',
        detail: 'utf8',
        status: 'live',
        shot: '09-stx-sign-message.png',
        note: 'The only screens that state the network — "No fees are incurred / Mainnet". The caption prints the full origin and then the hostname in brackets, so both localhost:3000 and localhost appear. "Show hash" reveals the bytes being signed.',
        facts: {
          domain: 'partial',
          walletTitle: 'partial',
          network: 'yes',
          fee: 'na',
          exact: 'na',
          raw: 'yes',
        },
      },
      {
        method: 'signMessage',
        detail: 'BIP-322',
        status: 'live',
        shot: '10-sign-message-bip322.png',
        note: 'Same header component, different arguments, so the sentence gains a tail: the signing address is appended to the end of the "Requested by" line. No hash drawer here — the message is shown but the bytes aren\'t.',
        facts: {
          domain: 'partial',
          walletTitle: 'partial',
          network: 'yes',
          fee: 'na',
          exact: 'na',
          raw: 'no',
        },
      },
    ],
    missing: [
      {
        title: 'signPsbt — not captured.',
        body: 'Building a PSBT the test wallet owns needs EXTENSION_INTEGRATION_TEST_MNEMONIC in apps/extension/.env. Add it and it captures with no other changes. Worth doing: from the source, signPsbt is the only screen whose fee is read from the payload rather than estimated, the only one with a raw-payload section, and the only one with a written state for "we couldn\'t parse this".',
      },
      {
        title: 'The legacy request screens are gone.',
        body: 'They were here until #2612 deleted them, and they were the worst of the set: the page title came from the request\'s own functionName, so the largest text on screen was chosen by the site; the caption led with the site\'s self-declared name before the domain; and contract arguments rendered as "unknown" whenever the ABI could not be resolved. All three problems were removed by deletion rather than redesign, along with /signature, legacy /psbt and /choose-account.',
      },
    ],
  },
];
