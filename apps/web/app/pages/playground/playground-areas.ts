// Registry of playground areas. Each area contributes exactly three things in
// its own PR: a folder under areas/, one route entry in playground.routes.ts,
// and one entry here — so parallel area PRs only ever conflict on single
// adjacent lines.
//
// Lifecycle ('status'):
// - 'exploration': tied to an initiative or issue. Deleted when the winning
//   variant is promoted into real app code (ideally in the promoting PR).
// - 'living': permanent reference surfaces (component galleries, token
//   sheets) that are curated, not pruned.
export interface PlaygroundArea {
  slug: string;
  title: string;
  description: string;
  status: 'exploration' | 'living';
  issue?: number;
}

export const playgroundAreas: PlaygroundArea[] = [
  {
    slug: 'welcome',
    title: 'Welcome',
    description: 'How the playground works: areas, variants, sharing.',
    status: 'living',
  },
  {
    slug: 'component-gallery',
    title: 'Component gallery',
    description:
      'Every multisig view-surface and component permutation on one page, with mock data.',
    status: 'living',
  },
  {
    slug: 'page-gallery',
    title: 'Page gallery',
    description:
      'Every multisig page reconstructed with mock data and the real presentational components.',
    status: 'living',
  },
];
