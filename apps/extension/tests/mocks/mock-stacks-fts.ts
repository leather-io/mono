import type { BrowserContext, Page } from '@playwright/test';

const mockedLongFtMetadata = {
  name: 'LONGcoin',
  symbol: 'LONG',
  decimals: 6,
  total_supply: '888888888888888888',
  token_uri: 'https://storage.googleapis.com/longcoin/LONGcoin-metadata.json',
  description:
    "$LONG will bring prosperity and BDE, Big Dragon Energy, to the Stacks blockchain. It's the first and most auspicious memecoin of the year of the dragon!",
  image_uri:
    'https://assets.hiro.so/api/mainnet/token-metadata-api/SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin/1.png',
  image_thumbnail_uri:
    'https://assets.hiro.so/api/mainnet/token-metadata-api/SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin/1-thumb.png',
  image_canonical_uri: 'https://storage.googleapis.com/longcoin/LONGcoin-image.png',
  tx_id: '0x170498fd9b2762242b833a92c87adb12dea471bb0dfa4584462af7e05ac85ce2',
  sender_address: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3',
  metadata: {
    sip: 16,
    name: 'LONGcoin',
    description:
      "$LONG will bring prosperity and BDE, Big Dragon Energy, to the Stacks blockchain. It's the first and most auspicious memecoin of the year of the dragon!",
    image: 'https://storage.googleapis.com/longcoin/LONGcoin-image.png',
    cached_image:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin/1.png',
    cached_thumbnail_image:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin/1-thumb.png',
  },
};

const mockedLeoFtMetadata = {
  name: 'LEO',
  symbol: 'LEO',
  decimals: 6,
};

export async function mockMainnetTestAccountStacksFTsRequest(page: Page | BrowserContext) {
  await page.route(`**/api.hiro.so/metadata/v1/ft/**`, route =>
    route.fulfill({
      json: {},
    })
  );

  // Mock one supported FT token metadata request
  await page.route(
    'https://api.hiro.so/metadata/v1/ft/SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin',
    route =>
      route.fulfill({
        json: mockedLongFtMetadata,
      })
  );

  await page.route(
    'https://api.hiro.so/metadata/v1/ft/SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token',
    route =>
      route.fulfill({
        json: mockedLeoFtMetadata,
      })
  );
}
