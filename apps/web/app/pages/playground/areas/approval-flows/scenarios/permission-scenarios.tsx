import { StxAvatarIcon } from '@leather.io/ui';

import { decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalGuarantee, ApprovalPermission } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import type { ApprovalRequester } from '../pattern/approval-types';
import { account1Stx, contracts, feeUnderOneCent, leatherApp, mainnet } from './fixtures';
import type { Scenario } from './scenario';

const fastPool: ApprovalRequester = {
  origin: 'https://fastpool.org',
  connection: 'connected',
};

const poolName = 'Fast Pool';
const signerName = contracts.signerManager.split('.')[1] ?? contracts.signerManager;

const stake = {
  amount: '5,000',
  fromCycle: '132',
  lastCycle: '143',
  endsIn: 'about 24 weeks',
  currentCycle: '133',
  currentCycleEnds: 'in about 8 days',
};

function DelegateScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Approve"
          reversibility="cycle-end"
          total={{
            label: 'Total spent',
            amount: <ExactAmount value="0.003000" symbol="STX" />,
            fiat: feeUnderOneCent,
          }}
          secondaryTotal={{
            label: 'Locked, stays in your account',
            amount: <ExactAmount value={`${stake.amount}.000000`} symbol="STX" />,
          }}
        />
      }
    >
      <ApprovalHeader requester={fastPool} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title={`Let ${poolName} stake ${stake.amount}\u00a0STX`}
        kind="Standing permission · PoX-5 staking, recognised by Leather"
      />
      <ApprovalSection label="What this lets Fast Pool do">
        <ApprovalRow label="Who" value={poolName} caption={`Signer ${signerName}`} />
        <ApprovalRow
          label="Up to"
          value={<ExactAmount value={`${stake.amount}.000000`} symbol="STX" />}
          caption="Set in this transaction"
        />
        <ApprovalRow
          label="Until"
          value={`End of cycle ${stake.lastCycle}`}
          caption={`${stake.endsIn} · no action needed each cycle`}
        />
        <ApprovalRow label="To end it" value="Unstake" caption="From Leather, at any cycle end" />
        <ApprovalPermission kind="cannot">
          It can’t move your STX, lock more or keep it past cycle 143
        </ApprovalPermission>
      </ApprovalSection>
      <ApprovalSection label="What moves" divided>
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You lock"
          qualifier="Exactly, for up to 12 cycles"
          amount={<ExactAmount value={`${stake.amount}.000000`} symbol="STX" />}
          fiat="$4,062.00"
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
          It must stake exactly {stake.amount} STX. If it stakes a different amount, it fails.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
        <ApprovalContractRow label="Contract" contractId={contracts.pox5} />
        <ApprovalRow label="Function" value={<ApprovalIdentifier>stake</ApprovalIdentifier>} />
        <ApprovalDisclosureRow label="All details" caption="Arguments, nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

function RevokeScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Stop staking"
          total={{
            label: 'Total spent',
            amount: <ExactAmount value="0.003000" symbol="STX" />,
            fiat: feeUnderOneCent,
          }}
          secondaryTotal={{
            label: `Unlocks after cycle ${stake.currentCycle}`,
            amount: <ExactAmount value={`${stake.amount}.000000`} symbol="STX" />,
          }}
        />
      }
    >
      <ApprovalHeader requester={leatherApp} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title={`Stop ${poolName} staking your STX`}
        kind="Ends a standing permission · PoX-5 staking"
      />
      <ApprovalSection label="The permission you’re ending">
        <ApprovalRow
          label="Who"
          value={poolName}
          caption={`Staking ${stake.amount} STX since cycle ${stake.fromCycle}`}
        />
        <ApprovalRow
          label="Was until"
          value={`End of cycle ${stake.lastCycle}`}
          caption="10 cycles left"
        />
        <ApprovalRow
          label="Now ends"
          value={`End of cycle ${stake.currentCycle}`}
          caption={`${stake.currentCycleEnds} · earns rewards until then`}
        />
        <ApprovalPermission kind="cannot">
          After that, Fast Pool can’t use your STX again without a new approval
        </ApprovalPermission>
      </ApprovalSection>
      <ApprovalSection label="What moves" divided>
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
      <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
        <ApprovalContractRow label="Contract" contractId={contracts.pox5} />
        <ApprovalRow label="Function" value={<ApprovalIdentifier>unstake</ApprovalIdentifier>} />
        <ApprovalDisclosureRow label="All details" caption="Arguments, nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const permissionScenarios: Scenario[] = [
  {
    id: 'permission-delegate-stx',
    family: 'contract-call',
    label: 'Let a pool stake your STX',
    method: 'stx_callContract · pox-5 stake with a pool’s signer (the PoX-5 form of delegate-stx)',
    refs: ['#2587', '#2710'],
    events: [
      viewed('stx_callContract', 'contract_call', 'note', true),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'A pool arrangement is a standing permission, so besides what moves, the screen answers four questions in one block: who can use your STX, up to how much, until when, and how to end it, plus one line on what the pool can’t do. In PoX-4 this was delegate-stx, often with allow-contract-caller: the pool could later lock up to the amount itself until a burn height, and you revoked with revoke-delegate-stx and disallow-contract-caller. PoX-5 (SIP-045) changes that: allow-contract-caller is superseded by the new staking post conditions, pooled and solo staking both go through a signer, and one stake registers you for all its cycles, so nothing locks your STX later without a transaction you sign. The screen models that PoX-5 stake, from the pool’s own site. Open questions: SIP-045 doesn’t say whether pox-5 keeps delegate-stx at all, and whether a pool’s own contract can extend or change a stake for you later without a new approval; the “can’t” line holds only if it can’t. Stake STX with a pool (under Stacks contract calls) is the same call read as a contract call, from Leather’s own staking page.',
    render() {
      return <DelegateScreen />;
    },
  },
  {
    id: 'permission-revoke',
    family: 'contract-call',
    label: 'End a pool’s permission',
    method: 'stx_callContract · pox-5 unstake · PoX post condition, must perform',
    refs: ['#2587', '#2659'],
    events: [
      viewed('stx_callContract', 'contract_call', 'none', true),
      decided('approve', '3_to_10s'),
      resulted('broadcast'),
    ],
    note: 'The revoke screen reads the permission back in the same rows it was granted with, then says what changes: the end moves from cycle 143 to the end of the current cycle, and rewards run until then. It starts from a staking permissions list in Leather, so ending an arrangement never depends on the pool’s site being up. In PoX-5 revoking is an unstake, which takes effect at the end of the cycle; in PoX-4 it was revoke-delegate-stx, which stopped new locks but left STX locked until the current lock expired, and a separate disallow-contract-caller. The Unstake STX screen, under Staking and sBTC, is the same call read from the staking page. Open question: whether Leather should also offer to clear PoX-4 permissions an account still has once PoX-5 is active.',
    render() {
      return <RevokeScreen />;
    },
  },
];
