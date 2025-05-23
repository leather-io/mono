import { colors } from './colors';

export const tokens = {
  animations: {
    spin: { value: 'spin 1s linear infinite' },
  },
  borders: {
    action: { value: '1px solid {colors.ink.action-primary-default}' },
    active: { value: '2px solid {colors.ink.border-default}' },
    background: { value: '2px solid {colors.ink.background-primary}' },
    dashed: { value: '2px dashed {colors.ink.component-background-default}' },
    default: { value: '1px solid {colors.ink.border-default}' },
    error: { value: '1px solid {colors.red.border}' },
    focus: { value: '2px solid {colors.ink.action-primary-default}' },
    invert: { value: '1px solid {colors.invert}' },
    subdued: { value: '1px solid {colors.ink.text-subdued}' },
    warning: { value: '1px solid {colors.yellow.border}' },
  },
  colors,
  radii: {
    xs: { value: '2px' },
    sm: { value: '4px' },
    md: { value: '8px' },
    lg: { value: '12px' },
    round: { value: '9999px' },
  },
  sizes: {
    xs: { value: '12px' },
    sm: { value: '16px' },
    md: { value: '24px' },
    lg: { value: '32px' },
    xl: { value: '36px' },
    xxl: { value: '40px' },
    pageWidth: { value: '500px' },
    twoColumnPageWidth: { value: '500px' },
    fullPageMaxWidth: { value: '882px' },
    dialogHeight: { value: '600px' },
    dialogContentHeight: { value: '500px' },
    headerHeight: { value: '80px' },
    footerHeight: { value: '95px' },
    popupWidth: { value: '390px' },
    popupMaxWidth: { value: '640px' },
    popupHeight: { value: '756px' },
    popupHeaderHeight: { value: '68px' },
    headerContainerHeight: { value: '40px' },
    inputHeight: { value: '64px' },
    iconButtonWithLabelWidth: { value: '64px' },
    settingsMenuWidth: { value: '240px' },
  },
  spacing: {
    // Numbers are padded with 0 to ensure they are sorted correctly in TS
    // autocomplete. When typing, mt="04" + enter key, will jump straight to the
    // spacing value you need.
    'space.00': { value: '0' },
    'space.01': { value: '4px', description: '4px' },
    'space.02': { value: '8px', description: '8px' },
    'space.03': { value: '12px', description: '12px' },
    'space.04': { value: '16px', description: '16px' },
    'space.05': { value: '24px', description: '24px' },
    'space.06': { value: '32px', description: '32px' },
    'space.07': { value: '40px', description: '40px' },
    'space.08': { value: '48px', description: '48px' },
    'space.09': { value: '64px', description: '64px' },
    'space.10': { value: '72px', description: '72px' },
    'space.11': { value: '128px', description: '128px' },
  },
  transition: { value: 'all 0.2s cubic-bezier(0.23, 1, 0.32, 1)' },
} as const;
