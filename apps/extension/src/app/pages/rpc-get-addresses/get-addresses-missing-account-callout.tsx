import { type GetAddressesChain } from '@leather.io/rpc';
import { Callout } from '@leather.io/ui';

import { capitalize } from '@app/common/utils';

interface GetAddressesMissingAccountCalloutProps {
  missingChain: GetAddressesChain;
  hasAvailableRequestedChain: boolean;
}
export function GetAddressesMissingAccountCallout({
  missingChain,
  hasAvailableRequestedChain,
}: GetAddressesMissingAccountCalloutProps) {
  const missingChainName = capitalize(missingChain);
  const availableChainName = missingChain === 'bitcoin' ? 'Stacks' : 'Bitcoin';

  const title = hasAvailableRequestedChain
    ? `Connecting with ${availableChainName} only`
    : `${missingChainName} account not found`;

  const body = hasAvailableRequestedChain
    ? `This wallet doesn't have a ${missingChainName} account. To also connect with ${missingChainName}, add your ${missingChainName} account in Leather, then reconnect to this app.`
    : `This app asked to connect your ${missingChainName} account, but it hasn't been added to this wallet yet. To add it, open Leather and select "Connect ${missingChainName}" on the homepage, then retry.`;

  return (
    <Callout
      data-testid="get-addresses-missing-account-callout"
      mt="space.03"
      mb="space.05"
      width="100%"
      variant="warning"
      title={title}
    >
      {body}
    </Callout>
  );
}
