// eslint-rules/design-system/no-raw-interactive.js
import { getStaticString, neverLink } from './shared.js';

const nativeTouchables = new Set([
  'Button',
  'Pressable',
  'TouchableHighlight',
  'TouchableOpacity',
  'TouchableWithoutFeedback',
]);

export const noRawInteractiveRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw <button>, styled.button and react-native touchables outside @leather.io/ui. ' +
        'The ui components carry focus rings, press feedback, haptics and disabled states.',
    },
    messages: {
      rawButton:
        'Use Button, IconButton or Pressable from @leather.io/ui instead of a raw <button> — {{link}}',
      styledButton:
        'Use Button, IconButton or Pressable from @leather.io/ui instead of styled.button — {{link}}',
      nativeTouchable:
        "Use Pressable, Button or IconButton from @leather.io/ui/native instead of {{name}} from 'react-native' — {{link}}",
    },
    schema: [],
  },
  create(context) {
    const link = neverLink('raw-button');

    return {
      JSXOpeningElement(node) {
        const { name } = node;
        if (name.type === 'JSXIdentifier' && name.name === 'button') {
          context.report({ node, messageId: 'rawButton', data: { link } });
        }
        if (
          name.type === 'JSXMemberExpression' &&
          name.object.type === 'JSXIdentifier' &&
          name.object.name === 'styled' &&
          name.property.name === 'button'
        ) {
          context.report({ node, messageId: 'styledButton', data: { link } });
        }
      },
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'styled' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'button'
        ) {
          context.report({ node, messageId: 'styledButton', data: { link } });
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'styled' &&
          getStaticString(node.arguments[0]) === 'button'
        ) {
          context.report({ node, messageId: 'styledButton', data: { link } });
        }
      },
      ImportDeclaration(node) {
        if (node.source.value !== 'react-native' || node.importKind === 'type') return;
        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier' || specifier.importKind === 'type') continue;
          const name = specifier.imported.name;
          if (!nativeTouchables.has(name)) continue;
          context.report({ node: specifier, messageId: 'nativeTouchable', data: { name, link } });
        }
      },
    };
  },
};
