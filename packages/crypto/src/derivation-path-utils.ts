export enum DerivationPathDepth {
  Root = 0,
  Purpose = 1,
  CoinType = 2,
  Account = 3,
  ChangeReceive = 4,
  AddressIndex = 5,
}

function extractSectionFromDerivationPath(depth: DerivationPathDepth) {
  return (path: string) => {
    const segments = path.split('/');
    const accountNum = parseInt(segments[depth].replaceAll("'", ''), 10);
    if (isNaN(accountNum)) throw new Error(`Cannot parse ${DerivationPathDepth[depth]} from path`);
    return accountNum;
  };
}

export const extractAccountIndexFromPath = extractSectionFromDerivationPath(
  DerivationPathDepth.Account
);

export const extractAddressIndexFromPath = extractSectionFromDerivationPath(
  DerivationPathDepth.AddressIndex
);

/**
 * @description
 * Key origin refers to the identifier commonly used as part of the key
 * information provided as part of a Output Descriptor described in BIP-380. It
 * replaces the `m/` part of a derivation path with the fingerprint to which the
 * key it describes belongs.
 * @example `0a3fd8ef/84'/0'/0'`
 */
export function createKeyOriginFromPath(path: string, fingerprint: string) {
  return `${fingerprint}/${path.replace('m/', '')}`;
}
