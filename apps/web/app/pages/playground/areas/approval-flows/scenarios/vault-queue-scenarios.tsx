import { useState } from 'react';

import { AddressDisplayer, StxAvatarIcon } from '@leather.io/ui';

import { cautionShown, decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalChoice, ApprovalChoiceList } from '../pattern/approval-choice';
import { ApprovalFingerprint } from '../pattern/approval-fingerprint';
import { ApprovalFooter } from '../pattern/approval-footer';
import { displayOrigin, truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalCaution, ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRow,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import type { ApprovalAccount } from '../pattern/approval-types';
import {
  feeUnderOneCent,
  leatherApp,
  ledgerAccount,
  mainnet,
  stxVaultRecipient,
  vaultAccount,
  vaultMember2,
  vaultMember3,
  vaultRequiredSignatures,
  vaultYou,
} from './fixtures';
import { DeviceWaitingStatus } from './ledger-state-scenarios';
import type { Scenario } from './scenario';

const transferTitle = 'Sign a transfer of 1,500 STX from Team Treasury';
const transferKind = 'STX vault transfer · you are co-signing';
const transferProposedBy = 'Proposed by Member 2 · 2 hours ago';
const vaultNonce = '7';

const clashingProposal = {
  title: 'Stake 5,000 STX with Fast Pool',
  proposedBy: 'Proposed by Member 3 · yesterday, 16:40',
  progress: '1 of 2 signed',
};

const cosignHash = '9c41e7b2d05af36e8b17c4290df5a6e3417bc82e5d9f0a6c3b84e1d27f56a09c';

const ledgerVaultAccount: ApprovalAccount = {
  ...ledgerAccount,
  balance: vaultAccount.balance,
  vault: vaultAccount.vault,
};

function TransferMoves() {
  return (
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
        Only this amount and the fee can leave the vault. If the fee, nonce or recipient changes,
        your signature no longer counts.
      </ApprovalGuarantee>
    </ApprovalSection>
  );
}

const transferTotal = {
  label: 'Total from vault',
  amount: <ExactAmount value="1,500.004200" symbol="STX" />,
  fiat: '$1,218.60',
};

type ClashChoice = 'this' | 'other';

function NonceClashScreen() {
  const [choice, setChoice] = useState<ClashChoice>('this');
  const isThis = choice === 'this';
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel={isThis ? 'Sign' : 'Open proposal'}
          total={isThis ? transferTotal : undefined}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={vaultAccount} network={mainnet} />
      <ApprovalIntent title={transferTitle} kind={transferKind} />
      <ApprovalCaution
        title={`Another proposal uses nonce ${vaultNonce}`}
        source="Team Treasury’s open proposals"
      >
        {`“${clashingProposal.title}” has the same nonce. Only one of them can go out; once either is broadcast, the other can’t be and has to be proposed again.`}
      </ApprovalCaution>
      <ApprovalSection label="Which one goes out">
        <ApprovalChoiceList label="Which one goes out">
          <ApprovalChoice
            label="This transfer"
            caption={[
              transferProposedBy,
              'Yours makes 2 of 2. The staking proposal would need proposing again.',
            ]}
            isSelected={isThis}
            onSelect={() => setChoice('this')}
          />
          <ApprovalChoice
            label={clashingProposal.title}
            caption={[
              `${clashingProposal.proposedBy} · ${clashingProposal.progress}`,
              'Opens it to review. This transfer would need proposing again.',
            ]}
            isSelected={!isThis}
            onSelect={() => setChoice('other')}
          />
        </ApprovalChoiceList>
      </ApprovalSection>
      <TransferMoves />
      <ApprovalSection label="Signers" divided>
        <ApprovalSigners
          required={vaultRequiredSignatures}
          signers={[
            { ...vaultMember2, status: 'signed', detail: 'proposed it' },
            { ...vaultYou, status: 'signing' },
            { ...vaultMember3, status: 'waiting' },
          ]}
          declineLabel="Decline proposal"
          declineCaption="Recorded for every signer"
        />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
        <ApprovalRow
          label="Nonce"
          value={vaultNonce}
          caption={['The vault’s nonce · fixed when proposed', 'Also used by the staking proposal']}
        />
        <ApprovalDisclosureRow label="All details" caption="Signers, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

function DeclineConfirmScreen() {
  return (
    <ApprovalShell footer={<ApprovalFooter primaryLabel="Decline" secondaryLabel="Back" />}>
      <ApprovalHeader requester={leatherApp} account={vaultAccount} network={mainnet} />
      <ApprovalIntent
        title="Decline this proposal?"
        kind="Transfer of 1,500 STX from Team Treasury, proposed by Member 2. Nothing is signed or sent."
      />
      <ApprovalSection label="What declining does">
        <ApprovalRow
          stacked
          label="Every signer sees it"
          value="Your decline is recorded on the proposal"
          caption="Leather signs a short decline note with Account 1’s key, so no one can decline for you. No fee."
        />
        <ApprovalRow
          stacked
          label="It can still pass"
          value="Member 3 can still sign and make 2 of 2"
          caption="In a 2 of 3 vault it closes only once 2 members decline."
        />
        <ApprovalRow
          stacked
          label="It’s final for you"
          value="You can’t sign this proposal later"
          caption="If you change your mind, anyone can propose it again."
        />
      </ApprovalSection>
      <ApprovalSection label="After you decline" divided>
        <ApprovalSigners
          required={vaultRequiredSignatures}
          signers={[
            { ...vaultMember2, status: 'signed', detail: 'proposed it' },
            { ...vaultYou, status: 'declined' },
            { ...vaultMember3, status: 'waiting' },
          ]}
        />
      </ApprovalSection>
      <ApprovalNote>
        Not sure yet? Back returns to the review, and Cancel there just closes this window. The
        proposal keeps waiting for you.
      </ApprovalNote>
    </ApprovalShell>
  );
}

function ProposalStaleScreen() {
  return (
    <ApprovalShell footer={<ApprovalFooter single primaryLabel="Close" />}>
      <ApprovalHeader requester={leatherApp} account={vaultAccount} network={mainnet} />
      <ApprovalIntent
        title="This proposal can’t be signed anymore"
        kind="Transfer of 1,500 STX from Team Treasury. There is nothing to sign."
      />
      <ApprovalCaution
        tone="blocking"
        title={`Nonce ${vaultNonce} was used by another proposal`}
        source="Stacks node"
      >
        {`“${clashingProposal.title}” went out 20 minutes ago with nonce ${vaultNonce}. Each nonce can be used once, so this transfer can never be broadcast.`}
      </ApprovalCaution>
      <ApprovalSection label="What it would have done">
        <ApprovalRow
          label="Leaves the vault"
          value={<ExactAmount value="1,500.000000" symbol="STX" />}
          caption="$1,218.60"
        />
        <ApprovalRow
          label="To"
          value={truncateMiddle(stxVaultRecipient, 4)}
          caption={transferProposedBy}
        />
      </ApprovalSection>
      <ApprovalNote>
        {`If the transfer is still needed, propose it again in ${displayOrigin(leatherApp.origin)}. It gets a new nonce, and every signer signs again.`}
      </ApprovalNote>
    </ApprovalShell>
  );
}

function LedgerHashScreen() {
  return (
    <ApprovalShell
      footer={<ApprovalFooter single isBusy primaryLabel="Sign" hint={<DeviceWaitingStatus />} />}
    >
      <ApprovalHeader requester={leatherApp} account={ledgerVaultAccount} network={mainnet} />
      <ApprovalIntent
        title="Confirm on your Ledger"
        kind="Co-signing 1,500 STX from Team Treasury. Nothing is signed yet."
      />
      <ApprovalSection label="Compare with your Ledger">
        <ApprovalFingerprint
          label="Transaction hash"
          value={cosignHash}
          caption="Worked out by Leather from the transaction, the same for every signer. If it’s different, reject on the device."
        />
      </ApprovalSection>
      <ApprovalSection label="Also on your Ledger" divided>
        <ApprovalRow
          stacked
          label="From"
          value={<AddressDisplayer address={vaultAccount.vault?.address ?? ''} />}
          caption="Team Treasury"
        />
        <ApprovalRow stacked label="To" value={<AddressDisplayer address={stxVaultRecipient} />} />
        <ApprovalRow
          label="Amount"
          value={<ExactAmount value="1,500.000000" symbol="STX" />}
          caption="Shown as 1500000000 uSTX on the device"
        />
        <ApprovalRow
          label="Fee"
          value={<ExactAmount value="0.004200" symbol="STX" />}
          caption="Shown as 4200 uSTX on the device"
        />
        <ApprovalRow label="Nonce" value={vaultNonce} />
      </ApprovalSection>
      <ApprovalNote>
        Other signers see this same hash. If you check it with them, do it in a call or chat you
        trust, not through the site.
      </ApprovalNote>
    </ApprovalShell>
  );
}

export const vaultQueueScenarios: Scenario[] = [
  {
    id: 'vault-nonce-clash',
    family: 'account',
    label: 'Co-sign while another proposal has the same nonce',
    method: 'stx_signTransaction · multisig co-sign · nonce clash',
    refs: ['#2587', '#2464'],
    events: [
      viewed('stx_signTransaction', 'vault', 'caution'),
      cautionShown('vault_queue'),
      decided('approve', '30_to_120s'),
      resulted('signed'),
    ],
    note: 'A co-signer opens a proposal while another open proposal on the same vault has the same nonce. On Stacks the nonce is fixed when a proposal is made and each nonce can be used once, so whichever goes out first makes the other impossible to broadcast. The caution names the other proposal, the choice says who proposed it, when, how far it has got and what happens to the one not picked, and the footer verb follows the choice. Bitcoin vaults clash the same way when two proposals spend the same coins: once one confirms, the other’s inputs are gone, so the caution would name the shared coins instead of a nonce. Leather does not check for this today, and the proposal that loses only fails at broadcast. It needs the vault coordinator to share the vault’s open proposals with their nonces or inputs.',
    render() {
      return <NonceClashScreen />;
    },
  },
  {
    id: 'vault-decline-confirm',
    family: 'account',
    label: 'Decline a vault proposal',
    method: 'multisig co-sign · decline',
    refs: ['#2464'],
    note: 'Decline proposal, in the Signers block of a co-sign screen, opens this step. Declining is recorded for every signer, signed with your key so no one can decline for you, and costs no fee; Cancel on the review only closes the window and leaves the proposal waiting. The screen says plainly that one decline is not a veto in a 2 of 3 vault: the proposal closes only once too few members are left to reach the threshold, and the Signers block previews that. Back returns to the review. Declines need the vault coordinator to store them; today the popup only offers Cancel.',
    render() {
      return <DeclineConfirmScreen />;
    },
  },
  {
    id: 'vault-proposal-stale',
    family: 'account',
    label: 'Proposal can’t be signed anymore',
    method: 'multisig co-sign · stale proposal',
    refs: ['#2464'],
    note: 'A co-signer opens a proposal that can no longer go out, here because another proposal used its nonce. There is nothing to sign, so the only button is Close; the caution says what used the nonce and the note says how to get the transfer back on track. The same screen covers a proposal replaced by a newer one, which names the newer proposal, and one that expired, which gives the date, each with its own caution title. Without it, members can keep signing a proposal that can never be broadcast.',
    render() {
      return <ProposalStaleScreen />;
    },
  },
  {
    id: 'vault-ledger-hash',
    family: 'account',
    label: 'Vault co-sign on Ledger, compare the hash',
    method: 'stx_signTransaction · multisig co-sign · Ledger device step',
    refs: ['#2699', '#2587'],
    note: 'When a vault co-sign goes to a Ledger, the device step leads with the transaction hash every signer signs, in groups of four so it can be read off in pieces, and one instruction: if it’s different, reject on the device. It follows Safe’s guidance for hardware signers, where a hash checked on the device catches a site that shows one transaction while the device is asked to sign another. The rows below mirror the device as on Ledger, confirm on the device. Whether and how the Stacks app shows this hash for multisig, and in what grouping, needs checking before build so the groups match the device. A Bitcoin vault on Ledger shows the registered policy and the outputs rather than a hash, so there the rows are the comparison.',
    render() {
      return <LedgerHashScreen />;
    },
  },
];
