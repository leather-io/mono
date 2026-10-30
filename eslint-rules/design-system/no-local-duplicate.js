// eslint-rules/design-system/no-local-duplicate.js
import { neverLink } from './shared.js';

const defaultDuplicates = [
  {
    pattern: '^@app/ui/components/tooltip/(basic-tooltip|tooltip)$',
    replacement: 'BasicTooltip or Tooltip from @leather.io/ui',
  },
];

export const noLocalDuplicateRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow importing an app-local copy of a component that @leather.io/ui already provides. ' +
        'Forks drift: the extension tooltip opens after 300ms, the ui one after 400ms.',
    },
    messages: {
      localDuplicate: "Use {{replacement}} instead of the local copy '{{source}}' — {{link}}",
    },
    schema: [
      {
        type: 'object',
        properties: {
          duplicates: {
            type: 'array',
            items: {
              type: 'object',
              properties: { pattern: { type: 'string' }, replacement: { type: 'string' } },
              required: ['pattern', 'replacement'],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const duplicates = (context.options[0]?.duplicates ?? defaultDuplicates).map(entry => ({
      regex: new RegExp(entry.pattern),
      replacement: entry.replacement,
    }));

    function check(node) {
      if (!node.source || typeof node.source.value !== 'string') return;
      const source = node.source.value;
      const match = duplicates.find(entry => entry.regex.test(source));
      if (!match) return;
      context.report({
        node: node.source,
        messageId: 'localDuplicate',
        data: { source, replacement: match.replacement, link: neverLink('local-duplicates') },
      });
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    };
  },
};
