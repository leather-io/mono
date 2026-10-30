import {
  ChangelogStrip,
  type ChangelogStripEntry,
  fetchChangelogStrip,
} from '~/pages/marketing/shared/changelog-strip';
import { marketingHeaders, marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { MarketingPage } from '~/pages/marketing/shared/marketing-page';

import { type Route } from './+types/home.route';
import {
  HomeFullControl,
  HomeProtection,
  HomeSwapsAndLedger,
  HomeWallets,
} from './components/home-features';
import { HomeHero } from './components/home-hero';
import { HomeProviders } from './components/home-providers';
import { HomeTrust } from './components/home-trust';

export const headers = marketingHeaders;

export function meta() {
  return marketingMeta({ title: 'Leather', path: '/' });
}

export async function loader(): Promise<{ changelog: ChangelogStripEntry[] }> {
  return { changelog: await fetchChangelogStrip() };
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return (
    <MarketingPage>
      <HomeHero />
      <HomeSwapsAndLedger />
      <HomeWallets />
      <HomeFullControl />
      <HomeProtection />
      <HomeTrust />
      <HomeProviders />
      <ChangelogStrip entries={loaderData.changelog} mt={['112px', null, '160px', '200px']} />
    </MarketingPage>
  );
}
