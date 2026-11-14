import type { ExplorationConfig } from '../../shared/exploration/exploration-config';
import {
  ChooseScreen,
  ClosedScreen,
  CopiedScreen,
  SegwitScreen,
  StacksScreen,
  TaprootScreen,
} from './receive-screens';

export const receiveConfig: ExplorationConfig<
  'fixed',
  'choose' | 'segwit' | 'taproot' | 'stacks' | 'copied' | 'closed'
> = {
  title: 'Receive example',
  variantIds: ['fixed'],
  screenIds: ['choose', 'segwit', 'taproot', 'stacks', 'copied', 'closed'],
  defaultVariant: 'fixed',
  defaultScreen: 'choose',
  variants: {
    fixed: {
      label: 'Fixed',
      module: {
        meta: {
          title: 'Receive example',
          summary: 'Receive journey with the owner-reviewed asset and protocol hierarchy.',
        },
        screens: {
          choose: ChooseScreen,
          segwit: SegwitScreen,
          taproot: TaprootScreen,
          stacks: StacksScreen,
          copied: CopiedScreen,
          closed: ClosedScreen,
        },
      },
    },
  },
  screens: {
    choose: { label: 'Choose protocol', job: 'choose-protocol' },
    segwit: { label: 'Native SegWit', job: 'receive-address' },
    taproot: { label: 'Taproot', job: 'receive-address' },
    stacks: { label: 'Stacks', job: 'receive-address' },
    copied: { label: 'Copied', job: 'copy-confirmation' },
    closed: { label: 'Closed', job: 'reopen-receive' },
  },
  today: {
    flows: [],
    image(name) {
      return name;
    },
  },
  concepts: {
    fixed: {
      title: 'Receive example',
      builtFrom: ['FramePage', 'ReceiveAssetIdentity', 'ReceiveAddressBlock'],
      bet: { text: 'Choose a protocol, inspect its full address, then copy it.', source: 'brief' },
      why: [{ text: 'A complete reviewable example using fixture addresses.', source: 'brief' }],
      tradeOff: { text: 'Fixture data only; no wallet connection.', source: 'brief' },
      openQuestions: [],
    },
  },
  journey: [],
  references: { byVariant: { fixed: [] } },
  assumptions: [
    'Example only: no wallet connection, real balance or current-product comparison. Protocol purpose copy is illustrative and must be checked before product use.',
  ],
  flow: {
    entries: {
      choose: 'Account → Receive; detail → Back; closed → Receive',
      segwit: 'Choose protocol → Native SegWit',
      taproot: 'Choose protocol → Taproot',
      stacks: 'Choose protocol → Stacks',
      copied: 'Selected protocol detail → successful clipboard write',
      closed: 'Choose or detail → Close',
    },
  },
};
