import { RouteUrls } from '~/route-urls';

import type { WebFeatureEntry } from './web-feature-entry';

const helpCenterRedirectsSpec = 'apps/web/tests/help-center-redirects.spec.ts';
const stackingRedirectsSpec = 'apps/web/tests/stacking-redirects.spec.ts';

export const redirectsFeatures = [
  {
    id: 'help-center-redirect',
    anchor: { kind: 'route' },
    routes: [RouteUrls.HelpCenterRedirect, RouteUrls.HelpCenterWildcardRedirect],
    params: [{ name: '*', example: 'getting-started' }],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Request /help-center or /help-center/<anything>; the loader answers 301 with the same URL under /support',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [helpCenterRedirectsSpec],
    description:
      "Two loader-only routes (pages/redirects/help-center-redirect.route.tsx and help-center-wildcard.route.tsx) that call helpCenterRedirectLoader (shared-redirect-logic.ts): the request URL's pathname has its /help-center prefix replaced by /support and the origin, search and hash are kept, returned as a 301 redirect. Nothing renders, so the NetworkGate never applies. The spec requests /help-center/getting-started, /help-center/guide/test-guide and a URL with a query string with maxRedirects 0 and asserts the 301 Location header; its first test follows the redirect from /help-center with page.goto and checks the final URL contains /support. /help-center/guide/<slug> chains into the support-guide-redirect.",
  },
  {
    id: 'stacking-redirect',
    anchor: { kind: 'route' },
    routes: [RouteUrls.StackingRedirect, RouteUrls.StackingWildcardRedirect],
    params: [{ name: '*', example: 'pool/fast-pool' }],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Request /stacking or /stacking/<anything>; the loader answers 301 with the same URL under /staking',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [stackingRedirectsSpec],
    description:
      'The retired stacking URLs (pages/redirects/stacking-redirect.route.tsx and stacking-wildcard.route.tsx) call stackingRedirectLoader, which replaces the /stacking prefix with /staking, keeps search and hash and returns a 301. The spec asserts /stacking/pool/fast-pool, /stacking/pool/fast-pool/active and /stacking/liquid/lisa?cycle=100 by their Location headers; the last target, /staking/liquid/lisa, matches no route, so following it lands on the not-found page. xss-protection.spec.ts fulfils **/stacking/faq with inline HTML through page.route (setupXssMocks in tests/utils/mock-data.ts), so that spec never reaches this loader.',
  },
  {
    id: 'support-guide-redirect',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SupportGuideRedirect],
    params: [{ name: 'slug', example: 'test-guide' }],
    entry: [
      {
        kind: 'deepLink',
        steps: ['Request /support/guide/<slug>; the loader answers 301 to /support/<slug>'],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [helpCenterRedirectsSpec],
    description:
      'pages/redirects/support-guide-redirect.route.tsx returns redirect(`/support/${params.slug}`, 301) and renders nothing; the three-segment pattern /support/guide/:slug is the only route that matches /support/guide/<slug>, while /support/:guideSlug cannot match it (a bare /support/guide is caught by that guide route with guideSlug "guide"). The search string is dropped. The spec asserts the Location header for /support/guide/test-guide.',
  },
  {
    id: 'deprecated-content-redirects',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Request /posts/bitcoin-runes or /support/send-ordinals (any slug in the runes, stamps or ordinals lists of shared-redirect-logic.ts); the loader answers 301 to the matching deprecation post',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'getDeprecationRedirect (pages/redirects/shared-redirect-logic.ts) maps retired guide and post slugs to three deprecation posts: the runes slugs (bitcoin-runes, ordinals-vs-runes, …) to /posts/leather-runes-wallet, the stamps slugs (bitcoin-stamps-src20, receive-stamps, …) to /posts/leather-stamps-src20-wallet and the ordinals and BRC-20 slugs (send-ordinals, what-are-brc20-tokens, …) to /posts/deprecation-of-ordinals-inscriptions-support-in-leather, each as a 301. post.route.tsx and guide.route.tsx run it before querying the CMS. The support search loader (/support/search) includes those three posts in its results as kind "deprecation" (rendered with a "Notice" badge and linking to /posts/<slug>) and filters deprecated guide slugs out. No spec covers it.',
  },
] as const satisfies readonly WebFeatureEntry[];
