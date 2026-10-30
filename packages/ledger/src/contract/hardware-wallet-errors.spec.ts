import {
  HardwareWalletError,
  ensureNotAborted,
  isHardwareWalletError,
  isHardwareWalletErrorOfKind,
  toHardwareWalletError,
} from './hardware-wallet-errors';

function thrownBy(fn: () => void): unknown {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error;
  }
}

describe(HardwareWalletError.name, () => {
  test('carries the kind, a default message and optional details', () => {
    const error = new HardwareWalletError('outdated-app', {
      details: { currentVersion: '0.26.17', requiredVersion: '0.26.19' },
    });

    expect(error.kind).toBe('outdated-app');
    expect(error.name).toBe('HardwareWalletError');
    expect(error.message).toBe('The app on the hardware wallet is outdated');
    expect(error.details).toEqual({ currentVersion: '0.26.17', requiredVersion: '0.26.19' });
  });

  test('keeps the original error as the cause', () => {
    const cause = new Error('device said no');

    const error = new HardwareWalletError('rejected', { cause });

    expect(error.cause).toBe(cause);
    expect(error.details).toBeNull();
  });
});

describe(toHardwareWalletError.name, () => {
  test('returns hardware wallet errors unchanged', () => {
    const error = new HardwareWalletError('locked');

    expect(toHardwareWalletError(error)).toBe(error);
  });

  test('wraps other errors as unknown, keeping message and cause', () => {
    const cause = new Error('boom');

    const error = toHardwareWalletError(cause);

    expect(error.kind).toBe('unknown');
    expect(error.message).toBe('boom');
    expect(error.cause).toBe(cause);
  });

  test('wraps non-error values with the default message', () => {
    const error = toHardwareWalletError({ _tag: 'SomethingElse' });

    expect(error.kind).toBe('unknown');
    expect(error.message).toBe('Unknown hardware wallet error');
    expect(error.cause).toEqual({ _tag: 'SomethingElse' });
  });
});

describe(isHardwareWalletErrorOfKind.name, () => {
  test('matches only the given kind', () => {
    const error = new HardwareWalletError('busy');

    expect(isHardwareWalletError(error)).toBe(true);
    expect(isHardwareWalletErrorOfKind(error, 'busy')).toBe(true);
    expect(isHardwareWalletErrorOfKind(error, 'locked')).toBe(false);
    expect(isHardwareWalletErrorOfKind(new Error('busy'), 'busy')).toBe(false);
  });
});

describe(ensureNotAborted.name, () => {
  test('throws a cancelled error once the signal is aborted', () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => ensureNotAborted(controller.signal)).toThrow(HardwareWalletError);
    expect(thrownBy(() => ensureNotAborted(controller.signal))).toMatchObject({
      kind: 'cancelled',
    });
  });

  test('passes without a signal or with a live one', () => {
    expect(() => ensureNotAborted(undefined)).not.toThrow();
    expect(() => ensureNotAborted(new AbortController().signal)).not.toThrow();
  });
});
