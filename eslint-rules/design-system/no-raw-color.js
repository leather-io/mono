// eslint-rules/design-system/no-raw-color.js
import { getPropertyName, neverLink } from './shared.js';

const embeddedHex = /(?:^|[\s,(])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![0-9a-z_-])/i;
const wholeHex = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const colorFunction = /\b(?:rgba?|hsla?)\(/i;

// Alpha masks use black and white as coverage, not as colour.
const maskProperties = new Set(['mask', 'maskImage', 'WebkitMask', 'WebkitMaskImage']);

// There is no shadow token yet, so a message pointing at one would send the
// reader nowhere. Shadows stay out until tokens.shadows exists (checkShadows).
const shadowProperties = new Set(['boxShadow', 'shadow', 'textShadow', 'filter']);

const styleCallees = new Set([
  'css',
  'cva',
  'sva',
  'styled',
  'defineRecipe',
  'defineSlotRecipe',
  'createStyles',
  'StyleSheet',
]);

const colorProperties = new Set([
  'color',
  'bg',
  'bgColor',
  'background',
  'backgroundColor',
  'border',
  'borderColor',
  'borderTop',
  'borderBottom',
  'borderLeft',
  'borderRight',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'outline',
  'outlineColor',
  'fill',
  'stroke',
  'boxShadow',
  'shadow',
  'shadowColor',
  'textShadow',
  'textDecorationColor',
  'caretColor',
  'accentColor',
  'tintColor',
  'placeholderTextColor',
  'underlayColor',
  'stopColor',
  'backgroundImage',
  'filter',
]);

const ignoredAttributes = new Set([
  'href',
  'to',
  'id',
  'key',
  'src',
  'alt',
  'title',
  'label',
  'name',
  'value',
  'placeholder',
  'className',
]);

function calleeName(callee) {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier') {
    return callee.object.name;
  }
  return null;
}

// Inside a colour property or a style call, any embedded hex counts. On other
// JSX attributes only an unambiguous value counts, so "issue #2643" in a
// description prop is not read as a colour.
function isRawColorInContext(value, ancestors, checkShadows) {
  const strong = embeddedHex.test(value) || colorFunction.test(value);
  const unambiguous = wholeHex.test(value.trim()) || colorFunction.test(value);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (ancestor.type === 'Property') {
      const name = getPropertyName(ancestor);
      if (maskProperties.has(name)) return false;
      if (!checkShadows && shadowProperties.has(name)) return false;
      if (colorProperties.has(name)) return strong;
    }
    if (ancestor.type === 'JSXAttribute') {
      const name = ancestor.name.type === 'JSXIdentifier' ? ancestor.name.name : '';
      if (ignoredAttributes.has(name) || name.startsWith('aria-') || name.startsWith('data-')) {
        return false;
      }
      if (!checkShadows && shadowProperties.has(name)) return false;
      return colorProperties.has(name) ? strong : unambiguous;
    }
    if (ancestor.type === 'CallExpression' && styleCallees.has(calleeName(ancestor.callee))) {
      return strong;
    }
  }
  return false;
}

export const noRawColorRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hex, rgb and hsl literals in style props, css() and style objects. Raw values skip ' +
        'the dark theme and drift from the palette in @leather.io/tokens.',
    },
    messages: {
      rawColor:
        "Use a semantic colour token (ink.*, red.*, green.*, yellow.*, blue.*) instead of the raw value '{{value}}' — {{link}}",
    },
    schema: [
      {
        type: 'object',
        properties: { checkShadows: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const checkShadows = context.options[0]?.checkShadows ?? false;

    function check(node, value) {
      if (!isRawColorInContext(value, context.sourceCode.getAncestors(node), checkShadows)) return;
      context.report({
        node,
        messageId: 'rawColor',
        data: {
          value: value.length > 48 ? `${value.slice(0, 45)}...` : value,
          link: neverLink('raw-colour'),
        },
      });
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};
