import { ReactElement, ReactNode, cloneElement } from 'react';

import { useTheme } from '@shopify/restyle';

import {
  Avatar,
  ChevronRightIcon,
  Flag,
  IconProps,
  ItemLayout,
  RadioButton,
  Theme,
  Switch as UISwitch,
} from '../../../native';
import { Pressable, PressableProps } from '../button/pressable.native';
import { RadioButtonProps } from '../radio-button/radio-button.native';
import { SwitchProps } from '../switch/switch.native';

interface CellProps extends PressableProps<Theme> {
  caption?: string;
  icon?: ReactElement<IconProps>;
  title: string;
  children: NonNullable<ReactNode>;
}

export function Root({ caption, icon, title, children, ...props }: CellProps) {
  const theme = useTheme<Theme>();
  const itemLayout = <ItemLayout actionIcon={children} captionLeft={caption} titleLeft={title} />;
  const defaultColor: string = theme.colors['ink.text-primary'];

  const content = icon ? (
    <Flag
      img={
        <Avatar>
          {cloneElement<IconProps>(icon, {
            color: icon.props.color ?? defaultColor,
          })}
        </Avatar>
      }
    >
      {itemLayout}
    </Flag>
  ) : (
    itemLayout
  );

  return (
    <Pressable flexDirection="row" {...props}>
      {content}
    </Pressable>
  );
}

function Chevron() {
  return <ChevronRightIcon variant="small" />;
}

function Switch(props: SwitchProps) {
  return <UISwitch {...props} />;
}

function Radio(props: RadioButtonProps) {
  return <RadioButton disabled {...props} />;
}

export const Cell = {
  Root,
  Chevron,
  Switch,
  Radio,
};
