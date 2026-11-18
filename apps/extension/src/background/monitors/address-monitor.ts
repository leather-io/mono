import { z } from 'zod';

import { logger } from '@shared/logger';

import { createBitcoinTransactionMonitor } from './address-monitors/bitcoin-transaction-monitor';

const monitoredAddressSchema = z.object({
  chain: z.enum(['bitcoin', 'stacks']),
  accountIndex: z.number(),
  isCurrent: z.boolean(),
  address: z.string(),
});
export type MonitoredAddress = z.infer<typeof monitoredAddressSchema>;

export function parseMonitoredAddresses(value: unknown): MonitoredAddress[] {
  const entries = z.array(z.unknown()).safeParse(value);
  if (!entries.success) return [];
  return entries.data.flatMap(entry => {
    const parsedEntry = monitoredAddressSchema.safeParse(entry);
    if (parsedEntry.success) return [parsedEntry.data];
    logger.warn('Ignoring an invalid monitored address', parsedEntry.error.issues);
    return [];
  });
}

export interface AddressMonitor {
  syncAddresses(addresses: MonitoredAddress[]): void;
}

const monitors: AddressMonitor[] = [];

export async function initAddressMonitor() {
  const addresses = await readMonitoredAddressStore();
  monitors.push(createBitcoinTransactionMonitor(addresses));
}

export async function syncAddressMonitor(addresses: MonitoredAddress[]) {
  await writeMonitoredAddressStore(addresses);
  monitors.forEach(monitor => monitor.syncAddresses(addresses));
}

const ADDRESS_MONITOR_STORE = 'addressMonitorStore';

async function readMonitoredAddressStore() {
  const result = await chrome.storage.local.get(ADDRESS_MONITOR_STORE);
  return parseMonitoredAddresses(result[ADDRESS_MONITOR_STORE]);
}

async function writeMonitoredAddressStore(addresses: MonitoredAddress[]) {
  await chrome.storage.local.set({
    [ADDRESS_MONITOR_STORE]: addresses,
  });
}
