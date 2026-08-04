export const STANDARD_BIP_FAKE_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon cactus';

export const TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS = 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq';
export const TEST_ACCOUNT_1_TAPROOT_ADDRESS =
  'bc1putuzj9lyfcm8fef9jpy85nmh33cxuq9u6wyuk536t9kemdk37yjqmkc0pg';
export const TEST_ACCOUNT_2_TAPROOT_ADDRESS =
  'bc1pmk2sacpfyy4v5phl8tq6eggu4e8laztep7fsgkkx0nc6m9vydjesaw0g2r';

export const TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS =
  'tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d';

export const TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS = 'tb1qr8me8t9gu9g6fu926ry5v44yp0wyljrespjtnz';

export const TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS =
  'tb1pve00jmp43whpqj2wpcxtc7m8wqhz0azq689y4r7h8tmj8ltaj87qj2nj6w';

// Stacks test addresses
export const TEST_ACCOUNT_1_STX_ADDRESS = 'SPS8CKF63P16J28AYF7PXW9E5AACH0NZNTEFWSFE';
export const TEST_TESTNET_ACCOUNT_1_STX_ADDRESS = 'STS8CKF63P16J28AYF7PXW9E5AACH0NZNRV74CM7';
export const TEST_ACCOUNT_2_STX_ADDRESS = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';
export const TEST_TESTNET_ACCOUNT_2_STX_ADDRESS = 'STXH3HNBPM5YP15VH16ZXZ9AX6CK289K3NVR9T1P';
export const TEST_MULTISIG_ACCOUNTS_3_1_STX_ADDRESS = 'SM2TBKGDZ6BKYM21NJ91F2JAA0MMCT41N8KSJB8E4';
export const TEST_ACCOUNT_1_STX_ADDRESS_HEX = '0x1632864de61d8269090af3cf6ef12e2a94c882bfae';

// Account public keys
export const TEST_ACCOUNT_1_PUBKEY =
  '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893';
export const TEST_ACCOUNT_3_PUBKEY =
  '03c1e856462ca2844adb898aee90af5237e9d1be0fe51212635b2f7a643b0585e1';

export const TEST_BNS_NAME = 'test-hiro-wallet.btc';
export const TEST_BNS_RESOLVED_ADDRESS = 'SP12YQ0M2KFT7YMJKVGP71B874YF055F77PFPH9KM';
export const TEST_PASSWORD = 'my_s3cret_p@ssw0r4';

export const SBTC_EMILY_API_URL = 'https://sbtc-emily.com';
export const SBTC_SPONSORSHIP_API_URL = 'https://sponsor.leather.io';

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
