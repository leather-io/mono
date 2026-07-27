import { serializeCV, tupleCV, uintCV } from '@stacks/transactions';

const signerManagerBasePath =
  'https://api.testnet-pox5.hiro.so/v2/contracts/call-read/ST3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SK5QGMWP/signer-manager';

const earnedRewardsResult = tupleCV({
  earned: uintCV(12_500n),
  fees: uintCV(625n),
});

export const pox5GetEarnedStakerRewardsHandler = {
  path: `${signerManagerBasePath}/get-earned-staker-rewards`,
  resp: { okay: true, result: `0x${serializeCV(earnedRewardsResult)}` },
  method: 'post',
} as const;

// Default: no L1 payout preference registered; rewards accrue as sBTC.
export const pox5GetPoxAddrHandler = {
  path: `${signerManagerBasePath}/get-pox-addr`,
  resp: { okay: true, result: '0x09' },
  method: 'post',
} as const;
