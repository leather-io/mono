import { Link, type MetaDescriptor, data } from 'react-router';

import { SITE_ORIGIN } from '~/constants/constants';
import { NotFound } from '~/pages/error/not-found';

import { ArrowLeftIcon, Button } from '@leather.io/ui';

import { type Route } from './+types/changelog-entry.route';
import { getChangelogDescription, getChangelogEntry } from './changelog.data';
import { ChangelogEntry } from './components/changelog-entry';
import { ChangelogEntryLayout, ChangelogPageLayout } from './components/changelog-page-layout';

export function loader({ params }: Route.LoaderArgs) {
  const entry = getChangelogEntry(params.slug);
  return data({ entry }, { status: entry ? 200 : 404 });
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.entry) {
    return [
      { title: 'Leather Changelog Not Found – Leather' },
      { name: 'description', content: 'Changelog entry not found' },
    ];
  }

  const { entry } = loaderData;
  const title = entry.title ?? 'Changelog';
  const description = getChangelogDescription(entry);
  const imageUrl = entry.cover ? `${SITE_ORIGIN}${entry.cover}` : undefined;

  const metaTags: MetaDescriptor[] = [
    { title: `${title} – Leather Changelog` },
    { name: 'description', content: `${description}` },
    { property: 'og:title', content: `${title} – Leather Changelog` },
    { property: 'og:description', content: `${description}` },
    { name: 'twitter:title', content: `${title} – Leather Changelog` },
    { name: 'twitter:description', content: `${description}` },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];

  if (imageUrl) {
    metaTags.push(
      { name: 'twitter:image', content: imageUrl },
      { property: 'og:image', content: imageUrl }
    );
  }

  return metaTags;
}

export default function ChangelogEntryRoute({ loaderData }: Route.ComponentProps) {
  const { entry } = loaderData;

  if (!entry) {
    return (
      <NotFound
        heading="Changelog entry not found"
        recovery={{ href: '/changelog', label: 'Back to changelog' }}
      />
    );
  }

  return (
    <ChangelogPageLayout
      backButton={
        <Link to="/changelog">
          <Button variant="ghost" size="sm" iconStart={ArrowLeftIcon} p="space.02" gap="0" />
        </Link>
      }
    >
      <ChangelogEntry entry={entry} key={entry.slug}>
        <ChangelogEntryLayout
          leftColumn={
            <>
              <ChangelogEntry.PublishDate />
              <ChangelogEntry.Title />
            </>
          }
          isLast
        >
          <ChangelogEntry.Image />
          <ChangelogEntry.Body mt="space.01" />
        </ChangelogEntryLayout>
      </ChangelogEntry>
    </ChangelogPageLayout>
  );
}
