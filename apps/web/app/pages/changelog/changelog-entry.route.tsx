import { Link, MetaDescriptor } from 'react-router';

import { cmsClient, getBlockText, urlFor } from '~/constants/cms-client';
import { canonicalUrl } from '~/constants/meta-tags';
import { createArticleSchema } from '~/constants/structured-data';

import { changelogEntryBySlugQuery } from '@leather.io/cms';
import { ArrowLeftIcon, Button } from '@leather.io/ui';

import { Route } from './+types/changelog-entry.route';
import { ChangelogEntry } from './components/changelog-entry';
import { ChangelogEntryLayout, ChangelogPageLayout } from './components/changelog-page-layout';

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  const entry = await cmsClient.fetch(changelogEntryBySlugQuery, { slug });

  return { entry };
}

export function meta({ loaderData, params }: Route.MetaArgs) {
  if (!loaderData?.entry) {
    return [
      { title: 'Leather Changelog Not Found – Leather' },
      { name: 'description', content: 'Changelog entry not found' },
    ];
  }

  const { entry } = loaderData;
  const title = entry.title ?? 'Changelog';
  const textBlocks = entry.body.filter(block => '_type' in block && block._type === 'block');
  const fullText = getBlockText(textBlocks, ' ');
  const description = fullText.split(/(?<!\d)\.(?!\d)|[!?]/)[0].trim() + '.';
  const imageUrl = entry.heroImage?.asset?._ref
    ? urlFor(entry.heroImage).auto('format').format('webp').width(600).height(338).url()
    : undefined;

  const metaTags: MetaDescriptor[] = [
    { title: `${title} – Leather Changelog` },
    { name: 'description', content: `${description}` },
    { property: 'og:title', content: `${title} – Leather Changelog` },
    { property: 'og:description', content: `${description}` },
    { name: 'twitter:title', content: `${title} – Leather Changelog` },
    { name: 'twitter:description', content: `${description}` },
    { name: 'twitter:card', content: 'summary_large_image' },
    canonicalUrl(`/changelog/${params.slug}`),
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

  if (!entry) return null;

  const imageUrl = entry.heroImage?.asset?._ref
    ? urlFor(entry.heroImage).auto('format').format('webp').width(600).height(338).url()
    : undefined;

  const textBlocks = entry.body.filter(block => '_type' in block && block._type === 'block');
  const fullText = getBlockText(textBlocks, ' ');
  const description = fullText.split(/(?<!\d)\.(?!\d)|[!?]/)[0].trim() + '.';

  const articleSchema = createArticleSchema({
    headline: entry.title ?? 'Changelog',
    datePublished: entry.publishedAt ?? entry._createdAt,
    dateModified: entry._updatedAt,
    image: imageUrl,
    description,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ChangelogPageLayout
        backButton={
          <Link to="/changelog">
            <Button variant="ghost" size="sm" iconStart={ArrowLeftIcon} p="space.02" gap="0" />
          </Link>
        }
      >
        <ChangelogEntry entry={entry} key={entry._id}>
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
    </>
  );
}
