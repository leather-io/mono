import { t } from '@lingui/macro';

import { FeeTypes } from '@leather.io/models';
import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
} from '@leather.io/ui/native';
import { match } from '@leather.io/utils';

export type ApproverState = 'start' | 'submitting' | 'submitted';

function getBaseFeeData(feeType: FeeTypes) {
  const feeMatcher = match<FeeTypes>();
  const icon = feeMatcher(feeType, {
    [FeeTypes.Low]: <AnimalSnailIcon />,
    [FeeTypes.Middle]: <AnimalRabbitIcon />,
    [FeeTypes.High]: <AnimalEagleIcon />,
    [FeeTypes.Custom]: <AnimalChameleonIcon />,
    [FeeTypes.Unknown]: <AnimalChameleonIcon />,
  });

  const title = feeMatcher(feeType, {
    [FeeTypes.Low]: t({
      id: 'approver.fee.type.low',
      message: 'Slow',
    }),
    [FeeTypes.Middle]: t({
      id: 'approver.fee.type.middle',
      message: 'Standard',
    }),
    [FeeTypes.High]: t({
      id: 'approver.fee.type.high',
      message: 'Fast',
    }),
    [FeeTypes.Custom]: t({
      id: 'approver.fee.type.custom',
      message: 'Custom',
    }),
    [FeeTypes.Unknown]: t({
      id: 'approver.fee.type.unknown',
      message: 'Unknown',
    }),
  });
  return { icon, title };
}

export function getBitcoinFeeData(feeType: FeeTypes) {
  const feeMatcher = match<FeeTypes>();
  const { icon, title } = getBaseFeeData(feeType);
  const time = feeMatcher(feeType, {
    [FeeTypes.Low]: t({
      id: 'approver.bitcoin.fee.speed.low',
      message: '~40 mins',
    }),
    [FeeTypes.Middle]: t({
      id: 'approver.bitcoin.fee.speed.middle',
      message: '~20 mins',
    }),
    [FeeTypes.High]: t({
      id: 'approver.bitcoin.fee.speed.high',
      message: '~10 mins',
    }),
    [FeeTypes.Custom]: t({
      id: 'approver.fee.speed.custom',
      message: 'Custom',
    }),
    [FeeTypes.Unknown]: t({
      id: 'approver.fee.speed.unknown',
      message: 'Unknown',
    }),
  });
  return {
    icon,
    title,
    time,
  };
}

export function getStacksFeeData(feeType: FeeTypes) {
  const feeMatcher = match<FeeTypes>();
  const { icon, title } = getBaseFeeData(feeType);
  const time = feeMatcher(feeType, {
    [FeeTypes.Low]: t({
      id: 'approver.stacks.fee.speed.low',
      message: '~40 mins',
    }),
    [FeeTypes.Middle]: t({
      id: 'approver.stacks.fee.speed.middle',
      message: '~20 mins',
    }),
    [FeeTypes.High]: t({
      id: 'approver.stacks.fee.speed.high',
      message: '~10 mins',
    }),
    [FeeTypes.Custom]: t({
      id: 'approver.fee.speed.custom',
      message: 'Custom',
    }),
    [FeeTypes.Unknown]: t({
      id: 'approver.fee.speed.unknown',
      message: 'Unknown',
    }),
  });
  return {
    icon,
    title,
    time,
  };
}
