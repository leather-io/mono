'use client';

import { Address } from '@leather.io/rpc';

import { Section } from './section';

export function GetAddressesSection({
  addresses,
  setAddresses,
  isSignedIn,
}: {
  addresses: Address[];
  setAddresses(addresses: Address[]): void;
  isSignedIn: boolean;
}) {
  return (
    <Section>
      <div className="p-2">
        {isSignedIn
          ? addresses.map(address => {
            return (
              <div key={address.address}>
                {address.symbol} {address.address}
              </div>
            );
          })
          : null}
      </div>
      <button
        className="border-2 border-neutral-500 rounded-md p-2"
        onClick={async () => {
          const getAddressesResult = await window.LeatherProvider.request('getAddresses');
          setAddresses(getAddressesResult.result.addresses);
        }}
      >
        getAddresses
      </button>
    </Section>
  );
}
