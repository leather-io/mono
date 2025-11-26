import { Box } from 'leather-styles/jsx';

import { CollectibleItemLayoutLegacy, CollectibleItemLayoutLegacyProps } from './collectible-item.layout-legacy';

interface CollectibleOtherProps extends Omit<CollectibleItemLayoutLegacyProps, 'children'> {
  children: React.JSX.Element;
}
export function CollectibleOtherLegacy({ children, ...props }: CollectibleOtherProps) {
  return (
    <CollectibleItemLayoutLegacy {...props}>
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
    </CollectibleItemLayoutLegacy>
  );
}
