import {
  HiroPoxInfoResponse,
  HiroPrincipalStakingBond,
  HiroStakingBond,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { LeatherApiStakingBond } from '../infrastructure/api/leather/leather-api.client';
import {
  deriveBondEnrollmentWindow,
  deriveBtcStakingPositionStatus,
  estimateBurnHeightDate,
  selectUpcomingBond,
  toBtcStakingPosition,
} from './bitcoin-staking.utils';

const now = new Date('2026-09-07T12:00:00Z');
const burnTip = 900_000;

function createOutput(
  overrides: Partial<LeatherApiStakingBond['outputs'][number]> = {}
): LeatherApiStakingBond['outputs'][number] {
  return {
    txid: 'lock-tx',
    vout: 0,
    amountSats: '100000000',
    unlockBurnHeight: 900_100,
    lockScriptHex: '00',
    spent: false,
    lastCheckedAt: null,
    ...overrides,
  };
}

function createRegistration(overrides: Partial<LeatherApiStakingBond> = {}): LeatherApiStakingBond {
  return {
    bondIndex: 4,
    stxAddress: 'SP1STAKER',
    enrollmentTxId: '0xenroll',
    registeredAtBurnHeight: 899_000,
    exitAnnouncedAtBurnHeight: null,
    outputs: [createOutput()],
    ...overrides,
  };
}

function createBond(overrides: Partial<HiroStakingBond> = {}): HiroStakingBond {
  return {
    index: 4,
    pox_version: 'pox5',
    status: 'active',
    parameters: {
      target_rate_bps: 300,
      stx_value_ratio: 310237,
      minimum_stx_ratio: 500,
      btc_capacity: '25000500000',
    },
    registrations: { allowed_count: 15, registered_count: 8 },
    schedule: {
      activation: { bitcoin_height: 899_500, pox_cycle: 143 },
      unlock: { bitcoin_height: 924_700, pox_cycle: 155 },
    },
    balances: { locked: { btc: '0', stx: '0' }, paid_out: { btc: '0' } },
    ...overrides,
  };
}

const principalBond: HiroPrincipalStakingBond = {
  bond_index: 4,
  status: 'enrolled',
  active: true,
  enrollment: { tx_id: '0xenroll', btc_lockup: { amount: '100000000' } },
  locked: { btc: '100000000', stx: '10000000000' },
  rewards: { btc: { accrued: '2000000', claimed: '1035000', claimable: '965000' } },
};

const poxInfo: HiroPoxInfoResponse = {
  contract_id: 'SP000000000000000000002Q6VF78.pox-5',
  first_burnchain_block_height: 666_050,
  current_burnchain_block_height: burnTip,
  prepare_phase_block_length: 100,
  reward_phase_block_length: 2000,
};

describe(estimateBurnHeightDate.name, () => {
  test('projects ten minutes per block from the burn tip', () => {
    expect(estimateBurnHeightDate(burnTip + 6, burnTip, now).toISOString()).toEqual(
      '2026-09-07T13:00:00.000Z'
    );
  });

  test('projects backwards for heights below the tip', () => {
    expect(estimateBurnHeightDate(burnTip - 6, burnTip, now).toISOString()).toEqual(
      '2026-09-07T11:00:00.000Z'
    );
  });
});

describe(deriveBtcStakingPositionStatus.name, () => {
  test('is locked while any unspent output is before its unlock height', () => {
    expect(deriveBtcStakingPositionStatus(createRegistration(), burnTip)).toEqual('locked');
  });

  test('is exiting once an early exit was announced', () => {
    const registration = createRegistration({ exitAnnouncedAtBurnHeight: 899_900 });
    expect(deriveBtcStakingPositionStatus(registration, burnTip)).toEqual('exiting');
  });

  test('is matured once every unspent output has passed its unlock height', () => {
    const registration = createRegistration({
      outputs: [
        createOutput({ unlockBurnHeight: burnTip }),
        createOutput({ vout: 1, unlockBurnHeight: burnTip - 5 }),
      ],
    });
    expect(deriveBtcStakingPositionStatus(registration, burnTip)).toEqual('matured');
  });

  test('ignores spent outputs when judging maturity', () => {
    const registration = createRegistration({
      outputs: [
        createOutput({ unlockBurnHeight: burnTip - 5 }),
        createOutput({ vout: 1, unlockBurnHeight: burnTip + 5, spent: true }),
      ],
    });
    expect(deriveBtcStakingPositionStatus(registration, burnTip)).toEqual('matured');
  });

  test('is reclaimed once every output is spent without an exit announcement', () => {
    const registration = createRegistration({
      outputs: [createOutput({ unlockBurnHeight: burnTip - 5, spent: true })],
    });
    expect(deriveBtcStakingPositionStatus(registration, burnTip)).toEqual('reclaimed');
  });

  test('is exited once every output is spent after an exit announcement', () => {
    const registration = createRegistration({
      exitAnnouncedAtBurnHeight: 899_900,
      outputs: [createOutput({ spent: true })],
    });
    expect(deriveBtcStakingPositionStatus(registration, burnTip)).toEqual('exited');
  });
});

describe(toBtcStakingPosition.name, () => {
  test('sums every output and takes the latest unlock height', () => {
    const position = toBtcStakingPosition({
      registration: createRegistration({
        outputs: [
          createOutput({ unlockBurnHeight: 900_100 }),
          createOutput({ vout: 1, amountSats: '50000000', unlockBurnHeight: 900_200 }),
          createOutput({ vout: 2, amountSats: '25000000', spent: true }),
        ],
      }),
      stakerAddress: 'bc1qpayer',
      bond: createBond(),
      principalBond,
      burnTip,
      now,
    });

    expect(position.amount.amount.toString()).toEqual('175000000');
    expect(position.outputs).toHaveLength(3);
    expect(position.unlockBurnHeight).toEqual(900_200);
    expect(position.estimatedUnlockAt.toISOString()).toEqual('2026-09-08T21:20:00.000Z');
    expect(position.status).toEqual('locked');
  });

  test('carries stacked stx and rewards from the principal bond', () => {
    const position = toBtcStakingPosition({
      registration: createRegistration(),
      stakerAddress: 'bc1qpayer',
      bond: createBond(),
      principalBond,
      burnTip,
      now,
    });

    expect(position.stxStacked?.amount.toString()).toEqual('10000000000');
    expect(position.rewardsAccrued?.amount.toString()).toEqual('2000000');
    expect(position.rewardsClaimed?.amount.toString()).toEqual('1035000');
    expect(position.estimatedActivationAt.toISOString()).toEqual('2026-09-04T00:40:00.000Z');
    expect(position.bond).toEqual({
      index: 4,
      status: 'active',
      activationBurnHeight: 899_500,
      unlockBurnHeight: 924_700,
    });
  });

  test('leaves principal-derived fields null when the principal bond is missing', () => {
    const position = toBtcStakingPosition({
      registration: createRegistration(),
      stakerAddress: 'bc1qpayer',
      bond: createBond(),
      principalBond: undefined,
      burnTip,
      now,
    });

    expect(position.stxStacked).toBeNull();
    expect(position.rewardsAccrued).toBeNull();
    expect(position.rewardsClaimed).toBeNull();
  });
});

describe(selectUpcomingBond.name, () => {
  test('picks the upcoming bond that activates first', () => {
    const bonds = [
      createBond({
        index: 7,
        status: 'upcoming',
        schedule: {
          activation: { bitcoin_height: 905_000, pox_cycle: 146 },
          unlock: { bitcoin_height: 930_200, pox_cycle: 158 },
        },
      }),
      createBond({
        index: 6,
        status: 'upcoming',
        schedule: {
          activation: { bitcoin_height: 902_900, pox_cycle: 145 },
          unlock: { bitcoin_height: 928_100, pox_cycle: 157 },
        },
      }),
      createBond({ index: 5, status: 'active' }),
    ];
    expect(selectUpcomingBond(bonds)?.index).toEqual(6);
  });

  test('is undefined when no bond is upcoming', () => {
    expect(selectUpcomingBond([createBond({ status: 'active' })])).toBeUndefined();
  });
});

describe(deriveBondEnrollmentWindow.name, () => {
  test('closes one prepare phase before activation', () => {
    const window = deriveBondEnrollmentWindow(
      createBond({
        index: 6,
        status: 'upcoming',
        schedule: {
          activation: { bitcoin_height: 900_600, pox_cycle: 145 },
          unlock: { bitcoin_height: 925_800, pox_cycle: 157 },
        },
      }),
      poxInfo,
      now
    );

    expect(window.bondIndex).toEqual(6);
    expect(window.activationBurnHeight).toEqual(900_600);
    expect(window.closesAtBurnHeight).toEqual(900_500);
    expect(window.estimatedActivationAt.toISOString()).toEqual('2026-09-11T16:00:00.000Z');
    expect(window.estimatedClosesAt.toISOString()).toEqual('2026-09-10T23:20:00.000Z');
  });
});
