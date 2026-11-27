export const bnsContractAddress = {
  mainnet: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF',
  testnet: 'ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M',
};

export const bnsContractName = 'BNS-V2';

export const bnsAssetIdentifiers = [
  `${bnsContractAddress.mainnet}.${bnsContractName}::BNS-V2`,
  `${bnsContractAddress.testnet}.${bnsContractName}::BNS-V2`,
];

export const bnsV1AssetIdentifiers = [
  'SP000000000000000000002Q6VF78.bns::names',
  'ST000000000000000000002AMW42H.bns::names',
];

export interface BnsName {
  owner: string;
  name: string;
  namespace: string;
  fullName: string;
  renewalHeight: number;
  registeredAtBlockNumber: number;
}

export interface BnsProfile {
  bnsName: BnsName;
  profileData: BnsProfileData;
}

export interface BnsProfileData {
  name?: string;
  bio?: string;
  website?: string;
  pfpUrl?: string;
  location?: string;
  addresses?: BnsProfileDataAddresses;
}

export interface BnsProfileDataAddresses {
  bitcoinPayment?: string;
  solana?: string;
  ethereum?: string;
}
