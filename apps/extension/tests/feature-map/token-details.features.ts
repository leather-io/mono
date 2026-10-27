import { CollectiblesSelectors } from '@tests/selectors/collectibles.selectors';
import { TokenDetailsSelectors } from '@tests/selectors/token-details.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

export const tokenDetailsFeatures = [
  {
    id: 'token-details',
    anchor: { kind: 'route' },
    routes: [RouteUrls.TokenDetails],
    params: [{ name: '*', example: 'BTC' }],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On the home Tokens tab click a token row (CoreAssetSelectors.BtcAsset, CoreAssetSelectors.StxAsset or a SIP-10 row such as MockedTokensSelectors.Sip10TokenTestId)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'On the home Tokens tab click a card in the "Trending tokens" section (HomePageSelectors.TrendingToken prefix; trending-tokens.spec.ts)',
        ],
      },
      {
        kind: 'nav',
        steps: [
          'On the Collectibles tab click a collectible card (CollectiblesSelectors.CollectibleCardSip9); a card needs holdings; only policy-account-surfaces.spec.ts provides them (mockStacksPolicyData, which calls mockPolicyStacksNftHoldings(page, address)), and no spec clicks through to the collectible page',
        ],
      },
      {
        kind: 'deepLink',
        steps: [
          'Open #/token/BTC, #/token/STX or #/token/<encodeURIComponent(serialized asset id)>; an unparseable id renders the error view',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: TokenDetailsSelectors.TokenDetailsContainer,
      others: [
        TokenDetailsSelectors.TokenDetailsBackButton,
        TokenDetailsSelectors.TokenDetailsTitle,
        TokenDetailsSelectors.TokenDetailsLoading,
        TokenDetailsSelectors.TokenDetailsError,
        TokenDetailsSelectors.TokenOverview,
        TokenDetailsSelectors.TokenOverviewAmount,
        TokenDetailsSelectors.TokenOverviewFiatAmount,
        TokenDetailsSelectors.TokenDetailsSendButton,
        TokenDetailsSelectors.TokenDetailsReceiveButton,
        TokenDetailsSelectors.TokenDetailsBuyButton,
        TokenDetailsSelectors.TokenDetailsSwapButton,
        TokenDetailsSelectors.TokenDetailsTabActivity,
        TokenDetailsSelectors.TokenDetailsTabBalances,
        TokenDetailsSelectors.TokenDetailsTabInfo,
        TokenDetailsSelectors.TokenDetailsDescription,
        TokenDetailsSelectors.TokenDetailsName,
        TokenDetailsSelectors.TokenDetailsPrice,
        TokenDetailsSelectors.TokenDetailsPriceChange,
        TokenDetailsSelectors.TokenDetailsLayer,
        TokenDetailsSelectors.TokenDetailsBalancesSection,
        TokenDetailsSelectors.TokenDetailsBalanceAvailable,
        TokenDetailsSelectors.TokenDetailsLockedRow,
        TokenDetailsSelectors.TokenDetailsActivitySection,
        TokenDetailsSelectors.TokenDetailsActivityEmpty,
        TokenDetailsSelectors.TokenDetailsActivityLoading,
        CollectiblesSelectors.CollectibleDetailsContainer,
      ],
    },
    actions: ['HomePage.waitForHomePageReady', 'HomePage.clickCollectiblesTab'],
    specs: [
      'apps/extension/tests/specs/token-details/token-details.spec.ts',
      'apps/extension/tests/specs/tokens/tokens-tab.spec.ts',
      'apps/extension/tests/specs/policy-surfaces/policy-account-surfaces.spec.ts',
      'apps/extension/tests/specs/trending-tokens/trending-tokens.spec.ts',
    ],
    description:
      'Detail page for one asset, chosen by the splat segment: BTC and STX by symbol, any other token by its URL-encoded serialized asset id. A SIP-9 id renders a separate collectible page instead (collectible-details.tsx, sip9-details-page.tsx): media plus the NFT details in a container with CollectiblesSelectors.CollectibleDetailsContainer, a back button (test id "collectible-details-back", no selector) that goes to the previous page (navigate(-1)), no overview, pills or tabs, "Collectible not found" when the account does not hold it and "Unable to load collectible details" on a load error; TokenDetailsContainer never renders on that path. Everything below applies to fungible tokens. The page shows the title, an overview with amount and fiat value, the Receive / Send / Buy / Swap pill buttons and Activity, Balances and Info tabs (token-details-actions.tsx). Buy shows only with the releaseOnramperBuy flag on mainnet, for policy accounts too (no policy check here, unlike home), and from the popup it opens /fund in a full-page tab. Swap is disabled under the home conditions; on BTC also when every BTC swap pair is disabled, and always for a policy BTC account (bitcoin-token-details.tsx, policy-bitcoin-token-details.tsx). The Balances tab is hidden when there is no balance content (token-details-tabs.tsx), and the selected tab is remembered when the page is reopened (token-details.spec.ts). When the asset has a price, the Info tab has a price-history chart with period selectors (test ids "price-history-chart" and "price-history-period-<period>", no selectors). On the BTC Balances tab each category row shown (Available plus any non-zero category) navigates to /all-balances/:category and both the Native Segwit and the Taproot address rows open the native segwit BTC QR sheet (showReceive(\'btc\'), even for the Taproot row), with the address itself copying to the clipboard (bitcoin-token-details.tsx); a policy account shows a Multisig row. On the STX Balances tab only "In a bond" navigates (to /all-balances/bonded), "Locked" opens the staking status page in a new tab, and "Available to transfer" and "Pending" have no action (stacks-token-details.tsx). TokenDetailsBalanceAvailable is on the STX Balances tab; TokenDetailsLockedRow needs locked STX, which no mock provides. A failed load or unparseable id shows "Lost in the stack"; the header back button navigates home (token-details-header.tsx). Spec variants: token-details.spec.ts registers mockEmptyStacksBalancesRequest, mockEmptyStacksBalancesV2Request and mockEmptyLeatherApiUtxosRequest for the empty-wallet BTC tests and mockTestAccountStacksTxsRequestsWithPendingTx for the STX tests; policy-account-surfaces.spec.ts opens SIP-10 details for a Stacks policy; the balance comes from the any-address balance mocks inside setupMockApis, and mockStacksPolicyData(page, address) only adds NFT holdings and activity.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
