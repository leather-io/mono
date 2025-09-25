import { Link } from 'react-router';

import { cmsClient } from '~/constants/cms-client';

import { changelogEntryBySlugQuery } from '@leather.io/cms';
import { Link as LinkButton } from '@leather.io/ui';

import { Route } from './+types/changelog-entry.route';
import { ChangelogEntry } from './components/changelog-entry';
import { ChangelogEntryLayout, ChangelogPageLayout } from './components/changelog-page-layout';

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  const entry = await cmsClient.fetch(changelogEntryBySlugQuery, { slug });

  return { entry };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.entry) {
    return [
      { title: 'Changelog Entry Not Found – Leather' },
      { name: 'description', content: 'Changelog entry not found' },
    ];
  }

  const { entry } = loaderData;

  return [
    { title: `${entry.title} – Leather` },
    { name: 'description', content: `Changelog entry: ${entry.title}` },
  ];
}

export default function ChangelogEntryRoute({ loaderData }: Route.ComponentProps) {
  const { entry } = loaderData;

  if (!entry) return null;

  return (
    <ChangelogPageLayout>
      <ChangelogEntry entry={entry} key={entry._id}>
        <ChangelogEntryLayout
          leftColumn={
            <Link to="/changelog">
              <LinkButton pos="relative" top="-2px">
                Back to changelog
              </LinkButton>
            </Link>
          }
        >
          <ChangelogEntry.Title />
          <ChangelogEntry.PublishDate />
          <ChangelogEntry.Image />
          <ChangelogEntry.Body />
          <ChangelogEntry.Tags />
        </ChangelogEntryLayout>
      </ChangelogEntry>
    </ChangelogPageLayout>
  );
}
