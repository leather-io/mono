import { styled } from 'leather-styles/jsx';

import { ItemLayoutWithButtons, Switch } from '@leather.io/ui';

interface NetworkListSwitchProps {
  title: string;
  caption: string;
  onClick(): void;
  isEnabled: boolean;
}

export function NetworkListSwitch({ title, caption, onClick, ...props }: NetworkListSwitchProps) {
  return (
    <styled.button
      _hover={{
        backgroundColor: 'ink.component-background-hover',
      }}
      mx="-space.05"
      px="space.05"
      py="space.03"
      borderRadius="xs"
      onClick={onClick}
    >
      <ItemLayoutWithButtons
        title={title}
        caption={caption}
        buttons={
          <Switch.Root checked={props.isEnabled}>
            <Switch.Thumb />
          </Switch.Root>
        }
      />
    </styled.button>
  );
}
