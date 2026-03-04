import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  Sip10Asset,
} from '@leather.io/models';
import { getSip10TokenNameWithOverrides, getTicker, isUndefined } from '@leather.io/utils';

import { LeatherApiSip10Token } from '../infrastructure/api/leather/leather-api.client';

export function isTransferableSip10Token(token: LeatherApiSip10Token) {
  return !isUndefined(token.decimals) && !isUndefined(token.name) && !isUndefined(token.symbol);
}

export function getAssetNameFromIdentifier(assetIdentifier: string) {
  return !assetIdentifier.includes('::') ? assetIdentifier : assetIdentifier.split('::')[1];
}

export function getContractPrincipalFromAssetIdentifier(assetIdentifier: string) {
  return assetIdentifier.split('::')[0];
}

export function getAddressFromAssetIdentifier(assetIdentifier: string) {
  const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
  return principal.split('.')[0];
}

export function getAssetIdentifierFromContract(
  contractAddress: string,
  contractName: string,
  assetName: string
) {
  return `${contractAddress}.${contractName}::${assetName}`;
}

export function getContractPrincipalFromAddressAndName(
  contractAddress: string,
  contractName: string
) {
  return `${contractAddress}.${contractName}`;
}

export function createSip10Asset(sip10Token: LeatherApiSip10Token): Sip10Asset {
  const assetName = getAssetNameFromIdentifier(sip10Token.assetIdentifier);
  const name = getSip10TokenNameWithOverrides(sip10Token.principal, sip10Token.name ?? assetName);

  return {
    chain: CryptoAssetChains.stacks,
    category: CryptoAssetCategories.fungible,
    protocol: CryptoAssetProtocols.sip10,
    canTransfer: isTransferableSip10Token(sip10Token),
    assetId: sip10Token.assetIdentifier,
    contractId: sip10Token.principal,
    decimals: sip10Token.decimals ?? 0,
    hasMemo: isTransferableSip10Token(sip10Token),
    imageCanonicalUri: sip10Token.image ?? '',
    name,
    symbol: sip10Token.symbol || getTicker(name),
  };
}
