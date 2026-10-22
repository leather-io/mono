import { decideVerdict, verdictExitCodes } from './summary';

const healthyRun = {
  envFailed: false,
  readyMet: true,
  blockingErrorCount: 0,
  allowConsoleErrors: false,
};

describe('decideVerdict', () => {
  test('verifies a run that reached readiness without errors', () => {
    expect(decideVerdict(healthyRun)).toBe('verified');
  });

  test('ranks an environment failure above everything else', () => {
    expect(decideVerdict({ ...healthyRun, envFailed: true, readyMet: false })).toBe('env');
  });

  test('ranks a missed readiness target above console errors', () => {
    expect(decideVerdict({ ...healthyRun, readyMet: false, blockingErrorCount: 2 })).toBe(
      'ready-not-met'
    );
  });

  test('fails on console or page errors', () => {
    expect(decideVerdict({ ...healthyRun, blockingErrorCount: 1 })).toBe('errors');
  });

  test('downgrades console errors when they are allowed', () => {
    expect(decideVerdict({ ...healthyRun, blockingErrorCount: 1, allowConsoleErrors: true })).toBe(
      'verified'
    );
  });
});

describe('verdictExitCodes', () => {
  test('maps each verdict to its documented exit code', () => {
    expect(verdictExitCodes).toEqual({ verified: 0, 'ready-not-met': 2, errors: 3, env: 4 });
  });
});
