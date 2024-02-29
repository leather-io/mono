/** @type{import("@storybook/react-native").StorybookConfig} */
export default {
  stories: ['../**/*.native.stories.?(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};
