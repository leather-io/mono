import type { HardwareWalletConnector } from './hardware-wallet-connector';
import { HardwareWalletError } from './hardware-wallet-errors';
import { withHardwareWallet } from './hardware-wallet-runner';
import {
  makeFakeHardwareWallet,
  makeFakeHardwareWalletConnector,
  makeFakeHardwareWalletSession,
} from './hardware-wallet.test-utils';

const wallet = makeFakeHardwareWallet({
  capabilities: { bitcoin: null, stacks: null, addressVerification: false },
});

function makeSession() {
  const close = vi.fn().mockResolvedValue(undefined);
  const session = makeFakeHardwareWalletSession({ wallet, close });
  return { session, close };
}

function makeConnector(connect: HardwareWalletConnector['connect']): HardwareWalletConnector {
  return makeFakeHardwareWalletConnector({ capabilities: wallet.capabilities, connect });
}

const stacksRequest = { chain: 'stacks' } as const;

describe(withHardwareWallet.name, () => {
  test('runs the operation with the connected wallet and closes the session', async () => {
    const { session, close } = makeSession();
    const connector = makeConnector(vi.fn().mockResolvedValue(session));
    const operation = vi.fn().mockResolvedValue('signed');

    await expect(withHardwareWallet(connector, stacksRequest, {}, operation)).resolves.toBe(
      'signed'
    );

    expect(operation).toHaveBeenCalledWith(wallet, session);
    expect(close).toHaveBeenCalledOnce();
  });

  test('closes the session and normalises the error when the operation fails', async () => {
    const { session, close } = makeSession();
    const connector = makeConnector(vi.fn().mockResolvedValue(session));
    const failure = new Error('device unplugged');

    const rejection = withHardwareWallet(connector, stacksRequest, {}, () =>
      Promise.reject(failure)
    );

    await expect(rejection).rejects.toBeInstanceOf(HardwareWalletError);
    await expect(rejection).rejects.toMatchObject({ kind: 'unknown', cause: failure });
    expect(close).toHaveBeenCalledOnce();
  });

  test('normalises connector failures', async () => {
    const connector = makeConnector(vi.fn().mockRejectedValue(new Error('no device')));

    await expect(withHardwareWallet(connector, stacksRequest, {}, vi.fn())).rejects.toMatchObject({
      kind: 'unknown',
      message: 'no device',
    });
  });

  test('does not connect when the signal is already aborted', async () => {
    const connect = vi.fn();
    const connector = makeConnector(connect);
    const controller = new AbortController();
    controller.abort();

    await expect(
      withHardwareWallet(connector, stacksRequest, { signal: controller.signal }, vi.fn())
    ).rejects.toMatchObject({ kind: 'cancelled' });

    expect(connect).not.toHaveBeenCalled();
  });
});
