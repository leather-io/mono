import { styled } from 'leather-styles/jsx';

import { SignInItem } from './sign-in-item';
import type { ChainConnection } from './use-chain-connection';

export function ChooseChainMenu({ chains }: { chains: ChainConnection[] }) {
  return (
    <>
      <styled.div px="space.03" py="space.02">
        <styled.p textStyle="label.02">Choose a chain to connect</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          Multisig uses chain-native signing — connect each chain independently.
        </styled.p>
      </styled.div>
      {chains.map(c => (
        <SignInItem key={c.chain} connection={c} detailed />
      ))}
    </>
  );
}
