import { useState } from 'react';

import { Meta } from '@storybook/react';

import { Switch as Component } from './switch.web';

const meta: Meta<typeof Component.Root> = {
  component: Component.Root,
  tags: ['autodocs'],
  title: 'Components/Switch',
};

export default meta;

export function Switch() {
  const [checked, setChecked] = useState(false);
  return (
    <Component.Root checked={checked} onCheckedChange={setChecked}>
      <Component.Thumb />
    </Component.Root>
  );
}
