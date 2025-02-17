import { delay } from '@leather.io/utils';

import type { Route } from './+types/home';

let name: null | string = null;

export async function loader() {
  if (name) {
    return { name };
  }
  await delay(3000);

  name = 'cached name';
  return { name: 'lkjsdflksjd' };
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather' }, { name: 'description', content: 'Bitcoin for the rest of us' }];
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  // return <Home params={{}} loaderData={undefined} matches={[]} />;

  return (
    <main>
      <div>
        <header>Leather Earn {loaderData.name}</header>
      </div>
    </main>
  );
}
