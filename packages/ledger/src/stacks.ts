import Transport from '@ledgerhq/hw-transport-webusb';
import StacksApp from '@zondax/ledger-stacks';

import { LEDGER_APPS_MAP, promptOpenAppOnDevice } from './utils';

export function connectLedgerStacksApp() {
  return async function connectLedgerStacksAppImpl() {
    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);
    const transport = await Transport.create();
    return new StacksApp(transport);
  };
}

export async function getStacksAppVersion(app: StacksApp) {
  const version = await app.getVersion();
  return {
    name: 'Stacks',
    version: `${version.major}.${version.minor}.${version.patch}`,
  };
}

export function isStacksAppOpen(version: { name: string }) {
  return version.name === 'Stacks';
}
