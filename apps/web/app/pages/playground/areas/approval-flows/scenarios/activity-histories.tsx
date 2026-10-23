import {
  AddressDisplayer,
  BtcAvatarIcon,
  LockIcon,
  SbtcAvatarIcon,
  StxAvatarIcon,
} from '@leather.io/ui';

import { whatMovedLabel, whatMovesLabel } from '../pattern/approval-direction';
import { displayOrigin, truncateMiddle } from '../pattern/approval-format';
import {
  ApprovalHistoryAction,
  ApprovalHistoryActions,
  ApprovalHistoryDetails,
  ApprovalHistoryHeader,
  ApprovalHistoryShell,
  ApprovalHistoryStatus,
} from '../pattern/approval-history';
import { AccountAvatar } from '../pattern/approval-identity';
import { ApprovalGuarantee } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalSection } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import { ApprovalSourceCheck } from '../pattern/approval-source';
import type { ApprovalAccount } from '../pattern/approval-types';
import { depositAddress } from './bitcoin-parts';
import {
  account1,
  bitflow,
  btcAccount1,
  contracts,
  explorer,
  feeUnderOneCent,
  gamma,
  leatherApp,
  mainnet,
  sbtcBridge,
  stxRecipient,
  stxVaultRecipient,
  vaultMember2,
  vaultMember3,
  vaultRequiredSignatures,
  vaultYou,
} from './fixtures';

const btcAccount: ApprovalAccount = { ...account1, address: btcAccount1.nativeSegwit };

const vaultHistoryAccount: ApprovalAccount = {
  ...account1,
  vault: {
    name: 'Team Treasury',
    threshold: '2 of 3',
    address: 'SM2Z7N4VJ1Q4F6Y2HX9QZD6N8W0KXB3T5R7M4J9PA',
  },
};

const historyTxids = {
  transfer: '0xb14d0f1f4e1b52f3a1bb1b0d53d9d63d2c4dcd3e3b9e17c6d1f3a2ab0cd76e09d',
  swap: '0x5fdf1a9c7b2e4d6f8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0c791e',
  psbt: '7f3b1c2d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00',
  segwit: 'c4e1a0b29f73d58e6a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6071',
  deposit: 'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff11',
  stake: '0x2c9a4b7d1e3f5a6b8c0d2e4f6a8b0c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f0a2b',
  vault: '0x3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a',
  failed: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
};

const stakeTitle = 'Staked 5,000\u00a0STX with Fast Pool';

const vaultTitle = 'Sent 1,500\u00a0STX from Team Treasury';

export function TransferStxHistory() {
  const date = '29 Sep 2026, 14:12';
  return (
    <ApprovalHistoryShell state="confirmed">
      <ApprovalHistoryHeader account={account1} />
      <ApprovalHistoryStatus title="Sent 1,234,999 STX" date={date} requester={explorer} />
      <ApprovalSection label={whatMovedLabel}>
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You sent"
          amount={<ExactAmount value="1,234,999.000000" symbol="STX" />}
          fiat="$1,003,313.19"
          direction="out"
        />
        <ApprovalRecipientRow
          address={<AddressDisplayer address={stxRecipient} />}
          caption="Memo: invoice 0042"
        />
        <ApprovalFeeRow
          label="Fee paid"
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
        />
        <ApprovalGuarantee kind="strict">
          Only this amount and the fee left your account, as the post conditions required.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Stacks"
        network={mainnet}
        date={date}
        nonce="512"
        block="9,009,544"
        txid={historyTxids.transfer}
      />
    </ApprovalHistoryShell>
  );
}

export function SwapHistory() {
  const date = '27 Sep 2026, 09:41';
  return (
    <ApprovalHistoryShell state="confirmed">
      <ApprovalHistoryHeader account={account1} />
      <ApprovalHistoryStatus title="Swapped 1,000 STX for sBTC" date={date} requester={bitflow} />
      <ApprovalSection label={whatMovedLabel}>
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You sent"
          amount={<ExactAmount value="1,000.000000" symbol="STX" />}
          fiat="$812.40"
          direction="out"
        />
        <ApprovalAssetRow
          icon={<SbtcAvatarIcon size="md" />}
          label="You received"
          qualifier="Your minimum was 0.00735 sBTC"
          amount={<ExactAmount value="0.00741000" symbol="sBTC" />}
          fiat="$813.46"
          direction="in"
        />
        <ApprovalFeeRow
          label="Fee paid"
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
        />
        <ApprovalGuarantee kind="strict">
          Everything that moved was on the approval, and the contract sent more than your minimum.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Stacks"
        network={mainnet}
        date={date}
        nonce="42"
        block="9,016,598"
        txid={historyTxids.swap}
      >
        <ApprovalRow label="Protocol" value="Bitflow" />
        <ApprovalContractRow label="Contract" contractId={contracts.bitflowSwap} />
        <ApprovalRow
          label="Function"
          value={<ApprovalIdentifier>swap-helper-a</ApprovalIdentifier>}
        />
      </ApprovalHistoryDetails>
    </ApprovalHistoryShell>
  );
}

export function MarketplacePsbtHistory() {
  const date = '28 Sep 2026, 18:05';
  return (
    <ApprovalHistoryShell state="confirmed">
      <ApprovalHistoryHeader account={btcAccount} />
      <ApprovalHistoryStatus
        title="Signed a spend of 0.0211 BTC"
        date={date}
        requester={gamma}
        note={`Broadcast by ${displayOrigin(gamma.origin)} after you signed.`}
      />
      <ApprovalSection label={whatMovedLabel}>
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You sent"
          qualifier={`Native SegWit · ${truncateMiddle(btcAccount1.nativeSegwit, 4)}`}
          amount={<ExactAmount value="0.02110000" symbol="BTC" />}
          fiat="$2,316.32"
          direction="out"
        />
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You received"
          qualifier={`Taproot · ${truncateMiddle(btcAccount1.taproot, 4)}`}
          amount={<ExactAmount value="0.00010000" symbol="BTC" />}
          fiat="$10.98"
          direction="in"
        />
        <ApprovalFeeRow
          label="Fee paid"
          amount={<ExactAmount value="0.00010000" symbol="BTC" />}
          fiat="$10.98"
          icon={<LockIcon variant="small" color="ink.text-subdued" />}
          caption={['19 sat/vB · part of You sent', 'Set by gamma.io']}
        />
        <ApprovalGuarantee kind="final">
          Your signature covered every input and output, and it went out as signed.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Bitcoin"
        network={mainnet}
        date={date}
        block="872,311"
        txid={historyTxids.psbt}
      />
    </ApprovalHistoryShell>
  );
}

export function SegwitSendHistory() {
  const date = '29 Sep 2026, 14:02';
  return (
    <ApprovalHistoryShell state="pending">
      <ApprovalHistoryHeader account={btcAccount} />
      <ApprovalHistoryStatus
        title="Sending 0.003 BTC"
        date={date}
        requester={sbtcBridge}
        actions={
          <ApprovalHistoryActions>
            <ApprovalHistoryAction label="Increase fee" />
            <ApprovalHistoryAction label="Cancel" />
          </ApprovalHistoryActions>
        }
      />
      <ApprovalSection label={whatMovesLabel}>
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly"
          amount={<ExactAmount value="0.00300000" symbol="BTC" />}
          fiat="$329.33"
          direction="out"
        />
        <ApprovalRecipientRow address={<AddressDisplayer address={depositAddress} />} />
        <ApprovalRow
          label="Paid from"
          value="Native SegWit"
          caption={`${truncateMiddle(btcAccount1.nativeSegwit, 4)} · change returns here`}
        />
        <ApprovalFeeRow
          label="Fee"
          amount={<ExactAmount value="0.00000765" symbol="BTC" />}
          fiat="$0.84"
          speed="standard"
          caption="5 sat/vB · about 30 min"
        />
        <ApprovalGuarantee kind="final">
          Your signature covers every input and output. If anything changes, it no longer counts.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Bitcoin"
        network={mainnet}
        date={date}
        txid={historyTxids.segwit}
      />
    </ApprovalHistoryShell>
  );
}

export function SbtcDepositHistory() {
  const date = '29 Sep 2026, 13:40';
  return (
    <ApprovalHistoryShell state="pending">
      <ApprovalHistoryHeader account={btcAccount} />
      <ApprovalHistoryStatus
        title="Bridging 0.01 BTC to sBTC"
        date={date}
        requester={sbtcBridge}
        statusLabel="Pending mint"
        note="The BTC is confirmed on Bitcoin. sBTC is minted to Account 1 after 1 to 2 more blocks."
      />
      <ApprovalSection label={whatMovesLabel}>
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You sent"
          qualifier="On Bitcoin, confirmed"
          amount={<ExactAmount value="0.01000000" symbol="BTC" />}
          fiat="$1,097.78"
          direction="out"
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
          label="Fee paid"
          amount={<ExactAmount value="0.00000765" symbol="BTC" />}
          fiat="$0.84"
          speed="standard"
          caption="5 sat/vB"
        />
      </ApprovalSection>
      <ApprovalSection label="Bridge" divided>
        <ApprovalRow
          label="Arrives"
          value="In about 20 minutes"
          caption="After 1 to 2 more blocks"
        />
        <ApprovalRow
          label="Signer fee"
          value={
            <>
              Up to <ExactAmount value="0.00004000" symbol="BTC" />
            </>
          }
          caption="Taken from the sBTC minted"
        />
        <ApprovalRow
          label="If it isn’t processed"
          value="You can reclaim it"
          caption="After 950 blocks, about 6.6 days"
        />
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Bitcoin"
        network={mainnet}
        date={date}
        block="872,390"
        txid={historyTxids.deposit}
      />
    </ApprovalHistoryShell>
  );
}

export function StakeHistory() {
  const date = '22 Sep 2026, 11:30';
  return (
    <ApprovalHistoryShell state="confirmed">
      <ApprovalHistoryHeader account={account1} />
      <ApprovalHistoryStatus title={stakeTitle} date={date} requester={leatherApp} />
      <ApprovalSection label={whatMovedLabel}>
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You locked"
          qualifier="For up to 12 cycles, from cycle 132"
          amount={<ExactAmount value="5,000.000000" symbol="STX" />}
          fiat="$4,062.00"
        />
        <ApprovalFeeRow
          label="Fee paid"
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
        />
        <ApprovalGuarantee kind="strict">
          Only the fee left your account. The STX stays in it, locked.
        </ApprovalGuarantee>
        <ApprovalGuarantee kind="staking">
          It staked exactly 5,000 STX, as the staking post condition required.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Staking" divided>
        <ApprovalRow
          label="Pool"
          value="Fast Pool"
          caption={contracts.signerManager.split('.')[1]}
        />
        <ApprovalRow
          label="Staked for"
          value="Up to 12 cycles"
          caption="From cycle 132 · unstake at any cycle end"
        />
        <ApprovalRow label="Rewards" value="Paid in sBTC" caption="Claimable each cycle" />
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Stacks"
        network={mainnet}
        date={date}
        nonce="43"
        block="9,001,207"
        txid={historyTxids.stake}
      >
        <ApprovalContractRow label="Contract" contractId={contracts.pox5} />
        <ApprovalRow label="Function" value={<ApprovalIdentifier>stake</ApprovalIdentifier>} />
      </ApprovalHistoryDetails>
    </ApprovalHistoryShell>
  );
}

export function VaultCosignHistory() {
  const date = '29 Sep 2026, 10:18';
  return (
    <ApprovalHistoryShell state="confirmed">
      <ApprovalHistoryHeader account={vaultHistoryAccount} />
      <ApprovalHistoryStatus
        title={vaultTitle}
        date={date}
        requester={leatherApp}
        note={`Proposed by Member 2, signed by you, then broadcast from ${displayOrigin(leatherApp.origin)}.`}
      />
      <ApprovalSection label={whatMovedLabel}>
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="Left the vault"
          amount={<ExactAmount value="1,500.000000" symbol="STX" />}
          fiat="$1,218.60"
          direction="out"
        />
        <ApprovalRecipientRow address={<AddressDisplayer address={stxVaultRecipient} />} />
        <ApprovalFeeRow
          label="Fee paid"
          amount={<ExactAmount value="0.004200" symbol="STX" />}
          fiat={feeUnderOneCent}
          caption="Set by the proposer · paid by the vault"
        />
        <ApprovalGuarantee kind="strict">
          Only this amount and the fee left the vault.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Signers" divided>
        <ApprovalSigners
          required={vaultRequiredSignatures}
          signers={[
            { ...vaultMember2, status: 'signed', detail: 'proposed it' },
            { ...vaultYou, status: 'signed' },
            { ...vaultMember3, status: 'not-needed' },
          ]}
          caption={`2 of 2 reached, then ${displayOrigin(leatherApp.origin)} broadcast it.`}
        />
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Stacks"
        network={mainnet}
        date={date}
        nonce="7"
        block="9,018,044"
        txid={historyTxids.vault}
      />
    </ApprovalHistoryShell>
  );
}

export function FailedSwapHistory() {
  const date = '29 Sep 2026, 12:55';
  return (
    <ApprovalHistoryShell state="failed">
      <ApprovalHistoryHeader account={account1} />
      <ApprovalHistoryStatus
        title="Failed to swap 1,000 STX for sBTC"
        date={date}
        requester={bitflow}
        note="The pool offered 0.00712 sBTC, less than your 0.00735 sBTC minimum, so the call stopped. Only the fee was spent."
      />
      <ApprovalSection label={whatMovedLabel}>
        <ApprovalFeeRow
          label="Fee paid"
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Charged even though the swap failed"
        />
        <ApprovalGuarantee kind="strict">
          Your minimum didn’t hold, so the swap stopped and nothing else left your account.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Dry run" divided>
        <ApprovalSourceCheck
          status="caution"
          title="Leather’s dry run warned about this"
          caption="At block 969,412, before you approved. You confirmed the fee is paid even if it fails."
        />
      </ApprovalSection>
      <ApprovalHistoryDetails
        chain="Stacks"
        network={mainnet}
        date={date}
        nonce="44"
        block="9,018,310"
        txid={historyTxids.failed}
      >
        <ApprovalRow label="Protocol" value="Bitflow" />
        <ApprovalContractRow label="Contract" contractId={contracts.bitflowSwap} />
        <ApprovalRow
          label="Function"
          value={<ApprovalIdentifier>swap-helper-a</ApprovalIdentifier>}
        />
      </ApprovalHistoryDetails>
    </ApprovalHistoryShell>
  );
}
