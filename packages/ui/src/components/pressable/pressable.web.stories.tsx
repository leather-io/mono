import { Meta, StoryObj } from '@storybook/react';
import { styled } from 'leather-styles/jsx';

import { Button } from '../../components/button/button.web';
import { ItemLayoutWithButtons } from '../../components/item-layout/item-layout-with-buttons.web';
import { ItemLayout } from '../../components/item-layout/item-layout.web';
import { Pressable as Component } from '../../components/pressable/pressable.web';
import { CopyIcon } from '../../icons/copy-icon.web';
import { QrCodeIcon } from '../../icons/qr-code-icon.web';
import { BtcAvatarIcon } from '../avatar/btc-avatar-icon.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Pressable',
  parameters: {
    controls: { include: [] },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

function ExamplePressableContent() {
  return (
    <ItemLayout
      showChevron
      flagImg={<BtcAvatarIcon />}
      titleLeft="Label"
      captionLeft="Caption"
      titleRight="1,000.00 ABC"
      captionRight="$1,000.00"
    />
  );
}

export const Pressable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Pressable` has its hover state applied with a before pseudo element, so the content aligns independently from its hover state background.',
      },
    },
  },
  args: {
    onClick: () => {},
    children: <ExamplePressableContent />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: () => {},
    children: (
      <ItemLayout
        showChevron
        flagImg={<BtcAvatarIcon />}
        titleLeft="Label"
        captionLeft="Caption"
        titleRight="1,000.00 ABC"
        captionRight="$1,000.00"
      />
    ),
  },
};

export const WithButtons: Story = {
  args: {
    children: (
      <ItemLayoutWithButtons
        flagImg={<BtcAvatarIcon />}
        title="Label"
        caption="Caption"
        buttons={
          <>
            <Button variant="ghost">
              <CopyIcon />
            </Button>
            <Button variant="ghost">
              <QrCodeIcon />
            </Button>
          </>
        }
      />
    ),
  },
};

export const AlignmentExample: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component alignment in combination with its hover state',
      },
    },
  },
  decorators: [
    Story => (
      <styled.div borderLeft="2px solid" borderColor="red.background-secondary" py="space.06">
        <styled.h1 textStyle="heading.04" mb="space.04">
          Left aligned header
        </styled.h1>
        <Story />
      </styled.div>
    ),
  ],
  args: {
    onClick: () => {},
    children: <ExamplePressableContent />,
  },
};

export const WithPadding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "In some layouts, it's necessary to contain the bounds of the element's pseudo element hover background. Wrap the component in a div with padding `space.03` to achieve this",
      },
    },
  },
  decorators: [
    Story => (
      <styled.div border="2px solid" borderColor="red.background-secondary" p="space.03">
        <Story />
      </styled.div>
    ),
  ],
  args: {
    onClick: () => {},
    children: <ExamplePressableContent />,
  },
};
