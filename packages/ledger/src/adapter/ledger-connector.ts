import type {
  DeviceManagementKit,
  DeviceSessionId,
  DiscoveredDevice,
  TransportFactory,
  TransportIdentifier,
} from '@ledgerhq/device-management-kit';
import { type Observable, map } from 'rxjs';

import type { BitcoinNetworkModes } from '@leather.io/models';

import { LEDGER_APPS_MAP } from '../app/generic-ledger-utils';
import type { LedgerBitcoinApp, LedgerStacksApp } from '../app/ledger-app';
import {
  connectLedgerBitcoinApp,
  getBitcoinAppVersion,
  isBitcoinAppOpen,
} from '../bitcoin/bitcoin-ledger-utils';
import type { HardwareWallet, HardwareWalletCapabilities } from '../contract/hardware-wallet';
import type {
  ConnectRequest,
  DeviceChooser,
  DiscoveredHardwareDevice,
  HardwareWalletAppInfo,
  HardwareWalletConnector,
  HardwareWalletSession,
} from '../contract/hardware-wallet-connector';
import { HardwareWalletError, ensureNotAborted } from '../contract/hardware-wallet-errors';
import type { OperationContext } from '../contract/hardware-wallet-interaction';
import {
  type ConnectLedgerDeviceOptions,
  connectLedgerDeviceToApp,
} from '../dmk/ledger-device-connection';
import { buildLedgerDmk } from '../dmk/ledger-dmk';
import { closeLedgerSession } from '../dmk/ledger-session';
import {
  MINIMUM_STACKS_APP_VERSION,
  connectLedgerStacksApp,
  getStacksAppVersion,
  validateStacksAppVersion,
} from '../stacks/stacks-ledger-utils';
import {
  createLedgerBitcoinSigner,
  getLedgerBitcoinMasterFingerprint,
} from './ledger-bitcoin-signer';
import { toLedgerHardwareWalletError } from './ledger-errors';
import { makeInteractionForwarder } from './ledger-interaction';
import { makeAbortableRunAction } from './ledger-run-action';
import { createLedgerStacksSigner, getLedgerStacksMasterFingerprint } from './ledger-stacks-signer';

export interface LedgerConnectorOptions {
  transportFactory: TransportFactory;
  transportIdentifier: TransportIdentifier;
  chooseDevice?: DeviceChooser;
  canPromptForDevice?(): boolean;
}

export const ledgerCapabilities: HardwareWalletCapabilities = {
  bitcoin: { taproot: true, descriptorPolicies: true },
  stacks: { structuredMessages: true, minimumAppVersion: MINIMUM_STACKS_APP_VERSION },
  addressVerification: true,
};

const defaultDeviceName = 'Ledger';

function toDiscoveredHardwareDevice(device: DiscoveredDevice): DiscoveredHardwareDevice {
  return { id: device.id, name: device.name, model: device.deviceModel.model };
}

function toDmkDeviceChooser(chooser: DeviceChooser, signal: AbortSignal | undefined) {
  return async (candidates: Observable<DiscoveredDevice>): Promise<DiscoveredDevice> => {
    const byId = new Map<string, DiscoveredDevice>();
    const chosen = await chooser.choose(
      candidates.pipe(
        map(device => {
          byId.set(device.id, device);
          return toDiscoveredHardwareDevice(device);
        })
      ),
      signal
    );
    const device = byId.get(chosen.id);
    if (!device)
      throw new HardwareWalletError('not-paired', {
        message: 'The chosen device is no longer available',
      });
    return device;
  };
}

function describeConnectedDevice(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId
): DiscoveredHardwareDevice {
  try {
    const device = dmk.getConnectedDevice({ sessionId });
    return { id: device.id, name: device.name, model: device.modelId };
  } catch {
    return { id: sessionId, name: defaultDeviceName, model: null };
  }
}

function bitcoinAppName(network: BitcoinNetworkModes): string | null {
  if (network === 'mainnet') return LEDGER_APPS_MAP.BITCOIN_MAINNET;
  if (network === 'testnet') return LEDGER_APPS_MAP.BITCOIN_TESTNET;
  return null;
}

function makeSession(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
  wallet: HardwareWallet,
  app: HardwareWalletAppInfo
): HardwareWalletSession {
  let closed = false;
  return {
    wallet,
    device: describeConnectedDevice(dmk, sessionId),
    app,
    async close() {
      if (closed) return;
      closed = true;
      await closeLedgerSession(dmk, sessionId);
    },
  };
}

async function ensureBitcoinAppOpen(
  dmk: DeviceManagementKit,
  app: LedgerBitcoinApp,
  network: BitcoinNetworkModes
): Promise<HardwareWalletAppInfo> {
  const version = await getBitcoinAppVersion(dmk)(app);
  if (isBitcoinAppOpen({ network })({ name: version.name }))
    return { name: version.name, version: version.version };
  throw new HardwareWalletError('wrong-app', {
    message: `Expected the ${bitcoinAppName(network) ?? 'Bitcoin'} app but ${version.name} is open`,
  });
}

async function ensureStacksAppReady(stacksApp: LedgerStacksApp): Promise<HardwareWalletAppInfo> {
  const version = await getStacksAppVersion(stacksApp);
  if (version.deviceLocked) throw new HardwareWalletError('locked');
  const { meetsMinimum, currentVersion } = validateStacksAppVersion(version);
  if (meetsMinimum) return { name: version.name, version: currentVersion };
  throw new HardwareWalletError('outdated-app', {
    details: { currentVersion, requiredVersion: MINIMUM_STACKS_APP_VERSION },
  });
}

async function closeOnFailure<T>(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    await closeLedgerSession(dmk, sessionId);
    throw error;
  }
}

export function createLedgerConnector(options: LedgerConnectorOptions): HardwareWalletConnector {
  let dmk: DeviceManagementKit | null = null;

  function getDmk(): DeviceManagementKit {
    dmk ??= buildLedgerDmk(options.transportFactory);
    return dmk;
  }

  function makeConnectOptions(
    ctx: OperationContext,
    appName: string | null
  ): ConnectLedgerDeviceOptions {
    return {
      transport: options.transportIdentifier,
      canPromptForDevice: options.canPromptForDevice?.() ?? true,
      chooseDevice: options.chooseDevice && toDmkDeviceChooser(options.chooseDevice, ctx.signal),
      onRequiredUserInteraction: makeInteractionForwarder(ctx, appName),
      runAction: makeAbortableRunAction(ctx.signal),
    };
  }

  async function pairDevice(ctx: OperationContext): Promise<DiscoveredHardwareDevice> {
    const kit = getDmk();
    const sessionId = await connectLedgerDeviceToApp(kit, null, makeConnectOptions(ctx, null));
    const device = describeConnectedDevice(kit, sessionId);
    await closeLedgerSession(kit, sessionId);
    return device;
  }

  async function connectBitcoin(
    network: BitcoinNetworkModes,
    ctx: OperationContext
  ): Promise<HardwareWalletSession> {
    const kit = getDmk();
    const connectOptions = makeConnectOptions(ctx, bitcoinAppName(network));
    const app = await connectLedgerBitcoinApp(
      kit,
      network,
      connectOptions.runAction
    )(connectOptions);
    return closeOnFailure(kit, app.sessionId, async () => {
      const appInfo = await ensureBitcoinAppOpen(kit, app, network);
      const wallet: HardwareWallet = {
        vendor: 'ledger',
        capabilities: ledgerCapabilities,
        bitcoin: createLedgerBitcoinSigner(app),
        stacks: null,
        getMasterFingerprint(operationCtx) {
          return getLedgerBitcoinMasterFingerprint(app, operationCtx);
        },
      };
      return makeSession(kit, app.sessionId, wallet, appInfo);
    });
  }

  async function connectStacks(ctx: OperationContext): Promise<HardwareWalletSession> {
    const kit = getDmk();
    const stacksApp = await connectLedgerStacksApp(
      kit,
      makeConnectOptions(ctx, LEDGER_APPS_MAP.STACKS)
    );
    return closeOnFailure(kit, stacksApp.sessionId, async () => {
      const appInfo = await ensureStacksAppReady(stacksApp);
      const wallet: HardwareWallet = {
        vendor: 'ledger',
        capabilities: ledgerCapabilities,
        bitcoin: null,
        stacks: createLedgerStacksSigner(stacksApp),
        getMasterFingerprint(operationCtx) {
          return getLedgerStacksMasterFingerprint(stacksApp, operationCtx);
        },
      };
      return makeSession(kit, stacksApp.sessionId, wallet, appInfo);
    });
  }

  return {
    vendor: 'ledger',
    capabilities: ledgerCapabilities,
    async pair(ctx: OperationContext) {
      ensureNotAborted(ctx.signal);
      try {
        return await pairDevice(ctx);
      } catch (error) {
        throw toLedgerHardwareWalletError(error);
      }
    },
    async connect(request: ConnectRequest, ctx: OperationContext) {
      ensureNotAborted(ctx.signal);
      try {
        if (request.chain === 'bitcoin') return await connectBitcoin(request.network, ctx);
        return await connectStacks(ctx);
      } catch (error) {
        throw toLedgerHardwareWalletError(error);
      }
    },
  };
}
