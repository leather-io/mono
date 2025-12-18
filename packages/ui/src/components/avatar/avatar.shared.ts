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
