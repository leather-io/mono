import { t } from '@lingui/macro';

import { BitcoinAddress } from '@leather.io/models';
import { AddressDisplayer, Avatar, Flag, Text, UsersTwoIcon } from '@leather.io/ui/native';

interface OutcomeAddressesCardArgs {
  addresses: BitcoinAddress[] | string[];
}

export function OutcomeAddressesCard({ addresses }: OutcomeAddressesCardArgs) {
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.outcomes.title2',
          message: 'To address',
        })}
      </Text>
      {addresses.map(address => (
        <Flag key={address} py="3" img={<Avatar icon={<UsersTwoIcon />} />}>
          <AddressDisplayer address={address} />
        </Flag>
      ))}
    </>
  );
}
