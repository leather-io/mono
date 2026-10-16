import { styled } from 'leather-styles/jsx';

import { SbtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import {
  cautionShown,
  decided,
  frictionCompleted,
  resulted,
  viewed,
} from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalCaution, ApprovalGuarantee } from '../pattern/approval-notices';
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
import { ApprovalSourceCheck } from '../pattern/approval-source';
import { FailedSwapHistory } from './activity-histories';
import {
  account1Stx,
  bitflow,
  contracts,
  dryRunSource,
  feeUnderOneCent,
  mainnet,
} from './fixtures';
import type { Scenario } from './scenario';

type SwapDryRun = 'estimated' | 'likely-fail' | 'unavailable';

const dryRunBlock = '969,412';

interface SimulatedSwapProps {
  dryRun: SwapDryRun;
}

function DryRunCheck({ dryRun }: SimulatedSwapProps) {
  if (dryRun === 'estimated') {
    return (
      <ApprovalSourceCheck
        status="clear"
        title="The swap goes through"
        caption={`Played against block ${dryRunBlock} without broadcasting. The result can change by the time it’s mined.`}
      />
    );
  }
  if (dryRun === 'likely-fail') {
    return (
      <ApprovalSourceCheck
        status="caution"
        title="The swap stops at your minimum"
        caption="Cancel and ask the app for a new quote, or approve to try anyway."
      />
    );
  }
  return (
    <ApprovalSourceCheck
      status="neutral"
      title="No dry run for this call"
      caption="The dry-run service didn’t answer, so there’s no estimate. The limits above still hold."
    />
  );
}

function SimulatedSwap({ dryRun }: SimulatedSwapProps) {
  const isLikelyFail = dryRun === 'likely-fail';
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Approve"
          confirmation={
            isLikelyFail
              ? { mode: 'acknowledge', statement: 'I understand the fee is paid even if it fails' }
              : undefined
          }
          total={{
            amount: <ExactAmount value="1,000.003000" symbol="STX" />,
            fiat: '$812.40',
          }}
          hint={
            isLikelyFail && (
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                If it fails, only the <ExactAmount value="0.003000" symbol="STX" /> fee is spent.
              </styled.p>
            )
          }
        />
      }
    >
      <ApprovalHeader requester={bitflow} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title="Swap 1,000 STX for sBTC"
        kind="Contract call · Bitflow swap, recognised by Leather"
      />
      {isLikelyFail && (
        <ApprovalCaution
          title="This swap is likely to fail"
          source={`${dryRunSource} at block ${dryRunBlock}`}
        >
          The pool would send 0.00712 sBTC, less than the 0.00735 sBTC minimum this swap allows, so
          the call would stop. A failed call is still recorded on Stacks and still charges the fee.
        </ApprovalCaution>
      )}
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly"
          amount={<ExactAmount value="1,000.000000" symbol="STX" />}
          fiat="$812.40"
        />
        <ApprovalAssetRow
          icon={<SbtcAvatarIcon size="md" />}
          label="You receive"
          qualifier="At least"
          amount={<ExactAmount value="0.00735000" symbol="sBTC" />}
          fiat="$806.87"
          direction="in"
        />
        {dryRun === 'estimated' && (
          <ApprovalAssetRow
            icon={<SbtcAvatarIcon size="md" />}
            label="Expected"
            qualifier="At the pool’s current price"
            amount={<ExactAmount value="0.00741000" symbol="sBTC" />}
            fiat="≈ $813.46"
            direction="in"
            estimateSource={dryRunSource}
          />
        )}
        {isLikelyFail && (
          <ApprovalAssetRow
            icon={<SbtcAvatarIcon size="md" />}
            label="Expected"
            qualifier="Below your minimum, so the swap fails"
            amount={<ExactAmount value="0.00712000" symbol="sBTC" />}
            fiat="≈ $781.62"
            estimateSource={dryRunSource}
          />
        )}
        <ApprovalFeeRow
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption={isLikelyFail ? 'Paid even if the swap fails' : 'Standard'}
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Every movement is listed here, including the minimum the contract sends you. If anything
          else moves, the transaction fails.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Dry run" divided>
        <DryRunCheck dryRun={dryRun} />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
        <ApprovalContractRow label="Contract" contractId={contracts.bitflowSwap} />
        <ApprovalRow
          label="Function"
          value={<ApprovalIdentifier>swap-helper-a</ApprovalIdentifier>}
        />
        <ApprovalDisclosureRow label="All details" caption="Arguments, nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

const slippage = {
  minimum: '0.00690000',
  minimumFiat: '$757.46',
  expected: '0.00735000',
  expectedFiat: '≈ $806.87',
  percent: '6.1%',
  priceImpact: '4.2%',
};

function HighSlippageSwap() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Approve"
          confirmation={{
            mode: 'acknowledge',
            statement: `I accept up to ${slippage.percent} less than expected`,
          }}
          total={{
            amount: <ExactAmount value="1,000.003000" symbol="STX" />,
            fiat: '$812.40',
          }}
        />
      }
    >
      <ApprovalHeader requester={bitflow} account={account1Stx} network={mainnet} />
      <ApprovalIntent
        title="Swap 1,000 STX for sBTC"
        kind="Contract call · Bitflow swap, recognised by Leather"
      />
      <ApprovalCaution
        title={`You could get ${slippage.percent} less than expected`}
        source="The swap’s minimum and Bitflow’s quote"
      >
        The swap accepts anything down to its minimum, and this trade alone moves the pool’s price
        by {slippage.priceImpact}. Most swaps allow 0.5 to 1%.
      </ApprovalCaution>
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly"
          amount={<ExactAmount value="1,000.000000" symbol="STX" />}
          fiat="$812.40"
        />
        <ApprovalAssetRow
          icon={<SbtcAvatarIcon size="md" />}
          label="You receive"
          qualifier="At least"
          amount={<ExactAmount value={slippage.minimum} symbol="sBTC" />}
          fiat={slippage.minimumFiat}
          direction="in"
        />
        <ApprovalAssetRow
          icon={<SbtcAvatarIcon size="md" />}
          label="Expected"
          qualifier={`${slippage.percent} above your minimum`}
          amount={<ExactAmount value={slippage.expected} symbol="sBTC" />}
          fiat={slippage.expectedFiat}
          direction="in"
          estimateSource="Bitflow’s quote"
        />
        <ApprovalFeeRow
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Every movement is listed here, including the minimum the contract sends you. If anything
          else moves, the transaction fails.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Price impact, contract, nonce">
        <ApprovalRow
          label="Price impact"
          value={slippage.priceImpact}
          caption="From Bitflow’s quote"
        />
        <ApprovalContractRow label="Contract" contractId={contracts.bitflowSwap} />
        <ApprovalDisclosureRow label="All details" caption="Arguments, nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const simulationScenarios: Scenario[] = [
  {
    id: 'contract-call-estimated',
    family: 'contract-call',
    label: 'Swap with a dry-run estimate',
    method: 'stx_callContract · deny mode · dry run passed',
    refs: ['#2587'],
    note: 'Proposed: before showing the screen, Leather plays the call against the current chain without broadcasting it (a dry run; stxer’s instant simulation is one service that does this). What the dry run returns sits next to the limits as its own row, tagged Estimate, prefixed ≈ and with its source, so it never reads as one of the on-chain limits. The footer total counts only the limits. A dry run reflects the chain at one block, so the real result can differ by the time the transaction is mined. Open question: whether the dry run runs on a third-party service, which sees the unsigned transaction before it is broadcast, or on a Leather-run node. Leather has no dry run today.',
    render() {
      return <SimulatedSwap dryRun="estimated" />;
    },
  },
  {
    id: 'contract-call-likely-fail',
    family: 'contract-call',
    label: 'The dry run says this call will fail',
    method: 'stx_callContract · deny mode · dry run fails',
    refs: ['#2587', '#2659'],
    events: [
      viewed('stx_callContract', 'contract_call', 'caution', true),
      cautionShown('dry_run'),
      frictionCompleted('acknowledge'),
      decided('cancel', '10_to_30s'),
    ],
    note: 'On Stacks a call that fails is still mined: it goes into a block, changes nothing else, and still charges the full fee. So when the dry run fails, a caution says why in plain words (here the pool would pay less than the minimum the post conditions allow), the estimate row shows the failing figure, and the fee row and a footer line say the fee is paid either way. Approve stays available behind an acknowledgement, since the price can move back before the call is mined. Reasons come from what Leather can read generically, such as a post condition that would not hold; contract error codes, which are numbers each contract defines, only become words for contracts on the recognised list. Today there is no dry run, so a failure only shows up after the fee is spent.',
    history() {
      return <FailedSwapHistory />;
    },
    render() {
      return <SimulatedSwap dryRun="likely-fail" />;
    },
  },
  {
    id: 'contract-call-simulation-unavailable',
    family: 'contract-call',
    label: 'No dry run available',
    method: 'stx_callContract · deny mode · dry run unavailable',
    refs: ['#2587'],
    note: 'When the dry run can’t run (the service is down, the network is slow, or the call reads state it can’t reproduce), the screen says so in a neutral line and nothing else changes: the limits come from the post conditions and are enforced on-chain whether or not a dry run happened. No caution and no extra step, so an outage doesn’t teach people to click through warnings.',
    render() {
      return <SimulatedSwap dryRun="unavailable" />;
    },
  },
  {
    id: 'swap-high-slippage',
    family: 'contract-call',
    label: 'Swap that allows a large price drop',
    method: 'stx_callContract · deny mode · minimum 6.1% under the quote',
    refs: ['#2587'],
    events: [
      viewed('stx_callContract', 'contract_call', 'caution', true),
      cautionShown('quote'),
      frictionCompleted('acknowledge'),
      decided('approve', '30_to_120s'),
      resulted('broadcast'),
    ],
    note: `The post conditions guarantee only the minimum, so that is the You receive row, and what the app expects sits under it in the estimate treatment: ≈, an Estimate tag and where it came from, never styled like a limit. When the gap between the two is over 5%, a caution says how much less you could get in one number, and Approve waits for a switch that repeats it. Price impact, how much this trade alone moves the pool, sits in details and in the caution when it drives the gap. Today the screen shows the minimum as a post condition and nothing about what was expected, so a 6% gap looks the same as a 0.5% one. The expected amount comes from the app’s quote or from a dry run; a quote is the site’s own number, so the caution names its source. Open questions: 5% as the line, and whether a dry run should replace the site’s quote when both exist.`,
    render() {
      return <HighSlippageSwap />;
    },
  },
];
