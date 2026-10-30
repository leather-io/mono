import { defineComponentMeta } from '../../utils/component-meta.shared';

export const buttonMeta = defineComponentMeta({
  name: 'Button',
  importFrom: { web: '@leather.io/ui', native: '@leather.io/ui/native' },
  useWhen: [
    'An action with a text label: submit, confirm, cancel, continue',
    'variant="solid" once per view for the primary action, "outline" for secondary, "ghost" for tertiary',
    'intent="danger" on the confirm step of a destructive action',
    'aria-busy while the action is in flight (web shows a spinner and disables the button)',
    'iconStart / iconEnd as a component (CopyIcon) or an element (<CopyIcon />): either way the icon takes the label ink (currentColor) and the small size',
    'An important action gets a label ("Save to address book"), not a bare icon',
  ],
  dontUseWhen: [
    { situation: 'The action is an icon with no visible label', use: 'IconButton' },
    { situation: 'A whole row, card or custom surface is clickable', use: 'Pressable' },
    { situation: 'Navigating to another page inside running text', use: 'Link' },
  ],
  replaces: ['<button>', 'styled.button', "styled('button')", 'TouchableOpacity from react-native'],
  examples: [
    {
      title: 'Secondary and primary pair in a sheet footer',
      platform: 'web',
      code: [
        '<Button variant="outline" fullWidth onClick={onCancel}>Cancel</Button>',
        '<Button fullWidth disabled={!isValid} onClick={onSave}>Save</Button>',
      ].join('\n'),
      seenIn: 'apps/extension/src/app/features/fee-editor/fee-editor.tsx:68',
    },
    {
      title: 'Destructive confirm',
      platform: 'web',
      code: '<Button variant="solid" intent="danger" onClick={handleRemove}>Remove wallet</Button>',
      seenIn:
        'apps/extension/src/app/features/dialogs/switch-account-sheet/components/remove-wallet-dialog.tsx:32',
    },
    {
      title: 'Ghost action on native',
      platform: 'native',
      code: '<Button variant="ghost" onPress={() => sheetRef.current?.present()}>{t`Skip for now`}</Button>',
      seenIn: 'apps/mobile/src/app/secure-your-wallet.tsx:41',
    },
  ],
  playground: '/playground/ui-gallery#button',
});
