import {
  InscriptionCryptoAssetInfo,
  NonFungibleCryptoAssetInfo,
  Sip9CryptoAssetInfo,
} from '@leather.io/models';

const mockInscriptions: InscriptionCryptoAssetInfo[] = [
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
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/335209b72c452f52199ae09e8ce586a451ce452c73326f01f958d8aa8417e062i0',
    chain: 'bitcoin',
    protocol: 'inscription',
    category: 'nft',
  },
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
    src: 'https://ordinals.com/preview/a494e48bf7120c959239e8c544bc821ca4fb5a46e5fff79938943d434f252949i0',
    chain: 'bitcoin',
    protocol: 'inscription',
    category: 'nft',
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
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/cd27e71f955e021dd0840aa0544067fc92c3608009f2191a405f9f4910712b78i0',
    chain: 'bitcoin',
    protocol: 'inscription',
    category: 'nft',
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
    src: 'https://ordinals.com/preview/e59434da4436cbdcdcf6b7b31fb734d43b304e981a2e3b69092bd6ca83108009i1286',
    chain: 'bitcoin',
    protocol: 'inscription',
    category: 'nft',
  },
];

const mockSip9s: Sip9CryptoAssetInfo[] = [
  {
    name: 'BlockSurvey #90',
    description: 'Worlds First Software License as an NFT',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey/90.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey/90-thumb.png',
    chain: 'stacks',
    protocol: 'sip9',
    assetId: '90',
    contractId: 'SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey',
    tokenId: 0,
    collection: '',
    category: 'nft',
  },
  {
    name: 'Portals-ALEX-Anniversary-Series',
    description: 'From proof-of-concept to bringing Bitcoin value to the multi-chain.\n',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series/1452.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series/1452-thumb.png',
    chain: 'stacks',
    protocol: 'sip9',
    assetId: '1452',
    contractId: 'SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series',
    tokenId: 1452,
    collection: 'ALEX Anniversary Series',
    category: 'nft',
  },
  {
    name: 'Crash Punk 5559',
    description: '',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559-thumb.png',
    chain: 'stacks',
    protocol: 'sip9',
    assetId: '5559',
    contractId: 'SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2',
    tokenId: 0,
    collection: '',
    category: 'nft',
  },
];

export const mockCollectibles: NonFungibleCryptoAssetInfo[] = [...mockInscriptions, ...mockSip9s];
