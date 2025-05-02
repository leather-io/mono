import { MetaDescriptor } from 'react-router';

import { NotFound } from '~/pages/not-found/not-found';

export function meta() {
  return [
    { title: '404 · Page Not Found – Leather' },
    {
      name: 'description',
      content: `The page you're looking for doesn't exist`,
    },
  ] satisfies MetaDescriptor[];
}

export default function NotFoundRoute() {
  return <NotFound />;
}
