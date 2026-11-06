import { SbtcSelectors } from '@tests/selectors/sbtc.selectors';
import { RouteUrls } from '~/route-urls';

import type { WebFeatureEntry } from './web-feature-entry';

export const contentFeatures = [
  {
    id: 'sbtc-rewards',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Sbtc],
    params: [],
    entry: [
      { kind: 'nav', steps: ['Click "sBTC" in the left navigation'] },
      { kind: 'deepLink', steps: ['Open /sbtc'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: {
      ready: SbtcSelectors.RewardsSunsetCallout,
      others: [SbtcSelectors.RewardsSunsetLink],
    },
    actions: [],
    specs: [],
    description:
      'The sBTC Rewards page (pages/sbtc/sbtc.route.tsx, meta title "sBTC Rewards – Leather"). The server loader fetches sbtcPoolsQuery, sbtcFaqQuery and sbtcConceptsQuery from Sanity through cmsClient (@leather.io/cms, useCdn false); MSW does not intercept that request. SbtcRewards renders Page.Header "sBTC Rewards", the heading "Earn yield with Bitcoin on Stacks" with its disclaimer, an ApyRewardHeroCard "5–8%", "Step 1: Get sBTC" with the GetSbtcGrid cells "Bridge BTC to sBTC" and "Swap Stacks tokens for sBTC" whose buttons depend on the wallet state: "Install Leather to bridge"/"Install Leather to swap" (opens the Chrome store) with no wallet, a disabled "Sign in to bridge"/"Sign in to swap" when a wallet is detected but not connected, and "Bridge"/"Swap" once connected, which call leather.openSwap({ base: "BTC", quote: "sBTC" }) or ({ base: "STX", quote: "sBTC" }) in the extension. "Step 2: Choose sBTC rewards provider" shows the sbtc-rewards-sunset-callout ("Enrollment for basic sBTC rewards ended on August 27, 2026" with the sbtc-rewards-sunset-link "Learn about Bitcoin Staking" to stacks.co) and one SbtcProtocolRewardGrid per CMS pool with an external "Start earning" button, then "Frequently asked questions". No spec covers it.',
  },
  {
    id: 'changelog',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Changelog],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['Click "Changelog" in the left navigation or in the footer "Dive deeper" column'],
      },
      { kind: 'deepLink', steps: ['Open /changelog'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'The changelog list (pages/changelog/changelog.route.tsx, meta title "Changelog – Leather" plus an alternate link to ./changelog.xml). The server loader fetches changelogQuery from the CMS. ChangelogPage renders ChangelogPageLayout: Page.Header "Changelog" with a "Subscribe" ghost button (hidden below md) that opens <origin>/changelog.xml, and one ChangelogEntry per CMS entry with the publish date and title in the left column (the title links to /changelog/<slug>) and the hero image and body on the right. No test ids and no spec.',
  },
  {
    id: 'changelog-entry',
    anchor: { kind: 'route' },
    routes: [RouteUrls.ChangelogEntry],
    params: [{ name: 'slug', example: 'example-release' }],
    entry: [
      { kind: 'nav', steps: ['On /changelog click an entry title'] },
      { kind: 'deepLink', steps: ['Open /changelog/<slug> for a published CMS entry'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'A single changelog entry (pages/changelog/changelog-entry.route.tsx). The loader fetches changelogEntryBySlugQuery for params.slug; when nothing matches the component returns null and the meta title is "Leather Changelog Not Found – Leather" (no redirect to the not-found page). Otherwise the meta title is "<title> – Leather Changelog" with a description cut from the first sentence of the body and og/twitter image tags when a hero image exists. The layout replaces the header title with a back-arrow button linking to /changelog and renders the entry\'s date, title, image and body. No spec.',
  },
  {
    id: 'changelog-rss',
    anchor: { kind: 'route' },
    routes: [RouteUrls.ChangelogRss],
    params: [],
    entry: [
      {
        kind: 'deepLink',
        steps: [
          'Request /changelog.xml, or click "Subscribe" on /changelog, which opens the same URL in a new tab',
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
      'A resource route with no component (pages/changelog/changelog-rss.route.tsx): the loader fetches changelogQuery and returns a Response whose body is an RSS 2.0 feed built with the feed package (title "Leather Changelog", description "Product updates from Leather", id and link https://leather.io/changelog, one item per entry linking to https://leather.io/changelog/<slug> with the body rendered to HTML by @portabletext/to-html) and Content-Type application/rss+xml. No spec.',
  },
  {
    id: 'post',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Post],
    params: [{ name: 'postSlug', example: 'leather-runes-wallet' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Pick a "Notice" result of the help-center search, or request an unknown /support/<slug>, which redirects here; the in-app "Learn more" links (LearnMoreLink / getPostHref) go to https://leather.io/posts/<slug> on the marketing site, not to this route',
        ],
      },
      { kind: 'deepLink', steps: ['Open /posts/<postSlug> for a published CMS post'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'A legacy post page (pages/posts/post.route.tsx). The loader first applies getDeprecationRedirect to params.postSlug, then fetches postBySlugQuery; a missing post throws new Error("Post not found", { cause: 404 }), which is a plain Error, so the root ErrorBoundary shows "Oops!" and "An unexpected error occurred." rather than a 404. The Post component renders a sticky Page.Header with no title, then the title, summary, publish date, the Markdown body and an optional "Disclaimer" section. No spec.',
  },
  {
    id: 'support',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Support],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['Click "Help Center" in the left navigation or in the footer "Dive deeper" column'],
      },
      { kind: 'deepLink', steps: ['Open /support, or /help-center which redirects here'] },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'The help center (pages/support/help-center.route.tsx, meta title "Guides – Leather"). The loader fetches helpCenterCategoriesQuery and throws new Error("Categories not found", { cause: 404 }) when the query returns null (an empty array still renders the page with no categories); the route also exports an action that handles the support form POST through handleSupportFormAction (validates name, email, subject and body with frontSupportMessageSchema, forwards to Front via postFrontAppSupportMessage and answers { success, status } or { success: false, error }). HelpCenter renders Page.Header "Help Center", the heading "How can we help?", the GuideSearch input (placeholder "Search help articles..."; from 2 characters it debounces 300 ms and loads /support/search?q=<query> through a fetcher, showing "Searching...", "No results found" or a dropdown of results linking to /support/<slug> or, for deprecation posts marked "Notice", /posts/<slug>), one CategorySection per CMS category with links to /support/<guide-slug>, and on the right the SupportFormProvider: a "Stay safe from scams" warning, the Name/Email/Subject/Message form submitted with the React Router Form to this route\'s action, a "Message sent successfully!" callout after success and a "Submission Failure" callout on error. The help-center-redirects spec only follows the redirect to this URL. No test ids.',
  },
  {
    id: 'support-search',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SupportSearch],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Type two or more characters into the search box on /support; GuideSearch loads this route with ?q=<query> through useFetcher',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Request /support/search?q=wallet; the response is the loader JSON, the route has no component of its own',
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
      'A loader-only search endpoint (pages/support/search.tsx). A q param shorter than 2 characters returns { results: [] }. Otherwise a GROQ query matches helpCenterGuide documents (title, body) and the three deprecation posts (title, body, summary) against the term, boosts title matches, orders by score and takes the first 10; deprecated guide slugs are dropped and each hit becomes { kind: "guide", href: "/support/<slug>", categories } or { kind: "deprecation", href: "/posts/<slug>" }, returned with data({ results }). No spec.',
  },
  {
    id: 'support-guide',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SupportGuide],
    params: [{ name: 'guideSlug', example: 'getting-started' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /support click a guide under a category, pick a search result, or follow a "Related articles" link on another guide',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open /support/<guideSlug> for a published CMS guide; /help-center/<slug> and /support/guide/<slug> redirect here',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description:
      'A help-center guide (pages/support/guide/guide.route.tsx). The loader applies getDeprecationRedirect, fetches helpCenterGuideBySlugQuery and, when no guide matches, redirects to /posts/<slug> so legacy post slugs still resolve. Guide renders a sticky block with Page.Header "Help Center" and a ReadingProgress bar, a Breadcrumb "Help & Support" (to /support) and the first category name, the title, summary and publish date, the Markdown body, "Related articles" when the guide lists any, and an optional "Disclaimer". No spec reaches the page itself.',
  },
] as const satisfies readonly WebFeatureEntry[];
