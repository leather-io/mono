import { CollectibleItemLayoutLegacy, CollectibleItemLayoutLegacyProps } from './collectible-item.layout-legacy';
import { CollectibleTextLayoutLegacy } from './collectible-text.layout-legacy';

interface CollectibleTextProps extends Omit<CollectibleItemLayoutLegacyProps, 'children'> {
  icon: React.JSX.Element;
  content: string;
}
export function CollectibleTextLegacy(props: CollectibleTextProps) {
  const { content, icon, ...rest } = props;
  return (
    <CollectibleItemLayoutLegacy collectibleTypeIcon={icon} {...rest}>
      <CollectibleTextLayoutLegacy>{content}</CollectibleTextLayoutLegacy>
    </CollectibleItemLayoutLegacy>
  );
}
