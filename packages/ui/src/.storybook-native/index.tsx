import { ComponentType } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { view } from './storybook.requires';

const StorybookUIRoot: ComponentType = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
