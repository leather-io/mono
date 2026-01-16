import { IconSize } from '../../icons/icon/icon.shared';

export type AvatarVariant = 'circle' | 'square';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export const defaultFallbackDelay = 600;
export const iconSizeMap: Record<
  AvatarSize,
  { width: number; height: number } | { variant: IconSize }
> = {
  xs: { width: 7, height: 7 },
  sm: { variant: 'small' },
  md: { variant: 'medium' },
  lg: { variant: 'medium' },
  xl: { variant: 'medium' },
};

const sbtcContractIds = [
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
  'SNGWPN3XDAQE673MXYXF81016M50NHF5X5PWWM70.sbtc-token',
];

const usdcxContractIds = [
  'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx',
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx',
];

export function isSbtcAsset(contractId: string): boolean {
  return sbtcContractIds.some(id => contractId.startsWith(id));
}

export function isUsdcxAsset(contractId: string): boolean {
  return usdcxContractIds.some(id => contractId.startsWith(id));
}

interface GetSip10AvatarImageProps {
  imageCanonicalUri: string;
  contractId: string;
  name: string;
}
export function getSip10AvatarImage({
  imageCanonicalUri,
  contractId,
  name,
}: GetSip10AvatarImageProps) {
  if (imageCanonicalUri) return imageCanonicalUri;
  return getAvatarUrl(contractId || name);
}

export function getAvatarUrl(inputString: string | undefined, size = 48): string {
  // https://avatar.vercel.sh/ generates a random avatar based on the input string
  const avatar = getAvatarFallbackText(inputString);
  return `https://avatar.vercel.sh/${avatar}?size=${size}`;
}

export function getAvatarFallbackText(inputString: string | undefined): string {
  return inputString?.substring(0, 2).toUpperCase() || '??';
}
