import { MetaDescriptor } from 'react-router';

import { SignerKeyGenerationPage } from './signer-key-generation.page';

export function meta() {
  return [{ title: 'Signer key generation – Leather' }] satisfies MetaDescriptor[];
}

export default function SignerKeyGenerationRoute() {
  return <SignerKeyGenerationPage />;
}
