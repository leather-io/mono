import { HIRO_API_BASE_URL_MAINNET, HIRO_API_BASE_URL_TESTNET } from '@leather.io/models';
import { stxToMicroStx } from '@leather.io/utils';

import packageJson from '../../package.json';

export const EXPLORER_URL = 'https://explorer.stacks.co';

export const STACKING_ADDRESS_FORMAT_HELP_URL =
  'https://www.hiro.so/questions/what-form-of-btc-addresses-can-i-use-for-proof-of-transfer-rewards';

export const STACKING_LEARN_MORE_URL = 'https://stacks.org/stacking-moves-us-forward';

export const MAX_STACKING_CYCLES = 12;

export const MIN_STACKING_CYCLES = 1;

export const MIN_DELEGATED_STACKING_AMOUNT_USTX = 50_000_000;

export const UI_IMPOSED_MAX_STACKING_AMOUNT_USTX = stxToMicroStx(10_000_000_000);

export const STACKING_CONTRACT_CALL_TX_BYTES = 260;

export const SUPPORTED_BTC_ADDRESS_FORMATS = ['p2pkh', 'p2sh', 'p2wpkh', 'p2tr', 'p2wsh'] as const;

export const FEE_RATE = 400;

export const SEND_MANY_CONTACT_ID = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.send-many-memo';

export const BUY_STACKS_URL = 'https://coinmarketcap.com/currencies/stacks/markets/';

export const DEFAULT_DEVNET_SERVER = 'http://localhost:3999';

export const DEFAULT_MAINNET_SERVER = HIRO_API_BASE_URL_MAINNET;

export const DEFAULT_TESTNET_SERVER = HIRO_API_BASE_URL_TESTNET;

export const VERSION = packageJson.version;

export const GITHUB_ORG = 'leather-io';
export const GITHUB_REPO = 'mono';

export const STACKS_BLOCKS_PER_DAY = 144;

export const STACKING_TRACKER_API_URL = 'https://api.stacking-tracker.com';
