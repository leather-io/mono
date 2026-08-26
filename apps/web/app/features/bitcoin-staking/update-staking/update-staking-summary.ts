import { EM_DASH } from '~/constants/constants';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { BitcoinStakingPool, BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { truncateMiddle } from '@leather.io/utils';

import { formatFeeBips } from '../utils/pool-fee';
import { SignerManagerOption } from './components/choose-signer-manager';
import { SidebarSummaryRow } from './components/sidebar-summary-card';

const switchContent = bitcoinStakingContent.switchSignerManager;
const summaryContent = switchContent.summary;

export const customRowId = 'custom';
export const currentCustomRowId = 'current-custom';

function rewardsTokenLabel(supportsBtcPayout: boolean): string {
  return supportsBtcPayout ? 'sBTC / BTC' : 'sBTC';
}

export interface SignerManagerFacts {
  name: string;
  isCustom: boolean;
  supportsBtcPayout: boolean;
  feeBips: number | null;
}

interface BuildSignerManagerOptionsArgs {
  availablePools: BitcoinStakingPool[];
  feeBipsByProvider: Partial<Record<BitcoinStakingProviderId, number | null>>;
  currentPool: BitcoinStakingPool | null;
  currentContractId: string;
}

export function buildSignerManagerOptions({
  availablePools,
  feeBipsByProvider,
  currentPool,
  currentContractId,
}: BuildSignerManagerOptionsArgs): SignerManagerOption[] {
  const poolOptions = availablePools.map(pool => {
    const feeBips = feeBipsByProvider[pool.providerId];
    const feeLabel = typeof feeBips === 'number' ? formatFeeBips(feeBips) : EM_DASH;
    return {
      providerId: pool.providerId,
      name: pool.name,
      meta: `${feeLabel} fee · ${rewardsTokenLabel(pool.supportsBtcPayout)}`,
      isCurrent: currentPool?.providerId === pool.providerId,
    };
  });

  const customOption: SignerManagerOption = {
    providerId: customRowId,
    name: currentPool
      ? switchContent.customOptionName
      : switchContent.customOptionNameWhenCurrentCustom,
    meta: switchContent.customOptionMeta,
    isCustom: true,
  };

  if (currentPool) return [...poolOptions, customOption];

  return [
    {
      providerId: currentCustomRowId,
      name: truncateMiddle(currentContractId),
      meta: '',
      isCurrent: true,
      mono: true,
    },
    ...poolOptions,
    customOption,
  ];
}

export interface UpdateStakeSummaryInput {
  current: SignerManagerFacts;
  target: SignerManagerFacts | null;
  customPendingValidation: boolean;
  amountMicroStx: bigint;
  amountIncreaseMicroStx: bigint;
  firstRewardCycle: number;
  numCycles: number;
  cyclesToExtend: number;
  nextCycleId: number | null;
  daysUntilNextCycle: number | null;
}

function buildRewardsTokenRow(
  current: SignerManagerFacts,
  target: SignerManagerFacts
): SidebarSummaryRow | null {
  if (target.isCustom) {
    return {
      kind: 'value',
      label: summaryContent.rewardsToken,
      value: summaryContent.customRewardsValue,
    };
  }
  const targetLabel = rewardsTokenLabel(target.supportsBtcPayout);
  if (current.isCustom) {
    return {
      kind: 'diff',
      label: summaryContent.rewardsToken,
      from: summaryContent.setByContract,
      to: targetLabel,
    };
  }
  const currentLabel = rewardsTokenLabel(current.supportsBtcPayout);
  if (currentLabel === targetLabel) return null;
  return { kind: 'diff', label: summaryContent.rewardsToken, from: currentLabel, to: targetLabel };
}

function formatEffectiveValue(nextCycleId: number | null, daysUntilNextCycle: number | null) {
  const cycleLabel = nextCycleId === null ? `Cycle ${EM_DASH}` : `Cycle ${nextCycleId}`;
  if (daysUntilNextCycle === null) return cycleLabel;
  return `${cycleLabel}, in ${daysUntilNextCycle} days`;
}

export function buildUpdateStakeSummaryRows(input: UpdateStakeSummaryInput): SidebarSummaryRow[] {
  if (input.customPendingValidation) {
    return [
      {
        kind: 'value',
        label: summaryContent.signerManager,
        value: summaryContent.enterContractHint,
      },
    ];
  }

  const rows: SidebarSummaryRow[] = [];
  const isSwitching = input.target !== null;
  const currentAmountLabel = toHumanReadableMicroStx(input.amountMicroStx);
  const newAmountLabel = toHumanReadableMicroStx(
    input.amountMicroStx + input.amountIncreaseMicroStx
  );
  const currentUnlockCycle = input.firstRewardCycle + input.numCycles;
  const newUnlockCycle = currentUnlockCycle + input.cyclesToExtend;

  if (input.target) {
    rows.push({
      kind: 'diff',
      label: summaryContent.pool,
      from: input.current.name,
      to: input.target.name,
    });

    if (
      input.current.feeBips !== null &&
      input.target.feeBips !== null &&
      input.current.feeBips !== input.target.feeBips
    ) {
      rows.push({
        kind: 'diff',
        label: summaryContent.fee,
        from: formatFeeBips(input.current.feeBips),
        to: formatFeeBips(input.target.feeBips),
        isCritical: input.target.feeBips > input.current.feeBips,
      });
    }

    const rewardsRow = buildRewardsTokenRow(input.current, input.target);
    if (rewardsRow) rows.push(rewardsRow);
  }

  if (input.amountIncreaseMicroStx > 0n) {
    rows.push({
      kind: 'diff',
      label: summaryContent.amountStaked,
      from: currentAmountLabel,
      to: newAmountLabel,
    });
  } else if (isSwitching) {
    rows.push({
      kind: 'value',
      label: summaryContent.amountStaked,
      value: `${currentAmountLabel}${summaryContent.movesInFullSuffix}`,
    });
  }

  if (input.cyclesToExtend > 0) {
    rows.push({
      kind: 'diff',
      label: summaryContent.lockedUntil,
      from: `Cycle ${currentUnlockCycle}`,
      to: `Cycle ${newUnlockCycle}`,
    });
  } else if (isSwitching) {
    rows.push({
      kind: 'value',
      label: summaryContent.lockedUntil,
      value: `Cycle ${currentUnlockCycle}`,
    });
  }

  rows.push({
    kind: 'value',
    label: summaryContent.effective,
    value: formatEffectiveValue(input.nextCycleId, input.daysUntilNextCycle),
    caption: summaryContent.effectiveCaption,
  });

  return rows;
}
