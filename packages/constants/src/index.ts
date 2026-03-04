import type {
  AccountDisplayPreference,
  AccountDisplayPreferenceInfo,
  BitcoinUnit,
  BitcoinUnitInfo,
  BtcAsset,
  CryptoCurrency,
  Currency,
  StxAsset,
} from '@leather.io/models';

export const gaiaUrl = 'https://hub.blockstack.org';

export const ZERO_INDEX = 0;

export const HIRO_EXPLORER_URL = 'https://explorer.hiro.so';
export const MEMPOOL_BASE_URL = 'https://mempool.space';
export const ORD_IO_URL = 'https://ord.io';
export const GAMMA_URL = 'https://gamma.io';
export const GAMMA_API_URL: string = `${GAMMA_URL}/api`;
export const MAGIC_EDEN_URL = 'https://magiceden.io/bitcoin';
export const BNS_REGISTRATION_URL = 'https://bns.one/';
export const LEATHER_IPFS_GATEWAY_URL = 'https://leather.quicknode-ipfs.com/ipfs/';
export const SBTC_RECLAIM_URL = 'https://app.stacks.co/reclaim?depositTxId=';

export const HIGH_FEE_AMOUNT_STX = 5;
export const HIGH_FEE_WARNING_LEARN_MORE_URL_BTC = 'https://bitcoinfees.earn.com/';
export const HIGH_FEE_WARNING_LEARN_MORE_URL_STX =
  'https://leather.gitbook.io/guides/transactions/fees';

export const DEFAULT_FEE_RATE = 400;

export const PERSISTENCE_CACHE_TIME: number = 1000 * 60 * 60 * 12; // 12 hours

export const BTC_DECIMALS = 8;
export const STX_DECIMALS = 6;
export const SATS_IN_BTC = 100_000_000;
export const BITCOIN_MINIMUM_SPEND_IN_SATS = 546;

// Units of `Money` should be declared in their smallest unit. Similar to
// Rosetta, we model currencies with their respective resolution
export const currencyDecimalsMap: Record<Currency, number> = {
  BTC: BTC_DECIMALS,
  STX: STX_DECIMALS,
  USD: 2,
  EUR: 2,
  GBP: 2,
  AUD: 2,
  CAD: 2,
  CNY: 2,
  JPY: 0,
  KRW: 0,
} as const;

export const currencyNameMap = {
  USD: 'United States Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CNY: 'Chinese Yuan',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  BTC: 'Bitcoin',
} as const;

// https://bitcoin.stackexchange.com/a/41082/139277
export const BTC_P2WPKH_DUST_AMOUNT = 294;

export const KEBAB_REGEX: RegExp = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;

export const DEFAULT_LIST_LIMIT = 50;

export const TOKEN_NAME_LENGTH = 4;

export const LEATHER_SUPPORT_URL = 'https://leather.io/contact';

export const LEATHER_SUPPORT_GUIDES = 'https://app.leather.io/support';
export const LEATHER_GUIDES_URL = 'https://leather.io/guides';
export const LEATHER_GUIDES_UTXO_PROTECTION_URL = 'https://leather.io/guides/utxo-protection';
export const LEATHER_GUIDES_GETTING_STARTED_URL = 'https://app.leather.io/support/get-started';
export const LEATHER_GUIDES_ORDINALS_URL =
  'https://app.leather.io/support/guide/what-are-bitcoin-ordinals';
export const LEATHER_GUIDES_BNS_URL = 'https://leather.io/guides/bns';

export const BTC_US_URL = 'https://btc.us/';

export const LEATHER_GUIDES_CONNECT_DAPPS = 'https://leather.io/guides/connect-dapps';

export const LEATHER_LEARN_URL = 'https://leather.io/learn';

export const LEATHER_GETTING_STARTED = 'https://app.leather.io/support/get-started';

export const LEATHER_SBTC_TUTORIAL = 'https://app.leather.io/support/sbtc';

export const LEATHER_STACKING_TUTORIAL =
  'https://app.leather.io/support/guide/getting-started-with-stacking';

export const LEATHER_HELP_CENTER = 'https://app.leather.io/support';

export const LEATHER_GITBOOK_DEVS = 'https://leather.gitbook.io/developers';

export const LEATHER_EARN_URL = 'https://earn.leather.io';

export const LEATHER_EARN_STACKING_URL = 'https://app.leather.io/stacking';
export const LEATHER_EARN_SBTC_URL = 'https://app.leather.io/sbtc';

export const LEATHER_EXTENSION_CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj?hl=en';

export const LEATHER_API_URL_STAGING = 'https://staging.api.leather.io';
export const LEATHER_API_URL_PRODUCTION = 'https://api.leather.io';

export const bitcoinUnitsKeyedByName: Record<BitcoinUnit, BitcoinUnitInfo> = {
  bitcoin: {
    name: 'bitcoin',
    symbol: 'BTC',
    decimal: '1',
  },
  satoshi: {
    name: 'satoshi',
    symbol: 'sat',
    decimal: '0.00000001',
  },
};

export enum AccountDisplayPreferenceType {
  NativeSegwit = 'native-segwit',
  Taproot = 'taproot',
  Bns = 'bns',
  Stacks = 'stacks',
}

export const accountDisplayPreferencesKeyedByType: Record<
  AccountDisplayPreference,
  AccountDisplayPreferenceInfo
> = {
  [AccountDisplayPreferenceType.NativeSegwit]: {
    type: 'native-segwit',
    blockchain: 'bitcoin',
    name: 'Native Segwit address',
  },
  [AccountDisplayPreferenceType.Taproot]: {
    type: 'taproot',
    blockchain: 'bitcoin',
    name: 'Taproot address',
  },
  [AccountDisplayPreferenceType.Bns]: {
    type: 'bns',
    blockchain: 'stacks',
    name: 'BNS name',
  },
  [AccountDisplayPreferenceType.Stacks]: {
    type: 'stacks',
    blockchain: 'stacks',
    name: 'Stacks address',
  },
};

export const btcAsset: BtcAsset = {
  chain: 'bitcoin',
  protocol: 'nativeBtc',
  symbol: 'BTC',
  category: 'fungible',
  name: 'Bitcoin',
  decimals: 8,
  hasMemo: false,
};

export const stxAsset: StxAsset = {
  chain: 'stacks',
  protocol: 'nativeStx',
  symbol: 'STX',
  category: 'fungible',
  name: 'Stacks',
  decimals: 6,
  hasMemo: false,
};

export const cryptoAssetColors: Record<CryptoCurrency, string> = {
  BTC: '#F59300',
  STX: '#FC6432',
  sBTC: '#DC7045',
  VELAR: '#966D3D',
  aeUSDC: '#4A73BE',
  USDh: '#E39B53',
};

export const ALEX_LINK = 'https://alexgo.io/';
export const ZEST_LINK = 'https://www.zestprotocol.com/';
export const ARKADIKO_LINK = 'https://app.arkadiko.finance/';
export const GRANITE_LINK = 'https://www.granite.world/';
export const HERMETICA_LINK = 'https://www.hermetica.fi/';
export const BITFLOW_LINK = 'https://app.bitflow.finance/';
export const VELAR_LINK = 'https://www.velar.co/';

export const USDCX_ASSET_ID_MAINNET =
  'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token';

export const USDCX_ASSET_ID_TESTNET =
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx::usdcx-token';

export const SBTC_ASSET_ID_MAINNET =
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token';

export const SBTC_ASSET_ID_TESTNET = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token';

export const SIP10_TOKEN_NAME_OVERRIDES: Record<string, string> = {
  'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity': 'Dawgcoin',
};
