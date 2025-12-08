import { getStacksExplorerLink } from '@leather.io/features';
import { ChainId } from '@leather.io/models';
import { Link } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

interface PrincipalValueProps {
  address: string;
}
export function PrincipalValue(props: PrincipalValueProps) {
  const { address } = props;
  const { chain, isNakamotoTestnet } = useCurrentNetworkState();

  return (
    <Link
      onClick={() =>
        openInNewTab(
          getStacksExplorerLink({
            mode: chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet',
            type: 'address',
            value: address,
            isNakamoto: isNakamotoTestnet,
          })
        )
      }
      size="sm"
      variant="text"
      wordBreak="break-all"
    >
      {address}
    </Link>
  );
}
