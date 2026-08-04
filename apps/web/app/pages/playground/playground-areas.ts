// Registry of playground areas. Each area contributes exactly two things in
// its own PR: a folder under areas/, and one entry here — so parallel area
// PRs only ever conflict on single adjacent lines.
//
// Lifecycle ('status'):
// - 'exploration': tied to an initiative or issue. Deleted when the winning
//   variant is promoted into real app code (ideally in the promoting PR).
// - 'living': permanent reference surfaces (component galleries, token
//   sheets) that are curated, not pruned.
//
// 'appShell': opt-in. By default an area renders on a bare canvas with no app
// chrome; set appShell: true when the area should sit inside the real website
// container (nav sidebar, page padding, footer).
//
// 'section': the part of the product an area belongs to. Sections without
// areas render disabled in the dock — present to hint at where this is going.
// 'web-app' covers the rest of the website (portfolio, stacking, sBTC, …).
// Extension UI is browser-renderable web tech, so it can plausibly get
// playground areas later; mobile (Expo/React Native) can't render here and is
// deliberately absent.
export const playgroundSections = [
  { id: 'multisig', label: 'Multisig' },
  { id: 'web-app', label: 'Web App' },
  { id: 'extension', label: 'Extension' },
] as const;

export type PlaygroundSectionId = (typeof playgroundSections)[number]['id'];

export interface PlaygroundArea {
  slug: string;
  title: string;
  description: string;
  status: 'exploration' | 'living';
  section: PlaygroundSectionId;
  issue?: number;
  appShell?: boolean;
}

export const playgroundAreas: PlaygroundArea[] = [
  {
    slug: 'component-gallery',
    title: 'Component gallery',
    description:
      'Every multisig view-surface and component permutation on one page, with mock data.',
    status: 'living',
    section: 'multisig',
    appShell: true,
  },
  {
    slug: 'page-gallery',
    title: 'Page gallery',
    description:
      'Every multisig page reconstructed with mock data and the real presentational components.',
    status: 'living',
    section: 'multisig',
    appShell: true,
  },
  {
    slug: 'staking-states',
    title: 'Staking states',
    description:
      'Every pox-5 staking screen stacked in journey order — discovery, the form, bring-your-own signer manager, an active position, updates — each in the states that change the design.',
    status: 'exploration',
    section: 'web-app',
    issue: 2550,
    appShell: true,
  },
];
