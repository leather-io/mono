import type { Meta, StoryObj } from '@storybook/react';

import { CollectibleCard } from './collectible-card.native';

const meta: Meta<typeof CollectibleCard> = {
  title: 'Collectibles/CollectibleCard',
  component: CollectibleCard,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {},
  decorators: [Story => <Story />],
};

export default meta;

export const OrdinalHtmlCollectibleCardStory = {
  args: {
    mimeType: 'html',
    name: 'Inscription 74703951',
    src: 'https://ordinals.com/preview/a494e48bf7120c959239e8c544bc821ca4fb5a46e5fff79938943d434f252949i0',
    type: 'inscription',
  },
  argTypes: {},
} satisfies StoryObj<typeof CollectibleCard>;

export const OrdinalTextCollectibleCardStory = {
  args: {
    mimeType: 'text',
    name: 'Inscription 73858867',
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/335209b72c452f52199ae09e8ce586a451ce452c73326f01f958d8aa8417e062i0',
    type: 'inscription',
  },
  argTypes: {},
} satisfies StoryObj<typeof CollectibleCard>;

export const OrdinalImageCollectibleCardStory = {
  args: {
    mimeType: 'image',
    name: 'Inscription 55549412',
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/cd27e71f955e021dd0840aa0544067fc92c3608009f2191a405f9f4910712b78i0',
    type: 'inscription',
  },
  argTypes: {},
} satisfies StoryObj<typeof CollectibleCard>;

export const OrdinalGltfCollectibleCardStory = {
  args: {
    mimeType: 'gltf',
    name: 'Inscription 64484111',
    src: 'https://ordinals.com/preview/e59434da4436cbdcdcf6b7b31fb734d43b304e981a2e3b69092bd6ca83108009i1286',
    type: 'inscription',
  },
  argTypes: {},
} satisfies StoryObj<typeof CollectibleCard>;

export const StxNftCollectibleCardStory = {
  args: {
    mimeType: undefined,
    name: 'BlockSurvey #90',
    src: 'https://assets.hiro.so/api/mainnet/token-metadata-api/SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.blocksurvey/90.png',
    type: 'stx20',
  },
  argTypes: {},
} satisfies StoryObj<typeof CollectibleCard>;
