import { ReactElement } from 'react';
import { Linking } from 'react-native';

import { Avatar, Cell, ChevronRightIcon, IconProps } from '@leather.io/ui/native';

interface LearnItemProps {
  icon: ReactElement<IconProps>;
  title: string;
  url: string;
}

export function LearnItem({ icon, title, url }: LearnItemProps) {
  return (
    <Cell.Root pressable onPress={() => Linking.openURL(url)}>
      <Cell.Icon>
        <Avatar showFauxBorder icon={icon} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{title}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <ChevronRightIcon variant="small" />
      </Cell.Aside>
    </Cell.Root>
  );
}
