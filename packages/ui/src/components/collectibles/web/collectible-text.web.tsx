import { CollectibleItemLayout, CollectibleItemLayoutProps } from './collectible-item.layout.web';
import { CollectibleTextLayout } from './collectible-text.layout.web';

interface CollectibleTextProps extends Omit<CollectibleItemLayoutProps, 'children'> {
  icon: React.JSX.Element;
  content: string;
}
export function CollectibleText(props: CollectibleTextProps) {
  const { content, icon, ...rest } = props;
  return (
    <CollectibleItemLayout collectibleTypeIcon={icon} {...rest}>
      <CollectibleTextLayout>{content}</CollectibleTextLayout>
    </CollectibleItemLayout>
  );
}
