import type { Meta } from '@storybook/react';

import { Card } from '../card/card.web.stories';
import { Page as Component } from './page.layout.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Layout/Page',
};

export default meta;

export function Page() {
  return (
    <Component>
      <Card />
    </Component>
  );
}
