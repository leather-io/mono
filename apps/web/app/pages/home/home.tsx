import { styled } from 'leather-styles/jsx';
import { Page } from '~/features/page/page';

import { HomeHeroCard } from './components/home-card';

interface HomeProps {
  latestArticles: { name: string; url: string }[];
}
export function Home({ latestArticles }: HomeProps) {
  return (
    <Page>
      <HomeHeroCard mt="space.07">
        <styled.h1 textStyle="heading.03">Earn rewards with BTC</styled.h1>
        <styled.p textStyle="label.02" mt="space.03">
          Bridge BTC to sBTC to access DeFi, NFTs, and ~5% Bitcoin yield* while keeping full
          liquidity and self-custody. Transfers adjust rewards dynamically.
        </styled.p>
        <styled.button textStyle="label.02" mt="space.03">
          Get started →
        </styled.button>
      </HomeHeroCard>
      <styled.ul mt="space.04" mb="space.09">
        {latestArticles.map(article => (
          <li key={article.name}>
            <a href={article.url}>{article.name}</a>
          </li>
        ))}
      </styled.ul>
    </Page>
  );
}
