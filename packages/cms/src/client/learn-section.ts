import { cmsCdnClient } from './cdn-client';

type LearnSectionKey = 'extension-tokens' | 'extension-collectibles' | 'mobile-home';

interface SanityLearnItem {
  label: string;
  iconUrl: string | null;
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
  iconUrl: string | null;
  url: string;
}

const helpCenterBaseUrl = 'https://app.leather.io/support';

function resolveLearnItemUrl(item: SanityLearnItem): string {
  if (item.linkType === 'guide' && item.guideSlug) {
    return `${helpCenterBaseUrl}/${item.guideSlug}`;
  }
  if (item.linkType === 'url' && item.externalUrl) {
    return item.externalUrl;
  }
  return helpCenterBaseUrl;
}

const learnSectionQuery = `*[_type == "learnSection" && key == $key][0]{ key, items[]{ label, "iconUrl": icon.asset->url, linkType, guideSlug, externalUrl } }`;

export async function fetchLearnSection(
  key: LearnSectionKey,
  signal?: AbortSignal
): Promise<ResolvedLearnItem[] | null> {
  const result = await cmsCdnClient.fetch<SanityLearnSection | null>(
    learnSectionQuery,
    { key },
    { signal }
  );
  if (!result?.items) return null;
  return result.items.map(item => ({
    label: item.label,
    iconUrl: item.iconUrl,
    url: resolveLearnItemUrl(item),
  }));
}
