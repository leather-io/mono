import { ReactNode } from 'react';

import { FeeBadge } from '@/features/send/fee-badge';
import { t } from '@lingui/macro';

import { FeeTypes } from '@leather.io/models';
import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
  Avatar,
  Box,
  ChevronRightIcon,
  Flag,
  ItemLayout,
  Pressable,
  Text,
} from '@leather.io/ui/native';
import { match } from '@leather.io/utils';

export function FeeCard({ feeType }: { feeType: FeeTypes }) {
  const matchFeeType = match<FeeTypes>();
  const feeIcon = matchFeeType<ReactNode>(feeType, {
    [FeeTypes.Low]: <AnimalSnailIcon />,
    [FeeTypes.Middle]: <AnimalRabbitIcon />,
    [FeeTypes.High]: <AnimalEagleIcon />,
    [FeeTypes.Custom]: <AnimalChameleonIcon />,
    [FeeTypes.Unknown]: <AnimalChameleonIcon />,
  });
  return (
    <>
      <Box flexDirection="row">
        <Text variant="label01">
          {t({
            id: 'approver.fee.title',
            message: 'Fee',
          })}
        </Text>
        <FeeBadge type="normal" />
      </Box>
      <Pressable flexDirection="row" onPress={() => {}} py="3">
        <Flag
          img={
            <Avatar bg="ink.background-secondary" p="1">
              {feeIcon}
            </Avatar>
          }
        >
          <ItemLayout
            titleLeft={t({
              id: 'approver.fee.type.normal',
              message: 'Normal',
            })}
            captionLeft={t({
              id: 'approver.fee.speed.normal',
              message: '~20 mins',
            })}
            titleRight="0.000034 BTC"
            captionRight="$ 1.65"
            actionIcon={<ChevronRightIcon />}
          />
        </Flag>
      </Pressable>
    </>
  );
}
