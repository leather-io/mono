import {
  SignerManagerFacts,
  UpdateStakeSummaryInput,
  buildSignerManagerOptions,
  buildUpdateStakeSummaryRows,
  currentCustomRowId,
  customRowId,
} from './update-staking-summary';

const stackingDaoFacts: SignerManagerFacts = {
  name: 'Stacking DAO',
  isCustom: false,
  supportsBtcPayout: false,
  feeBips: 0,
};

const senseiNodeFacts: SignerManagerFacts = {
  name: 'SenseiNode',
  isCustom: false,
  supportsBtcPayout: true,
  feeBips: 1000,
};

const customFacts: SignerManagerFacts = {
  name: 'SP4SZ…DPBG.custom-signer-manager',
  isCustom: true,
  supportsBtcPayout: true,
  feeBips: null,
};

const baseInput: UpdateStakeSummaryInput = {
  current: stackingDaoFacts,
  target: null,
  customPendingValidation: false,
  amountMicroStx: 3_200_000_000n,
  amountIncreaseMicroStx: 0n,
  firstRewardCycle: 100,
  numCycles: 22,
  cyclesToExtend: 0,
  nextCycleId: 114,
  daysUntilNextCycle: 12,
};

function rowLabels(input: UpdateStakeSummaryInput) {
  return buildUpdateStakeSummaryRows(input).map(row => row.label);
}

describe(buildUpdateStakeSummaryRows.name, () => {
  test('shows only the validation hint while a custom contract is unvalidated', () => {
    const rows = buildUpdateStakeSummaryRows({ ...baseInput, customPendingValidation: true });
    expect(rows).toEqual([
      { kind: 'value', label: 'Signer manager', value: 'Enter a contract address to validate' },
    ]);
  });

  test('narrates a pure switch with pool, fee, rewards, amount, lock, and effective rows', () => {
    const rows = buildUpdateStakeSummaryRows({ ...baseInput, target: senseiNodeFacts });
    expect(rows).toEqual([
      { kind: 'diff', label: 'Pool', from: 'Stacking DAO', to: 'SenseiNode' },
      { kind: 'diff', label: 'Fee', from: '0%', to: '10%', isCritical: true },
      { kind: 'diff', label: 'Rewards token', from: 'sBTC', to: 'sBTC / BTC' },
      { kind: 'value', label: 'Amount staked', value: '3,200 STX, moves in full' },
      { kind: 'value', label: 'Locked until', value: 'Cycle 122' },
      {
        kind: 'value',
        label: 'Effective',
        value: 'Cycle 114, in 12 days',
        caption: 'One transaction, no unstaking needed',
      },
    ]);
  });

  test('marks a fee decrease as non-critical', () => {
    const rows = buildUpdateStakeSummaryRows({
      ...baseInput,
      current: senseiNodeFacts,
      target: { ...stackingDaoFacts, supportsBtcPayout: true },
    });
    const feeRow = rows.find(row => row.label === 'Fee');
    expect(feeRow).toEqual({
      kind: 'diff',
      label: 'Fee',
      from: '10%',
      to: '0%',
      isCritical: false,
    });
  });

  test('omits the fee row when either side is unknown', () => {
    expect(
      rowLabels({
        ...baseInput,
        current: { ...stackingDaoFacts, feeBips: null },
        target: senseiNodeFacts,
      })
    ).not.toContain('Fee');
    expect(
      rowLabels({ ...baseInput, target: { ...senseiNodeFacts, feeBips: null } })
    ).not.toContain('Fee');
  });

  test('omits the rewards row when the label does not change', () => {
    expect(
      rowLabels({
        ...baseInput,
        current: senseiNodeFacts,
        target: { ...senseiNodeFacts, name: 'Fast Pool', feeBips: 0 },
      })
    ).not.toContain('Rewards token');
  });

  test('describes a custom target through its contract policies', () => {
    const rows = buildUpdateStakeSummaryRows({ ...baseInput, target: customFacts });
    expect(rows).toContainEqual({
      kind: 'value',
      label: 'Rewards token',
      value: 'Set by the custom contract',
    });
  });

  test('diffs rewards from a custom current contract', () => {
    const rows = buildUpdateStakeSummaryRows({
      ...baseInput,
      current: customFacts,
      target: senseiNodeFacts,
    });
    expect(rows).toContainEqual({
      kind: 'diff',
      label: 'Rewards token',
      from: 'Set by the contract',
      to: 'sBTC / BTC',
    });
  });

  test('shows fee diff between a custom contract and a pool when both are known', () => {
    const rows = buildUpdateStakeSummaryRows({
      ...baseInput,
      current: { ...customFacts, feeBips: 495 },
      target: senseiNodeFacts,
    });
    expect(rows).toContainEqual({
      kind: 'diff',
      label: 'Fee',
      from: '4.95%',
      to: '10%',
      isCritical: true,
    });
  });

  test('shows only changed rows plus effective when the pool is unchanged', () => {
    const rows = buildUpdateStakeSummaryRows({
      ...baseInput,
      amountIncreaseMicroStx: 10_000_000n,
      cyclesToExtend: 2,
    });
    expect(rows).toEqual([
      { kind: 'diff', label: 'Amount staked', from: '3,200 STX', to: '3,210 STX' },
      { kind: 'diff', label: 'Locked until', from: 'Cycle 122', to: 'Cycle 124' },
      {
        kind: 'value',
        label: 'Effective',
        value: 'Cycle 114, in 12 days',
        caption: 'One transaction, no unstaking needed',
      },
    ]);
  });

  test('falls back to em-dash pieces when cycle info is unavailable', () => {
    const rows = buildUpdateStakeSummaryRows({
      ...baseInput,
      cyclesToExtend: 1,
      nextCycleId: null,
      daysUntilNextCycle: null,
    });
    const effectiveRow = rows.find(row => row.label === 'Effective');
    expect(effectiveRow).toMatchObject({ value: 'Cycle —' });
  });
});

describe(buildSignerManagerOptions.name, () => {
  const pools = [
    {
      providerId: 'stackingDao' as const,
      name: 'Stacking DAO',
      url: '',
      description: '',
      signerManagerContracts: {},
      supportsBtcPayout: false,
      fixedFeeBips: 0,
    },
    {
      providerId: 'senseiNode' as const,
      name: 'SenseiNode',
      url: '',
      description: '',
      signerManagerContracts: {},
      supportsBtcPayout: true,
    },
  ];

  test('lists pools with fee and rewards meta and marks the current one', () => {
    const options = buildSignerManagerOptions({
      availablePools: pools,
      feeBipsByProvider: { stackingDao: 0, senseiNode: null },
      currentPool: pools[0],
      currentContractId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager',
    });
    expect(options).toEqual([
      { providerId: 'stackingDao', name: 'Stacking DAO', meta: '0% fee · sBTC', isCurrent: true },
      {
        providerId: 'senseiNode',
        name: 'SenseiNode',
        meta: '— fee · sBTC / BTC',
        isCurrent: false,
      },
      {
        providerId: customRowId,
        name: 'Custom signer manager',
        meta: 'Enter a contract address',
        isCustom: true,
      },
    ]);
  });

  test('prepends a mono current row for a custom position', () => {
    const options = buildSignerManagerOptions({
      availablePools: pools,
      feeBipsByProvider: {},
      currentPool: null,
      currentContractId: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.custom-signer-manager',
    });
    expect(options[0]).toEqual({
      providerId: currentCustomRowId,
      name: 'SP21Y…XEFFP.custom-signer-manager',
      meta: '',
      isCurrent: true,
      mono: true,
    });
    expect(options[options.length - 1]).toMatchObject({
      providerId: customRowId,
      name: 'Different custom contract',
    });
  });
});
