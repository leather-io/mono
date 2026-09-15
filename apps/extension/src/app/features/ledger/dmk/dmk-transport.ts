import type { DeviceManagementKit, DeviceSessionId } from '@ledgerhq/device-management-kit';
import Transport from '@ledgerhq/hw-transport';

import { toLedgerTransportError } from './ledger-dmk-errors';

export class DmkTransport extends Transport {
  private readonly dmk: DeviceManagementKit;
  private readonly sessionId: DeviceSessionId;
  private closed = false;

  constructor(dmk: DeviceManagementKit, sessionId: DeviceSessionId) {
    super();
    this.dmk = dmk;
    this.sessionId = sessionId;
  }

  async exchange(apdu: Buffer): Promise<Buffer> {
    try {
      const response = await this.dmk.sendApdu({
        sessionId: this.sessionId,
        apdu: new Uint8Array(apdu),
      });
      return Buffer.concat([Buffer.from(response.data), Buffer.from(response.statusCode)]);
    } catch (error) {
      throw toLedgerTransportError(error);
    }
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await this.dmk.disconnect({ sessionId: this.sessionId });
  }
}
