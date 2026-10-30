import { type MetaDescriptor, data } from 'react-router';

import { defaultMarketingDescription } from '~/pages/marketing/shared/marketing-meta';

import { NotFound } from './not-found';

// Unknown URLs render the not-found page with a real 404 status (as the Framer site's /404 did)
export function loader() {
  return data(null, { status: 404 });
}

export function meta() {
  return [
    { title: '404 – Leather' },
    { name: 'description', content: defaultMarketingDescription },
  ] satisfies MetaDescriptor[];
}

export default function NotFoundRoute() {
  return <NotFound />;
}
