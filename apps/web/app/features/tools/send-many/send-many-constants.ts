import { SEND_MANY_CONTACT_ID } from '~/constants/constants';

export const STX_DECIMALS = 6;
export const SBTC_DECIMALS = 8;
export const USDCX_DECIMALS = 6;
export const MAX_RECIPIENTS = 200;
export const MAX_MEMO_BYTES = 34;

export const SBTC_CONTRACT_ID = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';
export const SBTC_ASSET_NAME = 'sbtc-token';

export const USDCX_CONTRACT_ID = 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx';
export const USDCX_ASSET_NAME = 'usdcx-token';
export const USDCX_SEND_MANY_CONTRACT_ID =
  'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.usdcx-send-many-v1';

interface SendManyTokenConfig {
  label: string;
  decimals: number;
  contractId: string;
  functionName: string;
}

export const sendManyTokens = {
  stx: {
    label: 'STX',
    decimals: STX_DECIMALS,
    contractId: SEND_MANY_CONTACT_ID,
    functionName: 'send-many',
  },
  sbtc: {
    label: 'sBTC',
    decimals: SBTC_DECIMALS,
    contractId: SBTC_CONTRACT_ID,
    functionName: 'transfer-many',
  },
  usdc: {
    label: 'USDC',
    decimals: USDCX_DECIMALS,
    contractId: USDCX_SEND_MANY_CONTRACT_ID,
    functionName: 'send-many',
  },
} as const satisfies Record<string, SendManyTokenConfig>;

export type SendManyToken = keyof typeof sendManyTokens;
