import { Flex, FlexProps } from 'leather-styles/jsx';

import { Spinner } from './spinner.web';

export function LoadingSpinner(props: { size?: string } & FlexProps) {
  return (
    <Flex alignItems="center" flexGrow={1} justifyContent="center" width="100%" {...props}>
      <Spinner size={props.size} />
    </Flex>
  );
}
