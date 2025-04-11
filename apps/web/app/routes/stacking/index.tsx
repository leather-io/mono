import { Stacking } from '~/pages/stacking/stacking';

import { delay } from '@leather.io/utils';

export async function loader() {
  await delay(400);
  return true;
}

// eslint-disable-next-line no-empty-pattern
export function meta({}) {
  return [
    { title: 'Leather Earn' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
  ];
}

export default function HomeRoute() {
  return <Stacking />;
}
