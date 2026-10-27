import { defineComponentMeta } from '../../utils/component-meta.shared';

export const inlineIconMeta = defineComponentMeta({
  name: 'InlineIcon',
  importFrom: { web: '@leather.io/ui' },
  useWhen: [
    'An icon that belongs to a run of text: info next to a label, lock next to a locked amount, a user icon before a name, a chevron after a link-like label',
    'Put it inside the text element. It inherits the text colour (currentColor) and sits centred on the first text line (1lh box)',
    'tone="inherit" (default) or a lighter step (secondary, subdued). Never darker than its text',
    'size="small" (16px) with body, label and caption text; "medium" (24px) only beside headings',
  ],
  dontUseWhen: [
    { situation: 'The icon is the action', use: 'IconButton' },
    { situation: 'The icon leads a row (avatar, token logo)', use: 'ItemLayout img / Avatar' },
    { situation: 'The icon sits inside a Button label', use: 'Button iconStart / iconEnd' },
  ],
  replaces: [
    '<Flex gap="space.01"><span>Label</span><LockIcon /></Flex>',
    'a bare *Icon next to text',
  ],
  examples: [
    {
      title: 'Lock on a locked amount, on the text line',
      platform: 'web',
      code: '<styled.span textStyle="label.03" color="ink.text-primary">\n  <InlineIcon icon={LockIcon} placement="start" tone="secondary" />\n  0.045004\n</styled.span>',
    },
    {
      title: 'Info after a label, behind a tooltip',
      platform: 'web',
      code: '<styled.span textStyle="label.02">\n  Total balance\n  <BasicTooltip label="…" asChild>\n    <InlineIcon icon={InfoCircleIcon} placement="end" tone="subdued" tabIndex={0} />\n  </BasicTooltip>\n</styled.span>',
    },
  ],
  playground: '/playground/recipes?recipe=inline-info',
});
