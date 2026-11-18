import type { DeviceManagementKit, DeviceSessionId } from '@ledgerhq/device-management-kit';

interface CloseLedgerSessionOptions {
  onError?(error: unknown): void;
}

export async function closeLedgerSession(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
  { onError }: CloseLedgerSessionOptions = {}
): Promise<void> {
  try {
    await dmk.disconnect({ sessionId });
  } catch (error) {
    onError?.(error);
  }
}
