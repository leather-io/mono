// eslint-rules/design-system/shared.js
const neverDoc = 'docs/design/never.md';

export function neverLink(anchor) {
  return `${neverDoc}#${anchor}`;
}

export function getStaticString(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
  return null;
}

export function getPropertyName(node) {
  if (!node || node.type !== 'Property' || node.computed) return null;
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') return node.key.value;
  return null;
}

export function getJsxName(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') {
    return `${getJsxName(nameNode.object)}.${nameNode.property.name}`;
  }
  return null;
}

export function getJsxAttribute(openingElement, name) {
  return openingElement.attributes.find(
    attr =>
      attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier' && attr.name.name === name
  );
}

// Expands a value into the static leaves it can take: string literals, both
// branches of a ternary, and the values of a responsive or conditional object.
export function collectLeaves(node, leaves = []) {
  if (!node) return leaves;
  if (node.type === 'JSXExpressionContainer') return collectLeaves(node.expression, leaves);
  if (node.type === 'ConditionalExpression') {
    collectLeaves(node.consequent, leaves);
    collectLeaves(node.alternate, leaves);
    return leaves;
  }
  if (node.type === 'LogicalExpression') return collectLeaves(node.right, leaves);
  if (node.type === 'ObjectExpression') {
    for (const prop of node.properties) {
      if (prop.type === 'Property') collectLeaves(prop.value, leaves);
    }
    return leaves;
  }
  leaves.push(node);
  return leaves;
}
