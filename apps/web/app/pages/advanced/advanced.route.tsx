import { MetaDescriptor } from 'react-router';

import { whenEnvTarget } from '~/constants/environment';

import { AdvancedPage } from './advanced.page';

export const advancedModeEnabled = whenEnvTarget({
  branch: true,
  development: true,
  staging: true,
  production: true,
});

export function meta() {
  return [
    { title: 'Advanced – Leather' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
  ] satisfies MetaDescriptor[];
}

export default function AdvancedRoute() {
  return <AdvancedPage />;
}
