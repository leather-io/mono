import { MetaDescriptor, Navigate } from 'react-router';

import { WhenClient } from '~/components/when-client';
import { useWebPortfolioFlag } from '~/features/feature-flags';

import { PortfolioPage, PortfolioPageSkeleton } from './portfolio.page';

export function meta() {
  return [
    { title: 'Portfolio – Leather' },
    { name: 'description', content: 'View your cryptocurrency portfolio and asset balances' },
  ] satisfies MetaDescriptor[];
}

export default function PortfolioRoute() {
  const webPortfolioEnabled = useWebPortfolioFlag();

  if (!webPortfolioEnabled) {
    return <Navigate to="/404" replace />;
  }

  return (
    <WhenClient fallback={<PortfolioPageSkeleton />}>
      <PortfolioPage />
    </WhenClient>
  );
}
