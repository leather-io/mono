import { Stacking } from '~/pages/stacking/stacking';

import { delay } from '@leather.io/utils';

import type { Route } from '../+types/home';

export async function loader() {
  await delay(400);
  return true;
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Leather Earn' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
  ];
}

export default function HomeRoute() {
  return <Stacking />;
}
