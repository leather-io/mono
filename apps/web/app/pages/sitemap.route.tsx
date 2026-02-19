import { cmsClient } from '~/constants/cms-client';
import { BASE_URL } from '~/constants/meta-tags';

import {
  changelogQuery,
  legacyHelpCenterCategoryBySlugQuery,
  legacyHelpCenterPageQuery,
} from '@leather.io/cms';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(url => {
      const lastmod = url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : '';
      const changefreq = url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : '';
      const priority = url.priority !== undefined ? `<priority>${url.priority}</priority>` : '';

      return `  <url>
    <loc>${url.loc}</loc>${lastmod}${changefreq}${priority}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export async function loader() {
  const urls: SitemapUrl[] = [];

  // Static routes
  const staticRoutes = [
    { path: '/stacking', priority: 1.0, changefreq: 'weekly' as const },
    { path: '/portfolio', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/sbtc', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/changelog', priority: 0.8, changefreq: 'daily' as const },
    { path: '/support', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/advanced', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/advanced/signer-key-generation', priority: 0.5, changefreq: 'monthly' as const },
  ];

  for (const route of staticRoutes) {
    urls.push({
      loc: `${BASE_URL}${route.path}`,
      priority: route.priority,
      changefreq: route.changefreq,
    });
  }

  // Fetch changelog entries from CMS
  const changelogEntries = await cmsClient.fetch(changelogQuery);
  for (const entry of changelogEntries) {
    urls.push({
      loc: `${BASE_URL}/changelog/${entry.slug.current}`,
      lastmod: entry._updatedAt
        ? new Date(entry._updatedAt).toISOString().split('T')[0]
        : undefined,
      changefreq: 'monthly',
      priority: 0.6,
    });
  }

  // Fetch help center categories
  const helpCenter = await cmsClient.fetch(legacyHelpCenterPageQuery);
  if (helpCenter?.categories) {
    for (const category of helpCenter.categories) {
      if (category.slug?.current) {
        urls.push({
          loc: `${BASE_URL}/support/${category.slug.current}`,
          changefreq: 'weekly',
          priority: 0.7,
        });

        // Fetch guides for each category
        const categoryData = await cmsClient.fetch(legacyHelpCenterCategoryBySlugQuery, {
          slug: category.slug.current,
        });
        if (categoryData?.guides) {
          for (const guide of categoryData.guides) {
            if (guide.slug?.current) {
              urls.push({
                loc: `${BASE_URL}/support/guide/${guide.slug.current}`,
                lastmod: guide._updatedAt
                  ? new Date(guide._updatedAt).toISOString().split('T')[0]
                  : undefined,
                changefreq: 'monthly',
                priority: 0.6,
              });
            }
          }
        }
      }
    }
  }

  return new Response(generateSitemapXml(urls), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
