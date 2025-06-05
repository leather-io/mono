import { ViewStyle } from 'react-native';

import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

const handleIndicatorWidth = 60;
const handleIndicatorHeight = 4;

interface UseSheetStylesProps {
  handlePlacement: 'inside' | 'outside';
}

export function useSheetStyles({ handlePlacement }: UseSheetStylesProps) {
  const theme = useTheme<Theme>();

  return {
    handleContainer: getHandleContainerStyle(theme, handlePlacement),
    handleIndicator: getHandleIndicatorStyle(theme),
    background: getBackgroundStyle(theme),
  };
}

function getHandleIndicatorStyle(theme: Theme) {
  return {
    width: handleIndicatorWidth,
    height: handleIndicatorHeight,
    backgroundColor: theme.colors['ink.border-default'],
  };
}

function getHandleContainerStyle(theme: Theme, placement: 'inside' | 'outside'): ViewStyle {
  // Using non-absolute position on the container significantly degrades the animation performance for some reason.
  const style: ViewStyle = {
    position: 'absolute',
    padding: theme.spacing['2'],
    width: '100%',
  };

  if (placement === 'outside') {
    style.bottom = '100%';
  }

  return style;
}

function getBackgroundStyle(theme: Theme): ViewStyle {
  // TODO: LEA-1933, LEA-2725 Replace with tokens once the elevation scale and alpha colors are ready.
  const borderColor = addAlphaToHex(theme.colors['ink.text-primary'], 0.12);
  const shadowColor = 'rgba(18,16,16,.08)';

  return {
    borderTopLeftRadius: theme.borderRadii['lg'],
    borderTopRightRadius: theme.borderRadii['lg'],
    backgroundColor: theme.colors['ink.background-primary'],
    borderWidth: 0.5,
    borderColor: borderColor,
    borderBottomWidth: 0,
    boxShadow: [{ offsetX: 0, offsetY: -2, blurRadius: 8, spreadDistance: 0, color: shadowColor }],
  };
}

function addAlphaToHex(hex: string, alpha: number): string {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return hex;

  let parsed = hex.slice(1);
  if (parsed.length === 3) {
    parsed = parsed
      .split('')
      .map(c => c + c)
      .join('');
  }

  const alphaByte = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${parsed}${alphaByte}`;
}
