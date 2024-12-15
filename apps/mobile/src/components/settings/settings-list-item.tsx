import { ReactNode } from 'react';

import {
  Avatar,
  Cell,
  CellProps,
  ChevronRightIcon,
  RadioButton,
  Switch,
} from '@leather.io/ui/native';

type ItemType = 'simple' | 'switch' | 'radio';

interface ItemBaseProps {
  type?: ItemType;
  title: string;
  caption?: string;
  icon?: ReactNode;
  switchValue?: boolean | undefined;
  onSwitchValueChange?: (value: boolean) => Promise<void> | void | undefined;
  isRadioSelected?: boolean | undefined;
}

interface ItemPropsSimple extends ItemBaseProps {
  type?: 'simple';
}

interface ItemPropsSwitch extends ItemBaseProps {
  type: 'switch';
  onSwitchValueChange: (value: boolean) => Promise<void> | void;
  switchValue: boolean;
}

interface ItemPropsRadio extends ItemBaseProps {
  type: 'radio';
  isRadioSelected: boolean;
}

// TODO: Unnecessarily complicated–narrow down to minimum set of props a setting list item might need
type PickCellProps<P extends CellProps> = Omit<Extract<P, { pressable: true }>, 'pressable'>;

export type SettingsListItemProps = (ItemPropsSimple | ItemPropsSwitch | ItemPropsRadio) &
  PickCellProps<CellProps>;

export function SettingsListItem({
  type,
  switchValue,
  onSwitchValueChange,
  isRadioSelected,
  title,
  caption,
  icon,
  onPress,
  ...rest
}: SettingsListItemProps) {
  return (
    <Cell.Root pressable onPress={onPress} {...rest}>
      {icon && (
        <Cell.Icon>
          <Avatar>{icon}</Avatar>
        </Cell.Icon>
      )}
      <Cell.Content>
        <Cell.Label variant="primary">{title}</Cell.Label>
        {caption && <Cell.Label variant="secondary">{caption}</Cell.Label>}
      </Cell.Content>
      <Cell.Aside>
        {(!type || type === 'simple') && <ChevronRightIcon variant="small" />}
        {type === 'switch' && <Switch value={switchValue} onValueChange={onSwitchValueChange} />}
        {type === 'radio' && <RadioButton isSelected={isRadioSelected} onPress={onPress} />}
      </Cell.Aside>
    </Cell.Root>
  );
}
