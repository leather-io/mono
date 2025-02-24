import type { Meta, StoryObj } from '@storybook/react';
import { Box } from 'leather-styles/jsx';

import { Slider as Component } from './slider.web';

const meta: Meta<typeof Component.Root> = {
  component: Component.Root,
  tags: ['autodocs'],
  title: 'Slider',
};

export default meta;

type Story = StoryObj<typeof Component.Root>;

export const Default: Story = {
  render: () => (
    <Box width="300px">
      <Component.Root defaultValue={[50]} max={100} step={1}>
        <Component.Track>
          <Component.Range />
        </Component.Track>
        <Component.Thumb />
      </Component.Root>
    </Box>
  ),
};

export const RangeSlider: Story = {
  render: () => (
    <Box width="300px">
      <Component.Root defaultValue={[20, 80]} max={100} step={1}>
        <Component.Track>
          <Component.Range />
        </Component.Track>
        <Component.Thumb />
        <Component.Thumb />
      </Component.Root>
    </Box>
  ),
};

export const SteppedSlider: Story = {
  render: () => (
    <Box width="300px">
      <Component.Root defaultValue={[50]} max={100} step={10}>
        <Component.Track>
          <Component.Range />
        </Component.Track>
        <Component.Thumb />
      </Component.Root>
    </Box>
  ),
};

export const CustomWidth: Story = {
  render: () => (
    <Box width="500px">
      <Component.Root defaultValue={[50]} max={100} step={1}>
        <Component.Track>
          <Component.Range />
        </Component.Track>
        <Component.Thumb />
      </Component.Root>
    </Box>
  ),
};
