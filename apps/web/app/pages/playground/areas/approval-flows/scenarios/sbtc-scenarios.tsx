import { AddressDisplayer, BtcAvatarIcon, SbtcAvatarIcon } from '@leather.io/ui';

import { decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { AccountAvatar } from '../pattern/approval-identity';
import { ApprovalGuarantee } from '../pattern/approval-notices';
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
import { SbtcDepositHistory } from './activity-histories';
import { depositAddress } from './bitcoin-parts';
import {
  account1,
  account1Sbtc,
  btcAccount1,
  btcSigner,
  contracts,
  feeUnderOneCent,
  mainnet,
  sbtcBridge,
} from './fixtures';
import type { Scenario } from './scenario';

export const sbtcScenarios: Scenario[] = [
  {
    id: 'sbtc-deposit',
    family: 'bitcoin',
    label: 'Bridge BTC to sBTC',
    method: 'sendTransfer · to an sBTC deposit address (P2TR), scripts sent with it',
    refs: ['#2719', '#2738'],
    events: [
      viewed('sendTransfer', 'bitcoin_send', 'note'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'A deposit read as a bridge instead of a plain send: what leaves on Bitcoin, what arrives on Stacks, and the Stacks account it arrives at, marked as yours. The deposit address is a Taproot address with two scripts inside: one lets the sBTC signers take the BTC and mint sBTC to a Stacks address, with a maximum fee they may keep; the other lets you take it back if they never do. Leather can only read those details if the app sends both scripts with the request; Leather then rebuilds the address, checks it matches, and reads the Stacks address and maximum fee out of the deposit script. Numbers follow the Stacks docs: minting usually takes 1 to 2 Bitcoin blocks, the default reclaim wait is 950 blocks, and the minimum deposit is 0.001 BTC. The 0.00004 BTC signer fee is an example value; the library default is 0.0008 BTC. Reclaiming needs a transaction from you, which Leather would need to offer. Today the same request shows as a send to an unknown address.',
    history() {
      return <SbtcDepositHistory />;
    },
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Deposit"
              total={{
                amount: <ExactAmount value="0.01000765" symbol="BTC" />,
                fiat: '$1,098.62',
              }}
            />
          }
        >
          <ApprovalHeader requester={sbtcBridge} account={btcSigner} network={mainnet} />
          <ApprovalIntent
            title="Bridge 0.01 BTC to sBTC"
            kind="sBTC deposit · built by Leather, checked against the deposit script"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly, on Bitcoin"
              amount={<ExactAmount value="0.01000000" symbol="BTC" />}
              fiat="$1,097.78"
            />
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You receive"
              qualifier="At least, on Stacks, after the signer fee"
              amount={<ExactAmount value="0.00996000" symbol="sBTC" />}
              fiat="$1,093.39"
              direction="in"
            />
            <ApprovalRecipientRow
              label="Minted to"
              address="Account 1"
              avatar={<AccountAvatar account={account1} size="md" />}
              caption={`${truncateMiddle(account1.address, 4)} · yours, from the deposit script`}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00000765" symbol="BTC" />}
              fiat="$0.84"
              speed="standard"
              caption="5 sat/vB · about 30 min"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="final">
              Your signature covers every input and output. If anything changes, it no longer
              counts.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Bridge" divided>
            <ApprovalRow
              label="Arrives"
              value="In about 20 minutes"
              caption="After 1 to 2 Bitcoin blocks"
            />
            <ApprovalRow
              label="Signer fee"
              value={
                <>
                  Up to <ExactAmount value="0.00004000" symbol="BTC" />
                </>
              }
              caption="Set by the app · taken from the sBTC minted"
            />
            <ApprovalRow
              label="If it isn’t processed"
              value="You can reclaim it"
              caption="After 950 blocks, about 6.6 days"
            />
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Deposit address, scripts">
            <ApprovalRow
              label="Deposit address"
              value={<ApprovalIdentifier>{truncateMiddle(depositAddress, 6)}</ApprovalIdentifier>}
              caption="Rebuilt by Leather from the two scripts"
            />
            <ApprovalDisclosureRow
              label="All details"
              caption="Deposit script, reclaim script, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sbtc-withdraw',
    family: 'contract-call',
    label: 'Withdraw sBTC to Bitcoin',
    method: 'stx_callContract · sbtc-withdrawal initiate-withdrawal-request · deny mode',
    refs: ['#2587'],
    note: 'A withdrawal is a Stacks contract call that holds your sBTC plus a maximum Bitcoin fee; the sBTC signers then pay the BTC out on Bitcoin. The call names the Bitcoin address as a small tuple (an address type byte and 20 or 32 bytes), so Leather decodes it back into an address, says which type it is, and tags it as yours when it matches one of your accounts. You receive is not a post condition: the chain only guarantees what leaves your account, and the BTC is paid by the signers. Numbers follow the Stacks docs: payout waits for 6 Bitcoin blocks, the unused part of the maximum fee comes back as sBTC, and a rejected request returns the held sBTC. The 0.00003 BTC maximum fee is the docs’ example value. Today this shows as a generic contract call with the tuple as raw bytes.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Withdraw"
              total={{
                amount: [
                  <ExactAmount key="sbtc" value="0.01003000" symbol="sBTC" />,
                  <ExactAmount key="stx" value="0.003000" symbol="STX" />,
                ],
                fiat: '$1,101.07',
              }}
            />
          }
        >
          <ApprovalHeader requester={sbtcBridge} account={account1Sbtc} network={mainnet} />
          <ApprovalIntent
            title="Withdraw 0.01 sBTC to Bitcoin"
            kind="Contract call · sBTC withdrawal, recognised by Leather"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly, 0.01 plus up to 0.00003 for the Bitcoin fee"
              amount={<ExactAmount value="0.01003000" symbol="sBTC" />}
              fiat="$1,101.07"
            />
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="You receive"
              qualifier="On Bitcoin, paid by the sBTC signers"
              amount={<ExactAmount value="0.01000000" symbol="BTC" />}
              fiat="$1,097.78"
              direction="in"
            />
            <ApprovalRecipientRow
              address={<AddressDisplayer address={btcAccount1.nativeSegwit} />}
              caption={[
                'Yours · Account 1, Native SegWit',
                'Decoded from the address the app sent',
              ]}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Only this sBTC and the fee can leave your account. If anything else moves, the
              transaction fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Withdrawal" divided>
            <ApprovalRow
              label="Arrives"
              value="In about an hour"
              caption="After 6 Bitcoin blocks"
            />
            <ApprovalRow
              label="Bitcoin fee"
              value={
                <>
                  Up to <ExactAmount value="0.00003000" symbol="BTC" />
                </>
              }
              caption="Held with the amount · what isn’t used comes back as sBTC"
            />
            <ApprovalRow
              label="If it’s rejected"
              value="Your sBTC comes back"
              caption="The held 0.01003 sBTC is released"
            />
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Contract, function, recipient, nonce"
          >
            <ApprovalContractRow label="Contract" contractId={contracts.sbtcWithdrawal} />
            <ApprovalRow
              label="Function"
              value={<ApprovalIdentifier>initiate-withdrawal-request</ApprovalIdentifier>}
            />
            <ApprovalRow
              label="Recipient"
              value={<ApprovalIdentifier>version 0x04 · 20 bytes</ApprovalIdentifier>}
              caption="P2WPKH, shown as Native SegWit"
            />
            <ApprovalDisclosureRow
              label="All details"
              caption="Arguments, nonce, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
