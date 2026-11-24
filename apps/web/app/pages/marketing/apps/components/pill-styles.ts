import { css } from 'leather-styles/css';

// Outlined pill for secondary actions on the /apps cards ("Buy", "Get", "Start staking").
export const pillStyles = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  height: '40px',
  px: 'space.04',
  borderRadius: 'round',
  border: '1px solid',
  borderColor: 'ink.text-primary',
  bg: 'ink.background-primary',
  textStyle: 'label.02',
  fontWeight: 400,
  color: 'ink.text-primary',
  whiteSpace: 'nowrap',
  transition: 'background-color 120ms ease',
  _hover: { bg: 'ink.component-background-hover' },
  _focusVisible: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '2px' },
});
