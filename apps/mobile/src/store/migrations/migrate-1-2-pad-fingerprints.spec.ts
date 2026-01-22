import { describe, expect, test } from 'vitest';

import { migratePadFingerprints } from './migrate-1-2-pad-fingerprints';

const v1State = {
  wallets: {
    ids: ['f25e8', '24682ead'],
    entities: {
      f25e8: {
        type: 'software',
        fingerprint: 'f25e8',
        createdOn: '2026-01-22T10:01:00.999Z',
        name: 'Wallet 1',
      },
      '24682ead': {
        type: 'software',
        fingerprint: '24682ead',
        createdOn: '2026-01-22T10:09:41.199Z',
        name: 'Wallet 2',
      },
    },
  },
  accounts: {
    ids: ['f25e8/0', 'f25e8/1', '24682ead/0', '24682ead/1'],
    entities: {
      'f25e8/0': {
        id: 'f25e8/0',
      },
      'f25e8/1': {
        id: 'f25e8/1',
      },
      '24682ead/0': {
        id: '24682ead/0',
      },
      '24682ead/1': {
        id: '24682ead/1',
      },
    },
  },
  keychains: {
    ids: [
      "f25e8/84'/0'/0'",
      "f25e8/84'/1'/0'",
      "f25e8/86'/0'/0'",
      "f25e8/86'/1'/0'",
      "f25e8/44'/5757'/0'/0/0",
      "f25e8/84'/0'/1'",
      "f25e8/84'/1'/1'",
      "f25e8/86'/0'/1'",
      "f25e8/86'/1'/1'",
      "f25e8/44'/5757'/0'/0/1",
      "24682ead/84'/0'/0'",
      "24682ead/84'/1'/0'",
      "24682ead/86'/0'/0'",
      "24682ead/86'/1'/0'",
      "24682ead/44'/5757'/0'/0/0",
      "24682ead/84'/0'/1'",
      "24682ead/84'/1'/1'",
      "24682ead/86'/0'/1'",
      "24682ead/86'/1'/1'",
      "24682ead/44'/5757'/0'/0/1",
    ],
    entities: {
      "f25e8/84'/0'/0'": {
        descriptor:
          "[f25e8/84'/0'/0']xpub6D6TYd2tdvLaJkuNZUWxEiZswdHGfCcg77RQyP1We8ciMFrBsS2bcUdAs8NazSWkt3LAbJatKLqNcgHzcodcsCYZ8MAQ8SRpz1iLVJZhibj",
        chain: 'bitcoin',
      },
      "f25e8/84'/1'/0'": {
        descriptor:
          "[f25e8/84'/1'/0']xpub6CVWLbT3iigaVWbCXhUt9kkZMgmQpGSfkSZYywRZqLrWfRNWMjQ7qeRrZb4Aaimtkpb4xvoYeME9Rbs51WRHHVVWwkfGZE5KZLYDw7SBeeP",
        chain: 'bitcoin',
      },
      "f25e8/86'/0'/0'": {
        descriptor:
          "[f25e8/86'/0'/0']xpub6CxWWZyvhM5x98GQtZZQbGcgKZjGmWy5cqwHxApjjp8xcGGe9eR25R63BKrKFH1h3wPfs791zXZZdeC8XxmTwJoeiTDSqeFVJmHq7wNb7VK",
        chain: 'bitcoin',
      },
      "f25e8/86'/1'/0'": {
        descriptor:
          "[f25e8/86'/1'/0']xpub6D2Us2EbpZUo3TmfkddRDnoBZw2ehf9E6o9i95pJZzm9veSPgbopNZafgHDEk2UcF6ohHQA279EQHv217JfxAHL868VSWEnRJMuHw7sKtUt",
        chain: 'bitcoin',
      },
      "f25e8/44'/5757'/0'/0/0": {
        descriptor:
          "[f25e8/44'/5757'/0'/0/0]02ffb37e6635be77b666f94204b20149ff91c7bea3502610d22645b8e0f334efc5",
        chain: 'stacks',
      },
      "f25e8/84'/0'/1'": {
        descriptor:
          "[f25e8/84'/0'/1']xpub6D6TYd2tdvLaPGYncHmEfzUz7BGJ2ytKrrbGoveZdmaKX5J5FMuYiSiGCNx728maGivqyqrmSogwLzwLB1vouv49F9HMUEUNcShVHTGyB7g",
        chain: 'bitcoin',
      },
      "f25e8/84'/1'/1'": {
        descriptor:
          "[f25e8/84'/1'/1']xpub6CVWLbT3iigaXnGPVcLsXGQC8TfQ4kNcKrP6zuVecvs996nREJ8tgmoRmFWqPUeCgSEf9Ytm5HXx5oerHFdwKzqHuXtGrds1wfBC3vCZMeo",
        chain: 'bitcoin',
      },
      "f25e8/86'/0'/1'": {
        descriptor:
          "[f25e8/86'/0'/1']xpub6CxWWZyvhM5xA3vvBufWx1FMvr5mNHP2teY9ywP6R8o9AvWEQvw5N2wsvTUKoj2Nh3siXpW9nPgQZYKScSFjt2F9kh3hQtXFsU3FoQebiae",
        chain: 'bitcoin',
      },
      "f25e8/86'/1'/1'": {
        descriptor:
          "[f25e8/86'/1'/1']xpub6D2Us2EbpZUo6bPpUHuB6tTJMr724jZGfYZkZaJs3y61p46sib1igk6qC2t1kN3ffjAYm47auc5nnfjWmofR9U7Nyj5pZtQ2AjoupuhBTxK",
        chain: 'bitcoin',
      },
      "f25e8/44'/5757'/0'/0/1": {
        descriptor:
          "[f25e8/44'/5757'/0'/0/1]026b15fdaf16b01db1eb36314d1bc9edd274ec4bf166123164a62e3715eb42716c",
        chain: 'stacks',
      },
      "24682ead/84'/0'/0'": {
        descriptor:
          "[24682ead/84'/0'/0']xpub6D4nuUzLPukRYKmb6ZYxo5khwLJXHarYQutgauqv8UkAVV8NHw23UZPDoXdJZDqv5hHiyh55jCER2KuYt2a7Egnoj7TF8u7scsJbJPeCneM",
        chain: 'bitcoin',
      },
      "24682ead/84'/1'/0'": {
        descriptor:
          "[24682ead/84'/1'/0']xpub6CqrZidmoeJB1khkcUh81zgdeqy2mLgnAABvpA9HExCMSnBr7qHjJ5ekrPS6emrVGQg7BwSKQ9GWDcv6w5AQo6bn3Vf5oCZ3XAZRXGpbezQ",
        chain: 'bitcoin',
      },
      "24682ead/86'/0'/0'": {
        descriptor:
          "[24682ead/86'/0'/0']xpub6Ch5Go7FQLoXjxbAWAPjkYbzbJDrPnLiJAUWUGQUA8CFMVaDweTSn4p3DmrAR7yKHs6gXZ8VbVFBNTMjpevkSaF8wEnNAXXYoymzoAtWmh6",
        chain: 'bitcoin',
      },
      "24682ead/86'/1'/0'": {
        descriptor:
          "[24682ead/86'/1'/0']xpub6BgaefzDuw4JozeCwk8tkZBo4x2ZNPsqvB5Lryy8WFkruMRX2h9mHJMu6NUfSjo1EjroPSweZdgTU3BvRqH4RzMPUhcwRyisi4eNfTweovR",
        chain: 'bitcoin',
      },
      "24682ead/44'/5757'/0'/0/0": {
        descriptor:
          "[24682ead/44'/5757'/0'/0/0]025b2c58cbf22ad02e1a53041189ace847192834e0664cab4ed1a39676e8a8ddf8",
        chain: 'stacks',
      },
      "24682ead/84'/0'/1'": {
        descriptor:
          "[24682ead/84'/0'/1']xpub6D4nuUzLPukRaXBXWK55p8s7FCZmmXrhHJU7UJFxc9SMyYVFe4TQCYge95zsshNFk2NNxSRKPg1DGAEv5Gbuy5c7XLg1RawjokbTHD5sV3K",
        chain: 'bitcoin',
      },
      "24682ead/84'/1'/1'": {
        descriptor:
          "[24682ead/84'/1'/1']xpub6CqrZidmoeJB3wnjQEkDFn6E2P3B1nwTGezrMqzRgGLHsa83voApMNiskcTAZgB4WbfkqGiZKUNELCB8yK6wDwSXne7GgvwnukmMhBcGznp",
        chain: 'bitcoin',
      },
      "24682ead/86'/0'/1'": {
        descriptor:
          "[24682ead/86'/0'/1']xpub6Ch5Go7FQLoXnqHqnzeBWDmr9ag6Qi1URYqcsyjZMotwDsDu1KB8xgzYgkmkdCKr1fcckKjNkCcp2X4QYMq1Kf5fWBX5GLiPVX2bryWna3M",
        chain: 'bitcoin',
      },
      "24682ead/86'/1'/1'": {
        descriptor:
          "[24682ead/86'/1'/1']xpub6BgaefzDuw4JsLgfxjaZn3CnHnLGeMDfgEbMq14qSa4AoLVvHwE2vrgnGMQo5wdBbecEQTXG9WFxwVirBhq7uHPEuHP7kQpwSpzUnHjr5zZ",
        chain: 'bitcoin',
      },
      "24682ead/44'/5757'/0'/0/1": {
        descriptor:
          "[24682ead/44'/5757'/0'/0/1]02e6d4a2e2c9e822c3ac1890e989d77507bae8fa02cd403bed819716e4ed80997b",
        chain: 'stacks',
      },
    },
  },
  settings: {
    accountDisplayPreference: 'native-segwit',
    analyticsPreference: 'consent-given',
    bitcoinUnitPreference: 'bitcoin',
    createdOn: '2025-10-01T13:19:31.570Z',
    emailAddressPreference: '',
    fiatCurrencyPreference: 'USD',
    networkPreference: 'mainnet',
    privacyModePreference: 'visible',
    hapticsPreference: 'enabled',
    securityLevelPreference: 'secure',
    themePreference: 'dark',
    lastActive: 1759742397999,
    notificationsPreference: 'not-selected',
    languagePreference: 'en',
    languagePreferenceSource: 'system',
    assetVisibility: {},
    currentAccount: {
      fingerprint: 'f25e8',
      accountIndex: 0,
    },
    appIconPreference: 'default',
  },
  apps: {
    ids: ['https://www.granite.world', 'https://www.zestprotocol.com'],
    entities: {
      'https://www.granite.world': {
        screenshot:
          'file:///Users/edgarkhanzadian/Library/Developer/CoreSimulator/Devices/CA9E2A73-6CB1-4F93-8EB8-EC3847198747/data/Containers/Data/Application/CCB52B8B-B871-4079-BBEA-9696690974B4/Documents/www.granite.world_screenshot.jpg',
        name: 'Granite - Leather – Your Bitcoin Wallet for DeFi, NFTs, Ordinals, and dApps',
        origin: 'https://www.granite.world',
        status: 'connected',
        accountId: 'f25e8/0',
      },
      'https://www.zestprotocol.com': {
        screenshot:
          'file:///Users/edgarkhanzadian/Library/Developer/CoreSimulator/Devices/CA9E2A73-6CB1-4F93-8EB8-EC3847198747/data/Containers/Data/Application/CCB52B8B-B871-4079-BBEA-9696690974B4/Documents/www.zestprotocol.com_screenshot.jpg',
        name: 'Zest Protocol - Leather – Your Bitcoin Wallet for DeFi, NFTs, Ordinals, and dApps',
        origin: 'https://www.zestprotocol.com',
        status: 'recently_visited',
      },
    },
  },
  _persist: {
    version: 1,
    rehydrated: true,
  },
};

const v2State = {
  wallets: {
    ids: ['000f25e8', '24682ead'],
    entities: {
      '000f25e8': {
        type: 'software',
        fingerprint: '000f25e8',
        createdOn: '2026-01-22T10:01:00.999Z',
        name: 'Wallet 1',
      },
      '24682ead': {
        type: 'software',
        fingerprint: '24682ead',
        createdOn: '2026-01-22T10:09:41.199Z',
        name: 'Wallet 2',
      },
    },
  },
  accounts: {
    ids: ['000f25e8/0', '000f25e8/1', '24682ead/0', '24682ead/1'],
    entities: {
      '000f25e8/0': {
        id: '000f25e8/0',
      },
      '000f25e8/1': {
        id: '000f25e8/1',
      },
      '24682ead/0': {
        id: '24682ead/0',
      },
      '24682ead/1': {
        id: '24682ead/1',
      },
    },
  },
  keychains: {
    ids: [
      "000f25e8/84'/0'/0'",
      "000f25e8/84'/1'/0'",
      "000f25e8/86'/0'/0'",
      "000f25e8/86'/1'/0'",
      "000f25e8/44'/5757'/0'/0/0",
      "000f25e8/84'/0'/1'",
      "000f25e8/84'/1'/1'",
      "000f25e8/86'/0'/1'",
      "000f25e8/86'/1'/1'",
      "000f25e8/44'/5757'/0'/0/1",
      "24682ead/84'/0'/0'",
      "24682ead/84'/1'/0'",
      "24682ead/86'/0'/0'",
      "24682ead/86'/1'/0'",
      "24682ead/44'/5757'/0'/0/0",
      "24682ead/84'/0'/1'",
      "24682ead/84'/1'/1'",
      "24682ead/86'/0'/1'",
      "24682ead/86'/1'/1'",
      "24682ead/44'/5757'/0'/0/1",
    ],
    entities: {
      "000f25e8/84'/0'/0'": {
        descriptor:
          "[000f25e8/84'/0'/0']xpub6D6TYd2tdvLaJkuNZUWxEiZswdHGfCcg77RQyP1We8ciMFrBsS2bcUdAs8NazSWkt3LAbJatKLqNcgHzcodcsCYZ8MAQ8SRpz1iLVJZhibj",
        chain: 'bitcoin',
      },
      "000f25e8/84'/1'/0'": {
        descriptor:
          "[000f25e8/84'/1'/0']xpub6CVWLbT3iigaVWbCXhUt9kkZMgmQpGSfkSZYywRZqLrWfRNWMjQ7qeRrZb4Aaimtkpb4xvoYeME9Rbs51WRHHVVWwkfGZE5KZLYDw7SBeeP",
        chain: 'bitcoin',
      },
      "000f25e8/86'/0'/0'": {
        descriptor:
          "[000f25e8/86'/0'/0']xpub6CxWWZyvhM5x98GQtZZQbGcgKZjGmWy5cqwHxApjjp8xcGGe9eR25R63BKrKFH1h3wPfs791zXZZdeC8XxmTwJoeiTDSqeFVJmHq7wNb7VK",
        chain: 'bitcoin',
      },
      "000f25e8/86'/1'/0'": {
        descriptor:
          "[000f25e8/86'/1'/0']xpub6D2Us2EbpZUo3TmfkddRDnoBZw2ehf9E6o9i95pJZzm9veSPgbopNZafgHDEk2UcF6ohHQA279EQHv217JfxAHL868VSWEnRJMuHw7sKtUt",
        chain: 'bitcoin',
      },
      "000f25e8/44'/5757'/0'/0/0": {
        descriptor:
          "[000f25e8/44'/5757'/0'/0/0]02ffb37e6635be77b666f94204b20149ff91c7bea3502610d22645b8e0f334efc5",
        chain: 'stacks',
      },
      "000f25e8/84'/0'/1'": {
        descriptor:
          "[000f25e8/84'/0'/1']xpub6D6TYd2tdvLaPGYncHmEfzUz7BGJ2ytKrrbGoveZdmaKX5J5FMuYiSiGCNx728maGivqyqrmSogwLzwLB1vouv49F9HMUEUNcShVHTGyB7g",
        chain: 'bitcoin',
      },
      "000f25e8/84'/1'/1'": {
        descriptor:
          "[000f25e8/84'/1'/1']xpub6CVWLbT3iigaXnGPVcLsXGQC8TfQ4kNcKrP6zuVecvs996nREJ8tgmoRmFWqPUeCgSEf9Ytm5HXx5oerHFdwKzqHuXtGrds1wfBC3vCZMeo",
        chain: 'bitcoin',
      },
      "000f25e8/86'/0'/1'": {
        descriptor:
          "[000f25e8/86'/0'/1']xpub6CxWWZyvhM5xA3vvBufWx1FMvr5mNHP2teY9ywP6R8o9AvWEQvw5N2wsvTUKoj2Nh3siXpW9nPgQZYKScSFjt2F9kh3hQtXFsU3FoQebiae",
        chain: 'bitcoin',
      },
      "000f25e8/86'/1'/1'": {
        descriptor:
          "[000f25e8/86'/1'/1']xpub6D2Us2EbpZUo6bPpUHuB6tTJMr724jZGfYZkZaJs3y61p46sib1igk6qC2t1kN3ffjAYm47auc5nnfjWmofR9U7Nyj5pZtQ2AjoupuhBTxK",
        chain: 'bitcoin',
      },
      "000f25e8/44'/5757'/0'/0/1": {
        descriptor:
          "[000f25e8/44'/5757'/0'/0/1]026b15fdaf16b01db1eb36314d1bc9edd274ec4bf166123164a62e3715eb42716c",
        chain: 'stacks',
      },
      "24682ead/84'/0'/0'": {
        descriptor:
          "[24682ead/84'/0'/0']xpub6D4nuUzLPukRYKmb6ZYxo5khwLJXHarYQutgauqv8UkAVV8NHw23UZPDoXdJZDqv5hHiyh55jCER2KuYt2a7Egnoj7TF8u7scsJbJPeCneM",
        chain: 'bitcoin',
      },
      "24682ead/84'/1'/0'": {
        descriptor:
          "[24682ead/84'/1'/0']xpub6CqrZidmoeJB1khkcUh81zgdeqy2mLgnAABvpA9HExCMSnBr7qHjJ5ekrPS6emrVGQg7BwSKQ9GWDcv6w5AQo6bn3Vf5oCZ3XAZRXGpbezQ",
        chain: 'bitcoin',
      },
      "24682ead/86'/0'/0'": {
        descriptor:
          "[24682ead/86'/0'/0']xpub6Ch5Go7FQLoXjxbAWAPjkYbzbJDrPnLiJAUWUGQUA8CFMVaDweTSn4p3DmrAR7yKHs6gXZ8VbVFBNTMjpevkSaF8wEnNAXXYoymzoAtWmh6",
        chain: 'bitcoin',
      },
      "24682ead/86'/1'/0'": {
        descriptor:
          "[24682ead/86'/1'/0']xpub6BgaefzDuw4JozeCwk8tkZBo4x2ZNPsqvB5Lryy8WFkruMRX2h9mHJMu6NUfSjo1EjroPSweZdgTU3BvRqH4RzMPUhcwRyisi4eNfTweovR",
        chain: 'bitcoin',
      },
      "24682ead/44'/5757'/0'/0/0": {
        descriptor:
          "[24682ead/44'/5757'/0'/0/0]025b2c58cbf22ad02e1a53041189ace847192834e0664cab4ed1a39676e8a8ddf8",
        chain: 'stacks',
      },
      "24682ead/84'/0'/1'": {
        descriptor:
          "[24682ead/84'/0'/1']xpub6D4nuUzLPukRaXBXWK55p8s7FCZmmXrhHJU7UJFxc9SMyYVFe4TQCYge95zsshNFk2NNxSRKPg1DGAEv5Gbuy5c7XLg1RawjokbTHD5sV3K",
        chain: 'bitcoin',
      },
      "24682ead/84'/1'/1'": {
        descriptor:
          "[24682ead/84'/1'/1']xpub6CqrZidmoeJB3wnjQEkDFn6E2P3B1nwTGezrMqzRgGLHsa83voApMNiskcTAZgB4WbfkqGiZKUNELCB8yK6wDwSXne7GgvwnukmMhBcGznp",
        chain: 'bitcoin',
      },
      "24682ead/86'/0'/1'": {
        descriptor:
          "[24682ead/86'/0'/1']xpub6Ch5Go7FQLoXnqHqnzeBWDmr9ag6Qi1URYqcsyjZMotwDsDu1KB8xgzYgkmkdCKr1fcckKjNkCcp2X4QYMq1Kf5fWBX5GLiPVX2bryWna3M",
        chain: 'bitcoin',
      },
      "24682ead/86'/1'/1'": {
        descriptor:
          "[24682ead/86'/1'/1']xpub6BgaefzDuw4JsLgfxjaZn3CnHnLGeMDfgEbMq14qSa4AoLVvHwE2vrgnGMQo5wdBbecEQTXG9WFxwVirBhq7uHPEuHP7kQpwSpzUnHjr5zZ",
        chain: 'bitcoin',
      },
      "24682ead/44'/5757'/0'/0/1": {
        descriptor:
          "[24682ead/44'/5757'/0'/0/1]02e6d4a2e2c9e822c3ac1890e989d77507bae8fa02cd403bed819716e4ed80997b",
        chain: 'stacks',
      },
    },
  },
  settings: {
    accountDisplayPreference: 'native-segwit',
    analyticsPreference: 'consent-given',
    bitcoinUnitPreference: 'bitcoin',
    createdOn: '2025-10-01T13:19:31.570Z',
    emailAddressPreference: '',
    fiatCurrencyPreference: 'USD',
    networkPreference: 'mainnet',
    privacyModePreference: 'visible',
    hapticsPreference: 'enabled',
    securityLevelPreference: 'secure',
    themePreference: 'dark',
    lastActive: 1759742397999,
    notificationsPreference: 'not-selected',
    languagePreference: 'en',
    languagePreferenceSource: 'system',
    assetVisibility: {},
    currentAccount: {
      fingerprint: '000f25e8',
      accountIndex: 0,
    },
    appIconPreference: 'default',
  },
  apps: {
    ids: ['https://www.granite.world', 'https://www.zestprotocol.com'],
    entities: {
      'https://www.granite.world': {
        screenshot:
          'file:///Users/edgarkhanzadian/Library/Developer/CoreSimulator/Devices/CA9E2A73-6CB1-4F93-8EB8-EC3847198747/data/Containers/Data/Application/CCB52B8B-B871-4079-BBEA-9696690974B4/Documents/www.granite.world_screenshot.jpg',
        name: 'Granite - Leather – Your Bitcoin Wallet for DeFi, NFTs, Ordinals, and dApps',
        origin: 'https://www.granite.world',
        status: 'connected',
        accountId: '000f25e8/0',
      },
      'https://www.zestprotocol.com': {
        screenshot:
          'file:///Users/edgarkhanzadian/Library/Developer/CoreSimulator/Devices/CA9E2A73-6CB1-4F93-8EB8-EC3847198747/data/Containers/Data/Application/CCB52B8B-B871-4079-BBEA-9696690974B4/Documents/www.zestprotocol.com_screenshot.jpg',
        name: 'Zest Protocol - Leather – Your Bitcoin Wallet for DeFi, NFTs, Ordinals, and dApps',
        origin: 'https://www.zestprotocol.com',
        status: 'recently_visited',
      },
    },
  },
  _persist: {
    version: 1,
    rehydrated: true,
  },
};
describe(migratePadFingerprints.name, () => {
  test('function migrates the whole v1state to v2state correctly', () => {
    expect(migratePadFingerprints(v1State)).toEqual(v2State);
  });
});
