import { styled } from 'leather-styles/jsx';

import { inferPrincipalTypeFromAddress } from '@leather.io/stacks';

import { FormAddressDisplayer } from './form-address-displayer';

interface StacksAddressDisplayerProps {
  address: string;
}

export function StacksAddressDisplayer({ address }: StacksAddressDisplayerProps) {
  const principalType = inferPrincipalTypeFromAddress(address);

  if (principalType === 'standard') {
    return <FormAddressDisplayer address={address} />;
  }

  if (principalType === 'contract') {
    return (
      <styled.code
        ml="space.03"
        textAlign="right"
        textStyle="label.02"
        fontVariant="tabular-nums"
        lineHeight={1.5}
      >
        {address.replace('.', '\n.')}
      </styled.code>
    );
  }

  return null;
}
