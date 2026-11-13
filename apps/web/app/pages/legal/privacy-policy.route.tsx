import { marketingHeaders } from '~/pages/marketing/shared/marketing-meta';

import { LegalPage, legalPageMeta } from './legal-page';
import { privacyPolicyPage } from './legal.data';

export const headers = marketingHeaders;

export function meta() {
  return legalPageMeta(privacyPolicyPage);
}

export default function PrivacyPolicyRoute() {
  return <LegalPage page={privacyPolicyPage} />;
}
