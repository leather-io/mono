import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { MultisigOnboardingPage } from './onboarding.page';

export function meta() {
  return [{ title: 'Get started – Leather Multisig' }] satisfies MetaDescriptor[];
}

export default function OnboardingRoute() {
  return (
    <WhenClient>
      <MultisigOnboardingPage />
    </WhenClient>
  );
}
