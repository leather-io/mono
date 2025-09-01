import { NonFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import {
  formatInsciptionName,
  isValidInscription,
  isValidSip9,
  isValidStamp,
} from './collectibles.utils';

const mockCollectible = [
  {
    assetId: 'SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers::stacks-mfers',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers/1547.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers/1547-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers',
    description: 'Just a bunch of mfers on stacks',
    name: 'StacksMFers #1547',
    protocol: 'sip9',
    tokenId: 1547,
  },
  {
    assetId: 'SPJJYJVZ4H7B34GG8D3SSN70WVWDYSHCC9E9ZV4V.bitcoin-toadz::bitcoin-toadz',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPJJYJVZ4H7B34GG8D3SSN70WVWDYSHCC9E9ZV4V.bitcoin-toadz/6408.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPJJYJVZ4H7B34GG8D3SSN70WVWDYSHCC9E9ZV4V.bitcoin-toadz/6408-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SPJJYJVZ4H7B34GG8D3SSN70WVWDYSHCC9E9ZV4V.bitcoin-toadz',
    description:
      'Bitcoin Toadz is a derivative project of CrypToadz built on Stacks, with ownership settled on the Bitcoin blockchain.',
    name: 'Bitcoin Toadz #6408',
    protocol: 'sip9',
    tokenId: 6408,
  },
  {
    assetId: 'SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey::blocksurvey',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey/90.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey/90-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey',
    description: 'Worlds First Software License as an NFT',
    name: 'BlockSurvey #90',
    protocol: 'sip9',
    tokenId: 90,
  },
  {
    assetId: 'SPGGAEQWA7Y9HRZY5T0XJCEYEZ28J6RKCCC1HP9M.worry-nft-music::worry-nft-music',
    cachedImage: '',
    cachedImageThumbnail: '',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SPGGAEQWA7Y9HRZY5T0XJCEYEZ28J6RKCCC1HP9M.worry-nft-music',
    description:
      'Musical NFT Collection Worry is a self-reflective song done by Brythreesixty also known as 3hunnatheartist. Worry is an emotional state of being anxious and troubled over actual or potential problems. The greatest weapon is positivity. Welcome to my Bullish state of Mind. This collection is a gift to the community. Enjoy https://gamma.io/3hunnatheartist.btchttps://gamma.io/brythreesixtyhttps://twitter.com/brythreesixtyhttps://twitter.com/3hunnatheartisthttps://discord.gg/hRqeVRFG',
    name: 'WORRY - NFT - MUSIC',
    protocol: 'sip9',
    tokenId: 75,
  },
  {
    assetId: 'SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2::crashpunks-v2',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2/5559-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: 'Crash Punks',
    contractId: 'SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2',
    description: '',
    name: 'Crash Punk 5559',
    protocol: 'sip9',
    tokenId: 5559,
  },
  {
    assetId:
      'SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series::alex-anniversary-series',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series/1452.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series/1452-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: 'ALEX Anniversary Series',
    contractId: 'SP3N7Y3K01Y24G9JC1XXA13RQXXCY721WAVBMMD38.alex-anniversary-series',
    description: 'From proof-of-concept to bringing Bitcoin value to the multi-chain.',
    name: 'Portals-ALEX-Anniversary-Series',
    protocol: 'sip9',
    tokenId: 1452,
  },
  {
    assetId: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stxstone::stxstone',
    cachedImage: '',
    cachedImageThumbnail: '',
    category: 'nft',
    chain: 'stacks',
    collection: 'STXSTONE',
    contractId: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stxstone',
    description: 'STXSTONE IS A STXMAPS_NFT PROJECT',
    name: '6789',
    protocol: 'sip9',
    tokenId: 6789,
  },
  {
    assetId: 'SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0::stacks-invaders-v0',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0/2784.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0/2784-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: 'Stacks Invaders',
    contractId: 'SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0',
    description: '',
    name: 'Invader Block #157360',
    protocol: 'sip9',
    tokenId: 2784,
  },
  {
    assetId: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stx-fractal-stone::stx-fractal-stone',
    cachedImage: '',
    cachedImageThumbnail: '',
    category: 'nft',
    chain: 'stacks',
    collection: 'STX FRACTAL STONE',
    contractId: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stx-fractal-stone',
    description: 'STX FRACTAL STONE IS A STXMAPS_NFT PROJECT',
    name: '9008',
    protocol: 'sip9',
    tokenId: 9008,
  },
  {
    assetId: 'SP2Y743CNBQ5RW3A323C338HD1DVK04CSBKMECQ1Y.mutant-mojo::mutant-mojo',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2Y743CNBQ5RW3A323C338HD1DVK04CSBKMECQ1Y.mutant-mojo/17.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2Y743CNBQ5RW3A323C338HD1DVK04CSBKMECQ1Y.mutant-mojo/17-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: 'Mutant Mojo',
    contractId: 'SP2Y743CNBQ5RW3A323C338HD1DVK04CSBKMECQ1Y.mutant-mojo',
    description:
      "The first 1k PFP collection for Mojo holders Meet the Mutant Mojo Crew, your favorite orange block just got a serious upgrade. Now they're bolder, braver, and still rocking that unmistakable vibe. These guys are here for the bitcoin die-hards and crypto owners making waves around the world. With even more swag and a relentless drive, each Mutant Mojo is your perfect partner in the crypto revolution. 😈Ready to join?",
    name: 'Mutant Mojo #17',
    protocol: 'sip9',
    tokenId: 17,
  },
  {
    assetId:
      'SP18P831TBGKSGMJEMJM0V29CMKJP650ZT21YJ3XX.werner-dot-btc-s-10000::werner-dot-btc-s-10000',
    cachedImage: '',
    cachedImageThumbnail: '',
    category: 'nft',
    chain: 'stacks',
    collection: "werner.btc's 10000",
    contractId: 'SP18P831TBGKSGMJEMJM0V29CMKJP650ZT21YJ3XX.werner-dot-btc-s-10000',
    description:
      'Song 8: Love Adds Wings (CN) [Verse 1] 星光启思维，创新梦无边界，爱舞在光中。[Chorus] 爱添创意翼扬，共飞跨时间海，心醒在深海。[Verse 2]梦想如泉涌，创造画情深，未来图在展。[Chorus] 爱添创意翼扬，共飞跨时间海，心醒在深海。[Verse 3]情热如火燃，梦爱创光明，世界无尽展。[Chorus]爱添创意翼扬，共飞跨时间海，心醒在深海。[Verse 4]创新引领前路，爱渲染天边际，光芒新世界。[Chorus]爱添创意翼扬，共飞跨时间海，心醒在深海。[Post-chorus]爱添创意翼扬，共飞跨时间海，心醒在深海。',
    name: "Song 8 - werner.btc's 10000 - #483",
    protocol: 'sip9',
    tokenId: 483,
  },
  {
    assetId: 'SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers::stacks-mfers',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers/1547.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers/1547-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SP2N3BAG4GBF8NHRPH6AY4YYH1SP6NK5TGCY7RDFA.stacks-mfers',
    description: 'Just a bunch of mfers on stacks',
    name: 'StacksMFers #1547',
    protocol: 'sip9',
    tokenId: 288,
  },
  {
    assetId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2',
    description: '',
    name: 'thisisrenastest.btc',
    protocol: 'sip9',
    tokenId: 133161,
  },
  {
    assetId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2',
    description: '',
    name: 'thisisrenastest.btc',
    protocol: 'sip9',
    tokenId: 312241,
  },
  {
    assetId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2',
    description: '',
    name: 'thisisrenastest.btc',
    protocol: 'sip9',
    tokenId: 312251,
  },
  {
    assetId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2',
    cachedImage:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161.png',
    cachedImageThumbnail:
      'https://assets.hiro.so/api/mainnet/token-metadata-api/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2/133161-thumb.png',
    category: 'nft',
    chain: 'stacks',
    collection: '',
    contractId: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2',
    description: '',
    name: 'thisisrenastest.btc',
    protocol: 'sip9',
    tokenId: 125721,
  },
];

export function serializeCollectible(collectible: NonFungibleCryptoAsset) {
  console.log('collectible', collectible);
  switch (collectible.protocol) {
    case 'inscription':
      // if (!isValidInscription(collectible)) return null;
      return {
        name: formatInsciptionName(collectible.title),
        type: collectible.protocol,
        src: collectible.src,
        mimeType: collectible.mimeType,
      };
    case 'sip9':
      // if (!isValidSip9(collectible)) return null;
      return {
        name: collectible.name,
        type: collectible.protocol,
        src: collectible.cachedImage,
      };
    case 'stamp':
      if (!isValidStamp(collectible)) return null;
      return {
        name: collectible.stamp.toString(),
        type: collectible.protocol,
        src: collectible.stampUrl,
      };
    default:
      assertUnreachable(collectible);
  }
}
