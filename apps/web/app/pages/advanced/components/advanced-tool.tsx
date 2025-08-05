import { HTMLStyledProps, styled } from 'leather-styles/jsx';

function AdvancedListRoot(props: HTMLStyledProps<'ul'>) {
  return (
    <styled.ul display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="space.03" {...props} />
  );
}

interface AdvancedToolItemProps extends HTMLStyledProps<'li'> {
  name: string;
  description: string;
}
function AdvancedToolItem(props: AdvancedToolItemProps) {
  const { name, description, ...rest } = props;

  return (
    <styled.li
      borderRadius="xs"
      border="default"
      p="space.03"
      _hover={{ borderColor: 'ink.action-primary-hover' }}
      {...rest}
    >
      <styled.strong textStyle="label.01">{name}</styled.strong>
      <styled.p textStyle="caption.01">{description}</styled.p>
    </styled.li>
  );
}

export const AdvancedTool = {
  Root: AdvancedListRoot,
  Item: AdvancedToolItem,
};
