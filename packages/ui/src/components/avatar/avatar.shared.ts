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
  // TODO: work is needed to give better SIP-10 support
  // often the imageCanonicalUri is not set, so we need to use the contractId or name to generate a random avatar
  // LEA-2264: use ALEX avatars
  // LEA-2551: use leather hosted avatars
  if (imageCanonicalUri) return imageCanonicalUri;
  return getAvatarUrl(contractId || name);
}

export function getAvatarUrl(inputString: string | undefined): string {
  // https://avatar.vercel.sh/ generates a random avatar based on the input string
  const avatar = inputString?.substring(0, 2).toUpperCase() || '?? ';
  return `https://avatar.vercel.sh/${avatar}?size=36`;
}
