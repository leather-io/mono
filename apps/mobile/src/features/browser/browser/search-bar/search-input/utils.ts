import { type RefObject } from 'react';
import { type TextInputInstance } from 'react-native';

export interface SearchInputProps {
  textInputRef: RefObject<TextInputInstance | null>;
  textUrl: string;
  setTextUrl(textUrl: string): void;
  onSubmit(): void;
}
