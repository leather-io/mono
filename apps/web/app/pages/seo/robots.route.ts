import { siteOrigin } from '~/pages/marketing/shared/marketing-meta';

export function loader() {
  const robots = ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteOrigin}/sitemap.xml`, ''].join(
    '\n'
  );

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
