import { stxToMicroStx } from '@leather.io/utils';

import packageJson from '../../package.json';

export const UI_IMPOSED_MAX_STACKING_AMOUNT_USTX = stxToMicroStx(10_000_000_000);

export const STACKING_CONTRACT_CALL_TX_BYTES = 260;

export const FEE_RATE = 400;

export const DEFAULT_DEVNET_SERVER = 'http://localhost:3999';

export const VERSION = packageJson.version;

export const STACKS_BLOCKS_PER_DAY = 144;

export const STACKING_TRACKER_API_URL = 'https://api.stacking-tracker.com';

export const EM_DASH = '—';

export const FRONT_INBOX_ID = 'inb_6cw7l';
