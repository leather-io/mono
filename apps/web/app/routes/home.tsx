import { request } from '@stacks/connect';
import { styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';
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
  return (
    <>
      <styled.div p="space.04">
        <styled.h1 textStyle="display.02">Bitcoin for the rest of us</styled.h1>
        <styled.h2 textStyle="heading.05">
          Unlock yield opportunities without giving up control of your assets.
        </styled.h2>
        <styled.h2 textStyle="heading.03">Featured articles</styled.h2>
        <ul>
          {loaderData.map(article => (
            <li key={article.name}>
              <a href={article.url}>{article.name}</a>
            </li>
          ))}
        </ul>
        <Button
          onClick={async () => {
            const result = await request('getAddresses');
            console.log(result);
          }}
        >
          Connect
        </Button>
      </styled.div>
    </>
  );
}
