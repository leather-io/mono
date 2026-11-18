import {
  estimateDateFromBurnBlocks,
  getCycleClockInfo,
  getUnlockBurnHeight,
} from './pox5-cycle-clock';

const mainnetParams = {
  firstBurnchainBlockHeight: 666_050,
  rewardCycleLength: 2100,
  preparePhaseLength: 100,
};

const testnetParams = {
  firstBurnchainBlockHeight: 0,
  rewardCycleLength: 1050,
  preparePhaseLength: 50,
};

describe(getCycleClockInfo.name, () => {
  test('first block of a cycle is open for staking', () => {
    const info = getCycleClockInfo({
      ...mainnetParams,
      currentBurnHeight: mainnetParams.firstBurnchainBlockHeight + 10 * 2100,
    });
    expect(info.currentCycleId).toEqual(10);
    expect(info.isInPreparePhase).toBe(false);
    expect(info.blocksUntilPreparePhase).toEqual(2000);
    expect(info.blocksUntilStakingReopens).toEqual(0);
    expect(info.secondsUntilStakingReopens).toEqual(0);
  });

  test('last block before the prepare phase is still open', () => {
    const info = getCycleClockInfo({
      ...mainnetParams,
      currentBurnHeight: mainnetParams.firstBurnchainBlockHeight + 10 * 2100 + 1999,
    });
    expect(info.isInPreparePhase).toBe(false);
    expect(info.blocksUntilPreparePhase).toEqual(1);
  });

  test('first block of the prepare phase blocks staking', () => {
    const info = getCycleClockInfo({
      ...mainnetParams,
      currentBurnHeight: mainnetParams.firstBurnchainBlockHeight + 10 * 2100 + 2000,
    });
    expect(info.isInPreparePhase).toBe(true);
    expect(info.blocksUntilPreparePhase).toEqual(0);
    expect(info.blocksUntilStakingReopens).toEqual(100);
    expect(info.secondsUntilStakingReopens).toEqual(100 * 600);
  });

  test('last block of the cycle reopens next block', () => {
    const info = getCycleClockInfo({
      ...mainnetParams,
      currentBurnHeight: mainnetParams.firstBurnchainBlockHeight + 10 * 2100 + 2099,
    });
    expect(info.currentCycleId).toEqual(10);
    expect(info.isInPreparePhase).toBe(true);
    expect(info.blocksUntilStakingReopens).toEqual(1);
  });

  test('testnet-length prepare phase uses the provided length', () => {
    const info = getCycleClockInfo({
      ...testnetParams,
      currentBurnHeight: 5 * 1050 + 1000,
    });
    expect(info.currentCycleId).toEqual(5);
    expect(info.isInPreparePhase).toBe(true);
    expect(info.blocksUntilStakingReopens).toEqual(50);
  });
});

describe(getUnlockBurnHeight.name, () => {
  test('unlock height lands at the end of the last locked cycle', () => {
    const unlockHeight = getUnlockBurnHeight({
      numCycles: 12,
      currentCycleId: 10,
      rewardCycleLength: 2100,
      firstBurnchainBlockHeight: 666_050,
    });
    expect(unlockHeight).toEqual(666_050 + (10 + 1) * 2100 + 12 * 2100);
  });
});

describe(estimateDateFromBurnBlocks.name, () => {
  test('estimates ten minutes per burn block', () => {
    const now = new Date('2026-07-22T00:00:00Z');
    expect(estimateDateFromBurnBlocks(6, now).toISOString()).toEqual('2026-07-22T01:00:00.000Z');
  });
});
