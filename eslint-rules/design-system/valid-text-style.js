// eslint-rules/design-system/valid-text-style.js
import { collectLeaves, getPropertyName, getStaticString, neverLink } from './shared.js';

function suggest(value, textStyles) {
  const family = value.split('.')[0];
  const sameFamily = textStyles.filter(name => name === family || name.startsWith(`${family}.`));
  return sameFamily.length > 0
    ? sameFamily.join(', ')
    : 'one listed in packages/tokens/src/typography.ts';
}

export const validTextStyleRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Only use text styles defined in @leather.io/tokens. Panda does not type-check textStyle ' +
        'while strictTokens is off, so an undefined name renders as the browser default with no error.',
    },
    messages: {
      unknownTextStyle:
        "Use a defined text style ({{suggestion}}) instead of '{{value}}' — {{link}}",
    },
    schema: [
      {
        type: 'object',
        properties: { textStyles: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const textStyles = context.options[0]?.textStyles ?? [];
    if (textStyles.length === 0) return {};
    const defined = new Set(textStyles);

    function check(valueNode) {
      for (const leaf of collectLeaves(valueNode)) {
        const value = getStaticString(leaf);
        if (value === null || defined.has(value)) continue;
        context.report({
          node: leaf,
          messageId: 'unknownTextStyle',
          data: {
            value,
            suggestion: suggest(value, textStyles),
            link: neverLink('undefined-text-style'),
          },
        });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'textStyle') check(node.value);
      },
      Property(node) {
        if (getPropertyName(node) === 'textStyle') check(node.value);
      },
    };
  },
};
