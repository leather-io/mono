import { createHardwareWalletRegistry } from './hardware-wallet-registry';
import { makeFakeHardwareWalletConnector } from './hardware-wallet.test-utils';

function makeConnector() {
  return makeFakeHardwareWalletConnector({
    capabilities: { bitcoin: null, stacks: null, addressVerification: false },
  });
}

describe(createHardwareWalletRegistry.name, () => {
  test('resolves connectors by vendor', () => {
    const ledger = makeConnector();

    const registry = createHardwareWalletRegistry([ledger]);

    expect(registry.get('ledger')).toBe(ledger);
    expect(registry.has('ledger')).toBe(true);
    expect(registry.vendors()).toEqual(['ledger']);
  });

  test('throws when no connector is registered for a vendor', () => {
    const registry = createHardwareWalletRegistry([]);

    expect(registry.has('ledger')).toBe(false);
    expect(() => registry.get('ledger')).toThrow('No hardware wallet connector registered');
  });
});
