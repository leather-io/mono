import { ReactElement } from 'react';

import { Box } from 'leather-styles/jsx';

import { CollectibleItemLayout, CollectibleItemLayoutProps } from './collectible-item.layout.web';

interface CollectibleOtherProps extends Omit<CollectibleItemLayoutProps, 'children'> {
  children: ReactElement;
}
export function CollectibleOther({ children, ...props }: CollectibleOtherProps) {
  return (
    <CollectibleItemLayout {...props}>
      <Box
        alignItems="center"
        bg="black"
        display="flex"
        height="100%"
        justifyContent="center"
        width="100%"
      >
        {children}
      </Box>
    </CollectibleItemLayout>
  );
}
