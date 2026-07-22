import { serializeCV, tupleCV, uintCV } from '@stacks/transactions';

const signerManagerBasePath =
  'https://api.hiro.so/v2/contracts/call-read/SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP/pox5-signer-manager-placeholder';

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
