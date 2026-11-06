import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const allBalancesSpec = 'apps/extension/tests/specs/all-balances/all-balances.spec.ts';
const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

export const allBalancesFeatures = [
  {
    id: 'all-balances',
    anchor: { kind: 'route' },
    routes: [RouteUrls.AllBalances],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /settings click "All balances" (AllBalancesSelectors.AllBalancesMenuItem)'],
      },
      {
        kind: 'nav',
        steps: [
          'On home click the locked-balance card under the total balance (BondsSelectors.LockedBalanceCard); it only renders when the locked balance is above zero (account-card.tsx)',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/all-balances with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: AllBalancesSelectors.AllBalancesPage,
      others: [
        AllBalancesSelectors.TotalBalance,
        AllBalancesSelectors.BitcoinProtocolSection,
        AllBalancesSelectors.StacksProtocolSection,
        AllBalancesSelectors.BalanceRowAvailable,
        AllBalancesSelectors.BalanceRowBonded,
        AllBalancesSelectors.BalanceRowPending,
        AllBalancesSelectors.BalanceRowSending,
        AllBalancesSelectors.BalanceRowUneconomical,
        AllBalancesSelectors.BalanceRowStxAvailable,
        BondsSelectors.BalanceRowStxInBond,
        AllBalancesSelectors.BalanceRowStxLocked,
        AllBalancesSelectors.BalanceRowStxPending,
        AllBalancesSelectors.BalanceRowSip10,
        AllBalancesSelectors.BalanceRowSbtc,
        SharedComponentsSelectors.HeaderBackBtn,
      ],
    },
    actions: ['SettingsPage.openSettingsPage'],
    specs: [allBalancesSpec],
    description:
      'Breaks the account\'s holdings into a total balance plus a Bitcoin protocol section (available, in a bond, pending, sending, uneconomical UTXO buckets) and a Stacks protocol section (STX available, in a bond, locked, pending, SIP-10 tokens, sBTC). Each Bitcoin row navigates to /all-balances/:category. The STX "In a bond" row (BondsSelectors.BalanceRowStxInBond) renders only when the bonded STX is above zero and navigates to /all-balances/bonded; "STX locked" is hidden when the bond covers all locked STX (all-balances.tsx). setupMockApis returns no bonds, so the In a bond row does not render in E2E. Privacy mode replaces every amount with asterisks. SettingsPage.openSettingsPage clicks through to /settings but its final isVisible() does not wait; wait for SettingsSelectors.SettingsPage or the menu item before asserting. The last click is AllBalancesSelectors.AllBalancesMenuItem (all-balances.spec.ts). The header back button goes to the previous page (navigate(-1)), which is Settings when opened from the menu.',
  },
  {
    id: 'all-balances-detail',
    anchor: { kind: 'route' },
    routes: [RouteUrls.AllBalancesDetail],
    params: [{ name: 'category', example: 'available' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /all-balances click a Bitcoin row, for example AllBalancesSelectors.BalanceRowAvailable',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'Token details: each BTC category row shown on the Balances tab (Available, plus any category with a non-zero balance; token-balances.utils.ts) navigates here, and for STX only the "In a bond" row does (to bonded)',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open #/all-balances/available (or pending, sending, uneconomical, bonded); an unknown category redirects to /all-balances',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: AllBalancesSelectors.AllBalancesDetailPage,
      others: [
        AllBalancesSelectors.DetailTotal,
        AllBalancesSelectors.DetailAddressGroup,
        AllBalancesSelectors.DetailUtxoRow,
        AllBalancesSelectors.DetailEmpty,
        AllBalancesSelectors.DetailBondSection,
        AllBalancesSelectors.DetailUpcomingBond,
        AllBalancesSelectors.DetailManageLink,
        AllBalancesSelectors.DetailPastPeriods,
        BondsSelectors.DetailRenewalRow,
        BondsSelectors.DetailError,
        SharedComponentsSelectors.HeaderBackBtn,
      ],
    },
    actions: [],
    specs: [allBalancesSpec],
    description:
      'Detail page for one Bitcoin balance category. UTXO categories show the category total "across N addresses" and group the UTXOs per address, each group labelled with its address type (Taproot, Native Segwit; groupUtxosByAddress in all-balances.utils.ts), with an "Unconfirmed" caption for unmined ones; an empty category shows the empty state (AllBalancesSelectors.DetailEmpty). A UTXO or market-data fetch error shows "Couldn\'t load this balance right now. Check your connection and try again." (BondsSelectors.DetailError, all-balances-detail.tsx). The bonded category renders the bond positions view instead (bond-positions-detail.tsx): the Leather API bonds endpoint returns no registrations (mockLeatherApiRequests inside setupMockApis), so it shows "No bonds for this account" (DetailEmpty) and the "Manage in Bitcoin Staking" link (AllBalancesSelectors.DetailManageLink), which opens Bitcoin Staking in a new tab; the empty Hiro bond list from mockStacksStakingRequests also leaves no upcoming window; a positions error shows "Bond details are unavailable right now". DetailBondSection, DetailUpcomingBond, DetailRenewalRow and DetailPastPeriods (the "Past periods" row that goes to /all-balances/bonded/history) need bond data that no mock in tests/mocks provides yet. The header back button goes to the previous page (navigate(-1)).',
  },
  {
    id: 'all-balances-bond-history',
    anchor: { kind: 'route' },
    routes: [RouteUrls.AllBalancesBondHistory],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /all-balances/bonded click "Past periods" (AllBalancesSelectors.DetailPastPeriods); the row only renders when the account has a past bond, which no staking mock provides, so with the listed mocks only the deep link reaches the page',
        ],
      },
      { kind: 'deepLink', steps: ['Open #/all-balances/bonded/history with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: AllBalancesSelectors.BondHistoryPage,
      others: [AllBalancesSelectors.BondHistoryEmpty, SharedComponentsSelectors.HeaderBackBtn],
    },
    actions: [],
    specs: [],
    description:
      'Lists the account\'s past bond periods (matured bonds and their payouts) under the "Past periods" header, or "No past periods for this account" (AllBalancesSelectors.BondHistoryEmpty) when there are none, which is what the listed mocks render (bond-history.tsx). The header back button goes to the previous page (navigate(-1)).',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
