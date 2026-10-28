import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import type { ExtensionFeatureEntry } from './extension-feature-entry';

const addNetworkSpec = 'apps/extension/tests/specs/network/add-network.spec.ts';
const settingsSpec = 'apps/extension/tests/specs/settings/settings.spec.ts';
const sendBtcSpec = 'apps/extension/tests/specs/send/send-btc.spec.ts';
const sendStxSpec = 'apps/extension/tests/specs/send/send-stx.spec.ts';
const defaultMocks = ['setupMockApis', 'mockUnhandledRequests'] as const;

const networkFormSelectors = [
  NetworkSelectors.NetworkName,
  NetworkSelectors.NetworkStacksAddress,
  NetworkSelectors.NetworkBitcoinAddress,
  NetworkSelectors.NetworkKey,
  NetworkSelectors.AddNetworkBitcoinAPISelector,
  NetworkSelectors.BitcoinApiOptionTestnet,
  NetworkSelectors.AddNetworkBtn,
  NetworkSelectors.ErrorText,
  SharedComponentsSelectors.HeaderBackBtn,
] as const;

export const networkFeatures = [
  {
    id: 'select-network',
    anchor: { kind: 'route' },
    routes: [RouteUrls.SelectNetwork],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /settings click "Network" (SettingsSelectors.ChangeNetworkAction)'],
      },
      { kind: 'deepLink', steps: ['Open #/select-network with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', network: 'mainnet', mocks: [...defaultMocks] },
    selectors: {
      ready: NetworkSelectors.NetworkListActiveNetwork,
      others: [
        SettingsSelectors.NetworkListItem,
        SettingsSelectors.AddNewNetworkBtn,
        NetworkSelectors.NetworkMenuBtn,
        NetworkSelectors.EditNetworkMenuBtn,
        NetworkSelectors.DeleteNetworkMenuBtn,
        SharedComponentsSelectors.HeaderBackBtn,
      ],
    },
    actions: [
      'NetworkPage.openNetworkPage',
      'NetworkPage.changeNetwork',
      'NetworkPage.selectTestnet',
      'NetworkPage.goBackToHome',
    ],
    specs: [addNetworkSpec, settingsSpec, sendBtcSpec, sendStxSpec],
    description:
      'Lists every configured network with the active one marked (NetworkListActiveNetwork). Each row\'s click target has the network id as its data-testid (for example testnet4, which NetworkPage.changeNetwork clicks). A row switches on click unless it is already active or its Stacks API does not answer: an offline row is dimmed, shows a cloud-off icon and has no menu (network-list-item.tsx). The status check is a GET on the Stacks base URL, which setupMockApis fulfils for the hiro hosts. Online custom networks get a menu with Edit and Delete, both disabled while a multisig policy is bound to that network. Deleting the current network falls back to mainnet. The footer has the "Always show network" badge toggle and "Add network", which goes to /add-network. The toggle is passed SettingsSelectors.ToggleNetworkBadge, but NetworkListSwitch (network-list-switch.tsx) never spreads it onto the button, so the test id does not render and a repro clicks the switch by its title text. The header has only a back button, which goes to the previous page (navigate(-1)); the network badge does not render here. Once a non-mainnet network is active the home account card shows the network badge (network-switcher entry). settings.spec, send-btc.spec and send-stx.spec switch to testnet4 here through NetworkPage.changeNetwork / selectTestnet. NetworkPage.openNetworkPage and goBackToHome call isVisible() without awaiting a state, so they have no real readiness wait.',
  },
  {
    id: 'add-network',
    anchor: { kind: 'route' },
    routes: [RouteUrls.AddNetwork],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: ['On /select-network click "Add network" (SettingsSelectors.AddNewNetworkBtn)'],
      },
      { kind: 'deepLink', steps: ['Open #/add-network with an unlocked wallet'] },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: NetworkSelectors.NetworkPageReady,
      others: [...networkFormSelectors],
    },
    actions: [
      'NetworkPage.openAddNewNetworkPage',
      'NetworkPage.waitForNetworkPageReady',
      'NetworkPage.inputNetworkNameField',
      'NetworkPage.inputNetworkStacksAddressField',
      'NetworkPage.inputNetworkBitcoinAddressField',
      'NetworkPage.inputNetworkKeyField',
      'NetworkPage.clickAddNetwork',
      'NetworkPage.waitForErrorMessage',
      'NetworkPage.getErrorMessage',
    ],
    specs: [addNetworkSpec],
    description:
      'The "Add Network" form for a custom network. On-screen order: name, the "Bitcoin API" preset dropdown (Mainnet, Testnet4 and others), "Bitcoin API URL", "Network key", then the Stacks API URL (network-form-fields.tsx, bitcoin-api-section.tsx). On mount both URLs are prefilled from the Mainnet preset. Selecting a preset sets both the Stacks and the Bitcoin URL (setNetworkUrls), and the dropdown reads "Custom" as soon as either URL differs from the preset (network-presets.ts). "Add network" validates in order ("Enter a name", "Enter a valid Stacks API URL", "Enter a valid Bitcoin API URL", "Enter a unique key", "A network with this key already exists"), then fetches the Bitcoin mempool (/mempool/recent) and only after that the Stacks node info (/v2/info), showing "Unable to fetch mempool from bitcoin node" or "Unable to fetch info from stacks node" when either is unreachable, and "Unable to determine chainID from node." when /v2/info has no network_id (use-add-network.tsx). The node responses come from mockNetworkValidationRequests, which setupMockApis already registers. On success the network becomes active and the app navigates to Home. The back button goes to the previous page (navigate(-1)). BitcoinApiOptionTestnet renders only while the "Bitcoin API" dropdown is open and ErrorText only after a rejected submit.',
  },
  {
    id: 'edit-network',
    anchor: { kind: 'route' },
    routes: [RouteUrls.EditNetwork],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'On /select-network open a custom network menu (NetworkSelectors.NetworkMenuBtn)',
          'Click "Edit" (NetworkSelectors.EditNetworkMenuBtn); the network is passed in route state, so there is no deep link',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    deepLinkable: false,
    preconditions: { session: 'signed-in', mocks: [...defaultMocks] },
    selectors: {
      ready: NetworkSelectors.NetworkPageReady,
      others: [...networkFormSelectors],
    },
    actions: [],
    specs: [addNetworkSpec],
    description:
      'The same network form as /add-network, titled "Edit Network" and prefilled from the custom network passed in route state (the add-network spec checks the Stacks URL is restored). The "Network key" input is disabled in edit mode, and the Mainnet preset prefill is skipped. A bare #/edit-network therefore renders an empty form that can never be submitted ("Enter a unique key"). Submitting with "Edit network" revalidates against both nodes (mockNetworkValidationRequests, part of setupMockApis), saves the changes and navigates to Home. Editing is disabled for a network that a multisig policy is bound to. No page-object action opens it: NetworkPage.openNetworkPage stops on /select-network and the spec clicks NetworkMenuBtn and EditNetworkMenuBtn directly. BitcoinApiOptionTestnet renders only while the "Bitcoin API" dropdown is open and ErrorText only after a rejected submit.',
  },
  {
    id: 'network-switcher',
    anchor: { kind: 'selectors', objects: ['HomePageSelectors.NetworkSwitcher'] },
    routes: [],
    startRoute: RouteUrls.Home,
    open: ['NetworkPage.selectTestnet'],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Switch to any network other than mainnet (Settings → Network → pick a network → back), or turn on "Always show network" on /select-network',
          'On home the badge renders inside the account card next to "Total balance" (account-card.tsx); on /settings and /manage-tokens it renders in the header (HeaderNetwork); clicking it opens /select-network',
        ],
      },
    ],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', network: 'testnet4', mocks: [...defaultMocks] },
    selectors: {
      ready: HomePageSelectors.NetworkSwitcher,
      others: [],
    },
    actions: ['NetworkPage.selectTestnet', 'NetworkPage.changeNetwork'],
    specs: [settingsSpec],
    description:
      'The network badge (apps/extension/src/app/pages/settings/components/network-switcher.tsx), rendered inside the home account card and in the header of /settings and /manage-tokens. It is hidden while the current network\'s Stacks chain id is mainnet (custom networks whose node reports the mainnet chain id included) unless the "Always show network" setting is on, shows the current network name otherwise, and navigates to /select-network on click. The settings spec switches to testnet4, opens /settings and asserts only that the badge text contains "Testnet4"; its isHidden and isVisible calls carry no expect.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
