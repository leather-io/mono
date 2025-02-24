import { t } from '@lingui/macro';

import { AddressDisplayer, Avatar, Flag, Text, UsersTwoIcon } from '@leather.io/ui/native';

function BitcoinAddress({ address }: { address: string }) {
  return (
    <Flag py="3" img={<Avatar icon={<UsersTwoIcon />} />}>
      <AddressDisplayer address={address} />
    </Flag>
  );
}
export function OutcomeAddressesCard({ addresses }: { addresses: string[] }) {
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.outcomes.title2',
          message: 'To address',
        })}
      </Text>
      {addresses.map(address => (
        <BitcoinAddress key={address} address={address} />
      ))}
    </>
  );
}
