import { AddressDisplayer, BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import {
  cautionShown,
  decided,
  frictionCompleted,
  resulted,
  viewed,
} from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { truncateMiddle } from '../pattern/approval-format';
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
import type { ApprovalAccount } from '../pattern/approval-types';
import {
  account1,
  account1Stx,
  btcSigner,
  contracts,
  feeUnderOneCent,
  leatherApp,
  mainnet,
} from './fixtures';
import type { Scenario } from './scenario';

const bondSigner: ApprovalAccount = {
  ...btcSigner,
  balance: { amount: '0.62480000', symbol: 'BTC', fiat: '$68,589.29' },
};

const bondLockAddress = 'bc1q36ls9n4py7q8j8nzyg3fdmy6frzt5sk5x69p45csrlhdkfp0lmjd6ccfa9';

const bond = {
  startBlock: '972,650',
  startCycle: '146',
  unlockBlock: '996,800',
  unlockDate: 'about 6 April 2027',
  endCycle: '158',
  endDate: 'about 13 April 2027',
  stxLocked: '3,400',
  stxMinimum: '3,378',
};

const stakingPostConditionNote =
  'In Strict mode the chain refuses any staking change the post conditions don’t list, so this line is what lets the call work at all.';

function BondLockScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Lock"
          confirmation={{
            mode: 'acknowledge',
            statement: 'I understand it stays locked until April 2027',
          }}
          total={{
            amount: <ExactAmount value="0.50001540" symbol="BTC" />,
            fiat: '$54,890.69',
          }}
          secondaryTotal={{
            label: 'Locked, stays under your key',
            amount: <ExactAmount value="0.50000000" symbol="BTC" />,
          }}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={bondSigner} network={mainnet} />
      <ApprovalIntent
        title="Lock 0.5 BTC in a staking bond"
        kind="Bitcoin transfer · PoX-5 bond, step 1 of 2"
      />
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You lock"
          qualifier={`Exactly, until block ${bond.unlockBlock}`}
          amount={<ExactAmount value="0.50000000" symbol="BTC" />}
          fiat="$54,889.00"
        />
        <ApprovalRecipientRow
          label="Into your bond"
          address={<AddressDisplayer address={bondLockAddress} />}
          caption="Rebuilt by Leather from the bond’s terms"
        />
        <ApprovalFeeRow
          amount={<ExactAmount value="0.00001540" symbol="BTC" />}
          fiat="$1.69"
          speed="standard"
          caption="7 sat/vB · about 30 min"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="final">
          Your signature covers every input and output. If anything changes, it no longer counts.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalNote>
        Next, register the bond on Stacks and lock at least {bond.stxMinimum} STX before block{' '}
        {bond.startBlock}, in about 3 weeks. If it isn’t registered in time, this BTC stays locked
        until block {bond.unlockBlock} and earns nothing.
      </ApprovalNote>
      <ApprovalSection label="Ways out" divided>
        <ApprovalRow
          stacked
          label={`From block ${bond.unlockBlock} · ${bond.unlockDate}`}
          value="Your key alone"
        />
        <ApprovalRow
          stacked
          label="Before then · early exit"
          value="Your key plus the bond’s exit co-signer"
          caption="Only after you announce the exit on Stacks, and the rest of the rewards are lost"
        />
      </ApprovalSection>
      <ApprovalSection label="Bond" divided>
        <ApprovalCheck
          title="Lock address matches this bond"
          caption="Leather rebuilt it from your Stacks address, the unlock block and the bond’s exit script"
        />
        <ApprovalRow
          label="Tied to"
          value="Account 1 on Stacks"
          caption={`${truncateMiddle(account1.address, 4)} · only this address can register it`}
        />
        <ApprovalRow
          label="Rewards"
          value="Weekly, in sBTC"
          caption="Target 3% a year, not guaranteed"
        />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Lock script, raw transaction">
        <ApprovalDisclosureRow
          label="All details"
          caption="Lock script, exit script, raw transaction"
        />
      </ApprovalSection>
    </ApprovalShell>
  );
}

function BondRegisterScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Register"
          total={{
            label: 'Total spent',
            amount: <ExactAmount value="0.003000" symbol="STX" />,
            fiat: feeUnderOneCent,
          }}
          secondaryTotal={{
            label: 'Locked, stays in your account',
            amount: <ExactAmount value="3,400.000000" symbol="STX" />,
          }}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title={`Register your bond and lock ${bond.stxLocked}\u00a0STX`}
        kind="Contract call · PoX-5 bond, step 2 of 2"
      />
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You lock"
          qualifier="Exactly, until the bond ends"
          amount={<ExactAmount value="3,400.000000" symbol="STX" />}
          fiat="$2,762.16"
        />
        <ApprovalFeeRow
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Only the fee can leave your account. If anything else moves, the transaction fails.
        </ApprovalGuarantee>
        <ApprovalGuarantee kind="staking">
          It must stake exactly {bond.stxLocked} STX. If it stakes a different amount, it fails.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Bitcoin lock" divided>
        <ApprovalCheck
          title="0.5 BTC lock found on Bitcoin"
          caption={`6 confirmations · ${truncateMiddle(bondLockAddress, 4)} · unlocks at block ${bond.unlockBlock}`}
        />
      </ApprovalSection>
      <ApprovalSection label="Bond" divided>
        <ApprovalRow
          label="Starts"
          value={`Block ${bond.startBlock}`}
          caption={`Cycle ${bond.startCycle} · in about 3 weeks`}
        />
        <ApprovalRow
          label="STX unlocks"
          value={`Cycle ${bond.endCycle}`}
          caption="About 13 April 2027"
        />
        <ApprovalRow
          label="Minimum STX"
          value={<ExactAmount value={`${bond.stxMinimum}.000000`} symbol="STX" />}
          caption="5% of the BTC’s value"
        />
        <ApprovalRow label="Signer" value="Fast Pool" caption="fast-pool-signer-v1" />
        <ApprovalRow
          label="Rewards"
          value="Weekly, in sBTC"
          caption="Target 3% a year, on the BTC only"
        />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
        <ApprovalContractRow label="Contract" contractId={contracts.pox5} />
        <ApprovalRow
          label="Function"
          value={<ApprovalIdentifier>register-for-bond</ApprovalIdentifier>}
        />
        <ApprovalDisclosureRow
          label="All details"
          caption="Arguments, lock proof, nonce, raw transaction"
        />
      </ApprovalSection>
    </ApprovalShell>
  );
}

function UnstakeScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Unstake"
          total={{
            label: 'Total spent',
            amount: <ExactAmount value="0.003000" symbol="STX" />,
            fiat: feeUnderOneCent,
          }}
          secondaryTotal={{
            label: 'Unlocks after cycle 144',
            amount: <ExactAmount value="5,000.000000" symbol="STX" />,
          }}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title={'Unstake 5,000\u00a0STX'}
        kind="Contract call · PoX-5 staking, recognised by Leather"
      />
      <ApprovalSection label="What moves">
        <ApprovalFeeRow
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Only the fee can leave your account. If anything else moves, the transaction fails.
        </ApprovalGuarantee>
        <ApprovalGuarantee kind="staking">
          Required: this call has to change your staking. If it doesn’t, it fails.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Staking" divided>
        <ApprovalRow
          label="Staked now"
          value={<ExactAmount value="5,000.000000" symbol="STX" />}
          caption="With Fast Pool · read from your stake"
        />
        <ApprovalRow
          label="Unlocks"
          value="End of cycle 144"
          caption="In about 8 days · earns rewards until then"
        />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
        <ApprovalContractRow label="Contract" contractId={contracts.pox5} />
        <ApprovalRow label="Function" value={<ApprovalIdentifier>unstake</ApprovalIdentifier>} />
        <ApprovalDisclosureRow label="All details" caption="Arguments, nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

function AnnounceExitScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Announce"
          reversibility="permanent"
          confirmation={{
            mode: 'acknowledge',
            statement: 'I understand the rest of the rewards are lost',
          }}
          total={{
            label: 'Total spent',
            amount: <ExactAmount value="0.003000" symbol="STX" />,
            fiat: feeUnderOneCent,
          }}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title="Announce an early exit from your bond"
        kind="Contract call · PoX-5 bond, step 1 of 2 of leaving early"
      />
      <ApprovalCaution title="Rewards stop, and this can’t be undone" source="PoX-5 bond rules">
        Once announced, the rest of this bond’s BTC rewards are lost. Your {bond.stxLocked} STX
        stays locked until the bond ends.
      </ApprovalCaution>
      <ApprovalSection label="What moves">
        <ApprovalFeeRow
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Only the fee can leave your account. If anything else moves, the transaction fails.
        </ApprovalGuarantee>
        <ApprovalGuarantee kind="staking">
          Required: this call has to change your staking. If it doesn’t, it fails.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="After this" divided>
        <ApprovalRow label="BTC rewards" value="Stop now" caption="For the rest of this bond" />
        <ApprovalRow
          stacked
          label="Your 0.5 BTC"
          value="Can leave early"
          caption="Next, sign the Bitcoin exit. The exit co-signer signs once it sees this announcement."
        />
        <ApprovalRow
          label={`Your ${bond.stxLocked} STX`}
          value="Stays locked"
          caption={`Until cycle ${bond.endCycle}, ${bond.endDate}`}
        />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
        <ApprovalContractRow label="Contract" contractId={contracts.pox5} />
        <ApprovalRow
          label="Function"
          value={<ApprovalIdentifier>announce-l1-early-exit</ApprovalIdentifier>}
        />
        <ApprovalDisclosureRow label="All details" caption="Arguments, nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const stakingScenarios: Scenario[] = [
  {
    id: 'stake-bond-entry',
    family: 'bitcoin',
    label: 'Lock BTC in a staking bond',
    method: 'sendTransfer · to a PoX-5 bond lock address (P2WSH)',
    refs: ['#2648', '#2587'],
    note: 'The Bitcoin half of a PoX-5 bond (SIP-045): your BTC moves into a special address that only your own key can spend, and only after an unlock block about 6 months out. The address is worked out from your Stacks address, the unlock block and the bond’s exit script, so Leather can rebuild it and confirm it before showing this framing; that needs the app to send those terms with the request. There are two ways out: wait for the unlock block and spend with your key alone, or exit early with the bond’s exit co-signer, after announcing it on Stacks, which gives up the rest of the rewards. The early path also reveals a value worked out from your Stacks address, which is what ties the bond to it; it is not a secret you have to keep. Rewards default to weekly sBTC (target 3% a year at launch, not guaranteed). Open questions: exactly where the weekly rewards land for a native BTC bond, and what the exit co-signer is (the SIP says a signer set, the developer docs a single service). Block heights, dates and the STX minimum are example values.',
    render() {
      return <BondLockScreen />;
    },
  },
  {
    id: 'stake-bond-register',
    family: 'contract-call',
    label: 'Register the bond on Stacks',
    method: 'stx_callContract · pox-5 register-for-bond · deny mode · staking post condition',
    refs: ['#2587'],
    note: `The Stacks half of the same bond: one call proves the Bitcoin lock to the contract and locks STX for the whole bond, at least the bond’s minimum ratio (5% of the BTC’s value at launch). Leather can check the lock proof against what it saw on Bitcoin, so the screen confirms the lock instead of showing a proof blob. Locking STX is not a transfer, so a normal post condition can’t describe it; the new staking post condition (SIP-045, type 0x03) can, and it becomes its own guarantee line with its own label. ${stakingPostConditionNote} The registration must land before the bond starts and outside the few blocks at the end of each cycle when staking changes are refused.`,
    render() {
      return <BondRegisterScreen />;
    },
  },
  {
    id: 'stake-unstake',
    family: 'contract-call',
    label: 'Unstake STX',
    method: 'stx_callContract · pox-5 unstake · deny mode · PoX post condition, must perform',
    refs: ['#2587', '#2659', '#2326'],
    note: `An unstake moves no assets: the STX stays in your account and unlocks when the current cycle ends. Today this would read as “only fees will be transferred”, which hides the one thing the call does. The new PoX post condition (SIP-045, type 0x04) says whether the account must not, may, or must perform a staking action, so here it becomes a Staking action line saying the call has to change your staking. ${stakingPostConditionNote} The staked amount and unlock timing are read from your stake, not promised by the chain. An unstake sent in the last blocks of a cycle is refused by the contract, the kind of failure a dry run catches before the fee is spent.`,
    render() {
      return <UnstakeScreen />;
    },
  },
  {
    id: 'stake-announce-exit',
    family: 'contract-call',
    label: 'Announce an early bond exit',
    method:
      'stx_callContract · pox-5 announce-l1-early-exit · deny mode · PoX post condition, must perform',
    refs: ['#2648', '#2587'],
    events: [
      viewed('stx_callContract', 'contract_call', 'caution', true),
      cautionShown('staking_rules'),
      frictionCompleted('acknowledge'),
      decided('approve', '30_to_120s'),
      resulted('broadcast'),
    ],
    note: `Leaving a bond early starts on Stacks: this call tells the contract you’re leaving, and only then will the exit co-signer sign the Bitcoin spend, which is the second step. Like an unstake it moves no assets, so the PoX post condition carries the meaning. Because it can’t be undone and gives up the rest of the bond’s rewards, it gets a caution and an acknowledgement, while the STX stays locked until the bond ends. ${stakingPostConditionNote}`,
    render() {
      return <AnnounceExitScreen />;
    },
  },
];
