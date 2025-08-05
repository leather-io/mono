import { MetaDescriptor } from 'react-router';

import { AdvancedPage } from './advanced.page';

export function meta() {
  return [
    { title: 'Advanced – Leather' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
  ] satisfies MetaDescriptor[];
}

export default function AdvancedRoute() {
  return <AdvancedPage />;
}
