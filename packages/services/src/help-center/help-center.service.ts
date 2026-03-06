import { querySanityCdn } from '../infrastructure/api/sanity/sanity-cdn.client';

const helpCenterBaseUrl = 'https://app.leather.io/support';

interface HelpCenterGuide {
  title: string;
  slug: { current: string };
}

export interface HelpCenterCategory {
  _id: string;
  categoryName: string;
  slug: { current: string };
  guides: HelpCenterGuide[];
}

const helpCenterCategoriesQuery = `*[_type == "helpCenterCategory"]{ _id, categoryName, slug, guides[]->{ title, slug } }`;

export async function fetchHelpCenterCategories(
  signal?: AbortSignal
): Promise<HelpCenterCategory[]> {
  return querySanityCdn<HelpCenterCategory[]>(helpCenterCategoriesQuery, signal);
}

export function buildGuideUrl(slug: string): string {
  return `${helpCenterBaseUrl}/${slug}`;
}

export function getHelpCenterBaseUrl(): string {
  return helpCenterBaseUrl;
}

export function findGuideSlugInCategories(
  categories: HelpCenterCategory[],
  slug: string
): string | undefined {
  for (const category of categories) {
    if (!category.guides) continue;
    const guide = category.guides.find(g => g.slug?.current === slug);
    if (guide) return guide.slug.current;
  }
  return undefined;
}
