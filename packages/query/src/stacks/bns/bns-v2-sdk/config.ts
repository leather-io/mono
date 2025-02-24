import { NetworkModes } from '@leather.io/models';

export const BnsContractName = 'BNS-V2';

enum BnsContractAddress {
  Mainnet = 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF',
  Testnet = 'ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M',
}

export function getBnsContractAddress(network: NetworkModes): string {
  return network === 'mainnet' ? BnsContractAddress.Mainnet : BnsContractAddress.Testnet;
}
