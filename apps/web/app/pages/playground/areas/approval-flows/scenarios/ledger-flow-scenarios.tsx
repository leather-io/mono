import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer } from '@leather.io/ui';

import { useCanvasSettings } from '../canvas/canvas-settings';
import { ApprovalFooter } from '../pattern/approval-footer';
import { displayOrigin } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import {
  ApprovalLedgerDevice,
  type LedgerFlowStage,
  useLedgerFlowStage,
} from '../pattern/approval-ledger-device';
import { ApprovalLedgerSheet } from '../pattern/approval-ledger-sheet';
import { ApprovalCaution, ApprovalNote } from '../pattern/approval-notices';
import { useApprovalOptions } from '../pattern/approval-options';
import { ApprovalContractRow, ApprovalIdentifier, ApprovalRow } from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import type { ApprovalAccount, ApprovalRequester } from '../pattern/approval-types';
import {
  bitflow,
  btcAccount1,
  btcVault,
  contracts,
  gamma,
  leatherApp,
  ledgerAccount,
  mainnet,
  stxRecipient,
  vaultAccount,
} from './fixtures';
import { LedgerTransferHistory, LedgerVaultSignatureHistory } from './ledger-activity-histories';
import type { Scenario } from './scenario';

interface LedgerReviewRow {
  label: string;
  value: string;
  caption?: string;
  kind?: 'address' | 'contract' | 'identifier';
}

interface LedgerFlowRecipe {
  id: string;
  label: string;
  method: string;
  title: string;
  kind: string;
  app: 'Bitcoin' | 'Stacks';
  account: ApprovalAccount;
  requester: ApprovalRequester;
  rows: LedgerReviewRow[];
  deviceNote: string;
  outcomeTitle: string;
  outcome: string;
  message?: string;
  payload?: string;
  policy?: string;
  source?: string;
  total?: string;
  needsPolicy?: boolean;
  canBroadcast?: boolean;
  history?(): ReactNode;
}

const ledgerBitcoinAccount: ApprovalAccount = {
  ...ledgerAccount,
  address: btcAccount1.nativeSegwit,
  balance: { amount: '0.08421530', symbol: 'BTC', fiat: '$9,244.99' },
};

const ledgerTaprootAccount: ApprovalAccount = {
  ...ledgerBitcoinAccount,
  address: btcAccount1.taproot,
};

const ledgerVaultAccount: ApprovalAccount = {
  ...ledgerAccount,
  balance: vaultAccount.balance,
  vault: vaultAccount.vault,
};

const ledgerBitcoinVault: ApprovalAccount = {
  ...ledgerBitcoinAccount,
  balance: btcVault.balance,
  vault: btcVault.vault,
};

const walletRequester: ApprovalRequester = {
  source: 'internal',
  origin: 'https://app.leather.io',
  connection: 'connected',
  context: {
    status: 'neutral',
    label: 'Started in Leather',
    description: 'This is a send you started in Leather, rather than a request from another site.',
  },
};

const loginMessage =
  'Sign in to Leather\n\nDomain: https://app.leather.io\nApplication: multisig\nNetwork: mainnet\nIssued: 1791377895';
const proposalHash = '9c41e7b2d05af36e8b17c4290df5a6e3417bc82e5d9f0a6c3b84e1d27f56a09c';
const structuredMessageHash = '1f6ffe53a54150db6917c78569a7eafb97c02b2184aeafdbed8af1fad1124a06';
const ledgerHashPageLength = 34;
const structuredPayload = JSON.stringify(
  {
    domain: {
      name: 'leather-multisig-proposal-v1',
      version: '1',
      'chain-id': 1,
    },
    message: { type: 'string-ascii', value: proposalHash },
    domainHex:
      '0c0000000308636861696e2d69640100000000000000000000000000000001046e616d650d0000001c6c6561746865722d6d756c74697369672d70726f706f73616c2d76310776657273696f6e0d0000000131',
    messageHex:
      '0d0000004039633431653762326430356166333665386231376334323930646635613665333431376263383265356439663061366333623834653164323766353661303963',
  },
  null,
  2
);
const exampleWalletPolicy = JSON.stringify(
  {
    name: 'Leather',
    descriptorTemplate: 'wsh(multi(2,@0/**,@1/**,@2/**))',
    keys: [
      "[deadbeef/84'/0'/0']xpub6DFfyxrMEUfR9Fyczq5xK1m8C3zKfi97mZDt3u4UnjjaWPW8q1PY4UogPFbdp4ibSDnmaHZrNCUYwmzj2GjBYVcaJMvniK2chBMqdbebH5f",
      'xpub6DFfyxrMEUfRVkk7Mn3yBkgdvEUMKgcd84ejLXXjaBNANrzdTGDZTNrMV4DGEJJcVwQsirvmuqJTbESpZGtcmMr1p2kTDELcmZNf3zqdaVo',
      'xpub6DFfyxrMEUfRGTzteDuwAgnWJNMyk5oFnFpHzJ3FZVdhNbUUjQrum1yzZ8pRkSNnYik9f7nZQHVbX2QmVxjQg9QdwhwJBJ5BVU1eNiJn9nx',
    ],
  },
  null,
  2
);
const exampleContractSource =
  '(define-data-var owner principal tx-sender)\n\n(define-read-only (get-owner)\n  (ok (var-get owner)))';
const stxDeviceNote =
  'Compare the recipient, amount, fee and any other details your Stacks app displays. Reject on the device if they differ. The wallet’s decoded review stays available below.';
const bitcoinMessageNote =
  'Bitcoin messages use BIP-322. Your device may show transaction-style details or an unverified-input warning because the proof uses a synthetic transaction. It does not spend funds or get broadcast.';

const ledgerRecipes: LedgerFlowRecipe[] = [
  {
    id: 'ledger-flow-message',
    label: 'Ledger · Bitcoin message, start to finish',
    method: 'signMessage · BIP-322 · Native SegWit',
    title: 'Sign in to Leather',
    kind: 'Bitcoin message · proof that you control this address',
    app: 'Bitcoin',
    account: ledgerBitcoinAccount,
    requester: leatherApp,
    message: loginMessage,
    rows: [{ label: 'Network fee', value: 'None' }],
    deviceNote: bitcoinMessageNote,
    outcomeTitle: 'Message signed',
    outcome:
      'The signature is returned to app.leather.io. No funds moved and no transaction was broadcast.',
  },
  {
    id: 'ledger-flow-message-taproot',
    label: 'Ledger · Bitcoin message with Taproot',
    method: 'signMessage · BIP-322 · Taproot',
    title: 'Sign in to Leather',
    kind: 'Bitcoin message · Taproot signing address',
    app: 'Bitcoin',
    account: ledgerTaprootAccount,
    requester: leatherApp,
    message: loginMessage,
    rows: [{ label: 'Network fee', value: 'None' }],
    deviceNote: bitcoinMessageNote,
    outcomeTitle: 'Message signed',
    outcome:
      'The Taproot proof is returned to app.leather.io. No funds moved and no transaction was broadcast.',
  },
  {
    id: 'ledger-flow-stx-message',
    label: 'Ledger · Stacks text message',
    method: 'stx_signMessage · UTF-8 message',
    title: 'Sign in to Leather',
    kind: 'Stacks message · proof that you control this address',
    app: 'Stacks',
    account: ledgerAccount,
    requester: leatherApp,
    message: loginMessage,
    rows: [{ label: 'Network fee', value: 'None' }],
    deviceNote:
      'Review the message on your Ledger. Sign only if it matches the message shown here.',
    outcomeTitle: 'Message signed',
    outcome:
      'The signature is returned to app.leather.io. This is a message signature, not a transfer.',
  },
  {
    id: 'ledger-flow-structured-message',
    label: 'Ledger · Stacks structured message',
    method: 'stx_signStructuredMessage · SIP-018',
    title: 'Sign a structured message',
    kind: 'Stacks message · example proposal commitment',
    app: 'Stacks',
    account: ledgerAccount,
    requester: leatherApp,
    message: proposalHash,
    payload: structuredPayload,
    rows: [
      { label: 'Domain name', value: 'leather-multisig-proposal-v1' },
      { label: 'Version', value: '1' },
      { label: 'Chain ID', value: '1 · Mainnet' },
      {
        label: 'Message hash [1/2]',
        value: structuredMessageHash.slice(0, ledgerHashPageLength),
        kind: 'identifier',
      },
      {
        label: 'Message hash [2/2]',
        value: structuredMessageHash.slice(ledgerHashPageLength),
        kind: 'identifier',
      },
    ],
    deviceNote:
      'Compare the domain, version, chain ID and both halves of the message hash. A matching hash links the device signature to the message; it does not explain what the message means.',
    outcomeTitle: 'Structured message signed',
    outcome:
      'The signature is returned to the requesting app. No transaction was signed or broadcast.',
  },
  {
    id: 'ledger-flow-transfer',
    history: LedgerTransferHistory,
    label: 'Ledger · send from inside Leather',
    method: 'Internal send · STX transfer',
    title: 'Send 500 STX',
    kind: 'Started in Leather · review, sign, then submit',
    app: 'Stacks',
    account: ledgerAccount,
    requester: walletRequester,
    rows: [
      { label: 'Recipient', value: stxRecipient, kind: 'address' },
      { label: 'Amount', value: '500 STX' },
      { label: 'Fee', value: '0.0021 STX', caption: '2,100 µSTX' },
      { label: 'Nonce', value: '8' },
    ],
    deviceNote: stxDeviceNote,
    outcomeTitle: 'Transaction signed',
    outcome:
      'Your Ledger signed this transfer. Submit it to the network to send; nothing has been broadcast yet.',
    canBroadcast: true,
    total: '500.0021 STX',
  },
  {
    id: 'ledger-flow-btc-send',
    label: 'Ledger · Bitcoin send from inside Leather',
    method: 'Internal send · Bitcoin transaction',
    title: 'Send 0.01 BTC',
    kind: 'Started in Leather · review, sign, then submit',
    app: 'Bitcoin',
    account: ledgerBitcoinAccount,
    requester: walletRequester,
    rows: [
      { label: 'Recipient', value: btcAccount1.taproot, kind: 'address' },
      { label: 'Amount', value: '0.01000000 BTC' },
      { label: 'Network fee', value: '0.00010000 BTC' },
      { label: 'Total leaving account', value: '0.01010000 BTC' },
    ],
    deviceNote:
      'Compare each recipient and amount on the Bitcoin app, then the network fee. Change may be handled by the device without a separate recipient screen.',
    outcomeTitle: 'Transaction signed',
    outcome:
      'Your Ledger signed this Bitcoin transaction. Submit it to the network to send; nothing has been broadcast yet.',
    canBroadcast: true,
    total: '0.01010000 BTC',
  },
  {
    id: 'ledger-flow-contract',
    label: 'Ledger · external contract call',
    method: 'stx_callContract · external request',
    title: 'Swap 1,000 STX for sBTC',
    kind: 'Contract call · requested by Bitflow',
    app: 'Stacks',
    account: ledgerAccount,
    requester: bitflow,
    total: '1,000.003 STX',
    rows: [
      { label: 'You send exactly', value: '1,000 STX' },
      { label: 'You receive at least', value: '0.00735000 sBTC' },
      { label: 'Fee', value: '0.003 STX', caption: '3,000 µSTX' },
      { label: 'Contract', value: contracts.bitflowSwap, kind: 'contract' },
      { label: 'Function', value: 'swap-helper-a', kind: 'identifier' },
      { label: 'Nonce', value: '8' },
    ],
    deviceNote:
      'Compare the contract and function your Ledger displays. Some arguments may not be readable on the device; review them in Leather before approving. Device warnings vary by app version and payload.',
    outcomeTitle: 'Swap signed',
    outcome:
      'Your Ledger signed the contract call. Signing is complete; network submission and confirmation are separate steps.',
    canBroadcast: true,
  },
  {
    id: 'ledger-flow-deploy',
    label: 'Ledger · deploy a contract',
    method: 'stx_deployContract · Ledger account',
    title: 'Deploy treasury-v2',
    kind: 'Stacks contract deployment · permanent once confirmed',
    app: 'Stacks',
    account: ledgerAccount,
    requester: leatherApp,
    source: exampleContractSource,
    total: '0.03 STX fee',
    rows: [
      { label: 'Contract name', value: 'treasury-v2', kind: 'identifier' },
      { label: 'Language', value: 'Clarity' },
      { label: 'Fee', value: '0.03 STX', caption: '30,000 µSTX' },
      { label: 'Nonce', value: '8' },
    ],
    deviceNote:
      'Review the full contract source below before signing. The device cannot explain the behavior of deployed code. Compare the deployment details it shows.',
    outcomeTitle: 'Deployment signed',
    outcome:
      'Your Ledger signed the deployment. The contract is not deployed until the transaction is submitted and confirmed.',
    canBroadcast: true,
  },
  {
    id: 'ledger-flow-psbt',
    label: 'Ledger · external Bitcoin PSBT',
    method: 'signPsbt · external request · no broadcast',
    title: 'Sign a spend of 0.0211 BTC',
    kind: 'Bitcoin PSBT · you sign 4 of 5 inputs',
    app: 'Bitcoin',
    account: ledgerBitcoinAccount,
    requester: gamma,
    total: '0.02110000 BTC',
    rows: [
      { label: 'Your spend', value: '0.02110000 BTC' },
      { label: 'Network fee', value: '0.00010000 BTC' },
      { label: 'Inputs you sign', value: '4 of 5', caption: 'The seller owns the remaining input' },
      { label: 'Signature scope', value: 'SIGHASH_ALL', caption: 'All inputs and outputs' },
    ],
    deviceNote:
      'Review all device outputs and the fee. The Bitcoin app may warn about the seller’s external input. Reject any unexpected recipient, amount or signing mode.',
    outcomeTitle: 'Your inputs signed',
    outcome:
      'The signed PSBT is returned to gamma.io. Leather has not broadcast it; the requesting app may complete and submit it.',
  },
  {
    id: 'ledger-flow-vault',
    history: LedgerVaultSignatureHistory,
    label: 'Ledger · co-sign a Stacks vault transaction',
    method: 'stx_signTransaction · multisig · nonce assigned',
    title: 'Sign a transfer of 1,500 STX',
    kind: 'Team Treasury · add your transaction signature',
    app: 'Stacks',
    account: ledgerVaultAccount,
    requester: leatherApp,
    total: '1,500.0042 STX',
    rows: [
      { label: 'Leaves the vault', value: '1,500 STX' },
      { label: 'Recipient', value: stxRecipient, kind: 'address' },
      { label: 'Vault fee', value: '0.0042 STX', caption: '4,200 µSTX · fixed for all signers' },
      { label: 'Nonce', value: '7', caption: 'Assigned before transaction signing' },
      { label: 'Signatures before you', value: '0 of 2 required' },
    ],
    deviceNote:
      'Compare the vault transaction on your Ledger. You sign as Account 2; funds belong to Team Treasury. Fee and nonce must match the transaction other members sign.',
    outcomeTitle: 'Your vault signature added',
    outcome:
      '1 of 2 required signatures is present. Another member must sign before this transaction can be broadcast. Nothing was sent.',
  },
  {
    id: 'ledger-flow-btc-vault',
    label: 'Ledger · Bitcoin vault policy and co-sign',
    method: 'signPsbt · WSH wallet policy · partial signature',
    title: 'Co-sign a spend of 0.1 BTC',
    kind: 'Team Treasury · Bitcoin vault · 2 of 3',
    app: 'Bitcoin',
    account: ledgerBitcoinVault,
    requester: leatherApp,
    total: '0.10010000 BTC',
    policy: exampleWalletPolicy,
    rows: [
      { label: 'Vault address', value: btcVault.vault?.address ?? '', kind: 'address' },
      { label: 'Recipient', value: btcAccount1.taproot, kind: 'address' },
      { label: 'Amount', value: '0.10000000 BTC' },
      { label: 'Network fee', value: '0.00010000 BTC' },
      {
        label: 'Wallet policy',
        value: '2 of 3 · WSH',
        caption: 'Review the actual policy and participant keys on your device',
      },
    ],
    deviceNote:
      'After accepting the wallet policy, separately review the transaction outputs and fee. Registering a policy is not a transaction signature.',
    outcomeTitle: 'Your partial signature added',
    outcome:
      'Your Ledger added one signature to the vault PSBT. Another signer is still required. Nothing was broadcast.',
    needsPolicy: true,
  },
  {
    id: 'ledger-flow-proposal',
    label: 'Ledger · create a Stacks vault proposal',
    method: 'SIP-018 · proposal commitment · no transaction signature',
    title: 'Propose a transfer of 1,500 STX',
    kind: 'Team Treasury · sign a proposal commitment',
    app: 'Stacks',
    account: ledgerVaultAccount,
    requester: leatherApp,
    message: proposalHash,
    payload: structuredPayload,
    rows: [
      { label: 'Proposed amount', value: '1,500 STX' },
      { label: 'Recipient', value: stxRecipient, kind: 'address' },
      { label: 'Domain name', value: 'leather-multisig-proposal-v1' },
      { label: 'Version', value: '1' },
      { label: 'Chain ID', value: '1 · Mainnet' },
      {
        label: 'Message hash [1/2]',
        value: structuredMessageHash.slice(0, ledgerHashPageLength),
        kind: 'identifier',
      },
      {
        label: 'Message hash [2/2]',
        value: structuredMessageHash.slice(ledgerHashPageLength),
        kind: 'identifier',
      },
    ],
    deviceNote:
      'This signs a structured proposal commitment. Compare the domain, chain ID and message hash on your Ledger. Transaction signatures and a nonce come later.',
    outcomeTitle: 'Proposal commitment signed',
    outcome:
      'The commitment is returned to Leather’s vault app so it can create the proposal. It does not count as a transaction signature. Nothing moved.',
  },
  {
    id: 'ledger-flow-btc-proposal',
    label: 'Ledger · create a Bitcoin vault proposal',
    method: 'BIP-322 · Bitcoin proposal commitment',
    title: 'Propose a spend of 0.1 BTC',
    kind: 'Team Treasury · message proof for a proposal',
    app: 'Bitcoin',
    account: ledgerBitcoinVault,
    requester: leatherApp,
    message: proposalHash,
    rows: [
      { label: 'Proposed amount', value: '0.10000000 BTC' },
      { label: 'Recipient', value: btcAccount1.taproot, kind: 'address' },
      { label: 'Network fee for this message', value: 'None' },
    ],
    deviceNote: bitcoinMessageNote,
    outcomeTitle: 'Proposal commitment signed',
    outcome:
      'The BIP-322 proof is returned to the vault app to create the proposal. It does not sign the vault spend. Transaction signatures are collected separately.',
  },
];

const recoveryCopy: Partial<Record<LedgerFlowStage, { title: string; description: string }>> = {
  locked: {
    title: 'Unlock your Ledger',
    description:
      'Unlock it on the device, then open the required app. Keep this request open; Leather will check the account when the device is ready.',
  },
  'opening-app': {
    title: 'Open the app on your Ledger',
    description:
      'Approve opening the required app on your Ledger. This prepares the device; it does not sign the request.',
  },
  busy: {
    title: 'Your Ledger is busy',
    description:
      'Finish or close any other request on your Ledger. Close other apps using the device, then reconnect to continue this request.',
  },
  'outdated-app': {
    title: 'Update the app on your Ledger',
    description:
      'The device app cannot complete this request with its current version. Update it in Ledger Wallet, reopen the required app, then reconnect.',
  },
  'invalid-payload': {
    title: 'Your Ledger could not sign this data',
    description:
      'The device refused the payload. Nothing was signed. Review the request and app compatibility before trying again; reconnecting alone may not resolve this.',
  },
  rejected: {
    title: 'Signing declined on your Ledger',
    description: 'Nothing was signed. Review the request again or reconnect when you are ready.',
  },
  disconnected: {
    title: 'Your Ledger disconnected',
    description:
      'Signing did not finish. Reconnect and unlock the same Ledger to retry this request.',
  },
  'wrong-device': {
    title: 'This Ledger does not match your account',
    description:
      'Signing is blocked. Connect the Ledger for the selected account; Leather will check it again before signing.',
  },
  'wrong-app': {
    title: 'Open the correct app on your Ledger',
    description:
      'The selected Ledger app does not match this request. Close it and open the app named below, then reconnect.',
  },
  'chooser-canceled': {
    title: 'No Ledger selected',
    description:
      'The browser device chooser was closed. Your request is still here and nothing was signed.',
  },
};

interface LedgerReviewRowsProps {
  recipe: LedgerFlowRecipe;
}

function ledgerRowValue(row: LedgerReviewRow) {
  if (row.kind === 'address') return <AddressDisplayer address={row.value} />;
  if (row.kind === 'identifier') return <ApprovalIdentifier>{row.value}</ApprovalIdentifier>;
  return row.value;
}

interface LedgerPayloadDisclosureProps {
  label: string;
  payload: string;
}

function LedgerPayloadDisclosure({ label, payload }: LedgerPayloadDisclosureProps) {
  return (
    <styled.details py="space.02">
      <styled.summary textStyle="label.03" cursor="pointer" py="space.02">
        {label}
      </styled.summary>
      <styled.pre
        textStyle="caption.01"
        whiteSpace="pre-wrap"
        overflowWrap="anywhere"
        maxWidth="100%"
        py="space.02"
      >
        {payload}
      </styled.pre>
    </styled.details>
  );
}

function LedgerReviewRows({ recipe }: LedgerReviewRowsProps) {
  return (
    <>
      {recipe.message && (
        <ApprovalSection label="Message">
          <styled.pre
            textStyle="body.02"
            whiteSpace="pre-wrap"
            overflowWrap="anywhere"
            py="space.02"
            maxWidth="100%"
          >
            {recipe.message}
          </styled.pre>
        </ApprovalSection>
      )}
      <ApprovalSection label="Request details">
        <ApprovalRow
          stacked
          label="Signing account address"
          value={<AddressDisplayer address={recipe.account.address} />}
        />
        {recipe.rows.map(row => {
          if (row.kind === 'contract') {
            return <ApprovalContractRow key={row.label} label={row.label} contractId={row.value} />;
          }
          return (
            <ApprovalRow
              key={row.label}
              label={row.label}
              stacked={row.kind === 'address' || row.kind === 'identifier'}
              value={ledgerRowValue(row)}
              caption={row.caption}
            />
          );
        })}
      </ApprovalSection>
      {(recipe.payload || recipe.policy || recipe.source) && (
        <ApprovalSection label="More details">
          {recipe.payload && (
            <LedgerPayloadDisclosure label="Raw payload to sign" payload={recipe.payload} />
          )}
          {recipe.policy && (
            <LedgerPayloadDisclosure
              label="Wallet policy and participant keys"
              payload={recipe.policy}
            />
          )}
          {recipe.source && (
            <LedgerPayloadDisclosure label="Full contract source" payload={recipe.source} />
          )}
        </ApprovalSection>
      )}
    </>
  );
}

function ledgerReviewAction(recipe: LedgerFlowRecipe) {
  if (recipe.id.includes('proposal')) return 'Create proposal';
  if (recipe.id.includes('message')) return 'Sign message';
  if (recipe.account.vault) return 'Add signature';
  return 'Sign transaction';
}

function ledgerSheetTitle(stage: LedgerFlowStage) {
  const recovery = recoveryCopy[stage];
  if (recovery) return recovery.title;
  if (stage === 'pairing-required') return 'Connect in full screen';
  if (stage === 'chooser') return 'Select your Ledger';
  if (stage === 'checking') return 'Checking your account';
  if (stage === 'policy') return 'Review the wallet policy';
  if (stage === 'device') return 'Confirm on your Ledger';
  return 'Connect your Ledger';
}

function ledgerSheetAction(stage: LedgerFlowStage) {
  if (stage === 'locked') return 'Unlock on Ledger';
  if (stage === 'opening-app') return 'Open app on Ledger';
  if (stage === 'pairing-required') return 'Open full screen';
  if (stage === 'connect') return 'Connect Ledger';
  if (stage === 'chooser') return 'Choose your device';
  if (stage === 'checking') return 'Checking your account';
  if (stage === 'device' || stage === 'policy') return 'Confirm on Ledger';
  if (stage === 'invalid-payload') return 'Review request';
  if (stage === 'wrong-device') return 'Connect correct Ledger';
  return 'Reconnect Ledger';
}

function ledgerTotal(recipe: LedgerFlowRecipe) {
  if (!recipe.total) return undefined;
  return {
    label: recipe.account.vault ? 'Vault total' : 'Total',
    amount: recipe.total,
  };
}

function isLedgerSheetStage(stage: LedgerFlowStage) {
  return (
    stage === 'connect' ||
    stage === 'pairing-required' ||
    stage === 'chooser' ||
    stage === 'checking' ||
    stage === 'policy' ||
    stage === 'device' ||
    recoveryCopy[stage] !== undefined
  );
}

function ledgerReviewFooterLabel(stage: LedgerFlowStage, recipe: LedgerFlowRecipe) {
  if (stage === 'signed' && !recipe.canBroadcast) return 'Signature received';
  if (stage === 'canceled') return 'Request canceled';
  if (stage === 'broadcast') return 'Submitted';
  if (stage === 'signed' || stage === 'submit-failed') return 'Submit transaction';
  if (stage === 'submitting') return 'Submitting';
  return ledgerReviewAction(recipe);
}

function ledgerResultTitle(stage: LedgerFlowStage, recipe: LedgerFlowRecipe) {
  if (stage === 'signed') return recipe.outcomeTitle;
  if (stage === 'submitting') return 'Submitting signed transaction';
  if (stage === 'broadcast') return 'Transaction submitted';
  return 'Request canceled';
}

interface LedgerPairingPreviewProps {
  recipe: LedgerFlowRecipe;
  stage: LedgerFlowStage;
}

function ledgerPairingAction(isPaired: boolean) {
  return isPaired ? 'Back to app' : 'Connect Ledger';
}

function LedgerPairingPreview({ recipe, stage }: LedgerPairingPreviewProps) {
  const { setStage } = useLedgerFlowStage(recipe.id);
  const isWaiting = stage === 'pairing-chooser';
  const isPaired = stage === 'restart-request';
  const isClosed = stage === 'request-closed';
  const requesterName =
    recipe.requester.source === 'internal' ? 'Leather' : displayOrigin(recipe.requester.origin);
  const title = isPaired ? 'Ledger connected' : 'Connect your Ledger';

  function continuePairing() {
    if (isPaired) {
      setStage('request-closed');
      return;
    }
    setStage('pairing-chooser');
  }

  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel={isClosed ? 'Request closed' : ledgerPairingAction(isPaired)}
          secondaryLabel="Close"
          single={isPaired || isClosed}
          isPrimaryDisabled={isWaiting || isClosed}
          isBusy={isWaiting}
          onPrimaryClick={continuePairing}
          onSecondaryClick={() => setStage('request-closed')}
        />
      }
    >
      <ApprovalIntent
        title={isClosed ? 'Request closed' : title}
        kind="Full-screen tab · connection only"
      />
      <ApprovalSection label="Next step">
        <Stack gap="space.03" py="space.02">
          {!isClosed && <ApprovalLedgerDevice stage={isPaired ? 'signed' : 'connect'} />}
          <styled.p textStyle="body.02" role="status">
            {isPaired || isClosed
              ? `Return to ${requesterName} and start the request again. The previous approval is closed; nothing was signed or sent.`
              : `The approval popup has closed. Connect and unlock your Ledger, then open the ${recipe.app} app.`}
          </styled.p>
          {isWaiting && (
            <styled.p textStyle="body.02">
              Choose your Ledger in the browser dialog. This only grants device access; it does not
              approve the previous request.
            </styled.p>
          )}
          <ApprovalNote>
            {isClosed
              ? 'Use Restart review in the preview controls to simulate a fresh request.'
              : 'After connecting, return to the app to request a fresh approval.'}
          </ApprovalNote>
        </Stack>
      </ApprovalSection>
    </ApprovalShell>
  );
}

interface LedgerApprovalFlowProps {
  recipe: LedgerFlowRecipe;
}

function LedgerApprovalFlow({ recipe }: LedgerApprovalFlowProps) {
  const { formFactor, update } = useCanvasSettings();
  const { isSolo } = useApprovalOptions();
  const isPhone = formFactor === 'phone' || formFactor === 'small-phone';
  const { stage, setStage } = useLedgerFlowStage(recipe.id);
  const recovery = recoveryCopy[stage];
  const showSheet = isLedgerSheetStage(stage);
  const isDeviceWaiting =
    stage === 'chooser' ||
    stage === 'checking' ||
    stage === 'device' ||
    stage === 'policy' ||
    stage === 'locked' ||
    stage === 'opening-app';
  const isDone =
    stage === 'canceled' || stage === 'broadcast' || (stage === 'signed' && !recipe.canBroadcast);
  const showResult =
    stage === 'signed' || stage === 'submitting' || stage === 'broadcast' || stage === 'canceled';
  const requesterName =
    recipe.requester.source === 'internal' ? 'Leather' : displayOrigin(recipe.requester.origin);
  const accountName = recipe.account.vault
    ? `${recipe.account.vault.name} · ${recipe.account.name}`
    : recipe.account.name;

  function advanceReview() {
    if (stage === 'review') {
      setStage('connect');
      return;
    }
    if (stage === 'signed' || stage === 'submit-failed') setStage('submitting');
  }

  function advanceDevice() {
    if (stage === 'pairing-required') {
      update({ formFactor: 'web' });
      setStage('pairing-tab');
      return;
    }
    if (stage === 'connect') {
      setStage('checking');
      return;
    }
    if (stage === 'invalid-payload') {
      setStage('review');
      return;
    }
    if (recovery) setStage('connect');
  }

  function dismissDevice() {
    setStage('review');
  }

  if (
    stage === 'pairing-tab' ||
    stage === 'pairing-chooser' ||
    stage === 'restart-request' ||
    stage === 'request-closed'
  ) {
    return <LedgerPairingPreview recipe={recipe} stage={stage} />;
  }

  return (
    <ApprovalShell
      isBackgroundInert={showSheet}
      footer={
        <ApprovalFooter
          primaryLabel={ledgerReviewFooterLabel(stage, recipe)}
          secondaryLabel="Cancel"
          single={
            isDone || stage === 'signed' || stage === 'submitting' || stage === 'submit-failed'
          }
          isPrimaryDisabled={showSheet || stage === 'submitting' || isDone}
          total={ledgerTotal(recipe)}
          reversibility={recipe.id === 'ledger-flow-deploy' ? 'once-confirmed' : undefined}
          onPrimaryClick={advanceReview}
          onSecondaryClick={() => setStage('canceled')}
        />
      }
      overlay={
        showSheet ? (
          <ApprovalLedgerSheet
            title={ledgerSheetTitle(stage)}
            description="Complete signing with the account’s device."
            onDismiss={dismissDevice}
            isInteractive={isSolo}
          >
            <Flex direction="column" flex="1" width="100%" height="100%" minWidth={0} minHeight={0}>
              <Box flex="1" minHeight={0} overflowY="auto">
                <Stack gap="space.01" px="space.05" pt="space.03" pb="space.02">
                  <styled.p textStyle="label.03">{recipe.title}</styled.p>
                  <styled.p textStyle="caption.01" color="ink.text-subdued" overflowWrap="anywhere">
                    {requesterName} · {accountName} · Mainnet
                  </styled.p>
                </Stack>
                {isPhone && (
                  <ApprovalNote>
                    Phone layout study. Ledger signing currently requires Leather’s desktop
                    extension; mobile device connection is not available.
                  </ApprovalNote>
                )}
                <ApprovalSection>
                  <Stack gap="space.02" py="space.02">
                    <styled.span srOnly aria-live="polite">
                      {ledgerSheetTitle(stage)}
                    </styled.span>
                    {recovery && <ApprovalLedgerDevice stage={stage} />}
                    {stage === 'pairing-required' && (
                      <>
                        <styled.p textStyle="body.02">
                          Your browser needs permission to use this Ledger. Device selection must
                          open in a full-screen tab.
                        </styled.p>
                        <styled.p textStyle="body.02">
                          This approval popup will close. After connecting, return to{' '}
                          {requesterName} and start the request again. Nothing will be signed here.
                        </styled.p>
                      </>
                    )}
                    {(stage === 'connect' || stage === 'chooser') && (
                      <>
                        <ApprovalLedgerDevice stage={stage} />
                        <styled.p textStyle="body.02">
                          {stage === 'chooser'
                            ? 'Select your Ledger in the browser’s device chooser. Leather checks that it matches your account before sending the signing request.'
                            : `Connect and unlock your Ledger, then open the ${recipe.app} app.`}
                        </styled.p>
                        <styled.p textStyle="caption.01" color="ink.text-subdued">
                          Already paired? Leather reuses your browser permission. You approve the
                          signature on your Ledger.
                        </styled.p>
                      </>
                    )}
                    {stage === 'checking' && (
                      <>
                        <ApprovalLedgerDevice stage={stage} />
                        <styled.p role="status" textStyle="body.02">
                          Checking that this Ledger matches {recipe.account.name}. The signing
                          request is held until the account matches.
                        </styled.p>
                      </>
                    )}
                    {stage === 'policy' && (
                      <>
                        <ApprovalLedgerDevice stage={stage} />
                        <styled.p textStyle="body.02">
                          Check the 2 of 3 policy and participant keys on your Ledger. Accept only
                          if they match Team Treasury. The transaction review comes next.
                        </styled.p>
                      </>
                    )}
                    {stage === 'device' && (
                      <>
                        <ApprovalLedgerDevice stage={stage} />
                        <styled.p textStyle="body.02">{recipe.deviceNote}</styled.p>
                        <styled.p textStyle="caption.01" color="ink.text-subdued">
                          Nothing is signed until you confirm on the device.
                        </styled.p>
                      </>
                    )}
                  </Stack>
                </ApprovalSection>
                {recovery && (
                  <>
                    <ApprovalCaution
                      title={recovery.title}
                      tone="blocking"
                      source="Ledger connection"
                    >
                      {recovery.description}
                    </ApprovalCaution>
                    <ApprovalNote>Required app: {recipe.app}.</ApprovalNote>
                  </>
                )}
                <styled.details pb="space.03">
                  <styled.summary px="space.05" py="space.03" textStyle="label.03" cursor="pointer">
                    Review request details
                  </styled.summary>
                  <LedgerReviewRows recipe={recipe} />
                </styled.details>
              </Box>
              <ApprovalFooter
                primaryLabel={ledgerSheetAction(stage)}
                secondaryLabel="Back to review"
                isBusy={isDeviceWaiting}
                isPrimaryDisabled={isDeviceWaiting}
                total={ledgerTotal(recipe)}
                onPrimaryClick={advanceDevice}
                onSecondaryClick={dismissDevice}
              />
            </Flex>
          </ApprovalLedgerSheet>
        ) : undefined
      }
    >
      <ApprovalHeader requester={recipe.requester} account={recipe.account} network={mainnet} />
      <ApprovalIntent title={recipe.title} kind={recipe.kind} />
      {showResult && (
        <ApprovalSection label="Result">
          <Stack gap="space.02" py="space.02">
            <styled.p textStyle="label.02" aria-live="polite">
              {ledgerResultTitle(stage, recipe)}
            </styled.p>
            {stage === 'signed' && (
              <>
                <ApprovalLedgerDevice stage={stage} />
                <styled.p textStyle="body.02">{recipe.outcome}</styled.p>
              </>
            )}
            {stage === 'submitting' && (
              <styled.p role="status" textStyle="body.02">
                Waiting for the network to accept the signed transaction. It is not confirmed yet.
              </styled.p>
            )}
            {stage === 'broadcast' && (
              <styled.p textStyle="body.02">
                The network accepted the transaction. It is pending confirmation.
              </styled.p>
            )}
            {stage === 'canceled' && (
              <styled.p textStyle="body.02">Request canceled. Nothing was signed or sent.</styled.p>
            )}
          </Stack>
        </ApprovalSection>
      )}
      {stage === 'submit-failed' && (
        <ApprovalCaution
          title="The network did not accept this transaction"
          tone="blocking"
          source="Network submission"
        >
          The signature exists, but the transaction was not broadcast by this attempt. You can retry
          submission without asking your Ledger to sign again.
        </ApprovalCaution>
      )}
      <LedgerReviewRows recipe={recipe} />
    </ApprovalShell>
  );
}

export const ledgerFlowScenarios: Scenario[] = ledgerRecipes.map(recipe => ({
  id: recipe.id,
  family: 'state',
  label: recipe.label,
  method: recipe.method,
  note: `Interactive signing preview. Use the wallet buttons to review and connect; use Simulated Ledger in the viewer panel to select the browser device and deliver device events. Already-paired signing reuses browser permission. Simulate missing permission to review the full-screen connection and fresh-request path. No real device, signature or network call. ${recipe.deviceNote} ${recipe.needsPolicy ? 'The WSH wallet policy is a separate device confirmation before signing.' : ''} ${recipe.outcome}`,
  history: recipe.history,
  render() {
    return <LedgerApprovalFlow recipe={recipe} />;
  },
}));
