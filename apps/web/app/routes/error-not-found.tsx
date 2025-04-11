import { NotFound } from '~/pages/not-found/not-found';

export function meta() {
  return [
    { title: '404 - Page Not Found | Leather' },
    { name: 'description', content: `The page youre looking for doesn't exist or has been moved.` },
  ];
}

export default function NotFoundRoute() {
  return <NotFound />;
}
