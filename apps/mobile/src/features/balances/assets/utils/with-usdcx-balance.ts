import { Sip10Balance } from '@leather.io/services';

export function withUsdcxBalance(
  sip10s: Sip10Balance[],
  usdcxAssetId: string,
  usdcxBalance: Sip10Balance | undefined
) {
  const hasUsdcx = sip10s.some(sip10 => sip10.asset.assetId === usdcxAssetId);
  if (hasUsdcx || !usdcxBalance) return [...sip10s];
  return [...sip10s, usdcxBalance];
}
