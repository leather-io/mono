import { MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { PortfolioPage, PortfolioPageSkeleton } from './portfolio.page';

export function meta() {
  return [
    { title: 'Portfolio – Leather' },
    { name: 'description', content: 'View your cryptocurrency portfolio and asset balances' },
  ] satisfies MetaDescriptor[];
}

export default function PortfolioRoute() {
  return (
    <WhenClient fallback={<PortfolioPageSkeleton />}>
      <PortfolioPage />
    </WhenClient>
  );
}
