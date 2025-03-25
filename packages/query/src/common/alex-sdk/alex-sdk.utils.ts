import { AlexSDK } from 'alex-sdk';

import { createMoney } from '@leather.io/utils';

export const alex = new AlexSDK();

export const defaultSwapFee = createMoney(1000000, 'STX');
