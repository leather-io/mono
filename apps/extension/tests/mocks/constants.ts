export {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_PUBKEY,
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  TEST_ACCOUNT_2_STX_ADDRESS,
  TEST_ACCOUNT_2_TAPROOT_ADDRESS,
  TEST_ACCOUNT_3_PUBKEY,
  TEST_BNS_NAME,
  TEST_BNS_RESOLVED_ADDRESS,
  TEST_PASSWORD,
  TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_STX_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
} from '@leather.io/test-config';

export const STANDARD_BIP_FAKE_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon cactus';

export const SBTC_EMILY_API_URL = 'https://some-test-emily-api-url.com';
export const SBTC_SPONSORSHIP_API_URL = 'https://some-test-sponsorship-api-url.com';

const mockSbtcConfig = {
  enabled: true,
  emilyApiUrl: SBTC_EMILY_API_URL,
  sponsorshipApiUrl: {
    mainnet: SBTC_SPONSORSHIP_API_URL,
    testnet: SBTC_SPONSORSHIP_API_URL,
  },
  swapsEnabled: true,
  sponsorshipsEnabled: true,
  contracts: {
    mainnet: {
      address: '',
    },
    testnet: {
      address: '',
    },
  },
};

export const MOCK_REMOTE_CONFIG = {
  sbtc: mockSbtcConfig,
};
