import { ImgFillLoader } from '~/components/img-loader';

import {
  NetworkInstanceToLiquidContractMap,
  Protocol,
  ProtocolName,
} from './types-preset-protocols';

export const protocols: Record<ProtocolName, Protocol> = {
  ['Stacking DAO']: {
    name: 'Stacking DAO',
    description:
      'Enjoy automatic protocol operations and auto-compounded yield.' +
      ' ' +
      'Locked STX will stay stacked indefinitely.',
    duration: 1,
    website: 'https://www.stackingdao.com',
    liquidContract: 'WrapperStackingDAO',
    liquidToken: 'ST_STX',
    protocolAddress: {
      mainnet: NetworkInstanceToLiquidContractMap['mainnet']['WrapperStackingDAO'],
      testnet: NetworkInstanceToLiquidContractMap['testnet']['WrapperStackingDAO'],
      devnet: NetworkInstanceToLiquidContractMap['devnet']['WrapperStackingDAO'],
    },
    minimumDelegationAmount: 1_000_000,
    icon: <ImgFillLoader src="/icons/stacking-dao.webp" width="32" fill="black" />,
  },
  Lisa: {
    name: 'Lisa',
    description: 'See your balance increase automatically and always exchange at 1 STX to 1 LiSTX',
    duration: 1,
    website: 'https://www.lisalab.io/',
    liquidContract: 'Lisa',
    liquidToken: 'LI_STX',
    protocolAddress: {
      mainnet: NetworkInstanceToLiquidContractMap['mainnet']['Lisa'],
      testnet: NetworkInstanceToLiquidContractMap['testnet']['Lisa'],
      devnet: NetworkInstanceToLiquidContractMap['devnet']['Lisa'],
    },
    minimumDelegationAmount: 1_000_000,
    icon: <ImgFillLoader src="/icons/lisa.webp" width="32" fill="black" />,
  },
};
