import { AddressDisplayer, BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalGuarantee } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { depositAddress } from './bitcoin-parts';
import {
  account1Stx,
  btcSigner,
  feeUnderOneCent,
  gamma,
  leatherApp,
  mainnet,
  stxVaultRecipient,
} from './fixtures';
import type { Scenario } from './scenario';

const pendingBtcTxId = '9f2c6a1e4b7d3f80c5a2e9d1b6f4a3c8e7d2b5a9f1c4e6d8b3a7f2e5c9d1a4b6';

function SpeedUpBitcoinScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Speed up"
          reversibility="replaceable"
          total={{
            label: 'Extra fee',
            amount: <ExactAmount value="0.00001530" symbol="BTC" />,
            fiat: '$1.68',
          }}
        />
      }
    >
      <ApprovalHeader requester={gamma} account={btcSigner} network={mainnet} />
      <ApprovalIntent
        title="Speed up your 0.003 BTC send"
        kind="Bitcoin replace-by-fee · built by Leather"
      />
      <ApprovalSection label="What changes">
        <ApprovalFeeRow
          label="Fee now"
          amount={<ExactAmount value="0.00000765" symbol="BTC" />}
          fiat="$0.84"
          caption="5 sat/vB · pending 40 min"
        />
        <ApprovalFeeRow
          label="New fee"
          amount={<ExactAmount value="0.00002295" symbol="BTC" />}
          fiat="$2.52"
          speed="fast"
          caption="15 sat/vB · about 10 min"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="final">
          Your signature covers every input and output. If anything changes, it no longer counts.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Stays the same" divided>
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly, as before"
          amount={<ExactAmount value="0.00300000" symbol="BTC" />}
          fiat="$329.33"
        />
        <ApprovalRecipientRow address={<AddressDisplayer address={depositAddress} />} />
        <ApprovalRow
          label="Change"
          value={<ExactAmount value="0.00408235" symbol="BTC" />}
          caption="Less by the extra fee · back to Native SegWit"
        />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Replaced transaction, inputs">
        <ApprovalRow
          label="Replaces"
          value={truncateMiddle(pendingBtcTxId, 6)}
          caption="Dropped once the new one confirms"
        />
        <ApprovalDisclosureRow label="All details" caption="Inputs and outputs, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

function SpeedUpStacksScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Speed up"
          reversibility="replaceable"
          total={{
            amount: <ExactAmount value="50.002100" symbol="STX" />,
            fiat: '$40.62',
          }}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title="Speed up your 50 STX transfer"
        kind="Same nonce, higher fee · built by Leather"
      />
      <ApprovalSection label="What changes">
        <ApprovalFeeRow
          label="Fee now"
          amount={<ExactAmount value="0.000400" symbol="STX" />}
          fiat={feeUnderOneCent}
          caption="Pending 25 min at nonce 41"
        />
        <ApprovalFeeRow
          label="New fee"
          amount={<ExactAmount value="0.002100" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="fast"
          caption="Fast"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Only this amount and the new fee can leave your account. The old fee is never charged.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Stays the same" divided>
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly, as before"
          amount={<ExactAmount value="50.000000" symbol="STX" />}
          fiat="$40.62"
        />
        <ApprovalRecipientRow address={<AddressDisplayer address={stxVaultRecipient} />} />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
        <ApprovalRow label="Nonce" value="41" caption="Same as the pending transfer" />
        <ApprovalDisclosureRow label="All details" caption="Raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const speedUpScenarios: Scenario[] = [
  {
    id: 'speed-up-bitcoin',
    family: 'bitcoin',
    label: 'Speed up a Bitcoin send',
    method: 'Speed up · replace-by-fee (BIP-125)',
    refs: ['#2587'],
    events: [
      viewed('speedUp', 'bitcoin_send', 'none'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'Speed up from the Sent screen opens this approval: the fee now and the new fee side by side, each with its rate, and a second block for what stays the same, so the amount and recipient read as unchanged. The footer total is the extra fee only, which comes out of your change; the replaced transaction is named in details and is dropped once the new one confirms. The new rate has to beat the old one by at least the network’s minimum bump. When replace-by-fee isn’t possible, for example a PSBT a site built with inputs that aren’t yours, the same button would offer a child-pays-for-parent: a second transaction that spends your change with a high enough fee to pull both through, shown as its own send with its own fee. It’s not eligible either once the send confirms. Today Leather has an Increase fee action in Activity for Bitcoin sends that opens its own form.',
    render() {
      return <SpeedUpBitcoinScreen />;
    },
  },
  {
    id: 'speed-up-stacks',
    family: 'transfer',
    label: 'Speed up a Stacks transfer',
    method: 'Speed up · same nonce, higher fee',
    refs: ['#2587'],
    events: [
      viewed('speedUp', 'transfer', 'none'),
      decided('approve', '3_to_10s'),
      resulted('broadcast'),
    ],
    note: 'On Stacks a pending transaction is replaced by signing the same one again at the same nonce with a higher fee, so the screen reads like the Bitcoin one: fee now and new fee, then what stays the same, with the nonce in details. Only one of the two can confirm, and a fee is charged only for the one that does, so the total counts the new fee once. If the pending transaction confirms first, this one fails at broadcast and Leather says so on the result screen. Today Leather offers Increase fee for pending Stacks transactions in Activity. Open question: the minimum bump the Stacks mempool accepts for a replacement.',
    render() {
      return <SpeedUpStacksScreen />;
    },
  },
];
