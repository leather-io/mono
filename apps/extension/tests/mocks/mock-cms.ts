import type { BrowserContext, Page } from '@playwright/test';

const learnItems = [
  {
    label: 'Getting Started with Leather',
    iconKey: 'rocket',
    linkType: 'guide',
    guideSlug: 'getting-started',
    externalUrl: null,
  },
  {
    label: 'What is sBTC?',
    iconKey: 'sbtc',
    linkType: 'guide',
    guideSlug: 'what-is-sbtc',
    externalUrl: null,
  },
  {
    label: 'Learn more about stacking',
    iconKey: 'stacking',
    linkType: 'url',
    guideSlug: null,
    externalUrl: 'https://leather.io/stacking',
  },
];

export async function mockCmsRequests(page: Page | BrowserContext) {
  await page.route('**apicdn.sanity.io/**', route => {
    const key = new URL(route.request().url()).searchParams.get('$key')?.replaceAll('"', '');
    return route.fulfill({ json: { result: { key, items: learnItems } } });
  });
}
