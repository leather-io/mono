import type { Meta, StoryObj } from '@storybook/react';

import { CloudOffIcon } from '../../icons/cloud-off-icon.web';
import { Banner } from './banner.web';

const meta: Meta<typeof Banner> = {
  component: Banner,
  tags: ['autodocs'],
  title: 'Banner',
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Basic: Story = {
  args: {
    children:
      'Some balances are currently unavailable, which may impact the total balance displayed.',
    icon: <CloudOffIcon />,
  },
};

export const WithMaxContentWidth: Story = {
  render() {
    return (
      <Banner icon={<CloudOffIcon />} maxWidth="fullPageMaxWidth">
        Some balances are currently unavailable, which may impact the total balance displayed.
      </Banner>
    );
  },
};
