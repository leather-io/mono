import type { HardwareWallet } from './hardware-wallet';
import type {
  ConnectRequest,
  HardwareWalletConnector,
  HardwareWalletSession,
} from './hardware-wallet-connector';
import { ensureNotAborted, toHardwareWalletError } from './hardware-wallet-errors';
import type { OperationContext } from './hardware-wallet-interaction';

export type HardwareWalletOperation<T> = (
  wallet: HardwareWallet,
  session: HardwareWalletSession
) => Promise<T>;

async function openSession(
  connector: HardwareWalletConnector,
  request: ConnectRequest,
  ctx: OperationContext
): Promise<HardwareWalletSession> {
  ensureNotAborted(ctx.signal);
  try {
    return await connector.connect(request, ctx);
  } catch (error) {
    throw toHardwareWalletError(error);
  }
}

export async function withHardwareWallet<T>(
  connector: HardwareWalletConnector,
  request: ConnectRequest,
  ctx: OperationContext,
  operation: HardwareWalletOperation<T>
): Promise<T> {
  const session = await openSession(connector, request, ctx);
  try {
    ensureNotAborted(ctx.signal);
    return await operation(session.wallet, session);
  } catch (error) {
    throw toHardwareWalletError(error);
  } finally {
    await session.close();
  }
}
