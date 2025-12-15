import { AddressType, getAddressInfo } from 'bitcoin-address-validation';
import * as bitcoin from 'bitcoinjs-lib';

export function deconstructBtcAddress(address: string) {
  const typeMapping = {
    [AddressType.p2pkh]: '0x00',
    [AddressType.p2sh]: '0x01',
    [AddressType.p2wpkh]: '0x04',
    [AddressType.p2wsh]: '0x05',
    [AddressType.p2tr]: '0x06',
  };

  const addressInfo = getAddressInfo(address);

  const { bech32 } = addressInfo;
  let hashbytes: Uint8Array;
  if (bech32) {
    hashbytes = bitcoin.address.fromBech32(address).data;
  } else {
    hashbytes = bitcoin.address.fromBase58Check(address).hash;
  }

  const type = typeMapping[addressInfo.type];
  if (!type) {
    throw new Error(`Unsupported address type: ${addressInfo.type}`);
  }

  return {
    type,
    hashbytes,
  };
}
