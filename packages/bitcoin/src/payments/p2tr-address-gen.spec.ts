import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';

import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';

import { deriveAddressIndexKeychainFromAccount } from '../utils/bitcoin.utils';
import {
  deriveTaprootAccount,
  getTaprootPaymentFromAddressIndex,
  makeTaprootAddressIndexDerivationPath,
} from './p2tr-address-gen';

// TODO: this is a SECRET_KEY from @tests/mocks folder.
// Temporary until we move @tests/mocks folder to monorepo.
export const SECRET_KEY =
  'invite helmet save lion indicate chuckle world pride afford hard broom draft';

// Source:
// generated in Sparrow with same secret key used in tests
const addresses = {
  "m/86'/0'/0'/0/0": 'tb1p05uectcay8ptepqneycknxf0ewvdejcl0zdqex98ux87w7tzqjfsd7yxyl',
  "m/86'/0'/0'/1/0": 'tb1p8vf4ljcj43f0dqd8xprsf2w8g8wcqktsmly2rd92sh235nnjlg6qf2g4c6',
  "m/86'/0'/0'/0/1": 'tb1papsqvj9s2yn9mavhtuk9jyw4arlwcxey33n49g02rpjcajx88qrszpytxl',
  "m/86'/0'/0'/1/1": 'tb1p40xhx5m44fznk6vzxmyn4grlgmzunwrx3slqwzslg8rag9r236vsqmnkf3',
  "m/86'/0'/0'/0/2": 'tb1pfnegsp8x0gnjrgzu0p5xrltrms50prpl8c5a3rwfcrp9p9vumnfsv7zn84',
  "m/86'/0'/0'/1/2": 'tb1pn98uf3ln2lxn6n99rkk7nxx5u54g9rrlcfe2ere0w7m3hww93vuqrwmwwy',
  "m/86'/0'/0'/0/3": 'tb1pzqp06cvvcmftc4g69kuqt5z59k3uyuuwzsg796c00scav0vxjevs3gsvpr',
  "m/86'/0'/0'/1/3": 'tb1pnap8rexj2gqcjtq3vncav29duu4ungcys0kgcste5sdy04mg98usfcp90t',
  "m/86'/0'/0'/0/4": 'tb1p2acyvr7wzvdr2m9fprg2e48k03rjvvq8au680jtrxqrz5m9m5kdsurrp2z',
  "m/86'/0'/0'/1/4": 'tb1p4ssvcjmhuzlvwp48828zswvktjw8g6s9lwrcq5ecc5yjqwv5pp9s9624v6',
  "m/86'/0'/0'/0/5": 'tb1p3kautzlyralsnxf2fv7rudlgyhu6u0lcvzdnlhaywl4h8l7yk0ds59lvfg',
  "m/86'/0'/0'/1/5": 'tb1p3m3yxhjtnq86r9s62h6t9cnweu5se07c0srdureyly3z9kny68pqc5cnnn',
};

describe('taproot address gen', () => {
  test.each(Object.entries(addresses))(
    'should generate taproot addresses',
    (derivationPath, address) => {
      const keychain = HDKey.fromMasterSeed(mnemonicToSeedSync(SECRET_KEY));
      const addressIndex = extractAddressIndexFromPath(derivationPath);
      const changeIndex = extractChangeIndexFromPath(derivationPath);
      const accountZero = deriveTaprootAccount(keychain, 'testnet')(0);

      const addressIndexDetails = getTaprootPaymentFromAddressIndex(
        deriveAddressIndexKeychainFromAccount(accountZero.keychain)({
          addressIndex,
          changeIndex,
        }),
        'testnet'
      );
      if (!accountZero.keychain.privateKey) throw new Error('No private key found');

      expect(addressIndexDetails.address).toEqual(address);
    }
  );
});

describe(makeTaprootAddressIndexDerivationPath.name, () => {
  it('creates mainnet receive path', () => {
    expect(
      makeTaprootAddressIndexDerivationPath({
        network: 'mainnet',
        accountIndex: 5,
        changeIndex: 0,
        addressIndex: 0,
      })
    ).toEqual("m/86'/0'/5'/0/0");
  });
  it('creates mainnet change path', () => {
    expect(
      makeTaprootAddressIndexDerivationPath({
        network: 'mainnet',
        accountIndex: 42,
        changeIndex: 1,
        addressIndex: 5,
      })
    ).toEqual("m/86'/0'/42'/1/5");
  });
  it('creates testnet change path', () => {
    expect(
      makeTaprootAddressIndexDerivationPath({
        network: 'testnet',
        accountIndex: 0,
        changeIndex: 1,
        addressIndex: 1,
      })
    ).toEqual("m/86'/1'/0'/1/1");
  });
});
