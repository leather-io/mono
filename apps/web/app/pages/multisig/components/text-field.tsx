import { type ChangeEvent, type ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange(value: string): void;
  onBlur?(value: string): void;
  help?: ReactNode;
  mono?: boolean;
  invalid?: boolean;
}

// Minimal labelled text input shared by the multisig forms. A design-only
// field; production extraction uses the app's form atoms + react-hook-form.
export function TextField({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  help,
  mono,
  invalid,
}: TextFieldProps) {
  return (
    <Flex direction="column" gap="space.02">
      {label && (
        <styled.label textStyle="label.03" color="ink.text-subdued">
          {label}
        </styled.label>
      )}
      <styled.input
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onBlur={onBlur ? (e: ChangeEvent<HTMLInputElement>) => onBlur(e.target.value) : undefined}
        px="space.04"
        py="space.03"
        borderRadius="sm"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={invalid ? 'red.action-primary-default' : 'ink.border-default'}
        bg="ink.background-primary"
        textStyle="body.02"
        fontFamily={mono ? 'Fira Code' : undefined}
        _focusVisible={{ outline: 'none', borderColor: 'ink.action-primary-default' }}
      />
      {help && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {help}
        </styled.span>
      )}
    </Flex>
  );
}
