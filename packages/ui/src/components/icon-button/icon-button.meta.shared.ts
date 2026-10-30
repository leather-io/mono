import { defineComponentMeta } from '../../utils/component-meta.shared';

export const iconButtonMeta = defineComponentMeta({
  name: 'IconButton',
  importFrom: { web: '@leather.io/ui', native: '@leather.io/ui/native' },
  useWhen: [
    'An action shown as an icon only: back, close, copy, settings, QR',
    'Always with aria-label (web) or label (native)',
    'It is a 40px square (headerContainerHeight) on web, whatever the icon size, so the hover fill is square. Do not pass a width or height to resize it; a different size is a design decision',
    'Inside a row as a nested action: the row keeps one hover and the IconButton shows its own square hover on top (see the list-row recipe)',
  ],
  dontUseWhen: [
    { situation: 'The action has a visible text label', use: 'Button' },
    { situation: 'The icon decorates text and is not an action', use: 'InlineIcon' },
    { situation: 'The whole row is the action', use: 'Pressable (list-row recipe)' },
  ],
  replaces: ['<button><SomeIcon /></button>', 'a Pressable wrapping only an icon'],
  examples: [
    {
      title: 'Close in a sheet header',
      platform: 'web',
      code: '<IconButton icon={<CloseIcon />} aria-label="Close" onClick={onClose} />',
      seenIn: 'packages/ui/src/components/sheet/sheet-header.web.tsx:37',
    },
    {
      title: 'Copy inside a receive row',
      platform: 'web',
      code: '<IconButton icon={<CopyIcon />} aria-label="Copy address" onClick={onCopyAddress} />',
      seenIn: 'apps/extension/src/app/pages/receive/components/receive-item.tsx:52',
    },
  ],
  playground: '/playground/recipes?recipe=list-row',
});
