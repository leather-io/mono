// Copy and the "Start developing with Leather" doc list for /developers (verbatim from
// leather.io). Each doc is a CMS post served at /posts/<slug>.

export const developersIntro = {
  title: 'Everything you need to start building',
  description:
    "Whether you're just getting started or you're deep into development, you'll find everything you need right here. From quick-start guides to in-depth API references, this space is designed to help you ship faster and smarter.",
};

export const developerDocsHeading = 'Start developing with Leather';

interface DeveloperDoc {
  title: string;
  slug: string;
}

export const developerDocs: DeveloperDoc[] = [
  { title: 'Introduction to Leather APIs', slug: 'api-overview' },
  { title: 'getAddresses API method', slug: 'api-get-addresses' },
  { title: 'Open API method', slug: 'api-open' },
  { title: 'sendTransfer API method', slug: 'api-send-transfer' },
  { title: 'signMessage API method', slug: 'signmessage-api-method' },
  { title: 'signPsbt API method', slug: 'api-sign-psbt' },
  { title: 'stx_transferStx API method', slug: 'api-stx-transferstx' },
  { title: 'stx_signTransaction API method', slug: 'api-stx-signtransaction' },
  { title: 'stx_signMessage API method', slug: 'api-stx-signmessage' },
  { title: 'stx_signStructuredMessage API method', slug: 'stx-signstructuredmessage-api-method' },
  { title: 'stx_deployContract API method', slug: 'api-stx-deploycontract' },
  { title: 'stx_callContract API method', slug: 'api-stx-callcontract' },
  { title: 'Stacks libraries', slug: 'stacks-libraries' },
];
