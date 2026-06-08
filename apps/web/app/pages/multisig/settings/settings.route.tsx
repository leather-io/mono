import { type MetaDescriptor } from 'react-router';

import { WhenClient } from '~/components/when-client';

import { MultisigSettingsPage } from './settings.page';

export function meta() {
  return [{ title: 'Settings – Leather Multisig' }] satisfies MetaDescriptor[];
}

export default function SettingsRoute() {
  return (
    <WhenClient>
      <MultisigSettingsPage />
    </WhenClient>
  );
}
