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

export const ADDRESS_MONITOR_STORE = 'addressMonitorStore';

const monitors: AddressMonitor[] = [];

async function readMonitoredAddressStore() {
  const result = await chrome.storage.local.get(ADDRESS_MONITOR_STORE);
  return (result[ADDRESS_MONITOR_STORE] || []) as MonitoredAddress[];
}

function syncMonitors(addresses: MonitoredAddress[]) {
  monitors.forEach(monitor => monitor.syncAddresses(addresses));
}

export async function initAddressMonitor() {
  const addresses = await readMonitoredAddressStore();
  monitors.push(createBitcoinTransactionMonitor(addresses));
}

export function listenForAddressMonitorChanges() {
  chrome.storage.local.onChanged.addListener(changes => {
    if (changes[ADDRESS_MONITOR_STORE]) {
      const newAddresses = changes[ADDRESS_MONITOR_STORE].newValue as
        | MonitoredAddress[]
        | undefined;
      if (newAddresses) syncMonitors(newAddresses);
    }
  });
}
