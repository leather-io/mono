import privacyPolicyBody from '~/content/legal/privacy-policy.md?raw';
import termsBody from '~/content/legal/terms.md?raw';

// The legal pages live in the repo as Markdown, copied verbatim from their retired Sanity posts
// (privacy-policy and terms-of-service), last-updated line included.

export interface LegalPage {
  title: string;
  path: `/${string}`;
  description: string;
  /** Markdown body (GFM) */
  body: string;
}

export const privacyPolicyPage: LegalPage = {
  title: 'Privacy policy',
  path: '/privacy-policy',
  description:
    'Leather’s Privacy Policy outlines how user data is collected, used, and protected across its services.',
  body: privacyPolicyBody,
};

export const termsPage: LegalPage = {
  title: 'Terms of Service',
  path: '/terms',
  description:
    'Leather’s Terms of Service describe the rules, responsibilities, and legal terms for using the wallet and its connected products.',
  body: termsBody,
};
