import { MetaDescriptor } from 'react-router';

import { PortfolioPage } from './portfolio.page';

export function meta() {
  return [
    { title: 'Portfolio – Leather' },
    { name: 'description', content: 'View your cryptocurrency portfolio and asset balances' },
  ] satisfies MetaDescriptor[];
}

export default function PortfolioRoute() {
  return <PortfolioPage />;
}
