import { HDKey } from '@scure/bip32';
import type { P2Ret, P2TROut } from '@scure/btc-signer/payment';

import {
  BitcoinNativeSegwitPayer,
  BitcoinPayer,
  BitcoinTaprootPayer,
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
  paymentType: 'p2wpkh' | 'p2tr';
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): SupportedPaymentReturn;
}
function makeBitcoinPayer<T extends MakeBitcoinPayerArgs>(args: T) {
  const { keychain, network, paymentFn, keyOrigin, masterKeyFingerprint, paymentType } = args;
  const payment = paymentFn(keychain, network) as ReturnType<T['paymentFn']>;
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

interface BitcoinSoftwarePayerFactoryArgs<
  TPaymentFn extends (keychain: HDKey, network: BitcoinNetworkModes) => SupportedPaymentReturn,
> {
  accountKeychain: HDKey;
  accountKeyOrigin: string;
  masterKeyFingerprint: string;
  paymentFn: TPaymentFn;
  network: BitcoinNetworkModes;
}

export function bitcoinSoftwarePayerFactory<
  TPaymentFn extends (keychain: HDKey, network: BitcoinNetworkModes) => SupportedPaymentReturn,
>(
  args: BitcoinSoftwarePayerFactoryArgs<TPaymentFn>
): (args: {
  changeIndex: number;
  addressIndex: number;
}) => PaymentToPayer<ExtractPaymentReturn<TPaymentFn>> {
  const { network, paymentFn, accountKeychain, accountKeyOrigin, masterKeyFingerprint } = args;
  return ({ changeIndex, addressIndex }) => {
    const payerKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)({
      changeIndex,
      addressIndex,
    });

    const payment = paymentFn(payerKeychain, network);

    const paymentType = payment.type as 'p2wpkh' | 'p2tr';

    const payer = makeBitcoinPayer({
      keychain: deriveKeychainFromXpub(payerKeychain.publicExtendedKey),
      network,
      keyOrigin: appendAddressIndexToPath(accountKeyOrigin, changeIndex, addressIndex),
      masterKeyFingerprint,
      paymentType,
      paymentFn,
    });
    return payer as unknown as PaymentToPayer<ExtractPaymentReturn<TPaymentFn>>;
  };
}
