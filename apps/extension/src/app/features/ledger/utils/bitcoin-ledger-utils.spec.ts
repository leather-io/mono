import { HDKey } from '@scure/bip32';
import BitcoinApp from 'ledger-bitcoin';

import {
  displayNativeSegwitAddressOnDevice,
  displayTaprootAddressOnDevice,
} from './bitcoin-ledger-utils';

const masterFingerprint = '844b93a0';
const deviceAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

function makeAccountXpub(path: string) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(1)).derive(path).publicExtendedKey;
}

function makeFakeLedgerApp(xpub: string) {
  const app: BitcoinApp = Object.create(BitcoinApp.prototype);
  app.getMasterFingerprint = vi.fn(() => Promise.resolve(masterFingerprint));
  app.getExtendedPubkey = vi.fn(() => Promise.resolve(xpub));
  app.getWalletAddress = vi.fn(() => Promise.resolve(deviceAddress));
  return app;
}

describe(displayNativeSegwitAddressOnDevice.name, () => {
  test('displays the receive address of a default native segwit policy built from the device xpub', async () => {
    const xpub = makeAccountXpub("m/84'/0'/2'");
    const app = makeFakeLedgerApp(xpub);

    const address = await displayNativeSegwitAddressOnDevice(app)({
      network: 'mainnet',
      accountIndex: 2,
    });

    expect(app.getExtendedPubkey).toHaveBeenCalledWith("m/84'/0'/2'");
    const [walletPolicy, hmac, changeIndex, addressIndex, display] = vi.mocked(app.getWalletAddress)
      .mock.calls[0];
    expect(walletPolicy.descriptorTemplate).toBe('wpkh(@0/**)');
    expect(walletPolicy.keys).toEqual([`[${masterFingerprint}/84'/0'/2']${xpub}`]);
    expect(hmac).toBeNull();
    expect(changeIndex).toBe(0);
    expect(addressIndex).toBe(0);
    expect(display).toBe(true);
    expect(address).toBe(deviceAddress);
  });

  test('derives the testnet account path on testnet', async () => {
    const xpub = makeAccountXpub("m/84'/1'/0'");
    const app = makeFakeLedgerApp(xpub);

    await displayNativeSegwitAddressOnDevice(app)({ network: 'testnet', accountIndex: 0 });

    expect(app.getExtendedPubkey).toHaveBeenCalledWith("m/84'/1'/0'");
    const [walletPolicy] = vi.mocked(app.getWalletAddress).mock.calls[0];
    expect(walletPolicy.keys).toEqual([`[${masterFingerprint}/84'/1'/0']${xpub}`]);
  });
});

describe(displayTaprootAddressOnDevice.name, () => {
  test('displays the receive address of a default taproot policy built from the device xpub', async () => {
    const xpub = makeAccountXpub("m/86'/0'/0'");
    const app = makeFakeLedgerApp(xpub);

    const address = await displayTaprootAddressOnDevice(app)({
      network: 'mainnet',
      accountIndex: 0,
    });

    expect(app.getExtendedPubkey).toHaveBeenCalledWith("m/86'/0'/0'");
    const [walletPolicy, hmac, changeIndex, addressIndex, display] = vi.mocked(app.getWalletAddress)
      .mock.calls[0];
    expect(walletPolicy.descriptorTemplate).toBe('tr(@0/**)');
    expect(walletPolicy.keys).toEqual([`[${masterFingerprint}/86'/0'/0']${xpub}`]);
    expect(hmac).toBeNull();
    expect(changeIndex).toBe(0);
    expect(addressIndex).toBe(0);
    expect(display).toBe(true);
    expect(address).toBe(deviceAddress);
  });
});
