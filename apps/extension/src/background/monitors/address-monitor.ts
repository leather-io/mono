import { createBitcoinTransactionMonitor } from './address-monitors/bitcoin-transaction-monitor';

export interface MonitoredAddress {
  chain: 'bitcoin' | 'stacks';
  accountIndex: number;
  isCurrent: boolean;
  address: string;
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
  const addresses = result[ADDRESS_MONITOR_STORE] || [];
  return addresses;
}

async function writeMonitoredAddressStore(addresses: MonitoredAddress[]) {
  await chrome.storage.local.set({
    [ADDRESS_MONITOR_STORE]: addresses,
  });
}
