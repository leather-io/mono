import { styled } from 'leather-styles/jsx';
import { leather } from '~/helpers/leather-sdk';

import { Button } from '@leather.io/ui';

interface HomeProps {
  latestArticles: { name: string; url: string }[];
}
export function Home({ latestArticles }: HomeProps) {
  return (
    <>
      <styled.div p="space.04">
        <styled.h1 textStyle="display.02">Bitcoin for the rest of us</styled.h1>
        <styled.h2 textStyle="heading.05">
          Unlock yield opportunities without giving up control of your assets.
        </styled.h2>
        <styled.h2 textStyle="heading.03">Featured articles</styled.h2>
        <ul>
          {latestArticles.map(article => (
            <li key={article.name}>
              <a href={article.url}>{article.name}</a>
            </li>
          ))}
        </ul>
        <Button
          onClick={async () => {
            const result = await leather.getAddresses();
            // eslint-disable-next-line no-console
            console.log(result);
          }}
        >
          Connect
        </Button>
      </styled.div>
    </>
  );
}
