import { LEATHER_DOCS } from '~/constants/leather-docs';
import {
  LEATHER_DOCS_DISCONTINUED_PAGES,
  LEATHER_DOCS_GUIDE_PAGES,
  LEATHER_DOCS_RENAMED_PAGES,
} from '~/constants/leather-docs-pages';

const leatherDocsPagePaths = new Map<string, string>([
  ...LEATHER_DOCS_GUIDE_PAGES.map((path): [string, string] => [
    path.split('/').at(-1) ?? path,
    path,
  ]),
  ...LEATHER_DOCS_RENAMED_PAGES,
]);

function leatherDocsPageUrl(path: string) {
  return `${LEATHER_DOCS.guides}/${path}`;
}

export function hasLeatherDocsGuide(slug: string) {
  return leatherDocsPagePaths.has(slug);
}

/** The slug's Leather Docs page, or the Guides home when there is no page for the slug. */
export function leatherDocsGuideUrl(slug: string) {
  const path = leatherDocsPagePaths.get(slug);
  return path ? leatherDocsPageUrl(path) : LEATHER_DOCS.guides;
}

export function leatherDocsDiscontinuedUrl(feature: keyof typeof LEATHER_DOCS_DISCONTINUED_PAGES) {
  return leatherDocsPageUrl(LEATHER_DOCS_DISCONTINUED_PAGES[feature]);
}
