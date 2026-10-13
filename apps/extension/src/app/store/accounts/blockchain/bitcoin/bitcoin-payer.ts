import { type HDKey } from '@scure/bip32';
import type { P2Ret, P2TROut } from '@scure/btc-signer/payment';

import {
  type BitcoinNativeSegwitPayer,
  type BitcoinPayer,
  type BitcoinTaprootPayer,
  deriveAddressIndexKeychainFromAccount,
} from '@leather.io/bitcoin';
import { appendAddressIndexToPath, deriveKeychainFromXpub } from '@leather.io/crypto';
import type { BitcoinNetworkModes } from '@leather.io/models';

// Conditional type to infer payment-specific Payer type
type PaymentToPayer<TPayment> = TPayment extends P2TROut
  ? BitcoinTaprootPayer
  : TPayment extends P2Ret
    ? BitcoinNativeSegwitPayer
    : BitcoinPayer;

type ExtractPaymentReturn<T> = T extends (keychain: HDKey, network: BitcoinNetworkModes) => infer R
  ? R
  : never;

type SupportedPaymentReturn = P2Ret | P2TROut;

interface MakeBitcoinPayerArgs {
  keychain: HDKey;
  network: BitcoinNetworkModes;
  keyOrigin: string;
  masterKeyFingerprint: string;
  paymentType: string;
  paymentFn: (keychain: HDKey, network: BitcoinNetworkModes) => SupportedPaymentReturn;
}
function makeBitcoinPayer(args: MakeBitcoinPayerArgs) {
  const { keychain, network, paymentFn, keyOrigin, masterKeyFingerprint, paymentType } = args;
  const payment = paymentFn(keychain, network);
  return {
    paymentType,
    network,
    payment,
    keyOrigin,
    masterKeyFingerprint,
    keychain,
    get address() {
      if (!payment.address) throw new Error('Unable to get address from payment');
      return payment.address;
    },
    get publicKey() {
      if (!keychain.publicKey) throw new Error('Unable to get publicKey from keychain');
      return keychain.publicKey;
    },
  };
}

type SupportedPaymentFn = (keychain: HDKey, network: BitcoinNetworkModes) => SupportedPaymentReturn;

interface PayerIndexArgs {
  changeIndex: number;
  addressIndex: number;
}

interface BitcoinSoftwarePayerFactoryArgs<TPaymentFn extends SupportedPaymentFn> {
  accountKeychain: HDKey;
  accountKeyOrigin: string;
  masterKeyFingerprint: string;
  paymentFn: TPaymentFn;
  network: BitcoinNetworkModes;
}

export function bitcoinSoftwarePayerFactory<TPaymentFn extends SupportedPaymentFn>(
  args: BitcoinSoftwarePayerFactoryArgs<TPaymentFn>
): (args: PayerIndexArgs) => PaymentToPayer<ExtractPaymentReturn<TPaymentFn>>;
export function bitcoinSoftwarePayerFactory(
  args: BitcoinSoftwarePayerFactoryArgs<SupportedPaymentFn>
): (args: PayerIndexArgs) => unknown {
  const { network, paymentFn, accountKeychain, accountKeyOrigin, masterKeyFingerprint } = args;
  return ({ changeIndex, addressIndex }) => {
    const payerKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)({
      changeIndex,
      addressIndex,
    });

    const payment = paymentFn(payerKeychain, network);

    const paymentType = payment.type;

    return makeBitcoinPayer({
      keychain: deriveKeychainFromXpub(payerKeychain.publicExtendedKey),
      network,
      keyOrigin: appendAddressIndexToPath(accountKeyOrigin, changeIndex, addressIndex),
      masterKeyFingerprint,
      paymentType,
      paymentFn,
    });
  };
}
