import { styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { AssetsList } from './components/assets-list';
import { PortfolioChart } from './components/portfolio-chart';
import { PortfolioPageHeading } from './components/portfolio-page-heading';
import { PortfolioSummary } from './components/portfolio-summary';

export function PortfolioPage() {
  return (
    <Page>
      <Page.Header title="Portfolio" />

      <PortfolioPageHeading />

      <PortfolioSummary mb="space.06" />

      <PortfolioChart mb="space.07" />

      <styled.h2 textStyle="heading.05" mb="space.05">
        Your assets
      </styled.h2>

      <AssetsList mb="space.07" />
    </Page>
  );
}
