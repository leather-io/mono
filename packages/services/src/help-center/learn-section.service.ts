import { querySanityCdn } from '../infrastructure/api/sanity/sanity-cdn.client';
import { buildGuideUrl, getHelpCenterBaseUrl } from './help-center.service';

type LearnSectionKey = 'extension-tokens' | 'extension-collectibles' | 'mobile-home';

interface SanityLearnItem {
  label: string;
  iconKey: string;
  linkType: 'guide' | 'url';
  guideSlug: string | null;
  externalUrl: string | null;
}

interface SanityLearnSection {
  key: string;
  items: SanityLearnItem[];
}

export interface ResolvedLearnItem {
  label: string;
  iconKey: string;
  url: string;
}

function resolveLearnItemUrl(item: SanityLearnItem): string {
  if (item.linkType === 'guide' && item.guideSlug) {
    return buildGuideUrl(item.guideSlug);
  }
  if (item.linkType === 'url' && item.externalUrl) {
    return item.externalUrl;
  }
  return getHelpCenterBaseUrl();
}

function buildLearnSectionQuery(key: LearnSectionKey): string {
  return `*[_type == "learnSection" && key == "${key}"][0]{ key, items[]{ label, iconKey, linkType, guideSlug, externalUrl } }`;
}

export async function fetchLearnSection(
  key: LearnSectionKey,
  signal?: AbortSignal
): Promise<ResolvedLearnItem[] | null> {
  const result = await querySanityCdn<SanityLearnSection | null>(
    buildLearnSectionQuery(key),
    signal
  );
  if (!result?.items) return null;
  return result.items.map(item => ({
    label: item.label,
    iconKey: item.iconKey,
    url: resolveLearnItemUrl(item),
  }));
}
