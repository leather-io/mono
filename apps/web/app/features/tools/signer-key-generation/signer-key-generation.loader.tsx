import { V2PoxInfoResponse } from '@stacks/stacking';
import { useGetPoxInfoQuery } from '~/features/stacking/hooks/stacking.query';

interface SignerKeyGenerationLoaderProps {
  children(data: { poxInfo: V2PoxInfoResponse }): React.ReactNode;
}
export function SignerKeyGenerationLoader(props: SignerKeyGenerationLoaderProps) {
  const { data: poxInfo } = useGetPoxInfoQuery();
  if (!poxInfo) return null;
  return props.children({ poxInfo });
}
