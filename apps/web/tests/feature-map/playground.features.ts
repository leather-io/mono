import { PlaygroundSelectors } from '@tests/selectors/playground.selectors';
import { RouteUrls } from '~/route-urls';

import type { WebFeatureEntry } from './web-feature-entry';

const playgroundGateNote =
  'playground.layout.tsx wraps every /playground route: its loader throws data("Not found", { status: 404 }) when playgroundEnabled is false (import.meta.env.CLOUDFLARE_ENV === "production", playground.constants.ts), so the area exists on local dev, PR previews and staging only. The floating PlaygroundDock lists the sections (Multisig, Web App, Extension) and their areas.';

export const playgroundFeatures = [
  {
    id: 'playground-index',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Playground],
    params: [],
    entry: [{ kind: 'deepLink', steps: ['Open /playground on a non-production deploy'] }],
    gate: 'playgroundLayout',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description: `The playground index (pages/playground/playground-index.route.tsx): the heading "Playground areas" and a grid of AreaCards built from playgroundAreas (title, "#<issue>" when set, description and the status "exploration" or "living"), each linking to /playground/<slug>. The index itself is not an area, so isBareCanvasPath renders it without the nav, page padding or footer. ${playgroundGateNote} No spec.`,
  },
  {
    id: 'playground-staking-acknowledgment',
    anchor: { kind: 'route' },
    routes: [RouteUrls.PlaygroundStakingAcknowledgment],
    params: [],
    entry: [
      { kind: 'nav', steps: ['On /playground click the "Staking acknowledgment" card'] },
      { kind: 'deepLink', steps: ['Open /playground/staking-acknowledgment'] },
    ],
    gate: 'playgroundLayout',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { ready: PlaygroundSelectors.StakingAcknowledgmentReview, others: [] },
    actions: [],
    specs: [],
    description: `An exploration area for issue #2605 (pages/playground/areas/staking-acknowledgment/staking-acknowledgment.page.tsx, appShell true so it renders inside the normal site chrome). The review surface (staking-acknowledgment-review) shows "Stake with <pool>" or "Switch pool" (moving from Xverse to the picked pool) with amount (default 3200) and cycles (default 12) inputs that are editable in the start flow and read-only in the switch flow, the pool or signer-manager choice across the sample pools, the "Rewards payout" summary and the real StakingAcknowledgment plus confirm button driven by useStakingAcknowledgment with sample dates; confirming only records the acknowledged context locally. ${playgroundGateNote} No spec.`,
  },
  {
    id: 'playground-component-gallery',
    anchor: { kind: 'route' },
    routes: [RouteUrls.PlaygroundComponentGallery],
    params: [],
    entry: [
      { kind: 'nav', steps: ['On /playground click the "Component gallery" card'] },
      { kind: 'deepLink', steps: ['Open /playground/component-gallery'] },
    ],
    gate: 'playgroundLayout',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description: `A living area (pages/playground/areas/component-gallery/component-gallery.page.tsx, appShell true) headed "Multisig component gallery" with the sections "Balance heroes", "Detail cards", "Activity feed", "ListItemBox primitive", "Badges", "Avatars & pills", "CopyAddress" and "Form fields & states", each stacking the multisig presentational components with mock data. ${playgroundGateNote} No spec.`,
  },
  {
    id: 'playground-page-gallery',
    anchor: { kind: 'route' },
    routes: [RouteUrls.PlaygroundPageGallery],
    params: [],
    entry: [
      { kind: 'nav', steps: ['On /playground click the "Page gallery" card'] },
      { kind: 'deepLink', steps: ['Open /playground/page-gallery'] },
    ],
    gate: 'playgroundLayout',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description: `A living area (pages/playground/areas/page-gallery/page-gallery.page.tsx, appShell true) headed "Multisig pages in context" that reconstructs the multisig pages with mock data inside PageFrames labelled "Dashboard", "Account", "Vault", "Create vault", "Transaction detail" and "Modals", seeding the React Query cache so the real page components render. ${playgroundGateNote} No spec.`,
  },
  {
    id: 'playground-staking-states',
    anchor: { kind: 'route' },
    routes: [RouteUrls.PlaygroundStakingStates],
    params: [],
    entry: [
      { kind: 'nav', steps: ['On /playground click the "Staking states" card'] },
      { kind: 'deepLink', steps: ['Open /playground/staking-states'] },
    ],
    gate: 'playgroundLayout',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description: `An exploration area for issue #2550 (pages/playground/areas/staking-states/staking-states.page.tsx, appShell true): the pox-5 staking screens stacked in journey order, starting with a "Discovery" section whose boards render the real Staking page and StakingTopSection inside a StakingSurface seeded with mock staker info and rewards (staking-mock-data.ts), followed by the form, bring-your-own-signer-manager, active-position and update boards in the states that change the design. ${playgroundGateNote} No spec.`,
  },
  {
    id: 'playground-update-stake-switch',
    anchor: { kind: 'route' },
    routes: [RouteUrls.PlaygroundUpdateStakeSwitch],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /playground click the "Update stake: switch signer manager" card'],
      },
      { kind: 'deepLink', steps: ['Open /playground/update-stake-switch'] },
    ],
    gate: 'playgroundLayout',
    flags: [],
    preconditions: { session: 'uninstalled', network: 'mainnet', mocks: [] },
    selectors: { others: [] },
    actions: [],
    specs: [],
    description: `An exploration area for issue #2643 (pages/playground/areas/update-stake-switch/update-stake-switch.page.tsx, appShell true) titled "Update stake: switch signer manager" with the sections "Entry point" (the real StakingProviderTable seeded with a Stacking DAO position so rows show the "Switch" action), "The update form" (SwitchSignerManagerPreview boards with the signer-manager picker and summary card) and "Custom signer managers". ${playgroundGateNote} No spec.`,
  },
] as const satisfies readonly WebFeatureEntry[];
