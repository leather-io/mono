import { Sip10Asset } from '@leather.io/models';

export function matchesSip10SearchTerm(
  asset: Pick<Sip10Asset, 'name' | 'symbol'>,
  searchTerm: string
) {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (normalizedTerm.length === 0) return true;
  return (
    asset.name.toLowerCase().includes(normalizedTerm) ||
    asset.symbol.toLowerCase().includes(normalizedTerm)
  );
}
