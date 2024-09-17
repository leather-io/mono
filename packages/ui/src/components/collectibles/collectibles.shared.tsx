/* eslint-disable */

export interface Ordinal {
  id: string;
  number: number;
  output: string;
  txid: string;
  offset: string;
  address: string;
  preview: string;
  title: string;
  genesisBlockHeight: number;
  genesisBlockHash: string;
  genesisTimestamp: number;
  value: string;
  mimeType: string;
  name: string;
  src: string;
}

const mockOrdinals: Ordinal[] = [
  {
    id: 'a494e48bf7120c959239e8c544bc821ca4fb5a46e5fff79938943d434f252949i0',
    number: 74703951,
    output: '0',
    txid: 'a494e48bf7120c959239e8c544bc821ca4fb5a46e5fff79938943d434f252949',
    offset: '0',
    address: 'bc1pwz9n62p9dhjpqcpdmfcrewdnz3nk8jcved242vd2lj9fgvtvwnwscvdyre',
    preview:
      'https://ordinals.hiro.so/inscription/a494e48bf7120c959239e8c544bc821ca4fb5a46e5fff79938943d434f252949i0',
    title: 'Inscription 74703951',
    genesisBlockHeight: 857719,
    genesisBlockHash: '00000000000000000002bc6789fc6742da4958d003d3abff740687a863613a46',
    genesisTimestamp: 1724219117,
    value: '546',
    mimeType: 'html',
    name: 'inscription',
    src: 'https://ordinals.com/preview/a494e48bf7120c959239e8c544bc821ca4fb5a46e5fff79938943d434f252949i0',
  },
  {
    id: '335209b72c452f52199ae09e8ce586a451ce452c73326f01f958d8aa8417e062i0',
    number: 73858867,
    output: '0',
    txid: '335209b72c452f52199ae09e8ce586a451ce452c73326f01f958d8aa8417e062',
    offset: '0',
    address: 'bc1pwz9n62p9dhjpqcpdmfcrewdnz3nk8jcved242vd2lj9fgvtvwnwscvdyre',
    preview:
      'https://ordinals.hiro.so/inscription/335209b72c452f52199ae09e8ce586a451ce452c73326f01f958d8aa8417e062i0',
    title: 'Inscription 73858867',
    genesisBlockHeight: 855754,
    genesisBlockHash: '000000000000000000021972c2000a8d347dbac1a2540112fadf81219b188796',
    genesisTimestamp: 1723027746,
    value: '546',
    mimeType: 'text',
    name: 'inscription',
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/335209b72c452f52199ae09e8ce586a451ce452c73326f01f958d8aa8417e062i0',
  },
  {
    id: 'cd27e71f955e021dd0840aa0544067fc92c3608009f2191a405f9f4910712b78i0',
    number: 55549412,
    output: '0',
    txid: 'cd27e71f955e021dd0840aa0544067fc92c3608009f2191a405f9f4910712b78',
    offset: '0',
    address: 'bc1pwz9n62p9dhjpqcpdmfcrewdnz3nk8jcved242vd2lj9fgvtvwnwscvdyre',
    preview:
      'https://ordinals.hiro.so/inscription/cd27e71f955e021dd0840aa0544067fc92c3608009f2191a405f9f4910712b78i0',
    title: 'Inscription 55549412',
    genesisBlockHeight: 825933,
    genesisBlockHash: '00000000000000000002f95317315f9d00b2299eb3499b0f499a707506ad6735',
    genesisTimestamp: 1705356588,
    value: '600',
    mimeType: 'image',
    name: 'inscription',
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/cd27e71f955e021dd0840aa0544067fc92c3608009f2191a405f9f4910712b78i0',
  },
  {
    id: 'e59434da4436cbdcdcf6b7b31fb734d43b304e981a2e3b69092bd6ca83108009i1286',
    number: 64484111,
    output: '1287',
    txid: 'e59434da4436cbdcdcf6b7b31fb734d43b304e981a2e3b69092bd6ca83108009',
    offset: '0',
    address: 'bc1pwz9n62p9dhjpqcpdmfcrewdnz3nk8jcved242vd2lj9fgvtvwnwscvdyre',
    preview:
      'https://ordinals.hiro.so/inscription/e59434da4436cbdcdcf6b7b31fb734d43b304e981a2e3b69092bd6ca83108009i1286',
    title: 'Inscription 64484111',
    genesisBlockHeight: 834795,
    genesisBlockHash: '00000000000000000000a3f2c9b0459df8eda99abca3c83f0e94a2a224badaba',
    genesisTimestamp: 1710504509,
    value: '546',
    mimeType: 'gltf',
    name: 'inscription',
    src: 'https://ordinals.com/preview/e59434da4436cbdcdcf6b7b31fb734d43b304e981a2e3b69092bd6ca83108009i1286',
  },
];

export interface StacksNft {
  token_uri: string;
  metadata: {
    sip: number;
    name: string;
    description: string;
    image: string;
    cached_image: string;
    cached_thumbnail_image: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
      display_type?: string;
    }>;
    properties?: {
      collection?: string;
      collectionId?: string;
      [key: string]: any;
    };
  };
}

const mockStacksNfts: StacksNft[] = [
  {
    token_uri: 'ipfs://ipfs/QmQ63rXC9F7GyLYoYNyqxeiYvbBUvmHmL36PrfYNxpw5sT/90.json',
    metadata: {
      sip: 16,
      name: 'BlockSurvey #90',
      description: 'Worlds First Software License as an NFT',
      image: 'ipfs://QmZXkLMrN2ejpzGv1wk4HgcuL6XbyLVieW3Zm9wyAoDk18/90.png',
      cached_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey/90.png',
      cached_thumbnail_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey/90-thumb.png',
      attributes: [
        {
          trait_type: 'NightBackground',
          value: 'MidnightMoss',
          display_type: '',
        },
        {
          trait_type: 'NightLogo',
          value: 'AtomicTangerine',
          display_type: '',
        },
        {
          trait_type: 'SignatureWhite',
          value: 'SignatureWhite',
          display_type: '',
        },
      ],
    },
  },
  {
    token_uri: 'ipfs://ipfs/QmWRQyaVxUjHGjBUoZqGcNjL37VN99jcFwmoB1wZnpjJEg/',
    metadata: {
      sip: 16,
      name: 'Portals-ALEX-Anniversary-Series',
      description: 'From proof-of-concept to bringing Bitcoin value to the multi-chain.\n',
      image: 'ipfs://ipfs/QmUgHdbTy5LYi4wijf9YJgGs89SCAKNbXascvzuFgAsMB9',
      cached_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series/1452.png',
      cached_thumbnail_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series/1452-thumb.png',
      properties: {
        collection: 'ALEX Anniversary Series',
      },
    },
  },
  {
    token_uri: 'ipfs://QmYTX3u58v2Ero2drdtqhL6rPE5qnv51EJZ6WSu3LKqUBN/crashpunks-5559.json',
    metadata: {
      sip: 16,
      name: 'Crash Punk 5559',
      description: '',
      image: 'ipfs://Qmb84UcaMr1MUwNbYBnXWHM3kEaDcYrKuPWwyRLVTNKELC/5559.png',
      cached_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559.png',
      cached_thumbnail_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559-thumb.png',
      attributes: [
        {
          trait_type: 'Background',
          value: 'Blue',
          display_type: 'string',
        },
        {
          trait_type: 'Outfit Back',
          value: 'Stacks Hoodie Back',
          display_type: 'string',
        },
        {
          trait_type: 'Neck',
          value: 'Neck Metal',
          display_type: 'string',
        },
        {
          trait_type: 'Outfit Front',
          value: 'Stacks Hoodie',
          display_type: 'string',
        },
        {
          trait_type: 'Head',
          value: 'Head Tan',
          display_type: 'string',
        },
        {
          trait_type: 'Piercings',
          value: 'Piercings',
          display_type: 'string',
        },
        {
          trait_type: 'Mouth',
          value: 'Lips Bare',
          display_type: 'string',
        },
        {
          trait_type: 'Eyes',
          value: 'RoboEyes Blue',
          display_type: 'string',
        },
        {
          trait_type: 'Hair',
          value: 'Bob Silver',
          display_type: 'string',
        },
      ],
      properties: {
        collection: 'Crash Punks',
        collectionId: 'grace.btc/crash_punks',
        dna: '5c2f54662bb494b5e4ebc195070d9ce624c5a849',
        total_supply: '9216',
        external_url:
          'https://thisisnumberone.com/nfts/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559',
      },
    },
  },
  {
    token_uri: 'ipfs://ipfs/QmZYoSr94MKdarScJZSsyBYxBgMJchUQqqbtLxxxR86wZN/',
    metadata: {
      sip: 16,
      name: 'WORRY - NFT - MUSIC',
      description:
        'Musical NFT Collection \nWorry is a self-reflective song done by Brythreesixty also known as 3hunnatheartist. Worry is an emotional state of being anxious and troubled over actual or potential problems. The greatest weapon is positivity. Welcome to my Bullish state of Mind. This collection is a gift to the community. Enjoy \n\nhttps://gamma.io/3hunnatheartist.btc\nhttps://gamma.io/brythreesixty\n\nhttps://twitter.com/brythreesixty\nhttps://twitter.com/3hunnatheartist\n\nhttps://discord.gg/hRqeVRFG',
      image: '',
      cached_image: '',
      cached_thumbnail_image: '',
    },
  },
  {
    token_uri: 'ipfs://QmbMdASbHZb5XHizZJsFPL9hdmuDgekUHH9Ya1DnuSxfHj/1547.json',
    metadata: {
      sip: 16,
      name: 'StacksMFers #1547',
      description: 'Just a bunch of mfers on stacks',
      image: 'ipfs://QmUL7yELAmF1wnbqt6yaNLmCVbBa7BSbSNXYKijpku2r45/1547.png',
      cached_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers/1547.png',
      cached_thumbnail_image:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers/1547-thumb.png',
      attributes: [
        {
          trait_type: 'BG',
          value: 'Pixels',
          display_type: '',
        },
        {
          trait_type: 'Type',
          value: 'Plain',
          display_type: '',
        },
        {
          trait_type: 'Eyes',
          value: 'Greenglasses',
          display_type: '',
        },
        {
          trait_type: 'Mouth',
          value: 'Smile',
          display_type: '',
        },
        {
          trait_type: 'Beard',
          value: 'None',
          display_type: '',
        },
        {
          trait_type: 'Shirt',
          value: 'GreenHoodie',
          display_type: '',
        },
        {
          trait_type: 'Accessory',
          value: 'None',
          display_type: '',
        },
        {
          trait_type: 'LongHair',
          value: 'LongBlue',
          display_type: '',
        },
        {
          trait_type: 'Hat under',
          value: 'RedBandana',
          display_type: '',
        },
        {
          trait_type: 'Headphones',
          value: 'Red',
          display_type: '',
        },
        {
          trait_type: 'Smoke',
          value: 'None',
          display_type: '',
        },
      ],
    },
  },
];

export type Collectible = Ordinal | StacksNft;

export const mockCollectibles: (Ordinal | StacksNft)[] = [...mockOrdinals, ...mockStacksNfts];
