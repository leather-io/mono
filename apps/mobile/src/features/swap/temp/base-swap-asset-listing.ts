/* eslint-disable */
import { AccountSwapAsset } from '@/features/swap/temp/service';
import { BigNumber } from 'bignumber.js';

export const baseAssetListing: AccountSwapAsset[] = [
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
          amount: BigNumber(4087.15319426925),
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
          amount: BigNumber(4087.15319426925),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(4087.15319426925),
          symbol: 'USD',
          decimals: 2,
        },
        lockedBalance: {
          amount: BigNumber(2625.294),
          symbol: 'USD',
          decimals: 2,
        },
        unlockedBalance: {
          amount: BigNumber(1461.85919426925),
          symbol: 'USD',
          decimals: 2,
        },
        availableUnlockedBalance: {
          amount: BigNumber(1461.85919426925),
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin',
        assetId: {
          protocol: 'sip10',
          id: 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin::longcoin',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3MRT36YWK7R0SKFCQ1TDJB3Y3XBAVRFXPYBQ33E.Something-v420',
        assetId: {
          protocol: 'sip10',
          id: 'SP3MRT36YWK7R0SKFCQ1TDJB3Y3XBAVRFXPYBQ33E.Something-v420::Something',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz::tokensoft-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP4M2C88EE8RQZPYTC4PZ88CE16YGP825EYF6KBQ.stacks-rock',
        assetId: {
          protocol: 'sip10',
          id: 'SP4M2C88EE8RQZPYTC4PZ88CE16YGP825EYF6KBQ.stacks-rock::rock',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2Y8T3TR3FKH3Y2FPZVNQAEKNJXKWVS4RVQF48JE.stakemouse',
        assetId: {
          protocol: 'sip10',
          id: 'SP2Y8T3TR3FKH3Y2FPZVNQAEKNJXKWVS4RVQF48JE.stakemouse::stakemouse',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token',
        assetId: {
          protocol: 'sip10',
          id: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token::ststx',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
        assetId: {
          protocol: 'sip10',
          id: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo::kangaroo',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc::bridged-btc',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token::velar',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn',
        assetId: {
          protocol: 'sip10',
          id: 'SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn::odin',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2::liquid-staked-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin::liquid-staked-odin',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo-v2',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo-v2::liquid-staked-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP8FRWVKE42DY9XW26SGJ7XPWGVYX9M3FG7KTZNX.Hat',
        assetId: {
          protocol: 'sip10',
          id: 'SP8FRWVKE42DY9XW26SGJ7XPWGVYX9M3FG7KTZNX.Hat::Hat',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP1N4EXSR8DP5GRN2XCWZEW9PR32JHNRYW7MVPNTA.PomerenianBoo-Pomboo',
        assetId: {
          protocol: 'sip10',
          id: 'SP1N4EXSR8DP5GRN2XCWZEW9PR32JHNRYW7MVPNTA.PomerenianBoo-Pomboo::PomeranianBoo',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope',
        assetId: {
          protocol: 'sip10',
          id: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope::NOT',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx',
        assetId: {
          protocol: 'sip10',
          id: 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx::memegoatstx',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SPRSRMPJX76HQKCRMWDHB41F55P855KHNJ374M5W.aluxlobs',
        assetId: {
          protocol: 'sip10',
          id: 'SPRSRMPJX76HQKCRMWDHB41F55P855KHNJ374M5W.aluxlobs::AluxLobs',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2WTE5TEWWZYCWWBH0YJP5S553PVBDXVG18ACBHC.MarioWithMoustache',
        assetId: {
          protocol: 'sip10',
          id: 'SP2WTE5TEWWZYCWWBH0YJP5S553PVBDXVG18ACBHC.MarioWithMoustache::MarioWithMoustache',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId:
          'SPPK49DG7WR1J5D50GZ4W7DYYWM5MAXSX0ZA9VEJ.FrodoSaylorKeanuPepe10Inu-token-v69',
        assetId: {
          protocol: 'sip10',
          id: 'SPPK49DG7WR1J5D50GZ4W7DYYWM5MAXSX0ZA9VEJ.FrodoSaylorKeanuPepe10Inu-token-v69::FrodoSaylorKeanuPepe10Inu',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP12JCJYJJ31C59MV94SNFFM4687H9A04Q3BHTAJM.NoCodeClarity-Token',
        assetId: {
          protocol: 'sip10',
          id: 'SP12JCJYJJ31C59MV94SNFFM4687H9A04Q3BHTAJM.NoCodeClarity-Token::NoCodeClarity-Token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3MTMK7R8GQKYHN3XZGBFS81NSDD1YAZW305H2CS.dogwifknife',
        assetId: {
          protocol: 'sip10',
          id: 'SP3MTMK7R8GQKYHN3XZGBFS81NSDD1YAZW305H2CS.dogwifknife::KNFE',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3J9X6APANYNVE9B9ZWB7WJADYHFJH97R6KE2MYG.Pogobtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3J9X6APANYNVE9B9ZWB7WJADYHFJH97R6KE2MYG.Pogobtc::Pogo',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.donald-trump',
        assetId: {
          protocol: 'sip10',
          id: 'SP3TMGZ7WTT658PA632A3BA4B1GRXBNNEN8XPZQ5X.donald-trump::TREMP',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP1CYY7BKYD60R08K734K9SC6GRZD4ZSN4WCDE5BD.golf-is-boring',
        assetId: {
          protocol: 'sip10',
          id: 'SP1CYY7BKYD60R08K734K9SC6GRZD4ZSN4WCDE5BD.golf-is-boring::GOLF',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2HQVTV14DE31XQZE84G0EA2MFQY8G49R7RBAQZ2.theroaringkitty',
        assetId: {
          protocol: 'sip10',
          id: 'SP2HQVTV14DE31XQZE84G0EA2MFQY8G49R7RBAQZ2.theroaringkitty::DFV',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3PGDSH8P2VJA5RX4BY0GBP867Y4C9955KX97A4V.blitz',
        assetId: {
          protocol: 'sip10',
          id: 'SP3PGDSH8P2VJA5RX4BY0GBP867Y4C9955KX97A4V.blitz::Blitz',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP1NSCD02EE377W77JA5RHXF9S6RT6A6CA7K039DH.hawk-thua',
        assetId: {
          protocol: 'sip10',
          id: 'SP1NSCD02EE377W77JA5RHXF9S6RT6A6CA7K039DH.hawk-thua::SPIT',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence::index-token',
        },
      },
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
          decimals: 0,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'iQC',
          decimals: 0,
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma::index-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SPAAZWD8D1RXQG85HDH9NQ90DV8TGXBXS4XY02J3.vkng-token',
        assetId: {
          protocol: 'sip10',
          id: 'SPAAZWD8D1RXQG85HDH9NQ90DV8TGXBXS4XY02J3.vkng-token::viking',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charismatic-corgi::index-token',
        },
      },
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
      assetId: 'SP3R4MHK99JAAM0N3T0CBZRZVSVQFG1N75DQ08JSD.sbtc::sbtc',
      contractId: 'SP3R4MHK99JAAM0N3T0CBZRZVSVQFG1N75DQ08JSD.sbtc',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/Qmc67nU3ANzq1bGLssAEGSoy51Kx6VCoyRR1jyUT72E5jg',
      name: 'sbtc',
      symbol: 'sbtc',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3R4MHK99JAAM0N3T0CBZRZVSVQFG1N75DQ08JSD.sbtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3R4MHK99JAAM0N3T0CBZRZVSVQFG1N75DQ08JSD.sbtc::sbtc',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.magic-mojo',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.magic-mojo::index-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin',
        assetId: {
          protocol: 'sip10',
          id: 'SP1MJPVQ6ZE408ZW4JM6HET50S8GYTYRZ7PC6RKH7.edmundfitzgeraldcoin::EDMUND',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.new-hashiko',
        assetId: {
          protocol: 'sip10',
          id: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.new-hashiko::HSHKO',
        },
      },
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
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples::index-token',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://www.charisma.rocks/stations/fuji-apples.png',
      name: 'Fuji Apples',
      symbol: 'FUJI',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples::index-token',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-ingots',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.iron-ingots::index-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SPA0SZQ6KCCYMJV5XVKSNM7Y1DGDXH39A11ZX2Y8.gamestop',
        assetId: {
          protocol: 'sip10',
          id: 'SPA0SZQ6KCCYMJV5XVKSNM7Y1DGDXH39A11ZX2Y8.gamestop::GME',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam',
        assetId: {
          protocol: 'sip10',
          id: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.fam::TheFellowshipOfTheMeme',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP32RXJSH9DX4JGMBSZG0RQS09RG2MHBCGK4H8A7D.clokten',
        assetId: {
          protocol: 'sip10',
          id: 'SP32RXJSH9DX4JGMBSZG0RQS09RG2MHBCGK4H8A7D.clokten::CLOK10',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve',
        assetId: {
          protocol: 'sip10',
          id: 'SP253J64EGMH59TV32CQXXTVKH5TQVGN108TA5TND.fair-bonding-curve::FAIR',
        },
      },
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
      assetId: 'SP3QJ0MM9G8M3DSF5NEX7CEJ99NFDQ81WG17T7RMC.tenmetsu::TEN',
      contractId: 'SP3QJ0MM9G8M3DSF5NEX7CEJ99NFDQ81WG17T7RMC.tenmetsu',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1J5gdJKirX5wzXivYzUbNCWytHsaDL5hJ7/pixelcut-export-2-.png',
      name: 'Tenmetsu',
      symbol: 'TEN',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3QJ0MM9G8M3DSF5NEX7CEJ99NFDQ81WG17T7RMC.tenmetsu',
        assetId: {
          protocol: 'sip10',
          id: 'SP3QJ0MM9G8M3DSF5NEX7CEJ99NFDQ81WG17T7RMC.tenmetsu::TEN',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SPGDF0FAF9MKMPJ36G07QAR09DT4DANRFV98RZNT.dj-vence',
        assetId: {
          protocol: 'sip10',
          id: 'SPGDF0FAF9MKMPJ36G07QAR09DT4DANRFV98RZNT.dj-vence::VENCE',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.mr-president-pepe',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.mr-president-pepe::index-token',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP26PZG61DH667XCX51TZNBHXM4HG4M6B2HWVM47V.edelcoin',
        assetId: {
          protocol: 'sip10',
          id: 'SP26PZG61DH667XCX51TZNBHXM4HG4M6B2HWVM47V.edelcoin::EDLC',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2PGA85MN3D1YVMRJK9WCGQT09Q9EZBCM7C3VNYA.fuck-the-cabal-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2PGA85MN3D1YVMRJK9WCGQT09Q9EZBCM7C3VNYA.fuck-the-cabal-stxcity::FTC',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.walter',
        assetId: {
          protocol: 'sip10',
          id: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.walter::Walter',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SPBNZD0NMBJVRYJZ3SJ4MTRSZ3FEMGGTV2YM5MFV.moist-sock-bonding-curve',
        assetId: {
          protocol: 'sip10',
          id: 'SPBNZD0NMBJVRYJZ3SJ4MTRSZ3FEMGGTV2YM5MFV.moist-sock-bonding-curve::Moist',
        },
      },
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
      assetId: 'SP2VGJQAB0T7R2Y9S2PJRNPDEW91CM2YCDYJGGPQS.mooneeb::mooneeb',
      contractId: 'SP2VGJQAB0T7R2Y9S2PJRNPDEW91CM2YCDYJGGPQS.mooneeb',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pink-added-stork-978.mypinata.cloud/ipfs/QmdMTQKYVHsK1USakRkDjKcJ9DnCfsyGm3cSQqkzJ4c9Yu',
      name: 'Mooneeb',
      symbol: 'MOON',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2VGJQAB0T7R2Y9S2PJRNPDEW91CM2YCDYJGGPQS.mooneeb',
        assetId: {
          protocol: 'sip10',
          id: 'SP2VGJQAB0T7R2Y9S2PJRNPDEW91CM2YCDYJGGPQS.mooneeb::mooneeb',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mooneeb',
        assetId: {
          protocol: 'sip10',
          id: 'SP2VGJQAB0T7R2Y9S2PJRNPDEW91CM2YCDYJGGPQS.mooneeb::mooneeb',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SPKMQ8QD26HS1B2E9KXWCDKRF63X0RP8BZ361QTH.moneystack-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPKMQ8QD26HS1B2E9KXWCDKRF63X0RP8BZ361QTH.moneystack-stxcity::MST',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP1QBKVTKP2DG8BGHQQD3KG6EBWWCB6V4X5NXQRYR.eth-thcam-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP1QBKVTKP2DG8BGHQQD3KG6EBWWCB6V4X5NXQRYR.eth-thcam-stxcity::THCAM',
        },
      },
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
        providerId: 'velar-sdk',
        providerAssetId: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1',
        assetId: {
          protocol: 'sip10',
          id: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1::usdh',
        },
      },
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
      assetId: 'SP345FTTDC4VT580K18ER0MP5PR1ZRP5C3Q0KYA1P.booster-bonding-curve::BOOSTER',
      contractId: 'SP345FTTDC4VT580K18ER0MP5PR1ZRP5C3Q0KYA1P.booster-bonding-curve',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1JE8tA8g9jafC16FBG822Hwqf6dxVVNvJg/BOOSTER-logo1-800.jpg',
      name: 'BOOSTER',
      symbol: 'BOOSTER',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP345FTTDC4VT580K18ER0MP5PR1ZRP5C3Q0KYA1P.booster-bonding-curve',
        assetId: {
          protocol: 'sip10',
          id: 'SP345FTTDC4VT580K18ER0MP5PR1ZRP5C3Q0KYA1P.booster-bonding-curve::BOOSTER',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-booster',
        assetId: {
          protocol: 'sip10',
          id: 'SP345FTTDC4VT580K18ER0MP5PR1ZRP5C3Q0KYA1P.booster-bonding-curve::BOOSTER',
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
      assetId: 'SP1HPB7YTZDXMZSZD51C113PQFAXKSNR0QYFFPWVC.blewy-stxcity::BLEWY',
      contractId: 'SP1HPB7YTZDXMZSZD51C113PQFAXKSNR0QYFFPWVC.blewy-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/xQWhhLfr-IMG-1888.jpeg',
      name: 'Blewy',
      symbol: 'BLEWY',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1HPB7YTZDXMZSZD51C113PQFAXKSNR0QYFFPWVC.blewy-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP1HPB7YTZDXMZSZD51C113PQFAXKSNR0QYFFPWVC.blewy-stxcity::BLEWY',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-blewy',
        assetId: {
          protocol: 'sip10',
          id: 'SP1HPB7YTZDXMZSZD51C113PQFAXKSNR0QYFFPWVC.blewy-stxcity::BLEWY',
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
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-flatearth',
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
      assetId: 'SP739VRRCMXY223XPR28BWEBTJMA0B27DY8GTKCH.gyatt-bonding-curve::GYAT',
      contractId: 'SP739VRRCMXY223XPR28BWEBTJMA0B27DY8GTKCH.gyatt-bonding-curve',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1MCT5aQ6QAPoNhU6RQhh3TW51278xLraqu/gyatcat.jpg',
      name: 'GYATT',
      symbol: 'GYAT',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP739VRRCMXY223XPR28BWEBTJMA0B27DY8GTKCH.gyatt-bonding-curve',
        assetId: {
          protocol: 'sip10',
          id: 'SP739VRRCMXY223XPR28BWEBTJMA0B27DY8GTKCH.gyatt-bonding-curve::GYAT',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-gyat',
        assetId: {
          protocol: 'sip10',
          id: 'SP739VRRCMXY223XPR28BWEBTJMA0B27DY8GTKCH.gyatt-bonding-curve::GYAT',
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
      assetId: 'SP116BXQNYGH2SDF64Z68CRPKVTK93KWTVXTA2DYD.moon-landing-stxcity::HOAX',
      contractId: 'SP116BXQNYGH2SDF64Z68CRPKVTK93KWTVXTA2DYD.moon-landing-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/HObfvRrY-qTDZs8Vp.jpeg',
      name: 'Moon Landing',
      symbol: 'HOAX',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP116BXQNYGH2SDF64Z68CRPKVTK93KWTVXTA2DYD.moon-landing-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP116BXQNYGH2SDF64Z68CRPKVTK93KWTVXTA2DYD.moon-landing-stxcity::HOAX',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-hoax',
        assetId: {
          protocol: 'sip10',
          id: 'SP116BXQNYGH2SDF64Z68CRPKVTK93KWTVXTA2DYD.moon-landing-stxcity::HOAX',
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
      assetId: 'SP10VQCN71BZ0CXVKH7DF2H1MEQNKG9C49R9AHGKB.bao-stxcity::BAO',
      contractId: 'SP10VQCN71BZ0CXVKH7DF2H1MEQNKG9C49R9AHGKB.bao-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/RPKCfTDH-BAO.png',
      name: 'BAO',
      symbol: 'BAO',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP10VQCN71BZ0CXVKH7DF2H1MEQNKG9C49R9AHGKB.bao-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP10VQCN71BZ0CXVKH7DF2H1MEQNKG9C49R9AHGKB.bao-stxcity::BAO',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-bao',
        assetId: {
          protocol: 'sip10',
          id: 'SP10VQCN71BZ0CXVKH7DF2H1MEQNKG9C49R9AHGKB.bao-stxcity::BAO',
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
      assetId: 'SP2ECF9BD90CXW96XYT032MG6BQ2N6TRQ47V0D90R.september-11-stxcity::TRUTH',
      contractId: 'SP2ECF9BD90CXW96XYT032MG6BQ2N6TRQ47V0D90R.september-11-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/RTwPLrXB-truth.webp',
      name: 'September 11',
      symbol: 'TRUTH',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ECF9BD90CXW96XYT032MG6BQ2N6TRQ47V0D90R.september-11-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ECF9BD90CXW96XYT032MG6BQ2N6TRQ47V0D90R.september-11-stxcity::TRUTH',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-truth',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ECF9BD90CXW96XYT032MG6BQ2N6TRQ47V0D90R.september-11-stxcity::TRUTH',
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
      assetId: 'SP1NPDHF9CQ8B9Q045CCQS1MR9M9SGJ5TT6WFFCD2.honey-badger-stxcity::DGAF',
      contractId: 'SP1NPDHF9CQ8B9Q045CCQS1MR9M9SGJ5TT6WFFCD2.honey-badger-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/XlNYtjWJ-IMG-4351.jpeg',
      name: 'Honey Badger',
      symbol: 'DGAF',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1NPDHF9CQ8B9Q045CCQS1MR9M9SGJ5TT6WFFCD2.honey-badger-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP1NPDHF9CQ8B9Q045CCQS1MR9M9SGJ5TT6WFFCD2.honey-badger-stxcity::DGAF',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-dgaf',
        assetId: {
          protocol: 'sip10',
          id: 'SP1NPDHF9CQ8B9Q045CCQS1MR9M9SGJ5TT6WFFCD2.honey-badger-stxcity::DGAF',
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
      assetId: 'SP25K3XPVBNWXPMYDXBPSZHGC8APW0Z21CWJ3Y3B1.wen-nakamoto-stxcity::WEN',
      contractId: 'SP25K3XPVBNWXPMYDXBPSZHGC8APW0Z21CWJ3Y3B1.wen-nakamoto-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/XLiJBFYK-wen-logo.png',
      name: 'WEN NAKAMOTO',
      symbol: 'WEN',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP25K3XPVBNWXPMYDXBPSZHGC8APW0Z21CWJ3Y3B1.wen-nakamoto-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP25K3XPVBNWXPMYDXBPSZHGC8APW0Z21CWJ3Y3B1.wen-nakamoto-stxcity::WEN',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wennaka',
        assetId: {
          protocol: 'sip10',
          id: 'SP25K3XPVBNWXPMYDXBPSZHGC8APW0Z21CWJ3Y3B1.wen-nakamoto-stxcity::WEN',
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
      assetId: 'SP2Z2CBMGWB9MQZAF5Z8X56KS69XRV3SJF4WKJ7J9.dry-sock-stxcity::FRESH',
      contractId: 'SP2Z2CBMGWB9MQZAF5Z8X56KS69XRV3SJF4WKJ7J9.dry-sock-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/FZnTERSC-kb7SLKVY.jpg',
      name: 'Dry Sock',
      symbol: 'FRESH',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2Z2CBMGWB9MQZAF5Z8X56KS69XRV3SJF4WKJ7J9.dry-sock-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2Z2CBMGWB9MQZAF5Z8X56KS69XRV3SJF4WKJ7J9.dry-sock-stxcity::FRESH',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-fresh',
        assetId: {
          protocol: 'sip10',
          id: 'SP2Z2CBMGWB9MQZAF5Z8X56KS69XRV3SJF4WKJ7J9.dry-sock-stxcity::FRESH',
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
      assetId: 'SP371690BDHK9WRH3KXXRWNK62YR8N1P5JSYGQKRM.clive-stxcity::Clive',
      contractId: 'SP371690BDHK9WRH3KXXRWNK62YR8N1P5JSYGQKRM.clive-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/wsWgwIRJ-HEIF-.jpeg',
      name: 'Clive',
      symbol: 'Clive',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP371690BDHK9WRH3KXXRWNK62YR8N1P5JSYGQKRM.clive-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP371690BDHK9WRH3KXXRWNK62YR8N1P5JSYGQKRM.clive-stxcity::Clive',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-clive',
        assetId: {
          protocol: 'sip10',
          id: 'SP371690BDHK9WRH3KXXRWNK62YR8N1P5JSYGQKRM.clive-stxcity::Clive',
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
      assetId: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.riseofthememefam::RMFAM',
      contractId: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.riseofthememefam',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/DVQfDArB-RMFAM8.png',
      name: 'RiseOfTheMemeFam',
      symbol: 'RMFAM',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.riseofthememefam',
        assetId: {
          protocol: 'sip10',
          id: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.riseofthememefam::RMFAM',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-rmfam',
        assetId: {
          protocol: 'sip10',
          id: 'SP3SMQNVWRBVWC81SRJYFV4X1ZQ7AWWJFBQJMC724.riseofthememefam::RMFAM',
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
      assetId: 'SP3J2H949KF8N4EPXKB42ZQT4EFGJFEW36DX20J1D.jackaroo-stxcity::KANGA',
      contractId: 'SP3J2H949KF8N4EPXKB42ZQT4EFGJFEW36DX20J1D.jackaroo-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/TGYTMIIg-photo-6102786732912134717-y.jpg',
      name: 'JACKAROO',
      symbol: 'KANGA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3J2H949KF8N4EPXKB42ZQT4EFGJFEW36DX20J1D.jackaroo-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3J2H949KF8N4EPXKB42ZQT4EFGJFEW36DX20J1D.jackaroo-stxcity::KANGA',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-kanga',
        assetId: {
          protocol: 'sip10',
          id: 'SP3J2H949KF8N4EPXKB42ZQT4EFGJFEW36DX20J1D.jackaroo-stxcity::KANGA',
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
      assetId: 'SP253CHXESX9W66MCSN4JM2XZJBFG9NPHJE6J5JFX.dokwondesk-stxcity::KWON',
      contractId: 'SP253CHXESX9W66MCSN4JM2XZJBFG9NPHJE6J5JFX.dokwondesk-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/ulaIZkGA-kwon.jpg',
      name: 'dokwondesk',
      symbol: 'KWON',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP253CHXESX9W66MCSN4JM2XZJBFG9NPHJE6J5JFX.dokwondesk-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP253CHXESX9W66MCSN4JM2XZJBFG9NPHJE6J5JFX.dokwondesk-stxcity::KWON',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-kwon',
        assetId: {
          protocol: 'sip10',
          id: 'SP253CHXESX9W66MCSN4JM2XZJBFG9NPHJE6J5JFX.dokwondesk-stxcity::KWON',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-dokwon',
        assetId: {
          protocol: 'sip10',
          id: 'SP253CHXESX9W66MCSN4JM2XZJBFG9NPHJE6J5JFX.dokwondesk-stxcity::KWON',
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
      assetId: 'SP3A4VHJM691GGAC8QHNHPCX3KGJ7DZYE6GN6882D.mateo-stxcity::MATEO',
      contractId: 'SP3A4VHJM691GGAC8QHNHPCX3KGJ7DZYE6GN6882D.mateo-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/kXwUwGOk-mateo-pfp.png',
      name: 'MATEO',
      symbol: 'MATEO',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3A4VHJM691GGAC8QHNHPCX3KGJ7DZYE6GN6882D.mateo-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3A4VHJM691GGAC8QHNHPCX3KGJ7DZYE6GN6882D.mateo-stxcity::MATEO',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mateo',
        assetId: {
          protocol: 'sip10',
          id: 'SP3A4VHJM691GGAC8QHNHPCX3KGJ7DZYE6GN6882D.mateo-stxcity::MATEO',
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
      assetId: 'SP134ACD749QYM1J4ZTWMJ43MZH38BJB33D24DQB8.tychu-onasch-stxcity::TYCHU',
      contractId: 'SP134ACD749QYM1J4ZTWMJ43MZH38BJB33D24DQB8.tychu-onasch-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/pmaVaBbn-tychu-logo.PNG',
      name: 'Tychu Onasch',
      symbol: 'TYCHU',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP134ACD749QYM1J4ZTWMJ43MZH38BJB33D24DQB8.tychu-onasch-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP134ACD749QYM1J4ZTWMJ43MZH38BJB33D24DQB8.tychu-onasch-stxcity::TYCHU',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-tychu',
        assetId: {
          protocol: 'sip10',
          id: 'SP134ACD749QYM1J4ZTWMJ43MZH38BJB33D24DQB8.tychu-onasch-stxcity::TYCHU',
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
      assetId: 'SP2JCF3ME5QC779DQ2X1CM9S62VNJF44GC23MKQXK.less-bonding-curve::LESS',
      contractId: 'SP2JCF3ME5QC779DQ2X1CM9S62VNJF44GC23MKQXK.less-bonding-curve',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1FqPFBRapmCH3YpPYuChPq2BEB572DpTKE/less.jpg',
      name: 'LESS',
      symbol: 'LESS',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2JCF3ME5QC779DQ2X1CM9S62VNJF44GC23MKQXK.less-bonding-curve',
        assetId: {
          protocol: 'sip10',
          id: 'SP2JCF3ME5QC779DQ2X1CM9S62VNJF44GC23MKQXK.less-bonding-curve::LESS',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-less',
        assetId: {
          protocol: 'sip10',
          id: 'SP2JCF3ME5QC779DQ2X1CM9S62VNJF44GC23MKQXK.less-bonding-curve::LESS',
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
      assetId: 'SPXW8BXG2S88SX7C1CJ3BVFEGR51SFGRF8DMYC93.pnuts-freedom-farm-stxcity::PNUT',
      contractId: 'SPXW8BXG2S88SX7C1CJ3BVFEGR51SFGRF8DMYC93.pnuts-freedom-farm-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/XwAXNhUL-PNUT.avif',
      name: 'PNuts Freedom Farm',
      symbol: 'PNUT',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPXW8BXG2S88SX7C1CJ3BVFEGR51SFGRF8DMYC93.pnuts-freedom-farm-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPXW8BXG2S88SX7C1CJ3BVFEGR51SFGRF8DMYC93.pnuts-freedom-farm-stxcity::PNUT',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pnut',
        assetId: {
          protocol: 'sip10',
          id: 'SPXW8BXG2S88SX7C1CJ3BVFEGR51SFGRF8DMYC93.pnuts-freedom-farm-stxcity::PNUT',
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
      assetId: 'SP1K8Y1JDM3MX9HNBS4MGYERRZSADVMZWASAPHPK3.simulation-coin-stxcity::SIM',
      contractId: 'SP1K8Y1JDM3MX9HNBS4MGYERRZSADVMZWASAPHPK3.simulation-coin-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/BRtApnEI-SIM-COIN-LOGO-No-background.png',
      name: 'Simulation Coin',
      symbol: 'SIM',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1K8Y1JDM3MX9HNBS4MGYERRZSADVMZWASAPHPK3.simulation-coin-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP1K8Y1JDM3MX9HNBS4MGYERRZSADVMZWASAPHPK3.simulation-coin-stxcity::SIM',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-sim',
        assetId: {
          protocol: 'sip10',
          id: 'SP1K8Y1JDM3MX9HNBS4MGYERRZSADVMZWASAPHPK3.simulation-coin-stxcity::SIM',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-simulation',
        assetId: {
          protocol: 'sip10',
          id: 'SP1K8Y1JDM3MX9HNBS4MGYERRZSADVMZWASAPHPK3.simulation-coin-stxcity::SIM',
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
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wps',
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
      assetId: 'SPN7GYFCEVW1HR6CVFW3JGWSW57P1JZCZ3KSQTPT.turtoshi-stxcity::TURTO',
      contractId: 'SPN7GYFCEVW1HR6CVFW3JGWSW57P1JZCZ3KSQTPT.turtoshi-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/wAJrggwd-TURTO.jpg',
      name: 'Turtoshi',
      symbol: 'TURTO',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPN7GYFCEVW1HR6CVFW3JGWSW57P1JZCZ3KSQTPT.turtoshi-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPN7GYFCEVW1HR6CVFW3JGWSW57P1JZCZ3KSQTPT.turtoshi-stxcity::TURTO',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-turto',
        assetId: {
          protocol: 'sip10',
          id: 'SPN7GYFCEVW1HR6CVFW3JGWSW57P1JZCZ3KSQTPT.turtoshi-stxcity::TURTO',
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
      assetId: 'SP2ZHZRWAGZE2QJKTXYJ2QWKVM3BZ5HC2KC90HN1W.saylor-stxcity::SAYLOR',
      contractId: 'SP2ZHZRWAGZE2QJKTXYJ2QWKVM3BZ5HC2KC90HN1W.saylor-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/yMBwMCcg-coin-logo-crop512.png',
      name: 'SAYLOR',
      symbol: 'SAYLOR',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2ZHZRWAGZE2QJKTXYJ2QWKVM3BZ5HC2KC90HN1W.saylor-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZHZRWAGZE2QJKTXYJ2QWKVM3BZ5HC2KC90HN1W.saylor-stxcity::SAYLOR',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-saylor',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZHZRWAGZE2QJKTXYJ2QWKVM3BZ5HC2KC90HN1W.saylor-stxcity::SAYLOR',
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
      assetId: 'SPFGX4MZ770DA3RE6S5PVQ176QZ3P7VWAG3CKJ0Y.godl-on-stacks-stxcity::Godl',
      contractId: 'SPFGX4MZ770DA3RE6S5PVQ176QZ3P7VWAG3CKJ0Y.godl-on-stacks-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/ilRbfTXo-IMG-20241114-WA0099.jpg',
      name: 'Godl on stacks',
      symbol: 'Godl',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPFGX4MZ770DA3RE6S5PVQ176QZ3P7VWAG3CKJ0Y.godl-on-stacks-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPFGX4MZ770DA3RE6S5PVQ176QZ3P7VWAG3CKJ0Y.godl-on-stacks-stxcity::Godl',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-godl',
        assetId: {
          protocol: 'sip10',
          id: 'SPFGX4MZ770DA3RE6S5PVQ176QZ3P7VWAG3CKJ0Y.godl-on-stacks-stxcity::Godl',
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
      assetId: 'SP1MASMF30DRR4KDR5TG4RZEEVHBKS1ZX4TJZ8P06.mrbeans-stxcity::Beans',
      contractId: 'SP1MASMF30DRR4KDR5TG4RZEEVHBKS1ZX4TJZ8P06.mrbeans-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/IxnESYuq-400-x-400.png',
      name: 'MrBeans',
      symbol: 'Beans',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1MASMF30DRR4KDR5TG4RZEEVHBKS1ZX4TJZ8P06.mrbeans-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP1MASMF30DRR4KDR5TG4RZEEVHBKS1ZX4TJZ8P06.mrbeans-stxcity::Beans',
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
        'SP2VRZTFWH3D3459PMKE2G6JNJN9PEC0QFY1P64AN.free-ross-the-freedom-coin-stxcity::ROSSTX',
      contractId: 'SP2VRZTFWH3D3459PMKE2G6JNJN9PEC0QFY1P64AN.free-ross-the-freedom-coin-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/ccOIlGqE-ROSS.jpg',
      name: 'Free Ross The Freedom Coin',
      symbol: 'ROSSTX',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId:
          'SP2VRZTFWH3D3459PMKE2G6JNJN9PEC0QFY1P64AN.free-ross-the-freedom-coin-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2VRZTFWH3D3459PMKE2G6JNJN9PEC0QFY1P64AN.free-ross-the-freedom-coin-stxcity::ROSSTX',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-rosstx',
        assetId: {
          protocol: 'sip10',
          id: 'SP2VRZTFWH3D3459PMKE2G6JNJN9PEC0QFY1P64AN.free-ross-the-freedom-coin-stxcity::ROSSTX',
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
      assetId: 'SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity::MEME',
      contractId: 'SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/PxxUGCcj-f03c194bd4d181b.png',
      name: 'MEME',
      symbol: 'MEME',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity::MEME',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-memestx',
        assetId: {
          protocol: 'sip10',
          id: 'SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity::MEME',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-ROONS',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-ROONS::bridge-token',
        },
      },
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
      assetId: 'SP3ACD3WC1XTVJ0J3T3532TN4NFABRKMSD2WBBVWV.king-stxcity::kinq',
      contractId: 'SP3ACD3WC1XTVJ0J3T3532TN4NFABRKMSD2WBBVWV.king-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/pyXpTkua-ai-generated.jpg',
      name: 'KING',
      symbol: 'kinq',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3ACD3WC1XTVJ0J3T3532TN4NFABRKMSD2WBBVWV.king-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3ACD3WC1XTVJ0J3T3532TN4NFABRKMSD2WBBVWV.king-stxcity::kinq',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-kinq',
        assetId: {
          protocol: 'sip10',
          id: 'SP3ACD3WC1XTVJ0J3T3532TN4NFABRKMSD2WBBVWV.king-stxcity::kinq',
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
      assetId: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.wally::WALLY',
      contractId: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.wally',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/FvRfneQt-IMG-20240919-160030-921.jpg',
      name: 'Wally',
      symbol: 'WALLY',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.wally',
        assetId: {
          protocol: 'sip10',
          id: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.wally::WALLY',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wally',
        assetId: {
          protocol: 'sip10',
          id: 'SP45RYP4W83SMSCG5C7MZCM1EFVRJY4K6D0E05Z6.wally::WALLY',
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
      assetId: 'SPZ2X8P6QTV1SPN5NKP4VVCFPDWWK63RPB9PHCMK.secretsanta::SNTA',
      contractId: 'SPZ2X8P6QTV1SPN5NKP4VVCFPDWWK63RPB9PHCMK.secretsanta',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/pCthJOAP-Untitled-1.png',
      name: 'SECRETSANTA',
      symbol: 'SNTA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPZ2X8P6QTV1SPN5NKP4VVCFPDWWK63RPB9PHCMK.secretsanta',
        assetId: {
          protocol: 'sip10',
          id: 'SPZ2X8P6QTV1SPN5NKP4VVCFPDWWK63RPB9PHCMK.secretsanta::SNTA',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-snta',
        assetId: {
          protocol: 'sip10',
          id: 'SPZ2X8P6QTV1SPN5NKP4VVCFPDWWK63RPB9PHCMK.secretsanta::SNTA',
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
      assetId: 'SP3M31QFF6S96215K4Y2Z9K5SGHJN384NV6YM6VM8.satoshai::satoshai',
      contractId: 'SP3M31QFF6S96215K4Y2Z9K5SGHJN384NV6YM6VM8.satoshai',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://domain-interactive-470.mypinata.cloud/ipfs/bafybeif3okztvr3nsnwp4k5zvpxu2jvpavsxvlcefx43y5hffwtiq3iyvm',
      name: 'SatoshAi',
      symbol: 'sAI',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3M31QFF6S96215K4Y2Z9K5SGHJN384NV6YM6VM8.satoshai',
        assetId: {
          protocol: 'sip10',
          id: 'SP3M31QFF6S96215K4Y2Z9K5SGHJN384NV6YM6VM8.satoshai::satoshai',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-sai',
        assetId: {
          protocol: 'sip10',
          id: 'SP3M31QFF6S96215K4Y2Z9K5SGHJN384NV6YM6VM8.satoshai::satoshai',
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
      assetId: 'SP20KBF1FZAXDEH5D64FVYF9EYD8Y2Q8XPFNF381M.mana::MANA',
      contractId: 'SP20KBF1FZAXDEH5D64FVYF9EYD8Y2Q8XPFNF381M.mana',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1J4Wswh8LRRK9L6DP8QNpL7hX23gk3gcXp/mana.jpg',
      name: 'MANA',
      symbol: 'MANA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP20KBF1FZAXDEH5D64FVYF9EYD8Y2Q8XPFNF381M.mana',
        assetId: {
          protocol: 'sip10',
          id: 'SP20KBF1FZAXDEH5D64FVYF9EYD8Y2Q8XPFNF381M.mana::MANA',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mana',
        assetId: {
          protocol: 'sip10',
          id: 'SP20KBF1FZAXDEH5D64FVYF9EYD8Y2Q8XPFNF381M.mana::MANA',
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
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-diko',
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
          decimals: 0,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'DIKO',
          decimals: 0,
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
      assetId: 'SPAE4SFGGSKKH7NC49KQCHJFY9159DG24YHQCJVX.xtremely-retarded-people-stxcity::XRP',
      contractId: 'SPAE4SFGGSKKH7NC49KQCHJFY9159DG24YHQCJVX.xtremely-retarded-people-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/vkSACnZx-xDcOa3je-400x400.jpg',
      name: 'Xtremely Retarded People',
      symbol: 'XRP',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId:
          'SPAE4SFGGSKKH7NC49KQCHJFY9159DG24YHQCJVX.xtremely-retarded-people-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPAE4SFGGSKKH7NC49KQCHJFY9159DG24YHQCJVX.xtremely-retarded-people-stxcity::XRP',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-xrp',
        assetId: {
          protocol: 'sip10',
          id: 'SPAE4SFGGSKKH7NC49KQCHJFY9159DG24YHQCJVX.xtremely-retarded-people-stxcity::XRP',
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
        'SP17Z9QG1VZCZT01FYZD5KGVNMZVAXB0W536YMA7C.annoying-delusional-assholes-stxcity::ADA',
      contractId: 'SP17Z9QG1VZCZT01FYZD5KGVNMZVAXB0W536YMA7C.annoying-delusional-assholes-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/aWdZMmZQ-Untitled-1.jpg',
      name: 'Annoying Delusional Assholes',
      symbol: 'ADA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId:
          'SP17Z9QG1VZCZT01FYZD5KGVNMZVAXB0W536YMA7C.annoying-delusional-assholes-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP17Z9QG1VZCZT01FYZD5KGVNMZVAXB0W536YMA7C.annoying-delusional-assholes-stxcity::ADA',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ada',
        assetId: {
          protocol: 'sip10',
          id: 'SP17Z9QG1VZCZT01FYZD5KGVNMZVAXB0W536YMA7C.annoying-delusional-assholes-stxcity::ADA',
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
        'SPFDAYS6C5XBH3CEMC6R210P348YXT7W1Q69JKPP.dumb-online-gambling-experts-stxcity::DOGE',
      contractId: 'SPFDAYS6C5XBH3CEMC6R210P348YXT7W1Q69JKPP.dumb-online-gambling-experts-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://images.ctfassets.net/b8vkjfhb5t28/20cMS189swbEP516gy0hTj/64ce0db52bf21431d69cd24e3c872c94/doge-logo.png',
      name: 'Dumb Online Gambling Experts',
      symbol: 'DOGE',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId:
          'SPFDAYS6C5XBH3CEMC6R210P348YXT7W1Q69JKPP.dumb-online-gambling-experts-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPFDAYS6C5XBH3CEMC6R210P348YXT7W1Q69JKPP.dumb-online-gambling-experts-stxcity::DOGE',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-doge',
        assetId: {
          protocol: 'sip10',
          id: 'SPFDAYS6C5XBH3CEMC6R210P348YXT7W1Q69JKPP.dumb-online-gambling-experts-stxcity::DOGE',
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
      assetId: 'SPC77TE65CT7M37RZ7V282KE66CFBEMBNQZKN5WD.aidog::AIdog',
      contractId: 'SPC77TE65CT7M37RZ7V282KE66CFBEMBNQZKN5WD.aidog',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/fPXUoRlD-photo-2024-12-09-20-49-58.jpg',
      name: 'AIdog',
      symbol: 'AIdog',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPC77TE65CT7M37RZ7V282KE66CFBEMBNQZKN5WD.aidog',
        assetId: {
          protocol: 'sip10',
          id: 'SPC77TE65CT7M37RZ7V282KE66CFBEMBNQZKN5WD.aidog::AIdog',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-aldog',
        assetId: {
          protocol: 'sip10',
          id: 'SPC77TE65CT7M37RZ7V282KE66CFBEMBNQZKN5WD.aidog::AIdog',
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
      assetId: 'SPZX1HBFWAQMCJF9D5CZK0D067Z86KC2XVY75KKY.kitsune-inu::KINU',
      contractId: 'SPZX1HBFWAQMCJF9D5CZK0D067Z86KC2XVY75KKY.kitsune-inu',
      decimals: 5,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/NreIXMqZ-photo-2024-12-10-16-07-28.jpg',
      name: 'KITSUNE INU',
      symbol: 'KINU',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPZX1HBFWAQMCJF9D5CZK0D067Z86KC2XVY75KKY.kitsune-inu',
        assetId: {
          protocol: 'sip10',
          id: 'SPZX1HBFWAQMCJF9D5CZK0D067Z86KC2XVY75KKY.kitsune-inu::KINU',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-kinu',
        assetId: {
          protocol: 'sip10',
          id: 'SPZX1HBFWAQMCJF9D5CZK0D067Z86KC2XVY75KKY.kitsune-inu::KINU',
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
      assetId: 'SP4VEZSABNV5SXE9GTYMZHK9H08VCZM4V1GWPKEJ.chancla-stxcity::FLIP',
      contractId: 'SP4VEZSABNV5SXE9GTYMZHK9H08VCZM4V1GWPKEJ.chancla-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/XIgEIPMA-Screenshot-2024-12-10-173826.png',
      name: 'Chancla',
      symbol: 'FLIP',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP4VEZSABNV5SXE9GTYMZHK9H08VCZM4V1GWPKEJ.chancla-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP4VEZSABNV5SXE9GTYMZHK9H08VCZM4V1GWPKEJ.chancla-stxcity::FLIP',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-flip',
        assetId: {
          protocol: 'sip10',
          id: 'SP4VEZSABNV5SXE9GTYMZHK9H08VCZM4V1GWPKEJ.chancla-stxcity::FLIP',
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
      assetId: 'SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity::UAP',
      contractId: 'SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/bNTkeudj-uap.jpg',
      name: 'DRONES',
      symbol: 'UAP',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity::UAP',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-uap',
        assetId: {
          protocol: 'sip10',
          id: 'SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity::UAP',
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
      assetId: 'SP3AFTJ38PSZQBXZGNCDGM05GR0SFY7HBPZD2ACR2.rocket-stxcity::Rocket',
      contractId: 'SP3AFTJ38PSZQBXZGNCDGM05GR0SFY7HBPZD2ACR2.rocket-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/RcGNqcuH-hp-op-rocketemo.webp',
      name: 'Rocket',
      symbol: 'Rocket',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3AFTJ38PSZQBXZGNCDGM05GR0SFY7HBPZD2ACR2.rocket-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3AFTJ38PSZQBXZGNCDGM05GR0SFY7HBPZD2ACR2.rocket-stxcity::Rocket',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-rocket',
        assetId: {
          protocol: 'sip10',
          id: 'SP3AFTJ38PSZQBXZGNCDGM05GR0SFY7HBPZD2ACR2.rocket-stxcity::Rocket',
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
        'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kfxflkglu::tokensoft-token',
      contractId: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kfxflkglu',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://bafybeieuezvziq273ryrjy2hmd7drpegtgz6di62zqmrcl3qngf7wwyyny.ipfs.w3s.link/wojak.png',
      name: 'Wojak Coin',
      symbol: 'WOJAK',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kfxflkglu',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kfxflkglu::tokensoft-token',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wojak',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4kfxflkglu::tokensoft-token',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2TT71CXBRDDYP2P8XMVKRFYKRGSMBWCZ6W6FDGT.notastrategy',
        assetId: {
          protocol: 'sip10',
          id: 'SP2TT71CXBRDDYP2P8XMVKRFYKRGSMBWCZ6W6FDGT.notastrategy::NASTY',
        },
      },
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
      canTransfer: true,
      assetId: 'SP2BQ0676YV3F7QBJXS1PT7XA975ZG03XEXS9C8TN.stacksai-stxcity::stxAI',
      contractId: 'SP2BQ0676YV3F7QBJXS1PT7XA975ZG03XEXS9C8TN.stacksai-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/SKfCgdja-stxAI.jpeg',
      name: 'StacksAI',
      symbol: 'stxAI',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2BQ0676YV3F7QBJXS1PT7XA975ZG03XEXS9C8TN.stacksai-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2BQ0676YV3F7QBJXS1PT7XA975ZG03XEXS9C8TN.stacksai-stxcity::stxAI',
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
      assetId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
      contractId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://ipfs.io/ipfs/bafkreiffe46h5voimvulxm2s4ddszdm4uli4rwcvx34cgzz3xkfcc2hiwi',
      name: 'sBTC',
      symbol: 'sBTC',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
        assetId: {
          protocol: 'sip10',
          id: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-sbtc',
        assetId: {
          protocol: 'sip10',
          id: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
        },
      },
      {
        providerId: 'sbtc-bridge',
        providerAssetId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
        assetId: {
          protocol: 'sip10',
          id: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(112844.593584),
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
          amount: BigNumber(112844.593584),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(112844.593584),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1002564),
          symbol: 'sBTC',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'sBTC',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'sBTC',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(1002564),
          symbol: 'sBTC',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(1002564),
          symbol: 'sBTC',
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
      assetId: 'SP1AQDVJF18XEFVXMWTRAW9TQ0N2DCN0178FKW03R.smoke::Smoke',
      contractId: 'SP1AQDVJF18XEFVXMWTRAW9TQ0N2DCN0178FKW03R.smoke',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/yFQlgdKE-XjjBeKpu.jpg',
      name: 'Smoke',
      symbol: 'Smoke',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1AQDVJF18XEFVXMWTRAW9TQ0N2DCN0178FKW03R.smoke',
        assetId: {
          protocol: 'sip10',
          id: 'SP1AQDVJF18XEFVXMWTRAW9TQ0N2DCN0178FKW03R.smoke::Smoke',
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
          amount: BigNumber(75000000),
          symbol: 'Smoke',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'Smoke',
          decimals: 0,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'Smoke',
          decimals: 0,
        },
        pendingBalance: {
          amount: BigNumber(75000000),
          symbol: 'Smoke',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(75000000),
          symbol: 'Smoke',
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
      assetId: 'SP9PK32N4QVEE3N1JNQVJWBM4R36TKHNNKZMN62E.bone-stacks::BONE',
      contractId: 'SP9PK32N4QVEE3N1JNQVJWBM4R36TKHNNKZMN62E.bone-stacks',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/AJvvNvrt-BoneLogo.png',
      name: 'Bone Stacks',
      symbol: 'BONE',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP9PK32N4QVEE3N1JNQVJWBM4R36TKHNNKZMN62E.bone-stacks',
        assetId: {
          protocol: 'sip10',
          id: 'SP9PK32N4QVEE3N1JNQVJWBM4R36TKHNNKZMN62E.bone-stacks::BONE',
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
      assetId: 'SP1EPKCZEG9T3PVEMXGK81PVPAENWRM3H5MCZX3DV.nerdydude::NERDY',
      contractId: 'SP1EPKCZEG9T3PVEMXGK81PVPAENWRM3H5MCZX3DV.nerdydude',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/kvDsKDYg-QdeiDDEcVtdnzwOP.jpg',
      name: 'NerdyDude',
      symbol: 'NERDY',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1EPKCZEG9T3PVEMXGK81PVPAENWRM3H5MCZX3DV.nerdydude',
        assetId: {
          protocol: 'sip10',
          id: 'SP1EPKCZEG9T3PVEMXGK81PVPAENWRM3H5MCZX3DV.nerdydude::NERDY',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP2VG7S0R4Z8PYNYCAQ04HCBX1MH75VT11VXCWQ6G.built-on-bitcoin-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2VG7S0R4Z8PYNYCAQ04HCBX1MH75VT11VXCWQ6G.built-on-bitcoin-stxcity::BOB',
        },
      },
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
      assetId: 'SP67MJ3WDFW60XKGK1A45KDRTYXWFE0BB663W042.kekius-maximus::KEKIUS',
      contractId: 'SP67MJ3WDFW60XKGK1A45KDRTYXWFE0BB663W042.kekius-maximus',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/nNvxpBBt-kek.png',
      name: 'Kekius Maximus',
      symbol: 'KEKIUS',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP67MJ3WDFW60XKGK1A45KDRTYXWFE0BB663W042.kekius-maximus',
        assetId: {
          protocol: 'sip10',
          id: 'SP67MJ3WDFW60XKGK1A45KDRTYXWFE0BB663W042.kekius-maximus::KEKIUS',
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
      assetId: 'SP1S7ZPGH8ND18C6W00B3BB6BFKDVDF8Y8YKM80MY.ninja::NINJA',
      contractId: 'SP1S7ZPGH8ND18C6W00B3BB6BFKDVDF8Y8YKM80MY.ninja',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/pPvvaftP-16807.png',
      name: 'Ninja',
      symbol: 'NINJA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1S7ZPGH8ND18C6W00B3BB6BFKDVDF8Y8YKM80MY.ninja',
        assetId: {
          protocol: 'sip10',
          id: 'SP1S7ZPGH8ND18C6W00B3BB6BFKDVDF8Y8YKM80MY.ninja::NINJA',
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
      assetId: 'SP1GRA661HSA3F1FWC6EANTTF6NWTPHMQ31NB96AH.pizza-ninjas::NINJAS',
      contractId: 'SP1GRA661HSA3F1FWC6EANTTF6NWTPHMQ31NB96AH.pizza-ninjas',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/eEjMbCZk-Pizza-Ninjas-1-23-.png',
      name: 'Pizza Ninjas',
      symbol: 'NINJAS',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1GRA661HSA3F1FWC6EANTTF6NWTPHMQ31NB96AH.pizza-ninjas',
        assetId: {
          protocol: 'sip10',
          id: 'SP1GRA661HSA3F1FWC6EANTTF6NWTPHMQ31NB96AH.pizza-ninjas::NINJAS',
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
      assetId: 'SPQFACZ5KGYJH3XG8BDWW2VGGRBJ8BPFVEXEVC6M.mstr-on-stacks-stxcity::MSTR',
      contractId: 'SPQFACZ5KGYJH3XG8BDWW2VGGRBJ8BPFVEXEVC6M.mstr-on-stacks-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/oeNiAERy-MSTR-2-.png',
      name: 'MSTR on Stacks',
      symbol: 'MSTR',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPQFACZ5KGYJH3XG8BDWW2VGGRBJ8BPFVEXEVC6M.mstr-on-stacks-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPQFACZ5KGYJH3XG8BDWW2VGGRBJ8BPFVEXEVC6M.mstr-on-stacks-stxcity::MSTR',
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
      assetId: 'SP5NJH2NCQZK8V8E7GD4ZXKQ082N56YJYRD44CBR.chunk::CHUNK',
      contractId: 'SP5NJH2NCQZK8V8E7GD4ZXKQ082N56YJYRD44CBR.chunk',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/cQYLszdq-Logo.png',
      name: 'Chunk',
      symbol: 'CHUNK',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP5NJH2NCQZK8V8E7GD4ZXKQ082N56YJYRD44CBR.chunk',
        assetId: {
          protocol: 'sip10',
          id: 'SP5NJH2NCQZK8V8E7GD4ZXKQ082N56YJYRD44CBR.chunk::CHUNK',
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
      assetId: 'SP1B17ERMZV499PRH1WP6HDVVJARF3Q4CDD92EBWN.aibtc::AIBTC',
      contractId: 'SP1B17ERMZV499PRH1WP6HDVVJARF3Q4CDD92EBWN.aibtc',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/bqITDveZ-Gabe6HRWAAA6K0-.jpg',
      name: 'AIbtc',
      symbol: 'AIBTC',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1B17ERMZV499PRH1WP6HDVVJARF3Q4CDD92EBWN.aibtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP1B17ERMZV499PRH1WP6HDVVJARF3Q4CDD92EBWN.aibtc::AIBTC',
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
      assetId: 'SP6TNST5EKBSTGKBR0R95AF01HPW5747FYRBHKXT.trump-meme::TRUMP',
      contractId: 'SP6TNST5EKBSTGKBR0R95AF01HPW5747FYRBHKXT.trump-meme',
      decimals: 2,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/VYaupEsJ-WhatsApp-Image-2025-01-18-at-11-27-30-3e111460.jpg',
      name: 'TRUMP MEME',
      symbol: 'TRUMP',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP6TNST5EKBSTGKBR0R95AF01HPW5747FYRBHKXT.trump-meme',
        assetId: {
          protocol: 'sip10',
          id: 'SP6TNST5EKBSTGKBR0R95AF01HPW5747FYRBHKXT.trump-meme::TRUMP',
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
      assetId: 'SP2RSTYVKMSYHX7RHD6QN9VHV20K0P2JYPM18T069.bitstacks::BTS',
      contractId: 'SP2RSTYVKMSYHX7RHD6QN9VHV20K0P2JYPM18T069.bitstacks',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/ClLejgYK-WhatsApp-Image-2025-01-21-at-10-26-56-22e411e4.jpg',
      name: 'Bitstacks',
      symbol: 'BTS',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2RSTYVKMSYHX7RHD6QN9VHV20K0P2JYPM18T069.bitstacks',
        assetId: {
          protocol: 'sip10',
          id: 'SP2RSTYVKMSYHX7RHD6QN9VHV20K0P2JYPM18T069.bitstacks::BTS',
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
      assetId: 'SPXX4C4ZVM6N4RS4D7YX3QPTRJME1ESXWMNSB2MN.stacks-degens::DEGENS',
      contractId: 'SPXX4C4ZVM6N4RS4D7YX3QPTRJME1ESXWMNSB2MN.stacks-degens',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/uxQYSfwT-Ghq7bA8WMAEl6Pv.jpg',
      name: 'Stacks Degens',
      symbol: 'DEGENS',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPXX4C4ZVM6N4RS4D7YX3QPTRJME1ESXWMNSB2MN.stacks-degens',
        assetId: {
          protocol: 'sip10',
          id: 'SPXX4C4ZVM6N4RS4D7YX3QPTRJME1ESXWMNSB2MN.stacks-degens::DEGENS',
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
      assetId: 'SPD1R8A962EKB8JEHFQTFNXGZTRR93J0NG5KCM81.gangnam-rose-apt-stxcity::KAPT',
      contractId: 'SPD1R8A962EKB8JEHFQTFNXGZTRR93J0NG5KCM81.gangnam-rose-apt-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/orXMMQps-ase.png',
      name: 'Gangnam Rose APT',
      symbol: 'KAPT',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPD1R8A962EKB8JEHFQTFNXGZTRR93J0NG5KCM81.gangnam-rose-apt-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPD1R8A962EKB8JEHFQTFNXGZTRR93J0NG5KCM81.gangnam-rose-apt-stxcity::KAPT',
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
      assetId: 'SP22B7ZEPJRFZZFEYH8XMGXYRC9QTTBMVNTY3KXP9.stxtools-coin::STXTool',
      contractId: 'SP22B7ZEPJRFZZFEYH8XMGXYRC9QTTBMVNTY3KXP9.stxtools-coin',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/iEPYdFsS-WhatsApp-Image-2025-02-06-at-10-33-36-729a16e5.jpg',
      name: 'STXTools coin',
      symbol: 'STXTool',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP22B7ZEPJRFZZFEYH8XMGXYRC9QTTBMVNTY3KXP9.stxtools-coin',
        assetId: {
          protocol: 'sip10',
          id: 'SP22B7ZEPJRFZZFEYH8XMGXYRC9QTTBMVNTY3KXP9.stxtools-coin::STXTool',
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
      assetId: 'SP3SE348DFBQT3PV6YT9B85014W0XAC5CT5Q50FB3.amigo-stxcity::AMIGO',
      contractId: 'SP3SE348DFBQT3PV6YT9B85014W0XAC5CT5Q50FB3.amigo-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/hNcAIdbw-Shib-Sombrero-1.png',
      name: 'Amigo',
      symbol: 'AMIGO',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3SE348DFBQT3PV6YT9B85014W0XAC5CT5Q50FB3.amigo-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3SE348DFBQT3PV6YT9B85014W0XAC5CT5Q50FB3.amigo-stxcity::AMIGO',
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
        providerId: 'velar-sdk',
        providerAssetId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2',
        assetId: {
          protocol: 'sip10',
          id: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2::ststxbtc',
        },
      },
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
      assetId: 'SP1PMSY2QNBEH38BYJJ75EHQX3CMR70MCT51D4G30.BabyMojo::BabyMojo',
      contractId: 'SP1PMSY2QNBEH38BYJJ75EHQX3CMR70MCT51D4G30.BabyMojo',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'ipfs://ipfs/QmTUsVCL8V8dmay28NkFjHsBntsV68oZxghdsWCdnXykWD',
      name: 'BabyMojo',
      symbol: 'BabyMojo',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1PMSY2QNBEH38BYJJ75EHQX3CMR70MCT51D4G30.BabyMojo',
        assetId: {
          protocol: 'sip10',
          id: 'SP1PMSY2QNBEH38BYJJ75EHQX3CMR70MCT51D4G30.BabyMojo::BabyMojo',
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
      assetId: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.neebs::neebs',
      contractId: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.neebs',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'neebs',
      symbol: 'neebs',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.neebs',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.neebs::neebs',
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
      assetId: 'SP2JRMT8R6AR3B4M6GDFHMZTV9GVK4HF5YDF7972Y.nakamoto::NAKAMOTO',
      contractId: 'SP2JRMT8R6AR3B4M6GDFHMZTV9GVK4HF5YDF7972Y.nakamoto',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/IBgsrDPP-EwrETfzj-400x400.jpg',
      name: 'NAKAMOTO',
      symbol: 'NAKAMOTO',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2JRMT8R6AR3B4M6GDFHMZTV9GVK4HF5YDF7972Y.nakamoto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2JRMT8R6AR3B4M6GDFHMZTV9GVK4HF5YDF7972Y.nakamoto::NAKAMOTO',
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
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-play',
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
      assetId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.this-is-welsh-2-stxcity::welsh2',
      contractId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.this-is-welsh-2-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/LUtrfZkW-welsh.webp',
      name: 'This is welsh 2',
      symbol: 'welsh2',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.this-is-welsh-2-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.this-is-welsh-2-stxcity::welsh2',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-welsh2-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.this-is-welsh-2-stxcity::welsh2',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-sbtc::brc20-sbtc',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-sbtc',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/brc20-sbtc',
      name: 'sbtc (BRC20)',
      symbol: 'sbtc',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-sbtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-sbtc::brc20-sbtc',
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
      assetId: 'SP3E8B51MF5E28BD82FM95VDSQ71VK4KFNZX7ZK2R.frog-faktory::FROGGY',
      contractId: 'SP3E8B51MF5E28BD82FM95VDSQ71VK4KFNZX7ZK2R.frog-faktory',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://szigdtxfspmofhxoytra.supabase.co/storage/v1/object/public/token_logo/n62jpl96-froggy.gif',
      name: 'frog',
      symbol: 'FROGGY',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3E8B51MF5E28BD82FM95VDSQ71VK4KFNZX7ZK2R.frog-faktory',
        assetId: {
          protocol: 'sip10',
          id: 'SP3E8B51MF5E28BD82FM95VDSQ71VK4KFNZX7ZK2R.frog-faktory::FROGGY',
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
      assetId: 'SP14ZYP25NW67XZQWMCDQCGH9S178JT78QJYE6K37.rapha-faktory::RAPHA',
      contractId: 'SP14ZYP25NW67XZQWMCDQCGH9S178JT78QJYE6K37.rapha-faktory',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://szigdtxfspmofhxoytra.supabase.co/storage/v1/object/public/token_logo/k7g75rwr-J_SO2iUR_400x400.jpg',
      name: 'Rapha',
      symbol: 'RAPHA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP14ZYP25NW67XZQWMCDQCGH9S178JT78QJYE6K37.rapha-faktory',
        assetId: {
          protocol: 'sip10',
          id: 'SP14ZYP25NW67XZQWMCDQCGH9S178JT78QJYE6K37.rapha-faktory::RAPHA',
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
      assetId: 'SP3CA2XYS3PE4SG2RHJ88C978HP3B0XSGZ73SWVZF.pepecola::PEPECOLA',
      contractId: 'SP3CA2XYS3PE4SG2RHJ88C978HP3B0XSGZ73SWVZF.pepecola',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/TlVgNhXN-QmPxoZToxUUhsyQ8P7MytFD7uXt2YAbyVV8UdBUyYukccE.png',
      name: 'PEPECOLA',
      symbol: 'PEPECOLA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3CA2XYS3PE4SG2RHJ88C978HP3B0XSGZ73SWVZF.pepecola',
        assetId: {
          protocol: 'sip10',
          id: 'SP3CA2XYS3PE4SG2RHJ88C978HP3B0XSGZ73SWVZF.pepecola::PEPECOLA',
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
      assetId: 'SP2DRM5DKDJX6ECFJH9XDT66DZV8FK2H1A27JZHCA.doge-bonk::BONK',
      contractId: 'SP2DRM5DKDJX6ECFJH9XDT66DZV8FK2H1A27JZHCA.doge-bonk',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1Gwh5gnZBHswL7mCBGV4ngRcjnJuDMpsfk/bonk.jpeg',
      name: 'DOGE BONK ',
      symbol: 'BONK',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP2DRM5DKDJX6ECFJH9XDT66DZV8FK2H1A27JZHCA.doge-bonk',
        assetId: {
          protocol: 'sip10',
          id: 'SP2DRM5DKDJX6ECFJH9XDT66DZV8FK2H1A27JZHCA.doge-bonk::BONK',
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
      assetId: 'SPGNH14RQWAT05PVG8CEXCM7BGC5PPR01XVGQXPZ.pos-coin-stxcity::POS',
      contractId: 'SPGNH14RQWAT05PVG8CEXCM7BGC5PPR01XVGQXPZ.pos-coin-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/ppRkLTqs-IMG-0033.JPG',
      name: 'POS Coin',
      symbol: 'POS',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPGNH14RQWAT05PVG8CEXCM7BGC5PPR01XVGQXPZ.pos-coin-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPGNH14RQWAT05PVG8CEXCM7BGC5PPR01XVGQXPZ.pos-coin-stxcity::POS',
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
      assetId: 'SP15ZNQ9FT2YJFNXQQHC16B1VAXHAPQ1H5HA5VQ2T.nigiri::NIGIRI',
      contractId: 'SP15ZNQ9FT2YJFNXQQHC16B1VAXHAPQ1H5HA5VQ2T.nigiri',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/XKzcWWqz-IMG-4658.jpeg',
      name: 'NIGIRI',
      symbol: 'NIGIRI',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP15ZNQ9FT2YJFNXQQHC16B1VAXHAPQ1H5HA5VQ2T.nigiri',
        assetId: {
          protocol: 'sip10',
          id: 'SP15ZNQ9FT2YJFNXQQHC16B1VAXHAPQ1H5HA5VQ2T.nigiri::NIGIRI',
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
        'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4karmaedcr::tokensoft-token',
      contractId: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4karmaedcr',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://s3-us-east-2.amazonaws.com/stackswap-launchpad/f9cd3af6-c6b3-4f8f-9fe0-7749d60b8d44.jpg',
      name: 'STXOSHI',
      symbol: 'STXOSHI',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4karmaedcr',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4karmaedcr::tokensoft-token',
        },
      },
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-stxoshi',
        assetId: {
          protocol: 'sip10',
          id: 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4karmaedcr::tokensoft-token',
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
      assetId: 'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity::PEGGY',
      contractId: 'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/TILFLYCg-Dawgcoin-Logo-WHT-Back.png',
      name: 'Dawgpool',
      symbol: 'PEGGY',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity::PEGGY',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog::runes-dog',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/runes-dog',
      name: 'DOG GO TO THE MOON (RUNES)',
      symbol: 'DOG',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog::runes-dog',
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
      assetId: 'SP3A4NSFW6GTB6RJ33K06W8WSHG4AA1C2E6172Y02.buddha-stx-stxcity::BUDDHA',
      contractId: 'SP3A4NSFW6GTB6RJ33K06W8WSHG4AA1C2E6172Y02.buddha-stx-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/wqvVcHuS-BUDDHA-STX-1-1024x1024.jpg',
      name: 'BUDDHA STX',
      symbol: 'BUDDHA',
    },
    providerAssets: [
      {
        providerId: 'velar-sdk',
        providerAssetId: 'SP3A4NSFW6GTB6RJ33K06W8WSHG4AA1C2E6172Y02.buddha-stx-stxcity',
        assetId: {
          protocol: 'sip10',
          id: 'SP3A4NSFW6GTB6RJ33K06W8WSHG4AA1C2E6172Y02.buddha-stx-stxcity::BUDDHA',
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
      assetId: 'SPX9AGSPZMPX7J7Z90N7PER50PRJY5M59RZ1P8CC.elonstx::ELON',
      contractId: 'SPX9AGSPZMPX7J7Z90N7PER50PRJY5M59RZ1P8CC.elonstx',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/llGXAqsg-elpn.png',
      name: 'ELONSTX',
      symbol: 'ELON',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-elon',
        assetId: {
          protocol: 'sip10',
          id: 'SPX9AGSPZMPX7J7Z90N7PER50PRJY5M59RZ1P8CC.elonstx::ELON',
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
      assetId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aewbtc::aeWBTC',
      contractId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aewbtc',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://allbridge-assets.web.app/320px/ETH/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.svg',
      name: 'Ethereum WBTC via Allbridge',
      symbol: 'aeWBTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-aewbtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aewbtc::aeWBTC',
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
          amount: BigNumber(81),
          symbol: 'aeWBTC',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'aeWBTC',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'aeWBTC',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(81),
          symbol: 'aeWBTC',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(81),
          symbol: 'aeWBTC',
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
      assetId: 'SP32P7T7VSRKN8D1B9S6WYT8ZS4XAD6ZZJGBVSMRF.Boreden-Retriever-Token::BORDN',
      contractId: 'SP32P7T7VSRKN8D1B9S6WYT8ZS4XAD6ZZJGBVSMRF.Boreden-Retriever-Token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://gateway.pinata.cloud/ipfs/Qma1Fkxn2owueAPo5h1R7BW9qANYiYeB5Frck2u66WBCNp',
      name: 'Boreden Retriever',
      symbol: 'BORDN',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-bordn',
        assetId: {
          protocol: 'sip10',
          id: 'SP32P7T7VSRKN8D1B9S6WYT8ZS4XAD6ZZJGBVSMRF.Boreden-Retriever-Token::BORDN',
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
      assetId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-17::token-17',
      contractId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-17',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: '',
      name: '',
      symbol: '',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mega17',
        assetId: {
          protocol: 'sip10',
          id: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-17::token-17',
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
      assetId: 'SP673Z4BPB4R73359K9HE55F2X91V5BJTN5SXZ5T.token-liabtc::liabtc',
      contractId: 'SP673Z4BPB4R73359K9HE55F2X91V5BJTN5SXZ5T.token-liabtc',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-wliabtc',
      name: 'LiaBTC',
      symbol: 'LiaBTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-liabtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP673Z4BPB4R73359K9HE55F2X91V5BJTN5SXZ5T.token-liabtc::liabtc',
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
          amount: BigNumber(298),
          symbol: 'LiaBTC',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'LiaBTC',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'LiaBTC',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(298),
          symbol: 'LiaBTC',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(298),
          symbol: 'LiaBTC',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-db20::brc20-db20',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-db20',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/brc20-db20',
      name: '$B20 (BRC20)',
      symbol: '$B20',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-b20',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-db20::brc20-db20',
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
      assetId: 'SP3ATSS8V1SVQJRX1BF44Z12JENZ1K6FQ6J5F7XHX.family::FAM',
      contractId: 'SP3ATSS8V1SVQJRX1BF44Z12JENZ1K6FQ6J5F7XHX.family',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/bzPTbKjq-QmQPm6iuU83muYeAyGC6eDFbbTo7XAYR6BeEtV7ppJH4dy.png',
      name: 'Family',
      symbol: 'FAM',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-family',
        assetId: {
          protocol: 'sip10',
          id: 'SP3ATSS8V1SVQJRX1BF44Z12JENZ1K6FQ6J5F7XHX.family::FAM',
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
      assetId: 'SP3BGZAZKBS475T9FS18VH1NANWV4ERSGZWJKSRTF.baby-alex::BABYALEX',
      contractId: 'SP3BGZAZKBS475T9FS18VH1NANWV4ERSGZWJKSRTF.baby-alex',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/epQOkzjw-photo-2024-10-07-20-07-58.jpg',
      name: 'Baby ALEX',
      symbol: 'BABYALEX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-baby',
        assetId: {
          protocol: 'sip10',
          id: 'SP3BGZAZKBS475T9FS18VH1NANWV4ERSGZWJKSRTF.baby-alex::BABYALEX',
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
      assetId: 'SP3KRBFBCSM7SDA09N57BXRFEDGSA7PC6A1K4FVA9.catstacks::CATS',
      contractId: 'SP3KRBFBCSM7SDA09N57BXRFEDGSA7PC6A1K4FVA9.catstacks',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/nqCbelfd-cats.png',
      name: 'CatStacks',
      symbol: 'CATS',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-cats',
        assetId: {
          protocol: 'sip10',
          id: 'SP3KRBFBCSM7SDA09N57BXRFEDGSA7PC6A1K4FVA9.catstacks::CATS',
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
      assetId: 'SP8CFZ1ZQM71Y1E17G9SWFP1D0RNE1KSPKZ306ZC.wen::WenStacks',
      contractId: 'SP8CFZ1ZQM71Y1E17G9SWFP1D0RNE1KSPKZ306ZC.wen',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1FYgQvgEWeb6GPgy34BfkrVM3f8frXooJX/wen-logo.png',
      name: 'WEN',
      symbol: 'WenStacks',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wen',
        assetId: {
          protocol: 'sip10',
          id: 'SP8CFZ1ZQM71Y1E17G9SWFP1D0RNE1KSPKZ306ZC.wen::WenStacks',
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
      assetId: 'SPA7YK5GQWE9SYCT0GSSK4CNZQN6TRPYK0KW04W4.muneeb-cat-parker::MUNEEBCAT',
      contractId: 'SPA7YK5GQWE9SYCT0GSSK4CNZQN6TRPYK0KW04W4.muneeb-cat-parker',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/WmmbUHzG-catcoin-token-cats-logo.png',
      name: 'Muneeb Cat Parker',
      symbol: 'MUNEEBCAT',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wparker',
        assetId: {
          protocol: 'sip10',
          id: 'SPA7YK5GQWE9SYCT0GSSK4CNZQN6TRPYK0KW04W4.muneeb-cat-parker::MUNEEBCAT',
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
      assetId: 'SPAE1DZE3HPH909EARZ0FYY8KBR9JN7J3PE2G8QG.mojo::MOJO',
      contractId: 'SPAE1DZE3HPH909EARZ0FYY8KBR9JN7J3PE2G8QG.mojo',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://gaia.hiro.so/hub/1KZwYYn9ozSH7DH84PhEoisteT87kmq8Vd/GMQK4CHWkAA7X0a.jpg',
      name: 'MOJO',
      symbol: 'MOJO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mojo',
        assetId: {
          protocol: 'sip10',
          id: 'SPAE1DZE3HPH909EARZ0FYY8KBR9JN7J3PE2G8QG.mojo::MOJO',
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
      assetId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-16::token-16',
      contractId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-16',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: '',
      name: '',
      symbol: '',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-koko',
        assetId: {
          protocol: 'sip10',
          id: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-16::token-16',
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
      canTransfer: true,
      assetId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.leo-moon-stxcity::LEOMOON',
      contractId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.leo-moon-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/GHcdyJdm-welsh.webp',
      name: 'LEO MOON',
      symbol: 'LEOMOON',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-LEOMOON-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.leo-moon-stxcity::LEOMOON',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt::bridged-usdt',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://cdn.alexlab.co/logos/sUSDT.png',
      name: 'sUSDT',
      symbol: 'sUSDT',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-legsusdt',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt::bridged-usdt',
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
      assetId: 'SP3EBDZJH8Z3N62A20MKCYG37EXZ5R8FR77JFW5BR.bspx6900-stxcity::BSPX',
      contractId: 'SP3EBDZJH8Z3N62A20MKCYG37EXZ5R8FR77JFW5BR.bspx6900-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/UOuwLXDD-BSPX6900-BSPX-.png',
      name: 'BSPX6900',
      symbol: 'BSPX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-bspx6900',
        assetId: {
          protocol: 'sip10',
          id: 'SP3EBDZJH8Z3N62A20MKCYG37EXZ5R8FR77JFW5BR.bspx6900-stxcity::BSPX',
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
      assetId: 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-token-v2::miamicoin',
      contractId: 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-token-v2',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://cdn.citycoins.co/logos/miamicoin.png',
      name: 'miamicoin',
      symbol: 'MIA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mia',
        assetId: {
          protocol: 'sip10',
          id: 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-token-v2::miamicoin',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ormm::brc20-ormm',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ormm',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'ormm (BRC20)',
      symbol: 'ormm',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ormm',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ormm::brc20-ormm',
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
      assetId: 'SP26BVHEKMZSAKZ4PZ5SFPZVMRHDKH99D2Z38TK1Y.kiki-token::kiki',
      contractId: 'SP26BVHEKMZSAKZ4PZ5SFPZVMRHDKH99D2Z38TK1Y.kiki-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://stackstest1.s3.us-east-2.amazonaws.com/RichCat001.png',
      name: 'Rich Cat',
      symbol: 'KIKI',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-kiki',
        assetId: {
          protocol: 'sip10',
          id: 'SP26BVHEKMZSAKZ4PZ5SFPZVMRHDKH99D2Z38TK1Y.kiki-token::kiki',
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
          amount: BigNumber(2997000000),
          symbol: 'KIKI',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'KIKI',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'KIKI',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(2997000000),
          symbol: 'KIKI',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(2997000000),
          symbol: 'KIKI',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-tx20::brc20-tx20',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-tx20',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/brc20-tx20',
      name: 'TX20 (BRC20)',
      symbol: 'TX20',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-tx20',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-tx20::brc20-tx20',
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
      assetId: 'SP327J3J6RK88KGRQSMSWDRCP53EDHGJKHSNNGR4P.stacktaxi::TAXI',
      contractId: 'SP327J3J6RK88KGRQSMSWDRCP53EDHGJKHSNNGR4P.stacktaxi',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/AdKwmmfm-Robotaxi.jpg',
      name: 'Stacktaxi',
      symbol: 'TAXI',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-taxi',
        assetId: {
          protocol: 'sip10',
          id: 'SP327J3J6RK88KGRQSMSWDRCP53EDHGJKHSNNGR4P.stacktaxi::TAXI',
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
      assetId: 'SP1MYD1DXPVEKXFD2P9ZA8QVDZA4MXK212QW2A160.opk::ObiPNutKenobi',
      contractId: 'SP1MYD1DXPVEKXFD2P9ZA8QVDZA4MXK212QW2A160.opk',
      decimals: 7,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/VfdlSNMi-QmVVvxjX9KYeSaZUycyu8y6htrPDGyqC3z6kWtYdeQQ1T2.png',
      name: 'OPK',
      symbol: 'ObiPNutKenobi',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-opk',
        assetId: {
          protocol: 'sip10',
          id: 'SP1MYD1DXPVEKXFD2P9ZA8QVDZA4MXK212QW2A160.opk::ObiPNutKenobi',
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
      assetId: 'SP7V1SE7EA3ZG3QTWSBA2AAG8SRHEYJ06EBBD1J2.max-token::max',
      contractId: 'SP7V1SE7EA3ZG3QTWSBA2AAG8SRHEYJ06EBBD1J2.max-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmbEtREzSEiNf15wmFBphdVMEsx4wAvGNU1BadzZKzHPdp',
      name: 'Stacks Duck',
      symbol: 'MAX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-max',
        assetId: {
          protocol: 'sip10',
          id: 'SP7V1SE7EA3ZG3QTWSBA2AAG8SRHEYJ06EBBD1J2.max-token::max',
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
      assetId: 'SP3CTAW6MTJJJ741V19PH9RVZHK2QXT7E4EXSBVDN.just-a-chill-guy::CHILLGUY',
      contractId: 'SP3CTAW6MTJJJ741V19PH9RVZHK2QXT7E4EXSBVDN.just-a-chill-guy',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/hiQgyEPW-QmaFy59TMnLb4jGgL6LpquyXSxTRXKR4mEfSobUSsPoR46.jpg',
      name: 'Just a chill guy',
      symbol: 'CHILLGUY',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-chillguy',
        assetId: {
          protocol: 'sip10',
          id: 'SP3CTAW6MTJJJ741V19PH9RVZHK2QXT7E4EXSBVDN.just-a-chill-guy::CHILLGUY',
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
      assetId: 'SP11XNH1DR40PYSN8P3BCBNFY356TDFHS64XSRVPB.long-live-nakamoto::LLN',
      contractId: 'SP11XNH1DR40PYSN8P3BCBNFY356TDFHS64XSRVPB.long-live-nakamoto',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/DOtllayh-WhatsApp-Image-2024-11-05-at-23-29-12-d6a36f04.jpg',
      name: 'Long Live Nakamoto',
      symbol: 'LLN',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-lln',
        assetId: {
          protocol: 'sip10',
          id: 'SP11XNH1DR40PYSN8P3BCBNFY356TDFHS64XSRVPB.long-live-nakamoto::LLN',
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
      assetId: 'SP10X11JHXXGJV2055Z17K5WRW5G42S8AP6CF04S4.surge-stacks::SURGE',
      contractId: 'SP10X11JHXXGJV2055Z17K5WRW5G42S8AP6CF04S4.surge-stacks',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/sexJpxEe-cute-shark-cartoon-character-surfing-1308-120265.jpg',
      name: 'SURGE STACKS',
      symbol: 'SURGE',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-surge',
        assetId: {
          protocol: 'sip10',
          id: 'SP10X11JHXXGJV2055Z17K5WRW5G42S8AP6CF04S4.surge-stacks::SURGE',
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
      assetId: 'SP2RCZCP6X71BA1N4K8VKNYEBN13PEQ6CK43QHTR7.bitflow-token-2::kinq',
      contractId: 'SP2RCZCP6X71BA1N4K8VKNYEBN13PEQ6CK43QHTR7.bitflow-token-2',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/toikztiH-lion.jpg',
      name: 'KING',
      symbol: 'kinq',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-kinq-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2RCZCP6X71BA1N4K8VKNYEBN13PEQ6CK43QHTR7.bitflow-token-2::kinq',
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
      assetId: 'SP125J1ADVYWGWB9NQRCVGKYAG73R17ZNMV17XEJ7.slime-token::SLIME',
      contractId: 'SP125J1ADVYWGWB9NQRCVGKYAG73R17ZNMV17XEJ7.slime-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'SLIME',
      symbol: 'SLM',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-slime',
        assetId: {
          protocol: 'sip10',
          id: 'SP125J1ADVYWGWB9NQRCVGKYAG73R17ZNMV17XEJ7.slime-token::SLIME',
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
      assetId: 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin::wrapped-bitcoin',
      contractId: 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://wrapped.com/images/xbtc.png',
      name: 'Wrapped Bitcoin',
      symbol: 'xBTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-xbtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin::wrapped-bitcoin',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(110.355008),
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
          amount: BigNumber(110.355008),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(110.355008),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(1069),
          symbol: 'xBTC',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'xBTC',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'xBTC',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(1069),
          symbol: 'xBTC',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(1069),
          symbol: 'xBTC',
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
      assetId: 'SP3YTJRGXXMXDQ1V4T5GTFQC2KJ8G5EMYW93A4Q1G.stacking-turtle-stxcity::TURTLE',
      contractId: 'SP3YTJRGXXMXDQ1V4T5GTFQC2KJ8G5EMYW93A4Q1G.stacking-turtle-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/IbGdlKza-bitcoin-stack-rev.jpg',
      name: 'Stacking Turtle',
      symbol: 'TURTLE',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-turtle',
        assetId: {
          protocol: 'sip10',
          id: 'SP3YTJRGXXMXDQ1V4T5GTFQC2KJ8G5EMYW93A4Q1G.stacking-turtle-stxcity::TURTLE',
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
      assetId: 'SP27BB1Y2DGSXZHS7G9YHKTSH6KQ6BD3QG0AN3CR9.vibes-token::vibes-token',
      contractId: 'SP27BB1Y2DGSXZHS7G9YHKTSH6KQ6BD3QG0AN3CR9.vibes-token',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'HireVibes',
      symbol: 'VIBES',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-vibes',
        assetId: {
          protocol: 'sip10',
          id: 'SP27BB1Y2DGSXZHS7G9YHKTSH6KQ6BD3QG0AN3CR9.vibes-token::vibes-token',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordg::brc20-ordg',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordg',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/brc20-ordg',
      name: 'ORDG (BRC20)',
      symbol: 'ORDG',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ordg',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordg::brc20-ordg',
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
      assetId: 'SPX7Z21BD3HR8VXQE6NS38KX6PY7V184KDVVYMZW.x::X',
      contractId: 'SPX7Z21BD3HR8VXQE6NS38KX6PY7V184KDVVYMZW.x',
      decimals: 2,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/MRAijOcN-a-photo-of-a-large-intricately-carved-stone-sculpt-eJWPV2b0R-G0-2CumFw85g-OiSP-jxkSF67c38-rvD8dw.jpeg',
      name: 'X',
      symbol: 'X',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-xxx',
        assetId: {
          protocol: 'sip10',
          id: 'SPX7Z21BD3HR8VXQE6NS38KX6PY7V184KDVVYMZW.x::X',
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
      assetId: 'SPSCWDV3RKV5ZRN1FQD84YE1NQFEDJ9R1F4DYQ11.newyorkcitycoin-token-v2::newyorkcitycoin',
      contractId: 'SPSCWDV3RKV5ZRN1FQD84YE1NQFEDJ9R1F4DYQ11.newyorkcitycoin-token-v2',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://cdn.citycoins.co/logos/newyorkcitycoin.png',
      name: 'newyorkcitycoin',
      symbol: 'NYC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-nyc',
        assetId: {
          protocol: 'sip10',
          id: 'SPSCWDV3RKV5ZRN1FQD84YE1NQFEDJ9R1F4DYQ11.newyorkcitycoin-token-v2::newyorkcitycoin',
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
      assetId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.pepe-king-stxcity::pepe',
      contractId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.pepe-king-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/HXjucSKV-welsh.webp',
      name: 'pepe king',
      symbol: 'pepe',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pepe-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.pepe-king-stxcity::pepe',
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
      assetId: 'SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USD::wrapped-usd',
      contractId: 'SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USD',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://wrapped.com/images/xusd.png',
      name: 'Wrapped USD',
      symbol: 'xUSD',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-xusd',
        assetId: {
          protocol: 'sip10',
          id: 'SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USD::wrapped-usd',
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
      assetId: 'SPK5HH9QVYDNXNDCFH6W5AMRSR5K83ZMT4GPPK7M.flintstones::STONES',
      contractId: 'SPK5HH9QVYDNXNDCFH6W5AMRSR5K83ZMT4GPPK7M.flintstones',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1HXbchsfbuso4LX6jQ1EdwAHErt35Fg8aC/10452.png',
      name: 'Flintstones',
      symbol: 'STONES',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-stones',
        assetId: {
          protocol: 'sip10',
          id: 'SPK5HH9QVYDNXNDCFH6W5AMRSR5K83ZMT4GPPK7M.flintstones::STONES',
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
      assetId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt::bridged-usdt',
      contractId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://cdn.alexlab.co/logos/sUSDT.png',
      name: 'sUSDT',
      symbol: 'sUSDT',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-susdt',
        assetId: {
          protocol: 'sip10',
          id: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt::bridged-usdt',
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
          amount: BigNumber(431880163),
          symbol: 'sUSDT',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'sUSDT',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'sUSDT',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(431880163),
          symbol: 'sUSDT',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(431880163),
          symbol: 'sUSDT',
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
      canTransfer: false,
      assetId: 'SP3YB4JCE0H9QCE63MQ199BM8GXWV24E13G9J381F.zilong-meme-token-mobile-legend::ZIL',
      contractId: 'SP3YB4JCE0H9QCE63MQ199BM8GXWV24E13G9J381F.zilong-meme-token-mobile-legend',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/cvWjeqrU-channels4-profile.jpg',
      name: 'Zilong meme token mobile legend',
      symbol: 'ZIL',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-zilong',
        assetId: {
          protocol: 'sip10',
          id: 'SP3YB4JCE0H9QCE63MQ199BM8GXWV24E13G9J381F.zilong-meme-token-mobile-legend::ZIL',
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
      assetId: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.btc-monkeys-bananas::BANANA',
      contractId: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.btc-monkeys-bananas',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'BANANA',
      symbol: 'BAN',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-banana',
        assetId: {
          protocol: 'sip10',
          id: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.btc-monkeys-bananas::BANANA',
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
          amount: BigNumber(170975514),
          symbol: 'BAN',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'BAN',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'BAN',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(170975514),
          symbol: 'BAN',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(170975514),
          symbol: 'BAN',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-chax::brc20-chax',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-chax',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/brc20-chax',
      name: 'CHAX (BRC20)',
      symbol: 'CHAX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-chax',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-chax::brc20-chax',
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
      assetId: 'SP3YB4JCE0H9QCE63MQ199BM8GXWV24E13G9J381F.mia-meme-token-mobile-legend::MIA',
      contractId: 'SP3YB4JCE0H9QCE63MQ199BM8GXWV24E13G9J381F.mia-meme-token-mobile-legend',
      decimals: 1,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/dUgWiNCg-mlbb-cover.jpg',
      name: 'Mia meme token mobile legend',
      symbol: 'MIA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-miam',
        assetId: {
          protocol: 'sip10',
          id: 'SP3YB4JCE0H9QCE63MQ199BM8GXWV24E13G9J381F.mia-meme-token-mobile-legend::MIA',
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
      assetId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex',
      contractId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://cdn.alexlab.co/logos/ALEX_Token.png',
      name: 'ALEX Token',
      symbol: 'ALEX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-alex',
        assetId: {
          protocol: 'sip10',
          id: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(11.00214017602061),
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
          amount: BigNumber(11.00214017602061),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(11.00214017602061),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(2042080991),
          symbol: 'ALEX',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'ALEX',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'ALEX',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(2042080991),
          symbol: 'ALEX',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(2042080991),
          symbol: 'ALEX',
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
      assetId: 'SP230YPRBE81PK88VXHF25VXP4J0VJV5YJVJAS2DY.giggle-economy::Giggle',
      contractId: 'SP230YPRBE81PK88VXHF25VXP4J0VJV5YJVJAS2DY.giggle-economy',
      decimals: 2,
      hasMemo: true,
      imageCanonicalUri: 'https://gaia.hiro.so/hub/1N97svAoFQbSq8e5oWUbH63gCGixgyet1j/gigle.png',
      name: 'Giggle Economy',
      symbol: 'Giggle',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-giggle',
        assetId: {
          protocol: 'sip10',
          id: 'SP230YPRBE81PK88VXHF25VXP4J0VJV5YJVJAS2DY.giggle-economy::Giggle',
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
      assetId: 'SP3WPNAEBYMX06RQNNYTH5PTJ1FRGX5A13ZZMZ01D.dogwifhat-token::wif',
      contractId: 'SP3WPNAEBYMX06RQNNYTH5PTJ1FRGX5A13ZZMZ01D.dogwifhat-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/Qmbex1YoBbKvsZLjUrAL7QnswSFQSS1VrYs8JTs2Dhjvy2',
      name: 'dogwifhat',
      symbol: 'WIF',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wif',
        assetId: {
          protocol: 'sip10',
          id: 'SP3WPNAEBYMX06RQNNYTH5PTJ1FRGX5A13ZZMZ01D.dogwifhat-token::wif',
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
      assetId: 'SP256VGYK7ZFV6S2ZWHGE4PGMDDY8KWT3FD57H98G.pizza::PIZZA',
      contractId: 'SP256VGYK7ZFV6S2ZWHGE4PGMDDY8KWT3FD57H98G.pizza',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/hKOOpRdX-pngegg.png',
      name: 'PIZZA',
      symbol: 'PIZZA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-pizza',
        assetId: {
          protocol: 'sip10',
          id: 'SP256VGYK7ZFV6S2ZWHGE4PGMDDY8KWT3FD57H98G.pizza::PIZZA',
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
      assetId: 'SP5BDPA6AJEVER227D8H8EMX5MXKKV5FT5C0YX6M.shibatoshi::TOSHI',
      contractId: 'SP5BDPA6AJEVER227D8H8EMX5MXKKV5FT5C0YX6M.shibatoshi',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/NzLLVlAR-WhatsApp-Image-2024-10-06-at-11-38-38-c85573ad.jpg',
      name: 'Shibatoshi',
      symbol: 'TOSHI',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-toshi',
        assetId: {
          protocol: 'sip10',
          id: 'SP5BDPA6AJEVER227D8H8EMX5MXKKV5FT5C0YX6M.shibatoshi::TOSHI',
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
      assetId: 'SP1H82REZA4A4X007YTSF47PD8DPYCEHR6F8NCBTN.vladmir-puton::PUTON',
      contractId: 'SP1H82REZA4A4X007YTSF47PD8DPYCEHR6F8NCBTN.vladmir-puton',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/zXugFUwd-GRRIxxrWEAAIH-2-1-.jpg',
      name: 'Vladmir Puton',
      symbol: 'PUTON',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-puton',
        assetId: {
          protocol: 'sip10',
          id: 'SP1H82REZA4A4X007YTSF47PD8DPYCEHR6F8NCBTN.vladmir-puton::PUTON',
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
      assetId: 'SP2ZYR2314Z50MZF2K5N0266R1JX6VDZR9P501Z9B.stacks-army-token::stxARMY',
      contractId: 'SP2ZYR2314Z50MZF2K5N0266R1JX6VDZR9P501Z9B.stacks-army-token',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/XyyzArFX-photo-2024-11-13-18-34-09.jpg',
      name: 'Stacks ARMY Token',
      symbol: 'stxARMY',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-stxarmy',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZYR2314Z50MZF2K5N0266R1JX6VDZR9P501Z9B.stacks-army-token::stxARMY',
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
      assetId: 'SP2HH1X2KVS1M0BS15ZE42JXJFWNBVPH7C672XEKP.to-the-moon::MOON',
      contractId: 'SP2HH1X2KVS1M0BS15ZE42JXJFWNBVPH7C672XEKP.to-the-moon',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/RwOVlWbK-WhatsApp-Image-2024-11-10-at-22-32-58-7b708481.jpg',
      name: 'TO THE MOON',
      symbol: 'MOON',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-tothemoon',
        assetId: {
          protocol: 'sip10',
          id: 'SP2HH1X2KVS1M0BS15ZE42JXJFWNBVPH7C672XEKP.to-the-moon::MOON',
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
      assetId: 'SP306GW4ZQVNEZ2TMECB18XR78KRANYY2F63XM87T.baby-leo::BABYLEO',
      contractId: 'SP306GW4ZQVNEZ2TMECB18XR78KRANYY2F63XM87T.baby-leo',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/bNlbAZNL-babyleo.jpg',
      name: 'Baby Leo',
      symbol: 'BABYLEO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wbleo',
        assetId: {
          protocol: 'sip10',
          id: 'SP306GW4ZQVNEZ2TMECB18XR78KRANYY2F63XM87T.baby-leo::BABYLEO',
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
      assetId: 'SP1A7A633VW9RRJK06XX9VRPWT7N20JXHJ947Q5XJ.stacking-gecko::GECKO',
      contractId: 'SP1A7A633VW9RRJK06XX9VRPWT7N20JXHJ947Q5XJ.stacking-gecko',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/ZucbVQJR-pngegg.png',
      name: 'Stacking Gecko',
      symbol: 'GECKO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-wgecko',
        assetId: {
          protocol: 'sip10',
          id: 'SP1A7A633VW9RRJK06XX9VRPWT7N20JXHJ947Q5XJ.stacking-gecko::GECKO',
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
      assetId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token::usda',
      contractId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'USDA',
      symbol: 'USDA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-usda',
        assetId: {
          protocol: 'sip10',
          id: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token::usda',
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
          amount: BigNumber(10532533),
          symbol: 'USDA',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'USDA',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'USDA',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(10532533),
          symbol: 'USDA',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(10532533),
          symbol: 'USDA',
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
      assetId: 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.mega::mega',
      contractId: 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.mega',
      decimals: 2,
      hasMemo: true,
      imageCanonicalUri: 'ipfs://Qmdgks1HjYZQhF4sTnkoeh7naic7J3G5aHQk91Uq25RwmF',
      name: 'Mega',
      symbol: 'MEGA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-mega',
        assetId: {
          protocol: 'sip10',
          id: 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.mega::mega',
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
      assetId: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.Hashiko::hashiko',
      contractId: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.Hashiko',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri: 'https://storage.googleapis.com/hashiko/hashiko/HashikoHSHKO.png',
      name: 'Hashiko',
      symbol: 'HASHIKO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-hashiko',
        assetId: {
          protocol: 'sip10',
          id: 'SP28NB976TJHHGF4218KT194NPWP9N1X3WY516Z1P.Hashiko::hashiko',
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
          amount: BigNumber(144400000),
          symbol: 'HASHIKO',
          decimals: 0,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'HASHIKO',
          decimals: 0,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'HASHIKO',
          decimals: 0,
        },
        pendingBalance: {
          amount: BigNumber(144400000),
          symbol: 'HASHIKO',
          decimals: 0,
        },
        availableBalance: {
          amount: BigNumber(144400000),
          symbol: 'HASHIKO',
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
      canTransfer: true,
      assetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token::charisma',
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://charisma.rocks/charisma-logo-square.png',
      name: 'Charisma',
      symbol: 'CHA',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-charisma',
        assetId: {
          protocol: 'sip10',
          id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token::charisma',
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
          amount: BigNumber(4136),
          symbol: 'CHA',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'CHA',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'CHA',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(4136),
          symbol: 'CHA',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(4136),
          symbol: 'CHA',
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
      assetId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-19::token-19',
      contractId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-19',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: '',
      name: '',
      symbol: '',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-bome',
        assetId: {
          protocol: 'sip10',
          id: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-19::token-19',
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
      assetId: 'SP3R4MHK99JAAM0N3T0CBZRZVSVQFG1N75DQ08JSD.nakamoto::nakamoto',
      contractId: 'SP3R4MHK99JAAM0N3T0CBZRZVSVQFG1N75DQ08JSD.nakamoto',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/Qmc67nU3ANzq1bGLssAEGSoy51Kx6VCoyRR1jyUT72E5jg',
      name: 'nakamoto',
      symbol: 'nakamoto',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-nakamoto',
        assetId: {
          protocol: 'sip10',
          id: 'SP3R4MHK99JAAM0N3T0CBZRZVSVQFG1N75DQ08JSD.nakamoto::nakamoto',
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
      assetId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.auto-alex-v3::auto-alex-v3',
      contractId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.auto-alex-v3',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/auto-alex-v3',
      name: 'LiALEX',
      symbol: 'LiALEX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-lialex',
        assetId: {
          protocol: 'sip10',
          id: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.auto-alex-v3::auto-alex-v3',
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
          amount: BigNumber(879794641),
          symbol: 'LiALEX',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'LiALEX',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'LiALEX',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(879794641),
          symbol: 'LiALEX',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(879794641),
          symbol: 'LiALEX',
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
      assetId: 'SP2VNZNV7SPZSRDK4FNXM0A0DA43Y16TC9J68Q7CB.hodl-on-stacks::HODL',
      contractId: 'SP2VNZNV7SPZSRDK4FNXM0A0DA43Y16TC9J68Q7CB.hodl-on-stacks',
      decimals: 3,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/IVklxXxN-photo-2024-11-16-23-41-07.jpg',
      name: 'HODL ON STACKS',
      symbol: 'HODL',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-hodlStx',
        assetId: {
          protocol: 'sip10',
          id: 'SP2VNZNV7SPZSRDK4FNXM0A0DA43Y16TC9J68Q7CB.hodl-on-stacks::HODL',
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
      assetId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-psBTC::bridge-token',
      contractId: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-psBTC',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmagU1U2M8GERRkRSRKn5q4vXUCFvXWMG5G3BhiXBfDXK6',
      name: 'psBTC',
      symbol: 'psBTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-psBTC-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-psBTC::bridge-token',
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
      assetId: 'SP351ZJK9F5AWZJEEZGZ7NZKSRKA65EWFRR48V9KS.ALL::ALL',
      contractId: 'SP351ZJK9F5AWZJEEZGZ7NZKSRKA65EWFRR48V9KS.ALL',
      decimals: 0,
      hasMemo: false,
      imageCanonicalUri: '',
      name: 'Son Of STX10',
      symbol: 'ALL',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-all',
        assetId: {
          protocol: 'sip10',
          id: 'SP351ZJK9F5AWZJEEZGZ7NZKSRKA65EWFRR48V9KS.ALL::ALL',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ornj::brc20-ornj',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ornj',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/brc20-ornj',
      name: 'ORNJ (BRC20)',
      symbol: 'ORNJ',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-ornj',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ornj::brc20-ornj',
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
      assetId: 'SP1JFFSYTSH7VBM54K29ZFS9H4SVB67EA8VT2MYJ9.gus-token::gus',
      contractId: 'SP1JFFSYTSH7VBM54K29ZFS9H4SVB67EA8VT2MYJ9.gus-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://ipfs.io/ipfs/QmYfXyUPpJWtHX5AcsuRpRnBo6cL2cNALusbwEwpCFK8Jh',
      name: 'Gus',
      symbol: 'GUS',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-gus',
        assetId: {
          protocol: 'sip10',
          id: 'SP1JFFSYTSH7VBM54K29ZFS9H4SVB67EA8VT2MYJ9.gus-token::gus',
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
      assetId: 'SP3951VNPC55BMS9RCF6SKRZP4K3Q2PQ2RSM1DD1V.fast::fast',
      contractId: 'SP3951VNPC55BMS9RCF6SKRZP4K3Q2PQ2RSM1DD1V.fast',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://nftstorage.link/ipfs/bafybeia2rmjcaq7ri7jdobpwfiztaxykgh7zz7pealmqnrmjkpcswdnoi4',
      name: 'Fast',
      symbol: 'FAST',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-fast',
        assetId: {
          protocol: 'sip10',
          id: 'SP3951VNPC55BMS9RCF6SKRZP4K3Q2PQ2RSM1DD1V.fast::fast',
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
      assetId: 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx::lqstx',
      contractId: 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-wlqstx',
      name: 'LiSTX',
      symbol: 'LiSTX',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-listx',
        assetId: {
          protocol: 'sip10',
          id: 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx::lqstx',
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
          amount: BigNumber(10390787),
          symbol: 'LiSTX',
          decimals: 6,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'LiSTX',
          decimals: 6,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'LiSTX',
          decimals: 6,
        },
        pendingBalance: {
          amount: BigNumber(10390787),
          symbol: 'LiSTX',
          decimals: 6,
        },
        availableBalance: {
          amount: BigNumber(10390787),
          symbol: 'LiSTX',
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
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-trio::brc20-trio',
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-trio',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/brc20-trio',
      name: 'TRIO (BRC20)',
      symbol: 'TRIO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-trio',
        assetId: {
          protocol: 'sip10',
          id: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-trio::brc20-trio',
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
          amount: BigNumber(459280),
          symbol: 'TRIO',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'TRIO',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'TRIO',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(459280),
          symbol: 'TRIO',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(459280),
          symbol: 'TRIO',
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
      assetId: 'SP25JXH48YHJPE8R48S3AWVYPSB3N3ZG9PRKQZHSF.whales-coin::WHALE',
      contractId: 'SP25JXH48YHJPE8R48S3AWVYPSB3N3ZG9PRKQZHSF.whales-coin',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/ghSOktpL-photo-2024-10-07-15-05-04.jpg',
      name: 'Whales coin',
      symbol: 'WHALE',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-whale',
        assetId: {
          protocol: 'sip10',
          id: 'SP25JXH48YHJPE8R48S3AWVYPSB3N3ZG9PRKQZHSF.whales-coin::WHALE',
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
      assetId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-ssko::bridged-sko',
      contractId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-ssko',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-ssko',
      name: 'SKO',
      symbol: 'SKO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-sko',
        assetId: {
          protocol: 'sip10',
          id: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-ssko::bridged-sko',
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
      assetId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.welsh-moon-stxcity::MOON',
      contractId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.welsh-moon-stxcity',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/iXVibdqm-welsh.webp',
      name: 'WELSH MOON',
      symbol: 'MOON',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-MOON-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.welsh-moon-stxcity::MOON',
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
      assetId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc::bridged-btc',
      contractId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-abtc',
      name: 'aBTC',
      symbol: 'aBTC',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-abtc',
        assetId: {
          protocol: 'sip10',
          id: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc::bridged-btc',
        },
      },
    ],
    balance: {
      quote: {
        totalBalance: {
          amount: BigNumber(350.9888),
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
          amount: BigNumber(350.9888),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(350.9888),
          symbol: 'USD',
          decimals: 2,
        },
      },
      crypto: {
        totalBalance: {
          amount: BigNumber(3400),
          symbol: 'aBTC',
          decimals: 8,
        },
        inboundBalance: {
          amount: BigNumber(0),
          symbol: 'aBTC',
          decimals: 8,
        },
        outboundBalance: {
          amount: BigNumber(0),
          symbol: 'aBTC',
          decimals: 8,
        },
        pendingBalance: {
          amount: BigNumber(3400),
          symbol: 'aBTC',
          decimals: 8,
        },
        availableBalance: {
          amount: BigNumber(3400),
          symbol: 'aBTC',
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
      assetId: 'SPQT2PNZVZVYT4JV8CDY014HT3PN0YJT0T6GVQJ0.trump-wif-snacks::TRUMPWIF',
      contractId: 'SPQT2PNZVZVYT4JV8CDY014HT3PN0YJT0T6GVQJ0.trump-wif-snacks',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/TZblSqWy-uncivilized-alex-a-cartoon-of-a-full-size-donald-trump-eating-a-43924b90-2908-4e43-95a9-9bbf69c6e156.png',
      name: 'Trump Wif Snacks',
      symbol: 'TRUMPWIF',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-snack',
        assetId: {
          protocol: 'sip10',
          id: 'SPQT2PNZVZVYT4JV8CDY014HT3PN0YJT0T6GVQJ0.trump-wif-snacks::TRUMPWIF',
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
      assetId: 'SPZXE76HAF3621C4RQGHJ26ENXGEZV2JWAV2Y10Z.jindo::jindo',
      contractId: 'SPZXE76HAF3621C4RQGHJ26ENXGEZV2JWAV2Y10Z.jindo',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://images.ctfassets.net/ot3t2ji3dis3/7cUT5qbVT5M7nVT6EiLmkn/ff5ec74f8e274f1318cc4c585ecaf0b1/Jindo.png',
      name: 'Jindo',
      symbol: 'JINDO',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-jindo',
        assetId: {
          protocol: 'sip10',
          id: 'SPZXE76HAF3621C4RQGHJ26ENXGEZV2JWAV2Y10Z.jindo::jindo',
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
      assetId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.bitflow-token-2::kinq',
      contractId: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.bitflow-token-2',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/token_logo/toikztiH-lion.jpg',
      name: 'KING',
      symbol: 'kinq',
    },
    providerAssets: [
      {
        providerId: 'bitflow-sdk',
        providerAssetId: 'token-kinq-auto',
        assetId: {
          protocol: 'sip10',
          id: 'SP2QGQ3R0RH96SEGEV6YBK8QDPF7CQ0ATC2E7FH67.bitflow-token-2::kinq',
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
          amount: BigNumber(90502.41997369333068492),
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
          amount: BigNumber(90502.41997369333068492),
          symbol: 'USD',
          decimals: 2,
        },
        availableBalance: {
          amount: BigNumber(87291.93079154333077887),
          symbol: 'USD',
          decimals: 2,
        },
        protectedBalance: {
          amount: BigNumber(2033.2528614999999405),
          symbol: 'USD',
          decimals: 2,
        },
        uneconomicalBalance: {
          amount: BigNumber(3210.48918214999990605),
          symbol: 'USD',
          decimals: 2,
        },
        unspendableBalance: {
          amount: BigNumber(3210.48918214999990605),
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
