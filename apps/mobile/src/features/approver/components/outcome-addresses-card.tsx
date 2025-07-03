import { AddressDisplayer, Avatar, Flag, UsersTwoIcon } from '@leather.io/ui/native';

// TODO: Bitcoin?
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
      {addresses.map(address => (
        <BitcoinAddress key={address} address={address} />
      ))}
    </>
  );
}
