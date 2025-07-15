import { RefObject } from 'react';
import { TextInput as RNTextInput } from 'react-native';

export interface SearchInputProps {
  textInputRef: RefObject<RNTextInput | null>;
  textUrl: string;
  setTextUrl(textUrl: string): void;
  onSubmit(): void;
}
