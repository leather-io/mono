export function formatColorHexForParams(colorHex: string) {
  return colorHex.replace('#', '');
}

interface MatchAddresses<T> {
  btcAddress: string | undefined;
  stxAddress: string | undefined;
  resultMap: {
    bothAvailable: T;
    onlyBtc: T;
    onlyStx: T;
    none: T;
  };
}

export function matchAddresses<T>({ btcAddress, stxAddress, resultMap }: MatchAddresses<T>) {
  if (btcAddress && stxAddress) {
    return resultMap.bothAvailable;
  }
  if (btcAddress) {
    return resultMap.onlyBtc;
  }
  if (stxAddress) {
    return resultMap.onlyStx;
  }
  return resultMap.none;
}
