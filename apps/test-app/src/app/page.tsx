'use client';

import { useState } from 'react';

import { GetAddressesSection } from '@/components/get-addresses-section';
import { SignPsbtSection } from '@/components/sign-psbt-section';
import { TransferStxSection } from '@/components/transfer-stx-section';
import { initAppServices } from '@/services/init-app-services';
import { queryClient } from '@/services/mobile-http-cache.service';
import { QueryClientProvider } from '@tanstack/react-query';

import { BitcoinNetworkModes } from '@leather.io/models';
import { Address } from '@leather.io/rpc';

// Ended up not needing these services but let's keep it here just in case
initAppServices();

const networkOptions = ['mainnet', 'testnet3', 'testnet4'] as BitcoinNetworkModes[];

export default function Home() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [network] = useState(networkOptions[0]);
  const isSignedIn = addresses.length !== 0;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-row flex-wrap gap-8 row-start-2 items-center">
          {/* TODO: currently only works on mainnet, would be nice to enable testnet too */}
          {/* <Select */}
          {/*   value={network} */}
          {/*   onChange={net => setNetwork(net as BitcoinNetworkModes)} */}
          {/*   options={networkOptions.map(net => ({ value: net, label: net }))} */}
          {/* /> */}
          <GetAddressesSection
            isSignedIn={isSignedIn}
            addresses={addresses}
            setAddresses={setAddresses}
          />
          {isSignedIn && <TransferStxSection network={network} />}
          {isSignedIn && <SignPsbtSection addresses={addresses} network={network} />}
        </main>
      </div>
    </QueryClientProvider>
  );
}
