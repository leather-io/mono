import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, Badge, SbtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import {
  cautionShown,
  decided,
  frictionCompleted,
  resulted,
  viewed,
} from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { displayOrigin, truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import {
  ApprovalCaution,
  ApprovalCheck,
  ApprovalGuarantee,
  ApprovalNote,
} from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import { VaultCosignHistory } from './activity-histories';
import {
  account1Sbtc,
  account1Stx,
  contracts,
  feeUnderOneCent,
  gamma,
  leatherApp,
  mainnet,
  stxRecipient,
  stxVaultRecipient,
  vaultAccount,
  vaultMember2,
  vaultMember3,
  vaultRequiredSignatures,
  vaultYou,
  zest,
} from './fixtures';
import type { Scenario } from './scenario';

const pendingTransfer = {
  nonce: '41',
  amount: '50',
  recipient: 'SP3QRZ8XWE5M2V6N1TDK9AF4HGB7C0JYSPW2ETR6M',
};

export const signTransactionScenarios: Scenario[] = [
  {
    id: 'sign-transaction-app-fee',
    family: 'sign-transaction',
    label: 'Sign a transaction the app built, with its own fee',
    method: 'stx_signTransaction · sign only',
    captureId: '04b-stx-sign-transaction-in-balance',
    refs: ['#2399', '#2587'],
    events: [
      viewed('stx_signTransaction', 'sign_transaction', 'note'),
      decided('approve', '10_to_30s'),
      resulted('signed'),
    ],
    note: 'The app built this transaction and gets it back signed, so the screen says Leather only signs, and keeps the fee and nonce that are in it, labelled “Set by app”, with Leather’s estimate offered as an edit. Today both are replaced by Leather’s own without saying so, which hands the app back a different transaction than it built. Editing the fee still works; the app then gets back a transaction with Leather’s fee and a different transaction ID.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              reversibility="signed-copy"
              total={{
                amount: <ExactAmount value="1.500400" symbol="STX" />,
                fiat: '$1.22',
              }}
            />
          }
        >
          <ApprovalHeader requester={gamma} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Sign a transfer of 1.5 STX"
            kind={`STX transfer · built by ${displayOrigin(gamma.origin)}`}
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1.500000" symbol="STX" />}
              fiat="$1.22"
            />
            <ApprovalRecipientRow
              address={<AddressDisplayer address={stxRecipient} />}
              caption="Memo: order 7731"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.000400" symbol="STX" />}
              fiat={feeUnderOneCent}
              caption={[
                'Set by app',
                <>
                  Leather suggests <ExactAmount value="0.002100" symbol="STX" />
                </>,
              ]}
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Only this amount and the fee can leave your account. Anything else makes the transfer
              fail.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalNote>
            Leather signs and returns it to {displayOrigin(gamma.origin)}, which decides whether and
            when to broadcast it.
          </ApprovalNote>
          <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
            <ApprovalRow label="Nonce" value="41" caption="Set by app" />
            <ApprovalDisclosureRow label="All details" caption="Raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sign-transaction-multisig-cosign',
    family: 'sign-transaction',
    label: 'Co-sign a vault transaction',
    method: 'stx_signTransaction · multisig co-sign',
    captureId: '05-stx-sign-transaction-multisig',
    refs: ['#2587'],
    note: 'A co-signer sees the vault the funds leave, that their account is a signer, and how close it is to its threshold, in the same Signers block as a Bitcoin vault spend; fee and nonce come from the proposed transaction and are read-only, because changing either voids the signatures already collected. Today both rows are hidden, the total shows a Leather estimate that is not what gets signed, and nothing checks that Leather’s key belongs to the transaction. The Signers block lists each member with their device and status against the 2 of 3 threshold, which lives here rather than in the header. It needs app.leather.io to send the signatures collected so far, since today each co-signer gets the unsigned proposal, and a member then broadcasts it from app.leather.io. Decline proposal sits in that block, away from the two buttons: it is recorded for every signer, while Cancel only closes this window, which is all the popup offers today.',
    history() {
      return <VaultCosignHistory />;
    },
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              total={{
                label: 'Total from vault',
                amount: <ExactAmount value="1,500.004200" symbol="STX" />,
                fiat: '$1,218.60',
              }}
            />
          }
        >
          <ApprovalHeader requester={leatherApp} account={vaultAccount} network={mainnet} />
          <ApprovalIntent
            title={'Sign a transfer of 1,500\u00a0STX from Team Treasury'}
            kind="STX vault transfer · you are co-signing"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="Leaves the vault"
              qualifier="Exactly"
              amount={<ExactAmount value="1,500.000000" symbol="STX" />}
              fiat="$1,218.60"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={stxVaultRecipient} />} />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.004200" symbol="STX" />}
              fiat={feeUnderOneCent}
              caption={['Set by the proposer · paid by the vault', 'Fixed once signing starts']}
            />
            <ApprovalGuarantee kind="strict">
              Only this amount and the fee can leave the vault. If the fee, nonce or recipient
              changes, your signature no longer counts.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Signers" divided>
            <ApprovalCheck
              title={`${vaultAccount.name} is a signer on this vault`}
              caption="Checked by Leather against the vault’s keys"
            />
            <ApprovalSigners
              required={vaultRequiredSignatures}
              signers={[
                { ...vaultMember2, status: 'signed', detail: 'proposed it' },
                { ...vaultYou, status: 'signing' },
                { ...vaultMember3, status: 'waiting' },
              ]}
              caption={`Yours makes 2 of 2, then ${displayOrigin(leatherApp.origin)} can broadcast it.`}
              declineLabel="Decline proposal"
              declineCaption="Recorded for every signer"
            />
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Nonce, signers, raw transaction"
          >
            <ApprovalRow
              label="Nonce"
              value="7"
              caption="The vault’s nonce · assigned by the vault coordinator"
            />
            <ApprovalDisclosureRow label="All details" caption="Signers, raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sign-transaction-sponsored',
    family: 'sign-transaction',
    label: 'Sign a sponsored transaction',
    method: 'stx_signTransaction · sponsored, deny mode',
    refs: ['#2784'],
    note: 'Leather only signs here, so the title starts with Sign and one quiet note says the app decides whether and when to broadcast. A sponsor sets and pays the fee after you sign, and Leather cannot tell who, so the fee row says Sponsored with no amount instead of today’s green “FREE” badge, and the total counts only what leaves your account. The title assumes Zest is on the proposed Leather-owned list of known contracts; without it the function name leads.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              reversibility="signed-copy"
              total={{
                amount: <ExactAmount value="0.05000000" symbol="sBTC" />,
                fiat: '$5,488.90',
              }}
            />
          }
        >
          <ApprovalHeader requester={zest} account={account1Sbtc} network={mainnet} />
          <ApprovalIntent
            title="Sign a supply of 0.05 sBTC to Zest"
            kind="Contract call · Zest lending, recognised by Leather"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="0.05000000" symbol="sBTC" />}
              fiat="$5,488.90"
            />
            <ApprovalFeeRow
              amount={<Badge label="Sponsored" textColor="primary" />}
              caption="Set and paid by the sponsor after you sign"
            />
            <ApprovalGuarantee kind="strict">
              Every movement is listed here. If anything else moves, the transaction fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalNote>
            Leather signs and returns it to {displayOrigin(zest.origin)}, which decides whether and
            when to broadcast it. A sponsor adds and pays the fee before then.
          </ApprovalNote>
          <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
            <ApprovalContractRow label="Contract" contractId={contracts.zestBorrowHelper} />
            <ApprovalRow label="Function" value={<ApprovalIdentifier>supply</ApprovalIdentifier>} />
            <ApprovalDisclosureRow
              label="All details"
              caption="Arguments, nonce, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sign-transaction-nonce-pending',
    family: 'sign-transaction',
    label: 'The app’s nonce replaces a pending transaction',
    method: 'stx_signTransaction · sign only · nonce 41 already pending',
    refs: ['#2399', '#2587'],
    events: [
      viewed('stx_signTransaction', 'sign_transaction', 'caution'),
      cautionShown('mempool'),
      frictionCompleted('acknowledge'),
      decided('approve', '10_to_30s'),
      resulted('signed'),
    ],
    note: `The app built this transaction with nonce ${pendingTransfer.nonce}, the number that orders an account’s transactions, and a transfer of ${pendingTransfer.amount} STX from this account is still pending at ${pendingTransfer.nonce}. Only one of the two can confirm, so the caution names the pending one in plain words and signing asks for a switch that says it gets replaced. The fee is higher than the pending one’s, which a replacement needs, so this one would likely win. Leather keeps the app’s nonce, as on Sign a transaction the app built; the way out is Cancel, and asking the app for a new one. The other case is a gap: a nonce above the next free one (say 43 while 42 is free) just waits, and the screen would say “Waits until nonce 42 confirms” in a quiet note, since nothing is lost. The replace case is the one shown because it quietly drops a payment. Today Leather shows the nonce only in details and checks neither case. Needs Leather to read the account’s pending transactions from the mempool before this screen.`,
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              reversibility="signed-copy"
              confirmation={{
                mode: 'acknowledge',
                statement: `I understand the pending ${pendingTransfer.amount} STX transfer is replaced`,
              }}
              total={{
                amount: <ExactAmount value="1.502000" symbol="STX" />,
                fiat: '$1.22',
              }}
            />
          }
        >
          <ApprovalHeader requester={gamma} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Sign a transfer of 1.5 STX"
            kind={`STX transfer · built by ${displayOrigin(gamma.origin)}`}
          />
          <ApprovalCaution
            title={`This replaces your pending transfer of ${pendingTransfer.amount}\u00a0STX`}
            source="Leather, from your pending transactions"
          >
            {`Both use nonce ${pendingTransfer.nonce} and only one can confirm, so the transfer to ${truncateMiddle(pendingTransfer.recipient, 4)} would never happen.`}
            <styled.span display="block" mt="space.02">
              <ApprovalRowAction label="View pending transfer" />
            </styled.span>
          </ApprovalCaution>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1.500000" symbol="STX" />}
              fiat="$1.22"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={stxRecipient} />} />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.002000" symbol="STX" />}
              fiat={feeUnderOneCent}
              caption="Set by app · higher than the pending one’s"
            />
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
            <ApprovalRow label="Nonce" value={pendingTransfer.nonce} caption="Set by app" />
            <ApprovalDisclosureRow label="All details" caption="Raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
