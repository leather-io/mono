import { AddressDisplayer, StxAvatarIcon } from '@leather.io/ui';

import { whatMovesLabel } from '../pattern/approval-direction';
import {
  ApprovalHistoryHeader,
  ApprovalHistoryShell,
  ApprovalHistoryStatus,
} from '../pattern/approval-history';
import { ApprovalHistoryStateContext } from '../pattern/approval-history-state';
import { ApprovalNote } from '../pattern/approval-notices';
import { ApprovalOptionsOverride } from '../pattern/approval-options';
import {
  ApprovalAssetRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRow,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import type { ApprovalAccount } from '../pattern/approval-types';
import {
  leatherApp,
  ledgerAccount,
  mainnet,
  stxRecipient,
  vaultAccount,
  vaultMember2,
  vaultMember3,
  vaultRequiredSignatures,
} from './fixtures';

const ledgerVaultAccount: ApprovalAccount = {
  ...ledgerAccount,
  balance: vaultAccount.balance,
  vault: vaultAccount.vault,
};

const activityDate = 'a moment ago';

export function LedgerTransferHistory() {
  return (
    <ApprovalHistoryShell state="pending">
      <ApprovalHistoryHeader account={ledgerAccount} />
      <ApprovalHistoryStatus
        title="Sending 500 STX"
        date={activityDate}
        note="Started in Leather. Signed with Account 2 on your Ledger and submitted to the network. Waiting for confirmation."
      />
      <ApprovalSection label={whatMovesLabel}>
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You send"
          amount={<ExactAmount value="500.000000" symbol="STX" />}
          direction="out"
        />
        <ApprovalRecipientRow address={<AddressDisplayer address={stxRecipient} />} />
        <ApprovalFeeRow
          label="Network fee"
          amount={<ExactAmount value="0.002100" symbol="STX" />}
          caption="2,100 µSTX · pending confirmation"
        />
        <ApprovalRow label="Total" value={<ExactAmount value="500.002100" symbol="STX" />} />
      </ApprovalSection>
      <ApprovalSection label="Details" divided>
        <ApprovalRow label="Started in" value="Leather" />
        <ApprovalRow label="Signed with" value="Account 2 · Ledger" />
        <ApprovalRow
          stacked
          label="Signing account address"
          value={<AddressDisplayer address={ledgerAccount.address} />}
        />
        <ApprovalRow label="Network" value={`Stacks ${mainnet.name.toLowerCase()}`} />
        <ApprovalRow label="Nonce" value="8" />
      </ApprovalSection>
    </ApprovalHistoryShell>
  );
}

export function LedgerVaultSignatureHistory() {
  return (
    <ApprovalHistoryStateContext.Provider value="pending">
      <ApprovalOptionsOverride accountPlacement="body" hasLaunch={false}>
        <ApprovalShell>
          <ApprovalHistoryHeader account={ledgerVaultAccount} />
          <ApprovalHistoryStatus
            title="Added your vault signature"
            date={activityDate}
            requester={leatherApp}
            statusLabel="Waiting for another signature"
            note="Account 2 signed for Team Treasury on your Ledger. Nothing has been broadcast and no funds have moved."
          />
          <ApprovalSection label={whatMovesLabel}>
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="The vault would send"
              amount={<ExactAmount value="1,500.000000" symbol="STX" />}
              direction="out"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={stxRecipient} />} />
            <ApprovalFeeRow
              label="Transaction fee"
              amount={<ExactAmount value="0.004200" symbol="STX" />}
              caption="Fixed for all signers · paid by the vault if the transaction is confirmed"
            />
          </ApprovalSection>
          <ApprovalNote>
            Adding your signature did not charge a network fee. Another eligible member must sign
            before the transaction can be broadcast.
          </ApprovalNote>
          <ApprovalSection label="Signers" divided>
            <ApprovalSigners
              required={vaultRequiredSignatures}
              signers={[
                {
                  name: 'Account 2 (you)',
                  device: 'ledger',
                  account: ledgerAccount,
                  status: 'signed',
                },
                { ...vaultMember2, status: 'waiting' },
                { ...vaultMember3, status: 'waiting' },
              ]}
              caption="1 of 2 required transaction signatures is present. Reaching the threshold makes it ready for a separate broadcast."
            />
          </ApprovalSection>
          <ApprovalSection label="Details" divided>
            <ApprovalRow label="Spending account" value="Team Treasury" />
            <ApprovalRow label="Signed with" value="Account 2 · Ledger" />
            <ApprovalRow
              stacked
              label="Signing account address"
              value={<AddressDisplayer address={ledgerAccount.address} />}
            />
            <ApprovalRow label="Network" value={`Stacks ${mainnet.name.toLowerCase()}`} />
            <ApprovalRow label="Nonce" value="7" caption="Assigned before transaction signing" />
          </ApprovalSection>
        </ApprovalShell>
      </ApprovalOptionsOverride>
    </ApprovalHistoryStateContext.Provider>
  );
}
