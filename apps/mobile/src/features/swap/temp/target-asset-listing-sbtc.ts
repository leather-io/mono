/* eslint-disable */
import { AccountSwapAsset } from '@/features/swap/temp/service';
import BigNumber from 'bignumber.js';

export const targetAssetListingSBTC: AccountSwapAsset[] = [
  {
    asset: {
      chain: 'stacks',
      protocol: 'nativeStx',
      symbol: 'STX',
      category: 'fungible',
      decimals: 6,
      hasMemo: false,
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx',
        assetId: {
          protocol: 'nativeStx',
          id: 'STX',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-stx',
        assetId: {
          protocol: 'nativeStx',
          id: 'STX',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(4084.7598178154162515103),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(4084.7598178154162515103),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(4084.7598178154162515103),
          symbol: 'USD',
          decimals: 2,
        },
        lockedBalance: {
          amount: BigNumber(2623.7566666666664),
          symbol: 'USD',
          decimals: 2,
        },
        unlockedBalance: {
          amount: BigNumber(1461.0031511487498515103),
          symbol: 'USD',
          decimals: 2,
        },
        availableUnlockedBalance: {
          amount: BigNumber(1461.0031511487498515103),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(62273455),
          symbol: 'STX',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'STX',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'STX',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(62273455),
          symbol: 'STX',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(62273455),
          symbol: 'STX',
          decimals: 6,
        },
        lockedBalance: {
          amount: BigNumber(40000000),
          symbol: 'STX',
          decimals: 6,
        },
        unlockedBalance: {
          amount: BigNumber(22273455),
          symbol: 'STX',
          decimals: 6,
        },
        availableUnlockedBalance: {
          amount: BigNumber(22273455),
          symbol: 'STX',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo',
      contractId: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://token-meta.s3.eu-central-1.amazonaws.com/icon.png',
      name: 'Leo',
      symbol: 'LEO',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token',
        assetId: {
          protocol: 'sip10',
          id: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-leo',
        assetId: {
          protocol: 'sip10',
          id: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0.014210788568),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0.014210788568),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0.014210788568),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1006216),
          symbol: 'LEO',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'LEO',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'LEO',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(1006216),
          symbol: 'LEO',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(1006216),
          symbol: 'LEO',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin',
      contractId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://raw.githubusercontent.com/Welshcorgicoin/Welshcorgicoin/main/logos/welsh_tokenlogo.png',
      name: 'Welshcorgicoin',
      symbol: 'WELSH',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
        assetId: {
          protocol: 'sip10',
          id: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-welsh',
        assetId: {
          protocol: 'sip10',
          id: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(137.882228607837),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(137.882228607837),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(137.882228607837),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(7625807677),
          symbol: 'WELSH',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'WELSH',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'WELSH',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(7625807677),
          symbol: 'WELSH',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(7625807677),
          symbol: 'WELSH',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3W69VDG9VTZNG7NTW1QNCC1W45SNY98W1JSZBJH.flat-earth-stxcity::FlatEarth',
      contractId: 'SP3W69VDG9VTZNG7NTW1QNCC1W45SNY98W1JSZBJH.flat-earth-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/BxdQLdfT-IMG-0386.jpeg',
      name: 'Flat Earth',
      symbol: 'FlatEarth',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3W69VDG9VTZNG7NTW1QNCC1W45SNY98W1JSZBJH.flat-earth-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3W69VDG9VTZNG7NTW1QNCC1W45SNY98W1JSZBJH.flat-earth-stxcity::FlatEarth',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stone-bonding-curve::STONE',
      contractId: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stone-bonding-curve',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/12LoFHsDCJTFSqyTGPmp6KKzAsPdTEjS6s/stone-black-square.png',
      name: 'STONE',
      symbol: 'STONE',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stone-bonding-curve',
        assetId: {
          protocol: 'sip10',
          id: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stone-bonding-curve::STONE',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-stone',
        assetId: {
          protocol: 'sip10',
          id: 'SPQ5CEHETP8K4Q2FSNNK9ANMPAVBSA9NN86YSN59.stone-bonding-curve::STONE',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3BRXZ9Y7P5YP28PSR8YJT39RT51ZZBSECTCADGR.skullcoin-stxcity::SKULL',
      contractId: 'SP3BRXZ9Y7P5YP28PSR8YJT39RT51ZZBSECTCADGR.skullcoin-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/CwabtYip-crypto-logo.png',
      name: 'Skullcoin',
      symbol: 'SKULL',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3BRXZ9Y7P5YP28PSR8YJT39RT51ZZBSECTCADGR.skullcoin-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3BRXZ9Y7P5YP28PSR8YJT39RT51ZZBSECTCADGR.skullcoin-stxcity::SKULL',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-skull',
        assetId: {
          protocol: 'sip10',
          id: 'SP3BRXZ9Y7P5YP28PSR8YJT39RT51ZZBSECTCADGR.skullcoin-stxcity::SKULL',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(38000000000),
          symbol: 'SKULL',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'SKULL',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'SKULL',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(38000000000),
          symbol: 'SKULL',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(38000000000),
          symbol: 'SKULL',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2EEV5QBZA454MSMW9W3WJNRXVJF36VPV17FFKYH.DROID::droid',
      contractId: 'SP2EEV5QBZA454MSMW9W3WJNRXVJF36VPV17FFKYH.DROID',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://nakamoto1.space/droid.png',
      name: 'Droid',
      symbol: 'DROID',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2EEV5QBZA454MSMW9W3WJNRXVJF36VPV17FFKYH.DROID',
        assetId: {
          protocol: 'sip10',
          id: 'SP2EEV5QBZA454MSMW9W3WJNRXVJF36VPV17FFKYH.DROID::droid',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-DROID-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2EEV5QBZA454MSMW9W3WJNRXVJF36VPV17FFKYH.DROID::droid',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1PW804599BZ46B4A0FYH86ED26XPJA7SFYNK1XS.play::play',
      contractId: 'SP1PW804599BZ46B4A0FYH86ED26XPJA7SFYNK1XS.play',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://nftstorage.link/ipfs/bafybeichx5wzd3drwp4hai55pvtjbrb422rg6m6kvc6ytvj7sxzxgdual4',
      name: 'Play',
      symbol: 'PLAY',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1PW804599BZ46B4A0FYH86ED26XPJA7SFYNK1XS.play',
        assetId: {
          protocol: 'sip10',
          id: 'SP1PW804599BZ46B4A0FYH86ED26XPJA7SFYNK1XS.play::play',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14J806BWEPQAXVA0G6RYZN7GNA126B7JFRRYTEM.world-peace-stacks-stxcity::WPS',
      contractId: 'SP14J806BWEPQAXVA0G6RYZN7GNA126B7JFRRYTEM.world-peace-stacks-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/VfaKOEwo-WPSWPSWPS.png',
      name: 'World Peace Stacks',
      symbol: 'WPS',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP14J806BWEPQAXVA0G6RYZN7GNA126B7JFRRYTEM.world-peace-stacks-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP14J806BWEPQAXVA0G6RYZN7GNA126B7JFRRYTEM.world-peace-stacks-stxcity::WPS',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token::diko',
      contractId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'Arkadiko Token',
      symbol: 'DIKO',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
        assetId: {
          protocol: 'sip10',
          id: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token::diko',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(2.95280260142),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(2.95280260142),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(2.95280260142),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1614545),
          symbol: 'DIKO',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'DIKO',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'DIKO',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(1614545),
          symbol: 'DIKO',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(1614545),
          symbol: 'DIKO',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPKBV3CZB15CM3CVMCMRX56WRYKDY5P5CTQQXSN0.belgian-malinois::MALi',
      contractId: 'SPKBV3CZB15CM3CVMCMRX56WRYKDY5P5CTQQXSN0.belgian-malinois',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/uOcSFjgx-A18193A9-2264-433B-B673-E7ACCF7D22B6.png',
      name: 'Belgian Malinois',
      symbol: 'MALi',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPKBV3CZB15CM3CVMCMRX56WRYKDY5P5CTQQXSN0.belgian-malinois',
        assetId: {
          protocol: 'sip10',
          id: 'SPKBV3CZB15CM3CVMCMRX56WRYKDY5P5CTQQXSN0.belgian-malinois::MALi',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1T0VY3DNXRVP6HBM75DFWW0199CR0X15PC1D81B.teiko-token-stxcity::Teiko',
      contractId: 'SP1T0VY3DNXRVP6HBM75DFWW0199CR0X15PC1D81B.teiko-token-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/MOyNSqXv-Teiko-Labs-v1.png',
      name: 'Teiko Token',
      symbol: 'Teiko',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1T0VY3DNXRVP6HBM75DFWW0199CR0X15PC1D81B.teiko-token-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP1T0VY3DNXRVP6HBM75DFWW0199CR0X15PC1D81B.teiko-token-stxcity::Teiko',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(7000000),
          symbol: 'Teiko',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'Teiko',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'Teiko',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(7000000),
          symbol: 'Teiko',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(7000000),
          symbol: 'Teiko',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3J9X6APANYNVE9B9ZWB7WJADYHFJH97R6KE2MYG.Pogobtc::Pogo',
      contractId: 'SP3J9X6APANYNVE9B9ZWB7WJADYHFJH97R6KE2MYG.Pogobtc',
      decimals: 5,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'Pogo',
      symbol: 'Pogo',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pogo',
        assetId: {
          protocol: 'sip10',
          id: 'SP3J9X6APANYNVE9B9ZWB7WJADYHFJH97R6KE2MYG.Pogobtc::Pogo',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1QBKVTKP2DG8BGHQQD3KG6EBWWCB6V4X5NXQRYR.eth-thcam-stxcity::THCAM',
      contractId: 'SP1QBKVTKP2DG8BGHQQD3KG6EBWWCB6V4X5NXQRYR.eth-thcam-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/XoBhsiAl-file.png',
      name: 'ETH THCAM',
      symbol: 'THCAM',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-thcam',
        assetId: {
          protocol: 'sip10',
          id: 'SP1QBKVTKP2DG8BGHQQD3KG6EBWWCB6V4X5NXQRYR.eth-thcam-stxcity::THCAM',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: false,
      assetId: 'SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.donald-trump::TREMP',
      contractId: 'SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.donald-trump',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/13Z4eiPp6doBLZyK1yZr6EG8nprSJfVLxQ/3D2D73C3-8069-492B-99A8-4F77E7FCE3B7.png',
      name: 'Doland Tremp',
      symbol: 'TREMP',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-tremp',
        assetId: {
          protocol: 'sip10',
          id: 'SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.donald-trump::TREMP',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPGDF0FAF9MKMPJ36G07QAR09DT4DANRFV98RZNT.dj-vence::VENCE',
      contractId: 'SPGDF0FAF9MKMPJ36G07QAR09DT4DANRFV98RZNT.dj-vence',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SPGDF0FAF9MKMPJ36G07QAR09DT4DANRFV98RZNT.dj-vence/1.png',
      name: 'DJ Vence',
      symbol: 'VENCE',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-vence',
        assetId: {
          protocol: 'sip10',
          id: 'SPGDF0FAF9MKMPJ36G07QAR09DT4DANRFV98RZNT.dj-vence::VENCE',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2WTE5TEWWZYCWWBH0YJP5S553PVBDXVG18ACBHC.MarioWithMoustache::MarioWithMoustache',
      contractId: 'SP2WTE5TEWWZYCWWBH0YJP5S553PVBDXVG18ACBHC.MarioWithMoustache',
      decimals: 2,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'MarioWithMoustache',
      symbol: 'MWM',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mwm',
        assetId: {
          protocol: 'sip10',
          id: 'SP2WTE5TEWWZYCWWBH0YJP5S553PVBDXVG18ACBHC.MarioWithMoustache::MarioWithMoustache',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-DOG::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-DOG',
      decimals: 5,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmZphjHhkWboNsDt5TEMvH96fbdjjNZ69BhG9asJymwpcK',
      name: 'DOG.GO.TO.THE.MOON',
      symbol: 'DOG',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-dog',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-DOG::bridge-token',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(476.3528375211255686298245),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(476.3528375211255686298245),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(476.3528375211255686298245),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(182882243),
          symbol: 'DOG',
          decimals: 5,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'DOG',
          decimals: 5,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'DOG',
          decimals: 5,
        },
        pendingBalance: {
          amount: BigNumber(182882243),
          symbol: 'DOG',
          decimals: 5,
        },
        availableBalance: {
          amount: BigNumber(182882243),
          symbol: 'DOG',
          decimals: 5,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: false,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-POOKA::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-POOKA',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmNpFVcmU6w4RWpU4GRsrazy7nEYJBbaXdDpoe5sJvmyAg',
      name: 'POOKA.CANNOT.BE.STOPPED',
      symbol: 'POOKA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pooka',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-POOKA::bridge-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.deomedia-stxcity::DEOMEDIA',
      contractId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.deomedia-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/db8479e8-8285-43ae-8e10-48ec913f2186.png',
      name: 'Deorganized Media',
      symbol: 'DEOMEDIA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-DEOMEDIA-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.deomedia-stxcity::DEOMEDIA',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.new-hashiko::HSHKO',
      contractId: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.new-hashiko',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://storage.googleapis.com/hashiko/newhashiko/NewHashikoMars.png',
      name: 'New Hashiko',
      symbol: 'HSHKO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-hshko',
        assetId: {
          protocol: 'sip10',
          id: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.new-hashiko::HSHKO',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn::odin',
      contractId: 'SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://token-metadat.s3.eu-central-1.amazonaws.com/logo.png',
      name: 'Odin',
      symbol: 'ODIN',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-odin',
        assetId: {
          protocol: 'sip10',
          id: 'SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn::odin',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2Y8T3TR3FKH3Y2FPZVNQAEKNJXKWVS4RVQF48JE.stakemouse::stakemouse',
      contractId: 'SP2Y8T3TR3FKH3Y2FPZVNQAEKNJXKWVS4RVQF48JE.stakemouse',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://mickey-public.s3.eu-central-1.amazonaws.com/coin.png',
      name: 'Stakemouse',
      symbol: 'MICK',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mick',
        assetId: {
          protocol: 'sip10',
          id: 'SP2Y8T3TR3FKH3Y2FPZVNQAEKNJXKWVS4RVQF48JE.stakemouse::stakemouse',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-PUPS::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-PUPS',
      decimals: 18,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmeBdYKPyvTLYAGK4xqbPbFoC593iSiiB1dC3LahsXu4Jv',
      name: 'PUPS.WORLD.PEACE',
      symbol: 'PUPS',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pups',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-PUPS::bridge-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pBTC::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pBTC',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmNRLwHqua34j76Pkqa6ijC9A8o7sH7L36qD82emvctQhg',
      name: 'Pontis Bitcoin',
      symbol: 'pBTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pbtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pBTC::bridge-token',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(16.770844),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(16.770844),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(16.770844),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(149),
          symbol: 'pBTC',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'pBTC',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'pBTC',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(149),
          symbol: 'pBTC',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(149),
          symbol: 'pBTC',
          decimals: 8,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-ingots::index-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-ingots',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://www.charisma.rocks/indexes/iron-ingots-logo.png',
      name: 'Iron Ingots',
      symbol: 'IRON',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-iron',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-ingots::index-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.agentx-faktory::AGENTX',
      contractId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.agentx-faktory',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/f4fb7315-4f45-4593-a9d3-0e523fa68229.png',
      name: 'Agent Index',
      symbol: 'AGENTX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-AGENTX-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.agentx-faktory::AGENTX',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPBNZD0NMBJVRYJZ3SJ4MTRSZ3FEMGGTV2YM5MFV.moist-sock-bonding-curve::Moist',
      contractId: 'SPBNZD0NMBJVRYJZ3SJ4MTRSZ3FEMGGTV2YM5MFV.moist-sock-bonding-curve',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/RZtFXKCk-MoistSock.jpg',
      name: 'Moist Sock',
      symbol: 'Moist',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-moist',
        assetId: {
          protocol: 'sip10',
          id: 'SPBNZD0NMBJVRYJZ3SJ4MTRSZ3FEMGGTV2YM5MFV.moist-sock-bonding-curve::Moist',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPKMQ8QD26HS1B2E9KXWCDKRF63X0RP8BZ361QTH.moneystack-stxcity::MST',
      contractId: 'SPKMQ8QD26HS1B2E9KXWCDKRF63X0RP8BZ361QTH.moneystack-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/mwKJvZtn-MST.png',
      name: 'MoneyStack',
      symbol: 'MST',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mst',
        assetId: {
          protocol: 'sip10',
          id: 'SPKMQ8QD26HS1B2E9KXWCDKRF63X0RP8BZ361QTH.moneystack-stxcity::MST',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2PGA85MN3D1YVMRJK9WCGQT09Q9EZBCM7C3VNYA.fuck-the-cabal-stxcity::FTC',
      contractId: 'SP2PGA85MN3D1YVMRJK9WCGQT09Q9EZBCM7C3VNYA.fuck-the-cabal-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/YSsFdXMv-bitcoindesigns-a-logo-of-a-crypto-coin-with-a-hand-of-a-rogue-g-7202eda9-cf2f-4313-9853-836cfa3d6305-1-.png',
      name: 'FUCK THE CABAL',
      symbol: 'FTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ftc',
        assetId: {
          protocol: 'sip10',
          id: 'SP2PGA85MN3D1YVMRJK9WCGQT09Q9EZBCM7C3VNYA.fuck-the-cabal-stxcity::FTC',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3PGDSH8P2VJA5RX4BY0GBP867Y4C9955KX97A4V.blitz::Blitz',
      contractId: 'SP3PGDSH8P2VJA5RX4BY0GBP867Y4C9955KX97A4V.blitz',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/MOLZDyUH-Blitzer-logo-2.jpeg',
      name: 'Blitz',
      symbol: 'Blitz',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-blitz',
        assetId: {
          protocol: 'sip10',
          id: 'SP3PGDSH8P2VJA5RX4BY0GBP867Y4C9955KX97A4V.blitz::Blitz',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam::TheFellowshipOfTheMeme',
      contractId: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://stacksrock.com/fam.png',
      name: 'TheFellowshipOfTheMeme',
      symbol: 'FAM',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-fam',
        assetId: {
          protocol: 'sip10',
          id: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam::TheFellowshipOfTheMeme',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pUSDh::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pUSDh',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://assets.hermetica.fi/usdh_logo.svg',
      name: 'Pontis USDh',
      symbol: 'pUSDh',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pusdh',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pUSDh::bridge-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId:
        'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo-v2::liquid-staked-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo-v2',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://charisma.rocks/liquid-staked-roo.png',
      name: 'Liquid Staked Roo v2',
      symbol: 'sROO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-sroo',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo-v2::liquid-staked-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP38GBVK5HEJ0MBH4CRJ9HQEW86HX0H9AP1HZ3SVZ.trevors-beard-bonding-curve::BEARD',
      contractId: 'SP38GBVK5HEJ0MBH4CRJ9HQEW86HX0H9AP1HZ3SVZ.trevors-beard-bonding-curve',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1NS3xZVpANQ8i4ghAcsPfQhrUYmU58offM/Beard.jpeg',
      name: 'Trevors Beard',
      symbol: 'BEARD',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-BEARD-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP38GBVK5HEJ0MBH4CRJ9HQEW86HX0H9AP1HZ3SVZ.trevors-beard-bonding-curve::BEARD',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin::liquid-staked-odin',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://charisma.rocks/liquid-staked-odin.png',
      name: 'Liquid Staked Odin',
      symbol: 'sODIN',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-sodin',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin::liquid-staked-odin',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPRSRMPJX76HQKCRMWDHB41F55P855KHNJ374M5W.aluxlobs::AluxLobs',
      contractId: 'SPRSRMPJX76HQKCRMWDHB41F55P855KHNJ374M5W.aluxlobs',
      decimals: 5,
      hasMemo: true,
      imageCanonicalUri:
        'https://rose-useful-vicuna-13.mypinata.cloud/ipfs/QmW5eYQTYvDpiEB1jHfQdYjaPrpfQLoG3WwGvWUXPevNe9/',
      name: 'AluxLobs',
      symbol: 'ALUX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-alux',
        assetId: {
          protocol: 'sip10',
          id: 'SPRSRMPJX76HQKCRMWDHB41F55P855KHNJ374M5W.aluxlobs::AluxLobs',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC',
      contractId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://allbridge-assets.web.app/320px/ETH/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.svg',
      name: 'Ethereum USDC via Allbridge',
      symbol: 'aeUSDC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-aeusdc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(309.9143886614),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(309.9143886614),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(309.9143886614),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(3100046),
          symbol: 'aeUSDC',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'aeUSDC',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'aeUSDC',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(3100046),
          symbol: 'aeUSDC',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(3100046),
          symbol: 'aeUSDC',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2TT71CXBRDDYP2P8XMVKRFYKRGSMBWCZ6W6FDGT.notastrategy::NASTY',
      contractId: 'SP2TT71CXBRDDYP2P8XMVKRFYKRGSMBWCZ6W6FDGT.notastrategy',
      decimals: 7,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/RkHzFqIs-Nasty-hoddie.png',
      name: 'NotaStrategy',
      symbol: 'NASTY',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-nasty',
        assetId: {
          protocol: 'sip10',
          id: 'SP2TT71CXBRDDYP2P8XMVKRFYKRGSMBWCZ6W6FDGT.notastrategy::NASTY',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: false,
      assetId: 'SP1NSCD02EE377W77JA5RHXF9S6RT6A6CA7K039DH.hawk-thua::SPIT',
      contractId: 'SP1NSCD02EE377W77JA5RHXF9S6RT6A6CA7K039DH.hawk-thua',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1KGbedma7jYAENbnhoL3i9WiYqhnFvkbXc/Screenshot-2024-06-23-2-56-02-PM.png',
      name: 'HAWK THUA',
      symbol: 'SPIT',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-spit',
        assetId: {
          protocol: 'sip10',
          id: 'SP1NSCD02EE377W77JA5RHXF9S6RT6A6CA7K039DH.hawk-thua::SPIT',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId:
        'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2::liquid-staked-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://charisma.rocks/liquid-staked-welshcorgicoin.png',
      name: 'Liquid Staked Welsh v2',
      symbol: 'sWELSH',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-swelsh',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2::liquid-staked-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId:
        'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz::tokensoft-token',
      contractId: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://bafkreifq2bezvmjwfztjt4s3clt7or43kewxtg4ntbqur6axnh5qchkemu.ipfs.nftstorage.link/',
      name: 'Pepe Coin',
      symbol: 'PEPE',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pepe',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz::tokensoft-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence::index-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'Quiet Confidence',
      symbol: 'iQC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-iqc',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence::index-token',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1000000),
          symbol: 'iQC',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'iQC',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'iQC',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(1000000),
          symbol: 'iQC',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(1000000),
          symbol: 'iQC',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP32RXJSH9DX4JGMBSZG0RQS09RG2MHBCGK4H8A7D.clokten::CLOK10',
      contractId: 'SP32RXJSH9DX4JGMBSZG0RQS09RG2MHBCGK4H8A7D.clokten',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP32RXJSH9DX4JGMBSZG0RQS09RG2MHBCGK4H8A7D.clokten/1.png',
      name: 'ClokTen',
      symbol: 'CLOK10',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-clock',
        assetId: {
          protocol: 'sip10',
          id: 'SP32RXJSH9DX4JGMBSZG0RQS09RG2MHBCGK4H8A7D.clokten::CLOK10',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP4M2C88EE8RQZPYTC4PZ88CE16YGP825EYF6KBQ.stacks-rock::rock',
      contractId: 'SP4M2C88EE8RQZPYTC4PZ88CE16YGP825EYF6KBQ.stacks-rock',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://bafybeifpgpxwrtgumuy7d7qlhxynvoixpva4m2toxkcr2jssix5gwqc4rq.ipfs.dweb.link/QmWFjBD56Xp9btmi6K8xNB6Sc5VQ9LRB1xfxfKa44pNvJW',
      name: 'Rock',
      symbol: 'ROCK',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-rock',
        assetId: {
          protocol: 'sip10',
          id: 'SP4M2C88EE8RQZPYTC4PZ88CE16YGP825EYF6KBQ.stacks-rock::rock',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPAAZWD8D1RXQG85HDH9NQ90DV8TGXBXS4XY02J3.vkng-token::viking',
      contractId: 'SPAAZWD8D1RXQG85HDH9NQ90DV8TGXBXS4XY02J3.vkng-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://raw.githubusercontent.com/VIKITOKEN/Vkg/main/viking.png',
      name: 'Viking',
      symbol: 'VIKI',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-viki',
        assetId: {
          protocol: 'sip10',
          id: 'SPAAZWD8D1RXQG85HDH9NQ90DV8TGXBXS4XY02J3.vkng-token::viking',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token::velar',
      contractId: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://raw.githubusercontent.com/velar-be/asset-hosting/main/velar.jpg',
      name: 'Velar',
      symbol: 'VELAR',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-velar',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token::velar',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0.231964440519),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0.231964440519),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0.231964440519),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1341851),
          symbol: 'VELAR',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'VELAR',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'VELAR',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(1341851),
          symbol: 'VELAR',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(1341851),
          symbol: 'VELAR',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2VG7S0R4Z8PYNYCAQ04HCBX1MH75VT11VXCWQ6G.built-on-bitcoin-stxcity::BOB',
      contractId: 'SP2VG7S0R4Z8PYNYCAQ04HCBX1MH75VT11VXCWQ6G.built-on-bitcoin-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/AudBgumL-BOB-Main-Logo.png',
      name: 'Built on Bitcoin',
      symbol: 'BOB',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-bob',
        assetId: {
          protocol: 'sip10',
          id: 'SP2VG7S0R4Z8PYNYCAQ04HCBX1MH75VT11VXCWQ6G.built-on-bitcoin-stxcity::BOB',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(2475188832),
          symbol: 'BOB',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'BOB',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'BOB',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(2475188832),
          symbol: 'BOB',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(2475188832),
          symbol: 'BOB',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi::index-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://charisma.rocks/indexes/charismatic-corgi-logo.png',
      name: 'Charismatic Corgi',
      symbol: 'iCC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-icc',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi::index-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-ROONS::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-ROONS',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'ROOOOOOOOOONS',
      symbol: 'ROONS',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-roons',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-ROONS::bridge-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx::memegoatstx',
      contractId: 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1KdNvLJVWXxnr8JKswBksFAv1y3hMwCYrr/Goat-logo.png',
      name: 'memegoatstx',
      symbol: 'GOATSTX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-goatstx',
        assetId: {
          protocol: 'sip10',
          id: 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx::memegoatstx',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1CYY7BKYD60R08K734K9SC6GRZD4ZSN4WCDE5BD.golf-is-boring::GOLF',
      contractId: 'SP1CYY7BKYD60R08K734K9SC6GRZD4ZSN4WCDE5BD.golf-is-boring',
      decimals: 4,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1C7c3Rj4LRXhFq3CJW7uR3QqanHvhXoTvz/hj.jpg',
      name: 'Golf is Boring',
      symbol: 'GOLF',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-golf',
        assetId: {
          protocol: 'sip10',
          id: 'SP1CYY7BKYD60R08K734K9SC6GRZD4ZSN4WCDE5BD.golf-is-boring::GOLF',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.burndao-faktory::BURNDAO',
      contractId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.burndao-faktory',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/08c661cf-a5f4-421b-8b75-239bfb61ddd0.png',
      name: 'Burn DAO',
      symbol: 'BURNDAO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-BURNDAO-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.burndao-faktory::BURNDAO',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId:
        'SPPK49DG7WR1J5D50GZ4W7DYYWM5MAXSX0ZA9VEJ.FrodoSaylorKeanuPepe10Inu-token-v69::FrodoSaylorKeanuPepe10Inu',
      contractId: 'SPPK49DG7WR1J5D50GZ4W7DYYWM5MAXSX0ZA9VEJ.FrodoSaylorKeanuPepe10Inu-token-v69',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://i.imgur.com/6m5SfwF.jpeg',
      name: 'FrodoSaylorKeanuPepe10Inu',
      symbol: 'ETHEREUM',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ethereum',
        assetId: {
          protocol: 'sip10',
          id: 'SPPK49DG7WR1J5D50GZ4W7DYYWM5MAXSX0ZA9VEJ.FrodoSaylorKeanuPepe10Inu-token-v69::FrodoSaylorKeanuPepe10Inu',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.shark-coin-stxcity::SHARK',
      contractId: 'SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.shark-coin-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/jXcEqlsF-sharkcoin-blacklogo2.JPG',
      name: 'Shark Coin',
      symbol: 'SHARK',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-SHARK-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.shark-coin-stxcity::SHARK',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1N4EXSR8DP5GRN2XCWZEW9PR32JHNRYW7MVPNTA.PomerenianBoo-Pomboo::PomeranianBoo',
      contractId: 'SP1N4EXSR8DP5GRN2XCWZEW9PR32JHNRYW7MVPNTA.PomerenianBoo-Pomboo',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://bafkreicvz5fwc3if522hp2s2rkgisxfdwvazxwyrjponnr6747wd5g5pvy.ipfs.nftstorage.link/',
      name: 'PomeranianBoo',
      symbol: 'POMBOO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pomboo',
        assetId: {
          protocol: 'sip10',
          id: 'SP1N4EXSR8DP5GRN2XCWZEW9PR32JHNRYW7MVPNTA.PomerenianBoo-Pomboo::PomeranianBoo',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1::usdh',
      contractId: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://app.hermetica.fi/assets/usdh_logo.svg',
      name: 'Hermetica USDh',
      symbol: 'USDh',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-usdh',
        assetId: {
          protocol: 'sip10',
          id: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1::usdh',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(63.877546),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(63.877546),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(63.877546),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(63877546),
          symbol: 'USDh',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USDh',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USDh',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(63877546),
          symbol: 'USDh',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(63877546),
          symbol: 'USDh',
          decimals: 8,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP8FRWVKE42DY9XW26SGJ7XPWGVYX9M3FG7KTZNX.Hat::Hat',
      contractId: 'SP8FRWVKE42DY9XW26SGJ7XPWGVYX9M3FG7KTZNX.Hat',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://www.hatonstacks.com/icon.jpg',
      name: 'Hat',
      symbol: 'Hat',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-hat',
        assetId: {
          protocol: 'sip10',
          id: 'SP8FRWVKE42DY9XW26SGJ7XPWGVYX9M3FG7KTZNX.Hat::Hat',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP12JCJYJJ31C59MV94SNFFM4687H9A04Q3BHTAJM.NoCodeClarity-Token::NoCodeClarity-Token',
      contractId: 'SP12JCJYJJ31C59MV94SNFFM4687H9A04Q3BHTAJM.NoCodeClarity-Token',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri: 'ipfs://QmRrx5WSMsqfcoDuAzKgjj1d84s6Ttb6aVifsEfzwDqaBA',
      name: 'NoCodeClarity-Token',
      symbol: 'NOCC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-nocc',
        assetId: {
          protocol: 'sip10',
          id: 'SP12JCJYJJ31C59MV94SNFFM4687H9A04Q3BHTAJM.NoCodeClarity-Token::NoCodeClarity-Token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1::susdh',
      contractId: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://app.hermetica.fi/assets/susdh_logo.svg',
      name: 'Hermetica Staked USDh',
      symbol: 'sUSDh',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-sUSDh-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1::susdh',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(275915436),
          symbol: 'sUSDh',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'sUSDh',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'sUSDh',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(275915436),
          symbol: 'sUSDh',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(275915436),
          symbol: 'sUSDh',
          decimals: 8,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3MTMK7R8GQKYHN3XZGBFS81NSDD1YAZW305H2CS.dogwifknife::KNFE',
      contractId: 'SP3MTMK7R8GQKYHN3XZGBFS81NSDD1YAZW305H2CS.dogwifknife',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://assets.hiro.so/api/mainnet/token-metadata-api/SP3MTMK7R8GQKYHN3XZGBFS81NSDD1YAZW305H2CS.dogwifknife/1.png',
      name: 'DogWifKnife',
      symbol: 'KNFE',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-knfe',
        assetId: {
          protocol: 'sip10',
          id: 'SP3MTMK7R8GQKYHN3XZGBFS81NSDD1YAZW305H2CS.dogwifknife::KNFE',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token::ststx',
      contractId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://app.stackingdao.com/ststx-logo.png',
      name: 'Stacked STX Token',
      symbol: 'stSTX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ststx',
        assetId: {
          protocol: 'sip10',
          id: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token::ststx',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(4043.65986452114245971867),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(4043.65986452114245971867),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(4043.65986452114245971867),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(55971867),
          symbol: 'stSTX',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'stSTX',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'stSTX',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(55971867),
          symbol: 'stSTX',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(55971867),
          symbol: 'stSTX',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve::FAIR',
      contractId: 'SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1M19CV7cuRSEWzdfxAhiq6KSkDqHEqfoJt/fair-logo.JPG',
      name: 'Fair',
      symbol: 'FAIR',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-fair',
        assetId: {
          protocol: 'sip10',
          id: 'SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve::FAIR',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP26PZG61DH667XCX51TZNBHXM4HG4M6B2HWVM47V.edelcoin::EDLC',
      contractId: 'SP26PZG61DH667XCX51TZNBHXM4HG4M6B2HWVM47V.edelcoin',
      decimals: 5,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/aPrNPnww-1551015215-gg.jpg',
      name: 'Edelcoin',
      symbol: 'EDLC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-edlc',
        assetId: {
          protocol: 'sip10',
          id: 'SP26PZG61DH667XCX51TZNBHXM4HG4M6B2HWVM47V.edelcoin::EDLC',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin::longcoin',
      contractId: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://storage.googleapis.com/longcoin/LONGcoin-image.png',
      name: 'LONGcoin',
      symbol: 'LONG',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-long',
        assetId: {
          protocol: 'sip10',
          id: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin::longcoin',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: false,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-BDC::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-BDC',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri: '',
      name: 'BILLION.DOLLAR.CAT',
      symbol: 'BDC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-bdc',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-BDC::bridge-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3MRT36YWK7R0SKFCQ1TDJB3Y3XBAVRFXPYBQ33E.Something-v420::Something',
      contractId: 'SP3MRT36YWK7R0SKFCQ1TDJB3Y3XBAVRFXPYBQ33E.Something-v420',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://github.com/mafakajan/something/blob/main/Stacks_Logo_png(1).png?raw=true',
      name: 'Something',
      symbol: 'SOME',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-some',
        assetId: {
          protocol: 'sip10',
          id: 'SP3MRT36YWK7R0SKFCQ1TDJB3Y3XBAVRFXPYBQ33E.Something-v420::Something',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin::EDMUND',
      contractId: 'SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin',
      decimals: 4,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1NFtGv6a2WSd6YKLhP2KNnJnPQZxMRDMJX/edmund.png',
      name: 'EdmundFitzgeraldCoin',
      symbol: 'EDMUND',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-edmund',
        assetId: {
          protocol: 'sip10',
          id: 'SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin::EDMUND',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2::ststxbtc',
      contractId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://app.stackingdao.com/ststxbtc-logo.png',
      name: 'Stacked STX BTC Token',
      symbol: 'stSTXbtc',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ststxbtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2::ststxbtc',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(60.5816631256),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(60.5816631256),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(60.5816631256),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(933974),
          symbol: 'stSTXbtc',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'stSTXbtc',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'stSTXbtc',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(933974),
          symbol: 'stSTXbtc',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(933974),
          symbol: 'stSTXbtc',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo::kangaroo',
      contractId: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://roo-stx.com/images/55e88819c85e30c0e7cb4df70853adb1.png',
      name: 'Kangaroo the Jumping Coin',
      symbol: '$ROO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-roo',
        assetId: {
          protocol: 'sip10',
          id: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo::kangaroo',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1039221),
          symbol: '$ROO',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: '$ROO',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: '$ROO',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(1039221),
          symbol: '$ROO',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(1039221),
          symbol: '$ROO',
          decimals: 6,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.aiearn-stxcity::AIEARN',
      contractId: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.aiearn-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/78f2822a-a40b-4cae-b0a9-d6a352c118f2.png',
      name: 'AI Earnings',
      symbol: 'AIEARN',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-AIEARN-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.aiearn-stxcity::AIEARN',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.magic-mojo::index-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.magic-mojo',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://www.charisma.rocks/indexes/magic-mojo-logo.png',
      name: 'Magic Mojo',
      symbol: 'iMM',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-imm',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.magic-mojo::index-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: false,
      assetId: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope::NOT',
      contractId: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://ipfs.io/ipfs/bafkreieug75i7f74at6gailpsox52lgs2ct7zccht5nobik3giv4opkeuu',
      name: 'Nothing',
      symbol: 'NOT',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-not',
        assetId: {
          protocol: 'sip10',
          id: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope::NOT',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1225903),
          symbol: 'NOT',
          decimals: 0,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'NOT',
          decimals: 0,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'NOT',
          decimals: 0,
        },
        pendingBalance: {
          amount: BigNumber(1225903),
          symbol: 'NOT',
          decimals: 0,
        },
        availableBalance: {
          amount: BigNumber(1225903),
          symbol: 'NOT',
          decimals: 0,
        },
      },
    },
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: false,
      assetId: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.walter::Walter',
      contractId: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.walter',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1FMBfC5FpvJmjkukJvGYBWNkC7PZcKosxq/AiArtPictures-1721047280374.jpg',
      name: 'Walter',
      symbol: 'Walter',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-walter',
        assetId: {
          protocol: 'sip10',
          id: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.walter::Walter',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma::index-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://www.charisma.rocks/indexes/wrapped-charisma-logo.png',
      name: 'Wrapped Charisma',
      symbol: 'wCHA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wcha',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma::index-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPA0SZQ6KCCYMJV5XVKSNM7Y1DGDXH39A11ZX2Y8.gamestop::GME',
      contractId: 'SPA0SZQ6KCCYMJV5XVKSNM7Y1DGDXH39A11ZX2Y8.gamestop',
      decimals: 4,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1FsssMPzzQceoTWvYM3xpDVkRHuNufd83j/gamestop-logo.png',
      name: 'Gamestop',
      symbol: 'GME',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-gme',
        assetId: {
          protocol: 'sip10',
          id: 'SPA0SZQ6KCCYMJV5XVKSNM7Y1DGDXH39A11ZX2Y8.gamestop::GME',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-SATOSHI::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-SATOSHI',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmQdYxPAACjhGGDePspS2njDvWFWxTZfD2dH4r2usie9PT',
      name: 'SATOSHI.NAKAMOTO',
      symbol: 'SATOSHI',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-satoshi',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-SATOSHI::bridge-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.fakfun-faktory::FAKFUN',
      contractId: 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.fakfun-faktory',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://szigdtxfspmofhxoytra.supabase.co/storage/v1/object/public/token_logo/hhkqdb9w-FF_logoDARK.jpg',
      name: 'faktory fun',
      symbol: 'FAKFUN',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-FAKFUN-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.fakfun-faktory::FAKFUN',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId:
        'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://charisma.rocks/liquid-staked-charisma.png',
      name: 'Liquid Staked Charisma',
      symbol: 'sCHA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-scha',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SPVXNRDM0BF03DD70WZ285925S3A20NC86VYFB9A.duke-stxcity::DUKE',
      contractId: 'SPVXNRDM0BF03DD70WZ285925S3A20NC86VYFB9A.duke-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/LWLxcAYX-n0bq1a.jpg',
      name: 'Duke',
      symbol: 'DUKE',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-DUKE-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SPVXNRDM0BF03DD70WZ285925S3A20NC86VYFB9A.duke-stxcity::DUKE',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.mr-president-pepe::index-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.mr-president-pepe',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://www.charisma.rocks/indexes/presidential-pepe-logo.jpg',
      name: 'President Pepe',
      symbol: 'iPP',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ipp',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.mr-president-pepe::index-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc::bridged-btc',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-abtc',
      name: 'aBTC',
      symbol: 'aBTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-abtc-leg',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc::bridged-btc',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-LIQ::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-LIQ',
      decimals: 2,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmXwL8GVEnrFZJoem7VonkVidEuxoGsiPa3mPNCsM5EwTe',
      name: 'LIQUIDIUM.TOKEN',
      symbol: 'LIQ',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-liq',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-LIQ::bridge-token',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP2HQVTV14DE31XQZE84G0EA2MFQY8G49R7RBAQZ2.theroaringkitty::DFV',
      contractId: 'SP2HQVTV14DE31XQZE84G0EA2MFQY8G49R7RBAQZ2.theroaringkitty',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1E1znJXDfJpHBYCKPoFyapWkwTJF4Ke6YZ/G2w5X4MxQO2jIKEglnMZ4A.webp',
      name: 'TheRoaringKitty',
      symbol: 'DFV',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-dfv',
        assetId: {
          protocol: 'sip10',
          id: 'SP2HQVTV14DE31XQZE84G0EA2MFQY8G49R7RBAQZ2.theroaringkitty::DFV',
        },
      },
    ],
  },
  {
    asset: {
      chain: 'bitcoin',
      protocol: 'nativeBtc',
      symbol: 'BTC',
      category: 'fungible',
      decimals: 8,
      hasMemo: false,
    },
    providerAssets: [
      {
        providerId: 'sbtc-bridge',
        providerAssetId: 'BTC',
        assetId: {
          protocol: 'nativeBtc',
          id: 'BTC',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(90641.00526379555643836),
          symbol: 'USD',
          decimals: 2,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USD',
          decimals: 2,
        },
        pendingBalance: {
          amount: BigNumber(90641.00526379555643836),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(87425.59989736222307371),
          symbol: 'USD',
          decimals: 2,
        },
        protectedBalance: {
          amount: BigNumber(2036.3663576666666865),
          symbol: 'USD',
          decimals: 2,
        },
        uneconomicalBalance: {
          amount: BigNumber(3215.40536643333336465),
          symbol: 'USD',
          decimals: 2,
        },
        unspendableBalance: {
          amount: BigNumber(3215.40536643333336465),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(794524),
          symbol: 'BTC',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'BTC',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'BTC',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(794524),
          symbol: 'BTC',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(766339),
          symbol: 'BTC',
          decimals: 8,
        },
        protectedBalance: {
          amount: BigNumber(17850),
          symbol: 'BTC',
          decimals: 8,
        },
        uneconomicalBalance: {
          amount: BigNumber(28185),
          symbol: 'BTC',
          decimals: 8,
        },
        unspendableBalance: {
          amount: BigNumber(28185),
          symbol: 'BTC',
          decimals: 8,
        },
      },
    },
  },
];
