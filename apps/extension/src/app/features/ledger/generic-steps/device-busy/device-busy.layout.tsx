import { Box } from 'leather-styles/jsx';

import { AddressDisplayer } from '@leather.io/ui';

import { ConnectLedgerSuccess } from '@app/features/ledger/illustrations/ledger-illu-success';

import { LedgerWrapper } from '../../components/ledger-wrapper';
import { LookingForLedgerLabel } from '../../components/looking-for-ledger-label';

interface DeviceBusyLayoutProps {
  activityDescription: string;
  address?: string;
}
export function DeviceBusyLayout(props: DeviceBusyLayoutProps) {
  const { activityDescription, address } = props;

  return (
    <LedgerWrapper>
      <ConnectLedgerSuccess />
      <LookingForLedgerLabel my="space.06">{activityDescription}</LookingForLedgerLabel>
      {address && (
        <Box width="100%">
          <AddressDisplayer address={address} justifyContent="center" />
        </Box>
      )}
    </LedgerWrapper>
  );
}
