import { Home } from '~/features/home/home';

import { delay } from '@leather.io/utils';

import type { Route } from './+types/home';

const articles = [
  {
    name: 'How to Create a Bitcoin Wallet',
    url: './blog/create-bitcoin-wallet',
  },
  {
    name: 'How To Secure My Crypto Wallet',
    url: './blog/secure-crypto-wallet',
  },
  {
    name: 'December partner highlights',
    url: './blog/recover-crypto-wallet',
  },
];

export async function loader() {
  await delay(300);
  return articles;
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather' }, { name: 'description', content: 'Bitcoin for the rest of us' }];
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <Home latestArticles={loaderData} />;
}
