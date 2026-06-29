import { Page } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import type { SupportedBlockchains } from '@leather.io/models';
import { createCounter, delay } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

export const TEST_ACCOUNT_SECRET_KEY = process.env.EXTENSION_INTEGRATION_TEST_MNEMONIC ?? '';

// If default wallet state changes, this needs to be updated
export const testFingerprint = 'e87a850b';
export function getTestSoftwareAccountDefaultWalletState() {
  return {
    accounts: {
      ids: [`${testFingerprint}/0`],
      entities: {
        [`${testFingerprint}/0`]: { id: `${testFingerprint}/0` },
      },
    },
    active: {
      account: {
        fingerprint: testFingerprint,
        accountIndex: 0,
      },
    },
    chains: {
      stx: {
        [testFingerprint]: {
          highestAccountIndex: 10,
          currentAccountStacksDescriptor: '',
        },
      },
    },
    appPermissions: {
      entities: {},
      ids: [],
    },
    wallets: {
      ids: [testFingerprint],
      entities: {
        [testFingerprint]: {
          fingerprint: testFingerprint,
          name: 'Wallet 1',
          type: 'software',
          createdOn: null,
        },
      },
    },
    softwareKeys: {
      salt: 'a086b877fc757a4daa7c6343d2861c05',
      ids: [testFingerprint],
      entities: {
        [testFingerprint]: {
          type: 'software',
          id: testFingerprint,
          encryptedSecretKey:
            'ff735c244c72e1c7f7dc411b240ce6e30f87a43106cd1c87a77d3a6f80679176558ce2e73d1a089d6a83d8764b31d9d9043a6f79ca1104fb8238a6ae4f1e063bc1f1c3ba99c4c4e8b38d871963a7e3d8a0a4ed5e6525ec6702d9074dd9ee376c',
        },
      },
    },
    keychains: {
      entities: {},
      ids: [],
    },
    networks: { ids: [], entities: {}, currentNetworkId: 'mainnet' },
    policy: { entities: {}, ids: [] },
    settings: {
      userSelectedTheme: 'system',
      dismissedMessages: [],
      dismissedPromoIndexes: [],
      seenFeatureIntros: [],
      discardedInscriptions: [],
      isNotificationsEnabled: true,
    },
    manageTokens: { entities: {}, ids: [] },
    _persist: { version: 4, rehydrated: true },
  };
}

// Seeds the demo app (localhost:3000) as connected to the test software wallet.
// Signing methods (sendTransfer, stx_*, etc.) now require a connected wallet, so
// tests that dispatch them without an explicit connect step must seed this.
export function getConnectedTestAppPermissionsState() {
  return {
    appPermissions: {
      ids: ['localhost:3000'],
      entities: {
        'localhost:3000': {
          origin: 'localhost:3000',
          fingerprint: testFingerprint,
          accountIndex: 0,
          requestedAccounts: '2024-01-01T00:00:00.000Z',
          networkMode: 'mainnet',
        },
      },
    },
  };
}

const ledgerBitcoinKeysState = {
  entities: {
    "e87a850b/84'/0'/0'": {
      id: "e87a850b/84'/0'/0'",
      path: "m/84'/0'/0'",
      policy:
        "[e87a850b/84'/0'/0']xpub6BuKrNqTrGfsy8VAAdUW2KCxbHywuSKjg7hZuAXERXDv7GfuxUgUWdVRKNsgujcwdjEHCjaXWouPKi1m5gMgdWX8JpRcyMkrSxPe4Da3Lx8",
      fingerprint: 'e87a850b',
    },
    "e87a850b/84'/0'/1'": {
      id: "e87a850b/84'/0'/1'",
      path: "m/84'/0'/1'",
      policy:
        "[e87a850b/84'/0'/1']xpub6BuKrNqTrGft1dv2pR3Ey8VsBnSBkVVpehNsro8V8kaWMRGeUNv8yhJpTw62Ldqenm5kuVyC2bQqgc6yrKAruDKyzz18zi83Sg2FTwEHsrF",
      fingerprint: 'e87a850b',
    },
    "e87a850b/84'/0'/2'": {
      id: "e87a850b/84'/0'/2'",
      path: "m/84'/0'/2'",
      policy:
        "[e87a850b/84'/0'/2']xpub6BuKrNqTrGft5UhSiYcXtN1d9Cp8iwj9tBVLjfJtLUqUFYA2xjVmAiB4TbUP6uaX3qwNhrW3baGE1Fz49YNSFcEMTtcd4Uz25juszoCCy8w",
      fingerprint: 'e87a850b',
    },
    "e87a850b/84'/0'/3'": {
      id: "e87a850b/84'/0'/3'",
      path: "m/84'/0'/3'",
      policy:
        "[e87a850b/84'/0'/3']xpub6BuKrNqTrGft7h39ks3qJjcz3KusNtsDtr8t59t2MUneWoCqbGYLcqLeqRaXC5na2tWDDzncBBVNVPT55b6jLM4dT5f6aGvgaXEXV6VniL6",
      fingerprint: 'e87a850b',
    },
    "e87a850b/84'/0'/4'": {
      id: "e87a850b/84'/0'/4'",
      path: "m/84'/0'/4'",
      policy:
        "[e87a850b/84'/0'/4']xpub6BuKrNqTrGftAswPZxdCzxArCp1bsUh3JPizsMymSVanfVJqXR2wjsX7PBnwMXnXttiWU6pMdBgB82mR2BPDtSGcUfjD8QJTNca47iYkGD3",
      fingerprint: 'e87a850b',
    },
    "e87a850b/86'/0'/0'": {
      id: "e87a850b/86'/0'/0'",
      path: "m/86'/0'/0'",
      policy:
        "[e87a850b/86'/0'/0']xpub6C4MQD2bVDTfdnVe5AYKB6gE7BE4yQeKBRgukQ4Hi3phDB5fCYKEAdViQ2n7kZQ1t728QV4wKGgiR5qGigjNNrm5DCGWYUZDRVNWYb8ZWGK",
      fingerprint: 'e87a850b',
    },
    "e87a850b/86'/0'/1'": {
      id: "e87a850b/86'/0'/1'",
      path: "m/86'/0'/1'",
      policy:
        "[e87a850b/86'/0'/1']xpub6C4MQD2bVDTfgjjWZhmPMNDMFHFmrSmGzqJVpuf98XB8F5eNaQus6XmrcrTrTiiL2EscdC4cjztP5LfaW13vZ6eDuDHXXAq71W5KEHeEeKH",
      fingerprint: 'e87a850b',
    },
    "e87a850b/86'/0'/2'": {
      id: "e87a850b/86'/0'/2'",
      path: "m/86'/0'/2'",
      policy:
        "[e87a850b/86'/0'/2']xpub6C4MQD2bVDTfkGnARZXj6dRRF223bcyKAK2qCRKf9xyPQg7k4ZZc4FAHLcXhQ1NCVJCTVGEMd1YoRnBBDdgXKrmt4bm5XmF1ry9ox4Qsx3F",
      fingerprint: 'e87a850b',
    },
    "e87a850b/86'/0'/3'": {
      id: "e87a850b/86'/0'/3'",
      path: "m/86'/0'/3'",
      policy:
        "[e87a850b/86'/0'/3']xpub6C4MQD2bVDTfmbN4ZJfozbNRMqyD1jmMFcQTNRUNyjE2J6tdVggFoQ8KmxUpijsZX1E4iDciY5AmnHbq95BHMVGJAGZ1MAm7iupHkTBV6YE",
      fingerprint: 'e87a850b',
    },
    "e87a850b/86'/0'/4'": {
      id: "e87a850b/86'/0'/4'",
      path: "m/86'/0'/4'",
      policy:
        "[e87a850b/86'/0'/4']xpub6C4MQD2bVDTfq9RLtYxmqJRNsiviyuM51CFE1qqQbE6o8QN9Uix47Kvj4fqKFX5f88DyhxaX93L4H1WdSZChMZUWGUzPm54N9VfvsYJBvi9",
      fingerprint: 'e87a850b',
    },
  },
  ids: [
    "e87a850b/84'/0'/0'",
    "e87a850b/84'/0'/1'",
    "e87a850b/84'/0'/2'",
    "e87a850b/84'/0'/3'",
    "e87a850b/84'/0'/4'",
    "e87a850b/86'/0'/0'",
    "e87a850b/86'/0'/1'",
    "e87a850b/86'/0'/2'",
    "e87a850b/86'/0'/3'",
    "e87a850b/86'/0'/4'",
  ],
};

const ledgerStacksKeysState = {
  entities: {
    "e87a850b/44'/5757'/0'/0/0": {
      path: "m/44'/5757'/0'/0/0",
      stxPublicKey: '0329b076bc20f7b1592b2a1a5cb91dfefe8c966e50e256458e23dd2c5d63f8f1af',
      dataPublicKey:
        '04716759aa2d2ec9066ff699626c3404c5cc7e84e7295af6768a0fce2defcd1c50a9ee4b1fd1e63295abc47c81f602e77c497f4549fa68535c7abbe73854b62df7',
      id: "e87a850b/44'/5757'/0'/0/0",
      fingerprint: 'e87a850b',
    },
    "e87a850b/44'/5757'/0'/0/1": {
      path: "m/44'/5757'/0'/0/1",
      stxPublicKey: '035c63a8042cd820ae59b50cfb225b886d0837c97a5f5daa190037fcadf60a1da6',
      dataPublicKey:
        '04c8fba749c7be4a817c1bee8c24b7464f3be6f7e78f5c9ab43a57710f703155e059ce8b5fcb33e8c8d0ff154e964f99c486eed8b8b19f108cf5137a07275a277f',
      id: "e87a850b/44'/5757'/0'/0/1",
      fingerprint: 'e87a850b',
    },
    "e87a850b/44'/5757'/0'/0/2": {
      path: "m/44'/5757'/0'/0/2",
      stxPublicKey: '02dbcd4e19f13709889eebdb450f84b48195f8ada1673cd8e663ca409a09379740',
      dataPublicKey:
        '04614af2cb5b9a07fb9049713a860a09cd97549373e73104e32b814922392a97a3c6d938f2b7f6e771c5e6611be64b762919a435a242fa5796b5bb4b9728eb079e',
      id: "e87a850b/44'/5757'/0'/0/2",
      fingerprint: 'e87a850b',
    },
    "e87a850b/44'/5757'/0'/0/3": {
      path: "m/44'/5757'/0'/0/3",
      stxPublicKey: '03a9ee7ccb82ecdd9de236b4d1909f79e75d93ba0ae68494f0cf710a5bf1e47837',
      dataPublicKey:
        '04e3c33077024159f2a1aa28e4e73811d477fac3303f6395bfb8937994bc61d1a3b762d52ea4a57d0f2ed36523a96ffec74d1f05676e4411601402013f16f16374',
      id: "e87a850b/44'/5757'/0'/0/3",
      fingerprint: 'e87a850b',
    },
    "e87a850b/44'/5757'/0'/0/4": {
      path: "m/44'/5757'/0'/0/4",
      stxPublicKey: '03e8e4daeece139da8e03d06734712b3dce83175791b94f44185c3fdae9122d264',
      dataPublicKey:
        '04673e21fc8fb98131d843bcb10edb015dd3219bb1f730c81c6de13a9df91d5f1a709099cd0d41d535f45b3119d3458ccdc98614ee4833c99f09c7c62d654350fa',
      id: "e87a850b/44'/5757'/0'/0/4",
      fingerprint: 'e87a850b',
    },
  },
  ids: [
    "e87a850b/44'/5757'/0'/0/0",
    "e87a850b/44'/5757'/0'/0/1",
    "e87a850b/44'/5757'/0'/0/2",
    "e87a850b/44'/5757'/0'/0/3",
    "e87a850b/44'/5757'/0'/0/4",
  ],
};

// Build keychains from ledger Bitcoin and Stacks keys
function buildKeychains(keysToInclude: SupportedBlockchains[]) {
  const entities: Record<string, { descriptor: string; chain: 'bitcoin' | 'stacks' }> = {};
  const ids: string[] = [];

  // Add Bitcoin keychains
  if (keysToInclude.includes('bitcoin')) {
    Object.values(ledgerBitcoinKeysState.entities).forEach(key => {
      const keyOrigin = key.id; // Already in correct format: e87a850b/84'/0'/0'
      entities[keyOrigin] = {
        descriptor: key.policy, // policy is already a descriptor [keyOrigin]xpub...
        chain: 'bitcoin',
      };
      ids.push(keyOrigin);
    });
  }

  // Add Stacks keychains
  if (keysToInclude.includes('stacks')) {
    Object.values(ledgerStacksKeysState.entities).forEach(key => {
      const keyOrigin = key.id; // Already in correct format: e87a850b/44'/5757'/0'/0/0
      // Create descriptor for Stacks: [keyOrigin]publicKey
      const descriptor = `[${keyOrigin}]${key.stxPublicKey}`;
      entities[keyOrigin] = {
        descriptor,
        chain: 'stacks',
      };
      ids.push(keyOrigin);
    });
  }

  return { entities, ids };
}

export function makeLedgerTestAccountWalletState(keysToInclude: SupportedBlockchains[]) {
  const fingerprint = 'e87a850b';
  const keychains = buildKeychains(keysToInclude);

  return {
    _persist: { rehydrated: true, version: 3 },
    active: {
      account: {
        fingerprint,
        accountIndex: 0,
      },
    },
    chains: {
      stx: {
        [fingerprint]: {
          highestAccountIndex: 0,
          currentAccountStacksDescriptor: '',
        },
      },
    },
    wallets: {
      ids: [fingerprint],
      entities: {
        [fingerprint]: {
          fingerprint,
          name: 'My Ledger',
          type: 'ledger',
          createdOn: null,
        },
      },
    },
    softwareKeys: {
      entities: {},
      ids: [],
    },
    keychains,
    networks: { currentNetworkId: 'mainnet', entities: {}, ids: [] },
    settings: { dismissedMessages: [], userSelectedTheme: 'system' },
    appPermissions: {
      entities: {},
      ids: [],
    },
    manageTokens: { entities: {}, ids: [] },
  };
}

// A distinct fingerprint for the Ledger wallet so it does not collide with the
// software test wallet (`testFingerprint`) when both are present.
export const mixedLedgerFingerprint = 'a1b2c3d4';

function rekeyLedgerKeychains(
  keychains: {
    entities: Record<string, { descriptor: string; chain: 'bitcoin' | 'stacks' }>;
    ids: string[];
  },
  fromFingerprint: string,
  toFingerprint: string
) {
  const entities: Record<string, { descriptor: string; chain: 'bitcoin' | 'stacks' }> = {};
  const ids: string[] = [];
  keychains.ids.forEach(id => {
    const rekeyedId = id.replace(fromFingerprint, toFingerprint);
    const keychain = keychains.entities[id];
    entities[rekeyedId] = {
      ...keychain,
      // Only the key-origin fingerprint changes; the xpub/pubkey is untouched,
      // so the derived addresses are identical to the original Ledger fixture.
      descriptor: keychain.descriptor.replace(fromFingerprint, toFingerprint),
    };
    ids.push(rekeyedId);
  });
  return { entities, ids };
}

// One software wallet with 2 accounts plus one Ledger wallet with 5 accounts,
// each under its own fingerprint, for testing multiwallet account selection.
export function makeMixedSoftwareAndLedgerWalletState() {
  const softwareState = getTestSoftwareAccountDefaultWalletState();
  const ledgerKeychains = rekeyLedgerKeychains(
    buildKeychains(['bitcoin', 'stacks']),
    'e87a850b',
    mixedLedgerFingerprint
  );

  return {
    ...softwareState,
    chains: {
      stx: {
        [testFingerprint]: { highestAccountIndex: 1, currentAccountStacksDescriptor: '' },
        [mixedLedgerFingerprint]: { highestAccountIndex: 0, currentAccountStacksDescriptor: '' },
      },
    },
    wallets: {
      ids: [testFingerprint, mixedLedgerFingerprint],
      entities: {
        [testFingerprint]: {
          fingerprint: testFingerprint,
          name: 'Wallet 1',
          type: 'software',
          // Explicit timestamps so the software wallet sorts before the Ledger
          // wallet deterministically (the tree orders wallets by createdOn)
          createdOn: '2024-01-01T00:00:00.000Z',
        },
        [mixedLedgerFingerprint]: {
          fingerprint: mixedLedgerFingerprint,
          name: 'My Ledger',
          type: 'ledger',
          createdOn: '2024-01-02T00:00:00.000Z',
        },
      },
    },
    keychains: ledgerKeychains,
  };
}

export class OnboardingPage {
  constructor(readonly page: Page) {}

  async setPassword(password = TEST_PASSWORD) {
    const passwordInput = this.page.getByTestId(OnboardingSelectors.NewPasswordInput);
    await passwordInput.waitFor();
    await passwordInput.fill(password);
    await this.page.waitForTimeout(100);
    await this.page.getByTestId(OnboardingSelectors.SetPasswordBtn).click();
  }

  async signUpNewUser(password = TEST_PASSWORD) {
    await this.page.getByTestId(OnboardingSelectors.SignUpBtn).click();
    await this.page.waitForURL('**' + RouteUrls.BackUpSecretKey);
    await this.page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await this.setPassword(password);
    await this.page.waitForURL('**' + RouteUrls.Home);
    await this.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor();
    await this.dismissFeatureIntroducer();
  }
  async initiateSignIn() {
    await this.page.getByTestId(OnboardingSelectors.SignInLink).click();
  }

  /**
   * Use this to test the onboarding flow by going through step-by-step
   */
  async signInExistingUser(secretKey = TEST_ACCOUNT_SECRET_KEY) {
    await this.initiateSignIn();
    await this.enterMnemonicKey(secretKey);
    await this.page.getByTestId(OnboardingSelectors.SignInBtn).click();
    await this.setPassword();
    await this.page.waitForURL('**' + RouteUrls.Home);
    await this.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor();
  }

  async dismissFeatureIntroducer() {
    const tryItOutBtn = this.page.getByTestId(
      SharedComponentsSelectors.FeatureIntroducerTryItOutBtn
    );
    try {
      await tryItOutBtn.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      return;
    }
    await tryItOutBtn.click();
    await tryItOutBtn.waitFor({ state: 'detached' });
  }

  async signInMnemonicKey(secretKey = TEST_ACCOUNT_SECRET_KEY) {
    await this.initiateSignIn();
    await this.enterMnemonicKey(secretKey);
  }
  async enterMnemonicKey(secretKey: string) {
    // NOTE: TEST_ACCOUNT_SECRET_KEY needs to be obtained and set in .env
    if (!secretKey) throw new Error('No key found');
    const key = secretKey.split(' ');
    for (let i = 0; i < key.length; i++) {
      await this.page.getByTestId(`mnemonic-input-${i + 1}`).fill(key[i]);
    }
  }

  /**
   * Use this for tests that just need to be signed in. This will skip the
   * onboarding flow and initialise the wallet in a signed in state for the test
   * account
   */
  async signInWithTestAccount(id: string, stateOverrides: object = {}) {
    const testAccountDerivedKey =
      'd904f412b8d116540017c302f3f7033813c95902af5a067c7befcc34fa5e5290709f157f80548603a1e4f8edc2c0d5d7';

    const isSignedIn = async () => {
      const { encryptionKey } = await this.page.evaluate(() =>
        chrome.storage.session.get(['encryptionKey'])
      );
      const hasSessionKey = encryptionKey === testAccountDerivedKey;
      const hasTokensTab = await this.page.getByTestId(HomePageSelectors.TokensTabBtn).isVisible();
      const hasCollectiblesTab = await this.page
        .getByTestId(HomePageSelectors.CollectiblesTabBtn)
        .isVisible();
      const hasActivityTab = await this.page
        .getByTestId(HomePageSelectors.ActivityTabBtn)
        .isVisible();

      return hasSessionKey && hasTokensTab && hasActivityTab && hasCollectiblesTab;
    };

    const iterationCounter = createCounter();

    do {
      if (iterationCounter.getValue() > 5) throw new Error('Unable to initialize wallet state');

      await this.page.evaluate(
        async walletState => chrome.storage.local.set({ 'persist:root': walletState }),
        { ...getTestSoftwareAccountDefaultWalletState(), ...stateOverrides }
      );

      await this.page.evaluate(
        async encryptionKey => chrome.storage.session.set({ encryptionKey }),
        testAccountDerivedKey
      );

      await this.page.goto(`chrome-extension://${id}/index.html`);
      await delay(1000 * iterationCounter.getValue());

      iterationCounter.increment();
    } while (!(await isSignedIn()));

    await this.page.evaluate(() => window.debug.setHighestAccountIndex(2));

    await this.dismissFeatureIntroducer();
  }

  /**
   * Signs in with a software wallet (2 accounts) and a Ledger wallet (5
   * accounts) already present, skipping onboarding. The encryption key is set
   * so the software wallet's addresses derive, while the Ledger wallet's keys
   * come from stored keychains.
   */
  async signInWithMixedSoftwareAndLedgerWallets(id: string, stateOverrides: object = {}) {
    const testAccountDerivedKey =
      'd904f412b8d116540017c302f3f7033813c95902af5a067c7befcc34fa5e5290709f157f80548603a1e4f8edc2c0d5d7';

    const isSignedIn = async () => {
      const { encryptionKey } = await this.page.evaluate(() =>
        chrome.storage.session.get(['encryptionKey'])
      );
      const hasSessionKey = encryptionKey === testAccountDerivedKey;
      const hasTokensTab = await this.page.getByTestId(HomePageSelectors.TokensTabBtn).isVisible();
      const hasActivityTab = await this.page
        .getByTestId(HomePageSelectors.ActivityTabBtn)
        .isVisible();
      return hasSessionKey && hasTokensTab && hasActivityTab;
    };

    const iterationCounter = createCounter();

    do {
      if (iterationCounter.getValue() > 5) throw new Error('Unable to initialize wallet state');

      await this.page.evaluate(
        async walletState => chrome.storage.local.set({ 'persist:root': walletState }),
        { ...makeMixedSoftwareAndLedgerWalletState(), ...stateOverrides }
      );

      await this.page.evaluate(
        async encryptionKey => chrome.storage.session.set({ encryptionKey }),
        testAccountDerivedKey
      );

      await this.page.goto(`chrome-extension://${id}/index.html`);
      await delay(1000 * iterationCounter.getValue());

      iterationCounter.increment();
    } while (!(await isSignedIn()));

    await this.dismissFeatureIntroducer();
  }

  /**
   * Use this for tests that just need to be signed in. This will skip the
   * onboarding flow and initialise the wallet in a signed in state for the test
   * account
   */
  async signInWithLedgerAccount(id: string, state: object) {
    // @kyranjamie: completely unclear to me why, but after the work in
    // https://github.com/leather-io/extension/pull/6217 I had to add these
    // delays to get Ledger tests to run, otherwise either 1) the popup wouldn't
    // open or 2) the popup would open but it would load the unsigned in state.
    // This behaviour took place before I upgraded the playwright version in
    // that PR.
    await delay(2000);
    await this.page.evaluate(
      async walletState => chrome.storage.local.set({ 'persist:root': walletState }),
      state
    );
    await delay(2000);
    await this.page.goto(`chrome-extension://${id}/index.html`);
    await delay(2000);
    await this.dismissFeatureIntroducer();
  }
}
