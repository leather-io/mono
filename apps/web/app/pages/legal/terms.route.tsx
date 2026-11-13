import { marketingHeaders } from '~/pages/marketing/shared/marketing-meta';

import { LegalPage, legalPageMeta } from './legal-page';
import { termsPage } from './legal.data';

export const headers = marketingHeaders;

export function meta() {
  return legalPageMeta(termsPage);
}

export default function TermsRoute() {
  return <LegalPage page={termsPage} />;
}
