import { toHTML } from '@portabletext/to-html';
import { Feed } from 'feed';
import { cmsClient } from '~/constants/cms-client';

import { changelogQuery } from '@leather.io/cms';

export async function loader() {
  const changelogEntries = await cmsClient.fetch(changelogQuery);

  const feed = new Feed({
    title: 'Leather Changelog',
    description: 'Product updates from Leather',
    id: 'https://leather.io/changelog',
    link: 'https://leather.io/changelog',
    generator: 'Leather.io',
    language: 'en',
    copyright: `All rights reserved ${new Date().getFullYear()}, Leather`,
  });

  changelogEntries.forEach(entry =>
    feed.addItem({
      title: entry.title,
      id: `https://leather.io/changelog/${entry.slug.current}`,
      link: `https://leather.io/changelog/${entry.slug.current}`,
      content: toHTML(entry.body),
      date: new Date(entry._createdAt),
    })
  );

  return new Response(feed.rss2(), { headers: { 'Content-Type': 'application/rss+xml' } });
}
