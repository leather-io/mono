import { type ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';
import {
  ChangelogStrip,
  type ChangelogStripEntry,
  fetchChangelogStrip,
} from '~/pages/marketing/shared/changelog-strip';
import { marketingHeaders, marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { MarketingPage } from '~/pages/marketing/shared/marketing-page';

import { type Route } from './+types/apps.route';
import { coreTokens, featuredApps, projects } from './apps.data';
import { CoreTokenCard } from './components/core-token-card';
import { EarningCards } from './components/earning-cards';
import { FeaturedAppsCarousel } from './components/featured-apps-carousel';
import { ProjectDirectory } from './components/project-directory';

export async function loader(): Promise<{ changelog: ChangelogStripEntry[] }> {
  return { changelog: await fetchChangelogStrip() };
}

export const headers = marketingHeaders;

export function meta() {
  return marketingMeta({ title: 'Apps – Leather', path: '/apps' });
}

function AppsSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <styled.section
      aria-labelledby={id}
      mt={['space.08', null, 'space.09']}
      _first={{ mt: 'space.05' }}
    >
      <styled.h2 id={id} textStyle="heading.03" mb={['space.05', null, 'space.05']}>
        {title}
      </styled.h2>
      {children}
    </styled.section>
  );
}

export default function AppsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <MarketingPage title="Explore">
      <AppsSection id="core-tokens" title="Core tokens">
        <styled.ul
          display="grid"
          gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
          gap="space.03"
        >
          {coreTokens.map(token => (
            <li key={token.symbol}>
              <CoreTokenCard token={token} />
            </li>
          ))}
        </styled.ul>
      </AppsSection>

      <AppsSection id="earning-on-stacks" title="Earning on Stacks">
        <EarningCards />
      </AppsSection>

      <AppsSection id="featured-apps" title="Featured apps">
        <FeaturedAppsCarousel apps={featuredApps} />
      </AppsSection>

      <AppsSection id="projects" title="Projects">
        <ProjectDirectory projects={projects} />
      </AppsSection>

      <ChangelogStrip entries={loaderData.changelog} mt={['space.08', null, 'space.09']} />
    </MarketingPage>
  );
}
