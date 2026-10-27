// eslint-rules/design-system/no-primitive-imports.js
import { neverLink } from './shared.js';

// Radix primitive -> the @leather.io/ui component that wraps it.
const uiWrappers = {
  accordion: 'Accordion',
  dialog: 'Sheet',
  'alert-dialog': 'Sheet',
  'dropdown-menu': 'DropdownMenu',
  'hover-card': 'HoverCard',
  popover: 'Popover',
  select: 'Select',
  slider: 'Slider',
  switch: 'Switch',
  tabs: 'Tabs',
  toast: 'Toast',
  tooltip: 'BasicTooltip or Tooltip',
};

function kebab(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isPrimitiveSource(source) {
  return source === 'radix-ui' || source.startsWith('@radix-ui/');
}

function replacementFor(node) {
  const source = node.source.value;
  const primitives = source.startsWith('@radix-ui/react-')
    ? [source.slice('@radix-ui/react-'.length)]
    : (node.specifiers ?? [])
        .filter(specifier => specifier.type === 'ImportSpecifier')
        .map(specifier => kebab(specifier.imported.name));
  const wrappers = primitives.map(primitive => uiWrappers[primitive]).filter(Boolean);
  return wrappers.length > 0
    ? `${[...new Set(wrappers)].join(', ')} from @leather.io/ui`
    : 'the matching @leather.io/ui component (or add a wrapper in packages/ui)';
}

export const noPrimitiveImportsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing Radix primitives outside packages/ui. Apps compose the styled wrappers ' +
        'so focus, motion and theming stay in one place.',
    },
    messages: {
      primitiveImport: "Use {{replacement}} instead of importing '{{source}}' — {{link}}",
    },
    schema: [],
  },
  create(context) {
    function check(node) {
      if (!node.source || typeof node.source.value !== 'string') return;
      if (!isPrimitiveSource(node.source.value)) return;
      context.report({
        node: node.source,
        messageId: 'primitiveImport',
        data: {
          source: node.source.value,
          replacement: replacementFor(node),
          link: neverLink('radix-imports'),
        },
      });
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    };
  },
};
