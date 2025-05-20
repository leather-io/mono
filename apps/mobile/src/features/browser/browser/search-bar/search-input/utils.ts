import { RefObject } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export interface SearchInputProps {
  textInputRef: RefObject<RNTextInput | null>;
  isUrlFocused: SharedValue<boolean>;
  textUrl: string;
  setTextUrl(textUrl: string): void;
  onSubmit(): void;
}
