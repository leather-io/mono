import { Network } from 'bitcoin-address-validation';

import { isValidBitcoinAddress } from '@leather.io/models';

import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
  inValidCharactersAddress,
  inValidLengthAddress,
} from '../mocks/mocks';
import { getBitcoinAddressNetworkType, isValidBitcoinNetworkAddress } from './address-validation';

describe('getBitcoinAddressNetworkType', () => {
  it('returns the correct network type', () => {
    expect(getBitcoinAddressNetworkType('mainnet')).toEqual(Network.mainnet);
    expect(getBitcoinAddressNetworkType('testnet')).toEqual(Network.testnet);
    expect(getBitcoinAddressNetworkType('regtest')).toEqual(Network.regtest);
  });

  it('returns Network.testnet type for signet', () => {
    expect(getBitcoinAddressNetworkType('signet')).toEqual(Network.testnet);
  });

  it('returns false for invalid bitcoin addresses', () => {
    // expect(() => isValidBitcoinAddress(inValidLengthAddress)).toThrow(BitcoinError);
    expect(isValidBitcoinAddress('')).toBe(false);

    // @ts-expect-error arg type is invalid
    expect(isValidBitcoinAddress(null)).toBe(false);
    // @ts-expect-error arg type is invalid
    expect(isValidBitcoinAddress(undefined)).toBe(false);
  });

  it('returns false for addresses with invalid characters', () => {
    expect(isValidBitcoinAddress(inValidCharactersAddress)).toBe(false);
  });

  it('returns false for addresses with invalid length', () => {
    expect(isValidBitcoinAddress(inValidLengthAddress)).toBe(false);
  });
});

describe('isValidBitcoinAddress', () => {
  it('returns true for valid bitcoin addresses', () => {
    expect(isValidBitcoinAddress(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS)).toBe(true);
    expect(isValidBitcoinAddress(TEST_ACCOUNT_1_TAPROOT_ADDRESS)).toBe(true);
  });

  it('returns false for invalid bitcoin addresses', () => {
    // expect(() => isValidBitcoinAddress(inValidLengthAddress)).toThrow(BitcoinError);
    expect(isValidBitcoinAddress('')).toBe(false);

    // @ts-expect-error arg type is invalid
    expect(isValidBitcoinAddress(null)).toBe(false);
    // @ts-expect-error arg type is invalid
    expect(isValidBitcoinAddress(undefined)).toBe(false);
  });

  it('returns false for addresses with invalid characters', () => {
    expect(isValidBitcoinAddress(inValidCharactersAddress)).toBe(false);
  });

  it('returns false for addresses with invalid length', () => {
    expect(isValidBitcoinAddress(inValidLengthAddress)).toBe(false);
  });
});

describe('isValidBitcoinNetworkAddress', () => {
  it('returns true for valid bitcoin network addresses', () => {
    expect(isValidBitcoinNetworkAddress(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, 'mainnet')).toBe(
      true
    );
    expect(isValidBitcoinNetworkAddress(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, 'mainnet')).toBe(
      true
    );
    expect(isValidBitcoinNetworkAddress(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS, 'testnet')).toBe(true);
    expect(
      isValidBitcoinNetworkAddress(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, 'testnet')
    ).toBe(true);
  });

  it('returns false for invalid bitcoin network addresses', () => {
    expect(isValidBitcoinNetworkAddress(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, 'testnet')).toBe(
      false
    );
    expect(isValidBitcoinNetworkAddress(TEST_ACCOUNT_1_TAPROOT_ADDRESS, 'testnet')).toBe(false);
    expect(
      isValidBitcoinNetworkAddress(TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, 'mainnet')
    ).toBe(false);
    expect(isValidBitcoinNetworkAddress(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS, 'mainnet')).toBe(false);
  });

  it('returns false for addresses with invalid characters', () => {
    expect(isValidBitcoinNetworkAddress(inValidCharactersAddress, 'mainnet')).toBe(false);
  });

  it('returns false for addresses with invalid length', () => {
    expect(isValidBitcoinNetworkAddress(inValidLengthAddress, 'mainnet')).toBe(false);
  });

  it('returns false for invalid network types', () => {
    expect(
      // @ts-expect-error arg type is invalid
      isValidBitcoinNetworkAddress(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, 'invalid-network')
    ).toBe(false);
  });
});

// taken from bitcoin-address-validation/blob/master/tests/index.spec.ts
// adapted to our code to ensure completeness

describe('bitcoin-address-validation address tests', () => {
  describe('Validation and parsing', () => {
    it('validates Mainnet P2PKH', () => {
      const address = '17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });
    it('validates Testnet P2PKH', () => {
      const address = 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Mainnet P2SH', () => {
      const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Testnet P2SH', () => {
      const address = '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Mainnet Bech32 P2WPKH', () => {
      const addresses = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'bc1q973xrrgje6etkkn9q9azzsgpxeddats8ckvp5s',
      ];

      expect(isValidBitcoinAddress(addresses[0])).not.toBe(false);
      expect(isValidBitcoinAddress(addresses[1])).not.toBe(false);
    });

    it('validates Testnet Bech32 P2WPKH', () => {
      const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Regtest Bech32 P2WPKH', () => {
      const address = 'bcrt1q6z64a43mjgkcq0ul2znwneq3spghrlau9slefp';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Mainnet Bech32 P2WSH', () => {
      const address = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Testnet Bech32 P2WSH', () => {
      const address = 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Regtest Bech32 P2WSH', () => {
      const address = 'bcrt1q5n2k3frgpxces3dsw4qfpqk4kksv0cz96pldxdwxrrw0d5ud5hcqzzx7zt';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Signet Bech32 P2WKH', () => {
      const address = 'bcrt1qc7evl8kdgp69h7qmm8cndaq07xkhj6ulyck0x5';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Testnet P2PKH', () => {
      const address = 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('fails on invalid P2PKH', () => {
      const address = '17VZNX1SN5NtKa8UFFxwQbFeFc3iqRYhem';

      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    it('validates Mainnet P2SH', () => {
      const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Testnet P2SH', () => {
      const address = '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('fails on invalid P2SH', () => {
      const address = '17VZNX1SN5NtKa8UFFxwQbFFFc3iqRYhem';

      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    it('handles bogus address', () => {
      const address = 'x';

      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    it('validates Mainnet Bech32 P2WPKH', () => {
      const addresses = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'bc1q973xrrgje6etkkn9q9azzsgpxeddats8ckvp5s',
      ];

      expect(isValidBitcoinAddress(addresses[0])).not.toBe(false);

      expect(isValidBitcoinAddress(addresses[1])).not.toBe(false);
    });

    it('validates uppercase Bech32 P2WPKH', () => {
      const addresses = [
        'BC1Q973XRRGJE6ETKKN9Q9AZZSGPXEDDATS8CKVP5S',
        'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
      ];

      expect(isValidBitcoinAddress(addresses[0])).not.toBe(false);

      expect(isValidBitcoinAddress(addresses[1])).not.toBe(false);
    });

    it('validates Testnet Bech32 P2WPKH', () => {
      const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Regtest Bech32 P2WPKH', () => {
      const address = 'bcrt1q6z64a43mjgkcq0ul2znwneq3spghrlau9slefp';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Mainnet Bech32 P2TR', () => {
      const address = 'bc1ptxs597p3fnpd8gwut5p467ulsydae3rp9z75hd99w8k3ljr9g9rqx6ynaw';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Testnet Bech32 P2TR', () => {
      const address = 'tb1p84x2ryuyfevgnlpnxt9f39gm7r68gwtvllxqe5w2n5ru00s9aquslzggwq';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Regtest Bech32 P2TR', () => {
      const address = 'bcrt1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqc8gma6';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Mainnet Bech32 P2WSH', () => {
      const address = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Testnet Bech32 P2WSH', () => {
      const address = 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Regtest Bech32 P2WSH', () => {
      const address = 'bcrt1q5n2k3frgpxces3dsw4qfpqk4kksv0cz96pldxdwxrrw0d5ud5hcqzzx7zt';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('validates Signet Bech32 P2WKH', () => {
      const address = 'bcrt1qc7evl8kdgp69h7qmm8cndaq07xkhj6ulyck0x5';

      expect(isValidBitcoinAddress(address)).not.toBe(false);
    });

    it('fails on invalid Bech32', () => {
      const address = 'bc1qw508d6qejxtdg4y5r3zrrvary0c5xw7kv8f3t4';

      expect(isValidBitcoinAddress(address)).toBe(false);
    });
  });

  describe('Validation & network', () => {
    it('validates Mainnet P2PKH', () => {
      const address = '17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem';

      expect(isValidBitcoinNetworkAddress(address, Network.mainnet)).toBe(true);
    });

    it('validates Testnet P2PKH', () => {
      const address = 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn';

      expect(isValidBitcoinNetworkAddress(address, Network.testnet)).toBe(true);
    });

    it('fails on invalid P2PKH', () => {
      const address = '17VZNX1SN5NtKa8UFFxwQbFeFc3iqRYhem';

      expect(isValidBitcoinNetworkAddress(address, Network.mainnet)).toBe(false);
    });

    it('validates Mainnet P2SH', () => {
      const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';

      expect(isValidBitcoinNetworkAddress(address, Network.mainnet)).toBe(true);
    });

    it('validates Testnet P2SH', () => {
      const address = '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc';

      expect(isValidBitcoinNetworkAddress(address, Network.testnet)).toBe(true);
    });

    it('fails on invalid P2SH', () => {
      const address = '17VZNX1SN5NtKa8UFFxwQbFFFc3iqRYhem';

      expect(isValidBitcoinNetworkAddress(address, Network.mainnet)).toBe(false);
    });

    it('handles bogus address', () => {
      const address = 'x';

      expect(isValidBitcoinNetworkAddress(address, Network.mainnet)).toBe(false);
    });

    it('validates Mainnet Bech32 P2WPKH', () => {
      const addresses = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'bc1q973xrrgje6etkkn9q9azzsgpxeddats8ckvp5s',
      ];

      expect(isValidBitcoinNetworkAddress(addresses[0], Network.mainnet)).toBe(true);

      expect(isValidBitcoinNetworkAddress(addresses[1], Network.mainnet)).toBe(true);
    });

    it('validates Testnet Bech32 P2WPKH', () => {
      const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';

      expect(isValidBitcoinNetworkAddress(address, Network.testnet)).toBe(true);
    });

    it('validates Regtest Bech32 P2WPKH', () => {
      const address = 'bcrt1q6z64a43mjgkcq0ul2znwneq3spghrlau9slefp';

      expect(isValidBitcoinNetworkAddress(address, Network.regtest)).toBe(true);
    });

    it('validates Mainnet Bech32 P2WSH', () => {
      const address = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

      expect(isValidBitcoinNetworkAddress(address, Network.mainnet)).toBe(true);
    });

    it('validates Testnet Bech32 P2WSH', () => {
      const address = 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7';

      expect(isValidBitcoinNetworkAddress(address, Network.testnet)).toBe(true);
    });

    it('validates Regtest Bech32 P2WSH', () => {
      const address = 'bcrt1q5n2k3frgpxces3dsw4qfpqk4kksv0cz96pldxdwxrrw0d5ud5hcqzzx7zt';

      expect(isValidBitcoinNetworkAddress(address, Network.regtest)).toBe(true);
    });

    it('fails on invalid Bech32', () => {
      const address = 'bc1qw508d6qejxtdg4y5r3zrrvary0c5xw7kv8f3t4';

      expect(isValidBitcoinNetworkAddress(address, Network.mainnet)).toBe(false);
    });
  });
});
