import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';

import { Feed } from 'feed';
import remarkGfm from 'remark-gfm';
import { SITE_ORIGIN } from '~/constants/constants';

import { getChangelogEntries } from './changelog.data';

// Feed readers need absolute links and image URLs
function toAbsoluteUrl(url: string) {
  const safeUrl = defaultUrlTransform(url);
  return safeUrl.startsWith('/') ? `${SITE_ORIGIN}${safeUrl}` : safeUrl;
}

export function loader() {
  const feed = new Feed({
    title: 'Leather Changelog',
    description: 'Product updates from Leather',
    id: `${SITE_ORIGIN}/changelog`,
    link: `${SITE_ORIGIN}/changelog`,
    generator: 'Leather.io',
    language: 'en',
    copyright: `All rights reserved ${new Date().getFullYear()}, Leather`,
  });

  getChangelogEntries().forEach(entry =>
    feed.addItem({
      title: entry.title,
      id: `${SITE_ORIGIN}/changelog/${entry.slug}`,
      link: `${SITE_ORIGIN}/changelog/${entry.slug}`,
      content: renderToStaticMarkup(
        <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={toAbsoluteUrl}>
          {entry.body}
        </ReactMarkdown>
      ),
      date: new Date(entry.publishedAt),
    })
  );

  return new Response(feed.rss2(), { headers: { 'Content-Type': 'application/rss+xml' } });
}
