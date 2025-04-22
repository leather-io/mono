import { Box, styled } from 'leather-styles/jsx';

import { StackExtendInfo } from '../direct-stacking-info/get-has-pending-stack-extend';

interface PendingStackExtendAlertProps {
  pendingStackExtend: StackExtendInfo;
}

export function PendingStackExtendAlert({ pendingStackExtend }: PendingStackExtendAlertProps) {
  return (
    <Box>
      <styled.p textStyle="label.02">
        Waiacking-info-grid.layout.tsxting for transaction confirmation
      </styled.p>
      <styled.p>
        A stacking request was successfully submitted to the blockchain. Once confirmed, your STX
        will be stacking for an extra {pendingStackExtend.extendCycles.toString()} cycles.
      </styled.p>
    </Box>
  );
}
