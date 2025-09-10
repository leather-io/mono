import type { Meta, StoryObj } from '@storybook/react';

import { Inscription } from './inscription.native';

const meta: Meta<typeof Inscription> = {
  title: 'Collectibles/Inscription',
  component: Inscription,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {},
  decorators: [Story => <Story />],
};

export default meta;

export const OrdinalHtmlInscriptionStory = {
  args: {
    mimeType: 'html',
    name: 'Inscription 74703951',
    src: 'https://ordinals.com/preview/a494e48bf7120c959239e8c544bc821ca4fb5a46e5fff79938943d434f252949i0',
  },
  argTypes: {},
} satisfies StoryObj<typeof Inscription>;

export const OrdinalTextInscriptionStory = {
  args: {
    mimeType: 'text',
    name: 'Inscription 73858867',
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/335209b72c452f52199ae09e8ce586a451ce452c73326f01f958d8aa8417e062i0',
  },
  argTypes: {},
} satisfies StoryObj<typeof Inscription>;

export const OrdinalImageInscriptionStory = {
  args: {
    mimeType: 'image',
    name: 'Inscription 55549412',
    src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/cd27e71f955e021dd0840aa0544067fc92c3608009f2191a405f9f4910712b78i0',
  },
  argTypes: {},
} satisfies StoryObj<typeof Inscription>;

export const OrdinalGltfInscriptionStory = {
  args: {
    mimeType: 'gltf',
    name: 'Inscription 64484111',
    src: 'https://ordinals.com/preview/e59434da4436cbdcdcf6b7b31fb734d43b304e981a2e3b69092bd6ca83108009i1286',
  },
  argTypes: {},
} satisfies StoryObj<typeof Inscription>;
