import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { ANIMATION_DURATION, SkeletonLoader } from './skeleton-loader.native';

type SkeletonLoaderArgs = React.ComponentProps<typeof SkeletonLoader>;

type Story = StoryObj<SkeletonLoaderArgs>;

const meta: Meta<SkeletonLoaderArgs> = {
  title: 'Skeleton Loader',
  component: SkeletonLoader,
  decorators: [
    Story => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

export const SkeletonLoaderStory: Story = {
  args: {
    isLoading: true,
    width: 200,
    height: 38,
  },
};

export const SkeletonLoaderRoundStory: Story = {
  args: {
    isLoading: true,
    width: 200,
    height: 200,
    borderRadius: 'round',
  },
};

export const SkeletonLoaderMultipleStory: Story = {
  args: {
    isLoading: true,
    width: 200,
    height: 38,
  },
  render: (props => {
    const [showCount, setShowCount] = useState(1);

    useEffect(() => {
      let count = 1;
      let step = 1;
      const maxCount = 5;

      const interval = setInterval(() => {
        count += step;
        setShowCount(count);
        if (count === maxCount || count === 1) {
          step *= -1;
        }
      }, 1.5 * ANIMATION_DURATION);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 5 }}>
        {[...Array(showCount)].map((_, index) => (
          <SkeletonLoader key={index} {...props} />
        ))}
      </View>
    );
  }) satisfies React.FC<SkeletonLoaderArgs>,
};
