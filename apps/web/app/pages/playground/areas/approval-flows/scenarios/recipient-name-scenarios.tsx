import { AddressDisplayer, StxAvatarIcon } from '@leather.io/ui';

import {
  cautionShown,
  decided,
  frictionCompleted,
  resulted,
  viewed,
} from '../approval-flows.events';
import type { ApprovalRecipientName } from '../pattern/approval-direction';
import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import { AccountAvatar } from '../pattern/approval-identity';
import type { ApprovalIdentityContext } from '../pattern/approval-identity-context';
import { ApprovalCaution, ApprovalGuarantee } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { account1Stx, feeUnderOneCent, leatherApp, ledgerAccount, mainnet } from './fixtures';
import type { Scenario } from './scenario';

const bnsName = 'muneeb.btc';
const bnsAddress = 'SP1MNB7Q4ZK2XWT9E6RD3HVA0CJ8GFS5YPN4R2DK';
const bnsNewOwnerAddress = 'SP2T8WQX5N1KRZ7HV3BD0MYF6EJ4CPG9SAT2N8QW';
const bnsSource = 'Looked up in BNS by Leather, just now';

const bnsRecipient: ApprovalRecipientName = {
  value: bnsName,
  kind: 'bns',
  source: bnsSource,
};

const bnsChangedRecipient: ApprovalRecipientName = {
  ...bnsRecipient,
  caution: 'Owner changed 3 days ago',
};

const ownRecipient: ApprovalRecipientName = {
  value: ledgerAccount.name,
  kind: 'yours',
  source: 'One of your accounts in Leather',
};

function recipientContext(name: ApprovalRecipientName): ApprovalIdentityContext {
  if (name.caution) return { status: 'caution', label: 'Owner changed', description: name.caution };
  if (name.kind === 'yours')
    return {
      status: 'clear',
      label: 'Your account',
      description: 'An account held in this Leather wallet.',
    };
  return {
    status: 'neutral',
    label: 'BNS resolved',
    description: name.source ?? 'Name resolved through BNS.',
  };
}

interface NamedTransferProps {
  title: string;
  amount: string;
  fiat: string;
  total: string;
  address: string;
  name: ApprovalRecipientName;
  isChanged?: boolean;
}

function NamedTransfer({
  title,
  amount,
  fiat,
  total,
  address,
  name,
  isChanged,
}: NamedTransferProps) {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Send"
          reversibility="once-confirmed"
          confirmation={
            isChanged
              ? { mode: 'acknowledge', statement: 'I checked the new address with them' }
              : undefined
          }
          total={{ amount: <ExactAmount value={total} symbol="STX" />, fiat }}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={account1Stx} network={mainnet} />
      <ApprovalIntent title={title} kind="STX transfer · built by Leather" />
      {isChanged && (
        <ApprovalCaution
          title={`${bnsName} has a new owner`}
          source="BNS on Stacks, read by Leather"
        >
          It moved to a new address 3 days ago, after your last send. Check the address with them
          another way.
        </ApprovalCaution>
      )}
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly"
          amount={<ExactAmount value={amount} symbol="STX" />}
          fiat={fiat}
        />
        <ApprovalRecipientRow
          name={name}
          context={recipientContext(name)}
          address={<AddressDisplayer address={address} />}
          avatar={
            name.kind === 'yours' ? <AccountAvatar account={ledgerAccount} size="md" /> : undefined
          }
        />
        <ApprovalFeeRow
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Only this amount and the fee can leave your account. Anything else makes the transfer
          fail.
        </ApprovalGuarantee>
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const recipientNameScenarios: Scenario[] = [
  {
    id: 'transfer-bns-name',
    family: 'transfer',
    label: 'Send to a BNS name',
    method: 'stx_transferStx · recipient entered as a BNS name',
    refs: ['#2587'],
    events: [
      viewed('stx_transferStx', 'transfer', 'none'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: `A name makes the recipient readable, but the address is what gets signed, so both show: the name with a BNS name tag, where Leather found it and when, then the address in full, grouped for comparing. The name treatment is shared by every recipient row, in every direction, so a name never replaces the address. Leather looks the name up itself at the moment of review; a name a site passes in is treated as a label and never resolved on its behalf. Today Leather resolves BNS names in its own send form and shows only the address on the review. Open questions: whether the lookup goes through a Hiro API or a Leather-run node, and how old a lookup may be before the screen repeats it. ${bnsName} and its address are example values.`,
    render() {
      return (
        <NamedTransfer
          title={`Send 250 STX to ${bnsName}`}
          amount="250.000000"
          fiat="$203.10"
          total="250.003000"
          address={bnsAddress}
          name={bnsRecipient}
        />
      );
    },
  },
  {
    id: 'transfer-bns-name-changed',
    family: 'transfer',
    label: 'Send to a BNS name that changed owner',
    method: 'stx_transferStx · BNS name transferred 3 days ago',
    refs: ['#2587'],
    events: [
      viewed('stx_transferStx', 'transfer', 'caution'),
      cautionShown('name_service'),
      frictionCompleted('acknowledge'),
      decided('approve', '30_to_120s'),
      resulted('broadcast'),
    ],
    note: 'The same send when the name moved to a new owner recently and you have sent to its old address before. The name row carries a short caution line, the callout says what happened and what to do, and Send waits for a switch that names the check. It stays a caution rather than a block: names are sold and moved between someone’s own wallets all the time. It needs Leather to read when the name last changed hands and to remember past recipients, which it does not do today. Open question: how recent counts as recently (3 days here).',
    render() {
      return (
        <NamedTransfer
          title={`Send 250 STX to ${bnsName}`}
          amount="250.000000"
          fiat="$203.10"
          total="250.003000"
          address={bnsNewOwnerAddress}
          name={bnsChangedRecipient}
          isChanged
        />
      );
    },
  },
  {
    id: 'transfer-own-account',
    family: 'transfer',
    label: 'Send to one of your own accounts',
    method: 'stx_transferStx · recipient is Account 2',
    refs: ['#2587'],
    events: [
      viewed('stx_transferStx', 'transfer', 'none'),
      decided('approve', '3_to_10s'),
      resulted('broadcast'),
    ],
    note: 'When the recipient is one of your own accounts, the row says so (“Account 2 · yours”) with that account’s avatar, and the full address stays underneath. The label comes only from matching the address against the accounts Leather derived, never from the site or a name service, so it can be trusted where a name can’t. The same label appears on PSBT outputs and vault change, which today use Yours and Change tags. Today the review shows the bare address even when it is your own.',
    render() {
      return (
        <NamedTransfer
          title="Send 1,000 STX to Account 2"
          amount="1,000.000000"
          fiat="$812.40"
          total="1,000.003000"
          address={ledgerAccount.address}
          name={ownRecipient}
        />
      );
    },
  },
];
