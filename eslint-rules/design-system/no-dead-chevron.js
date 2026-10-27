// eslint-rules/design-system/no-dead-chevron.js
//
// A chevron promises "this opens a deeper view". The list-row recipe draws it
// only with `navigates`; this flags `navigates` on a row that has no onClick or
// whose onClick does nothing (`noop`, `() => undefined`, `() => {}`), as on
// round 3's address book rows, where no detail view existed.
import { getJsxAttribute, neverLink } from './shared.js';

function isTrueAttribute(attr) {
  if (!attr) return false;
  if (attr.value === null) return true;
  return (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'Literal' &&
    attr.value.expression.value === true
  );
}

function isNoop(expression) {
  if (!expression) return true;
  if (expression.type === 'Identifier') return /^(noop|undefined)$/.test(expression.name);
  if (expression.type === 'ArrowFunctionExpression' || expression.type === 'FunctionExpression') {
    const body = expression.body;
    if (body.type === 'BlockStatement') {
      return body.body.every(
        statement =>
          statement.type === 'ReturnStatement' &&
          (!statement.argument || isEmptyValue(statement.argument))
      );
    }
    return isEmptyValue(body);
  }
  return false;
}

function isEmptyValue(node) {
  return (
    (node.type === 'Identifier' && node.name === 'undefined') ||
    (node.type === 'Literal' && node.value === null) ||
    (node.type === 'UnaryExpression' && node.operator === 'void')
  );
}

export const noDeadChevronRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'A row with `navigates` (a chevron) must open a deeper view: it needs an onClick that ' +
        'goes somewhere. Pick rows that select and return have no chevron.',
    },
    messages: {
      deadChevron:
        'Use navigates only with an onClick that opens a deeper view, instead of a chevron on a row that goes nowhere; drop navigates for a pick or display row — {{link}}',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const navigates = getJsxAttribute(node, 'navigates');
        if (!isTrueAttribute(navigates)) return;
        const onClick = getJsxAttribute(node, 'onClick');
        const handler =
          onClick?.value?.type === 'JSXExpressionContainer' ? onClick.value.expression : null;
        if (onClick && !isNoop(handler)) return;
        context.report({
          node: navigates,
          messageId: 'deadChevron',
          data: { link: neverLink('dead-chevron') },
        });
      },
    };
  },
};
