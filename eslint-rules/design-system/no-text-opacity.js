// eslint-rules/design-system/no-text-opacity.js
import {
  collectLeaves,
  getJsxAttribute,
  getJsxName,
  getPropertyName,
  neverLink,
} from './shared.js';

const textElements = new Set([
  'Text',
  'Title',
  'Caption',
  'span',
  'p',
  'label',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'styled.span',
  'styled.p',
  'styled.label',
  'styled.h1',
  'styled.h2',
  'styled.h3',
  'styled.h4',
  'styled.h5',
  'styled.h6',
]);

const surfaceProperties = ['bg', 'background', 'backgroundColor', 'bgColor'];

function isPartialOpacity(node) {
  let value = null;
  if (node.type === 'Literal' && typeof node.value === 'number') value = node.value;
  if (node.type === 'Literal' && typeof node.value === 'string') {
    value = node.value.endsWith('%') ? Number.parseFloat(node.value) / 100 : Number(node.value);
  }
  return value !== null && Number.isFinite(value) && value > 0 && value < 1;
}

function hasPartialOpacity(valueNode) {
  return collectLeaves(valueNode).some(isPartialOpacity);
}

export const noTextOpacityRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow opacity on text to fake an in-between shade. Opacity drops contrast unpredictably ' +
        'on tinted surfaces and in dark mode; the ink ladder is tuned for both.',
    },
    messages: {
      textOpacity:
        'Use a step on the ink text ladder (ink.text-secondary, ink.text-subdued or ink.text-non-interactive) instead of opacity on text — {{link}}',
    },
    schema: [],
  },
  create(context) {
    const link = neverLink('text-opacity');

    const reported = new Set();

    function report(node) {
      if (reported.has(node)) return;
      reported.add(node);
      context.report({ node, messageId: 'textOpacity', data: { link } });
    }

    return {
      JSXOpeningElement(node) {
        const isText =
          textElements.has(getJsxName(node.name)) || Boolean(getJsxAttribute(node, 'textStyle'));
        if (!isText) return;

        const opacity = getJsxAttribute(node, 'opacity');
        if (opacity && hasPartialOpacity(opacity.value)) report(opacity);

        const style = getJsxAttribute(node, 'style');
        const styleObject = style?.value?.expression;
        if (styleObject?.type === 'ObjectExpression') {
          for (const prop of styleObject.properties) {
            if (getPropertyName(prop) === 'opacity' && hasPartialOpacity(prop.value)) report(prop);
          }
        }
      },
      ObjectExpression(node) {
        const names = node.properties.map(getPropertyName);
        if (!names.includes('textStyle') && !names.includes('color')) return;
        // Opacity next to a background dims the whole surface (a hover or
        // pressed state), which is a different decision from text colour.
        if (surfaceProperties.some(name => names.includes(name))) return;
        for (const prop of node.properties) {
          if (getPropertyName(prop) === 'opacity' && hasPartialOpacity(prop.value)) report(prop);
        }
      },
    };
  },
};
