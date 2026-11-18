import type BigNumber from 'bignumber.js';

const transfersPerSendAndRotate = 2;

interface CalculateRotationAmountArgs {
  availableBalance: BigNumber;
  amount: BigNumber;
  feePerTransfer: BigNumber;
}
export function calculateRotationAmount({
  availableBalance,
  amount,
  feePerTransfer,
}: CalculateRotationAmountArgs) {
  return availableBalance.minus(amount).minus(feePerTransfer.times(transfersPerSendAndRotate));
}
