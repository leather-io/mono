export interface WalletId {
  fingerprint: string;
}

export interface AccountId extends WalletId {
  accountIndex: number;
}

export interface HdBitcoinAddressInfo {
  type: 'hd';
  taprootDescriptor: string;
  nativeSegwitDescriptor: string;
  zeroIndexTaprootPayerAddress?: string;
  zeroIndexNativeSegwitPayerAddress?: string;
}

export interface FixedBitcoinAddressInfo {
  type: 'fixedAddress';
  address: string;
  paymentType: 'p2wsh' | 'p2wpkh' | 'p2sh' | 'p2pkh' | 'p2tr';
  multisig?: { threshold: number; signerCount: number };
}

export type BitcoinAddressInfo = HdBitcoinAddressInfo | FixedBitcoinAddressInfo;

export interface StacksAddressInfo {
  stxAddress: string;
}

export interface AccountAddresses {
  id: AccountId;
  bitcoin?: BitcoinAddressInfo;
  stacks?: StacksAddressInfo;
}
