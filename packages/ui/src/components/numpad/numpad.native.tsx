import { ReactNode } from 'react';

import { ArrowLeftIcon } from '../../icons/arrow-left-icon.native';
import { Box } from '../box/box.native';
import { NumpadKey, NumpadKeySlot } from './numpad-key.native';

const FALLBACK_LOCALE_IDENTIFIER = 'en';

type Mode = 'numeric' | 'decimal';
type DecimalSeparator = '.' | ',';
type KeyId =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0'
  | 'delete'
  | 'decimalSeparator';
type Layout = [KeyId | null, KeyId | null, KeyId | null][];

interface Key {
  id: KeyId;
  accessibilityLabel: string;
  element: ReactNode;
}

function getAllKeys(locale: string): Record<KeyId, Key> {
  const decimalSeparator = getDecimalSeparator(locale);

  return {
    '1': { id: '1', accessibilityLabel: '1', element: '1' },
    '2': { id: '2', accessibilityLabel: '2', element: '2' },
    '3': { id: '3', accessibilityLabel: '3', element: '3' },
    '4': { id: '4', accessibilityLabel: '4', element: '4' },
    '5': { id: '5', accessibilityLabel: '5', element: '5' },
    '6': { id: '6', accessibilityLabel: '6', element: '6' },
    '7': { id: '7', accessibilityLabel: '7', element: '7' },
    '8': { id: '8', accessibilityLabel: '8', element: '8' },
    '9': { id: '9', accessibilityLabel: '9', element: '9' },
    '0': { id: '0', accessibilityLabel: '0', element: '0' },
    decimalSeparator: {
      id: 'decimalSeparator',
      accessibilityLabel: decimalSeparator,
      element: decimalSeparator,
    },
    delete: { id: 'delete', accessibilityLabel: 'delete', element: <ArrowLeftIcon /> },
  };
}

const layouts: Record<Mode, Layout> = {
  numeric: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [null, '0', 'delete'],
  ],
  decimal: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['decimalSeparator', '0', 'delete'],
  ],
};

function getLayout(mode: Mode, locale: string): (Key | null)[] {
  return layouts[mode].flat().map(id => {
    if (!id) {
      return null;
    }

    return getAllKeys(locale)[id];
  });
}

function getDecimalSeparator(locale: string): DecimalSeparator {
  try {
    const formatter = new Intl.NumberFormat(locale);
    return formatter.format(1.1).includes(',') ? ',' : '.';
  } catch {
    return '.';
  }
}

function updateValue(currentValue: string, id: KeyId, decimalSeparator: DecimalSeparator) {
  switch (id) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      return currentValue === '0' ? id : currentValue + id;
    case 'decimalSeparator':
      return currentValue.includes(decimalSeparator)
        ? currentValue
        : currentValue + decimalSeparator;
    case 'delete':
      return currentValue.length === 1 ? '0' : currentValue.slice(0, -1);
    default:
      // TODO: Assert exhaustiveness
      return currentValue;
  }
}

export interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
  locale?: string;
  allowNextValue?: (value: string) => boolean;
  mode?: Mode;
}

export function Numpad({
  value,
  onChange,
  locale = FALLBACK_LOCALE_IDENTIFIER,
  mode = 'decimal',
  allowNextValue,
}: NumpadProps) {
  const decimalSeparator = getDecimalSeparator(locale);

  function handlePress(key: Key) {
    const updatedValue = updateValue(value, key.id, decimalSeparator);
    return () => {
      if (allowNextValue && !allowNextValue(updatedValue)) {
        return;
      }
      onChange(updatedValue);
    };
  }

  function handleLongPress(key: Key) {
    return () => {
      if (key.id === 'delete') {
        onChange('0');
      }
    };
  }

  return (
    <Box flexDirection="row" flexWrap="wrap" gap="2" px="2">
      {getLayout(mode, locale).map((keyItem, index) => {
        return (
          <NumpadKeySlot key={keyItem ? keyItem.id : `empty-slot-${index}`}>
            {keyItem ? (
              <NumpadKey
                label={keyItem.accessibilityLabel}
                element={keyItem.element}
                onPress={handlePress(keyItem)}
                onLongPress={handleLongPress(keyItem)}
              />
            ) : null}
          </NumpadKeySlot>
        );
      })}
    </Box>
  );
}
