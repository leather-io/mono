// eslint-rules/design-system/no-mono-amount.js
//
// Monospace is for full addresses and code only (AddressDisplayer's `address`
// text style, the broadcast error's `code` block). An amount, total, fee or
// balance in mono reads as raw data, not as money. This flags a mono font
// (textStyle `code` / `address`, a mono fontFamily) on an element whose content
// looks like an amount.
//
// With `checkTabular`, it also flags `fontVariant` / `fontVariantNumeric`
// `tabular-nums` on an amount: in the web build Diatype's tabular figures come
// from its semi-mono cut, so the whole value ("120.0004 STX", letters included)
// renders monospaced. That is how round 3's review rows ended up mono.
import { collectLeaves, getJsxName, getStaticString, neverLink } from './shared.js';

const monoTextStyles = new Set(['code', 'address']);
const monoFamily = /mono|fira|code|courier|menlo|consolas/i;
const amountName =
  /amount|total|fee|balance|fiat|price|spend|sending|sum|value|usd|quantity|money|cost/i;
// Content that is allowed in mono: an address, a hash, a code block.
const monoContentName = /address|hash|txid|code|mnemonic|seed|key|group|principal|contract/i;
// Props that carry money on value components (Balance). Not `value`: on an input
// that is typed text (a contract id, a key), where mono can be right.
const amountAttributes = /^(balance|amount|money|fee|total|fiat|price)$/i;

function attributeValueNode(attr) {
  return attr.value ?? null;
}

// The names an expression reads from: `fee`, `send.totalSpend`, `format(amount)`.
function namesIn(node, names = []) {
  if (!node) return names;
  switch (node.type) {
    case 'JSXExpressionContainer':
      return namesIn(node.expression, names);
    case 'Identifier':
      names.push(node.name);
      return names;
    case 'MemberExpression':
      if (!node.computed && node.property.type === 'Identifier') names.push(node.property.name);
      return namesIn(node.object, names);
    case 'CallExpression':
      namesIn(node.callee, names);
      node.arguments.forEach(arg => namesIn(arg, names));
      return names;
    case 'TemplateLiteral':
      node.expressions.forEach(expression => namesIn(expression, names));
      return names;
    case 'ConditionalExpression':
      namesIn(node.consequent, names);
      namesIn(node.alternate, names);
      return names;
    case 'LogicalExpression':
    case 'BinaryExpression':
      namesIn(node.left, names);
      namesIn(node.right, names);
      return names;
    default:
      return names;
  }
}

// A literal that reads as a number: "120.00 STX", "$102.00", "0.0004".
function isAmountText(text) {
  const trimmed = text.trim();
  if (!/\d/.test(trimmed)) return false;
  // Long letter-digit runs are addresses or hashes.
  if (/[A-Za-z0-9]{20,}/.test(trimmed.replace(/\s/g, ''))) return false;
  return /^[~≈<>+\-−$€£¥]*\s*\d[\d.,\s]*\s*[A-Za-z%]{0,6}$/.test(trimmed);
}

function looksLikeAmount(element) {
  const opening = element.openingElement;
  const names = [];
  const texts = [];
  for (const child of element.children ?? []) {
    if (child.type === 'JSXText') texts.push(child.value);
    else if (child.type === 'JSXExpressionContainer') {
      const text = getStaticString(child.expression);
      if (text !== null) texts.push(text);
      else namesIn(child, names);
    }
  }
  // Self-closing value components: <Balance balance={fee} textStyle="code" />.
  for (const attr of opening.attributes) {
    if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') continue;
    if (amountAttributes.test(attr.name.name)) {
      names.push(attr.name.name);
      namesIn(attributeValueNode(attr), names);
    }
  }
  if (names.some(name => monoContentName.test(name))) return false;
  return names.some(name => amountName.test(name)) || texts.some(isAmountText);
}

function monoReason(attr, checkTabular) {
  const name = attr.name.name;
  const leaves = collectLeaves(attr.value).map(getStaticString).filter(Boolean);
  if (name === 'textStyle') {
    const hit = leaves.find(value => monoTextStyles.has(value));
    return hit ? `textStyle="${hit}"` : null;
  }
  if (name === 'fontFamily') {
    const hit = leaves.find(value => monoFamily.test(value));
    return hit ? `fontFamily="${hit}"` : null;
  }
  if (checkTabular && (name === 'fontVariant' || name === 'fontVariantNumeric')) {
    return leaves.some(value => value.includes('tabular-nums')) ? `${name}="tabular-nums"` : null;
  }
  return null;
}

export const noMonoAmountRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Monospace is for full addresses and code. Amounts, totals, fees and balances use the ' +
        'Diatype text styles (label.02 for a value, heading.03 for the hero amount).',
    },
    messages: {
      monoAmount:
        'Use a Diatype text style (label.02 for a value, heading.03 for a hero amount) instead of {{reason}} on an amount; mono is for full addresses and code — {{link}}',
    },
    schema: [
      {
        type: 'object',
        properties: { checkTabular: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const checkTabular = context.options[0]?.checkTabular ?? false;
    return {
      JSXElement(element) {
        const opening = element.openingElement;
        // AddressDisplayer owns the address style.
        if (getJsxName(opening.name) === 'AddressDisplayer') return;
        for (const attr of opening.attributes) {
          if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') continue;
          const reason = monoReason(attr, checkTabular);
          if (!reason || !looksLikeAmount(element)) continue;
          context.report({
            node: attr,
            messageId: 'monoAmount',
            data: { reason, link: neverLink('mono-amount') },
          });
        }
      },
    };
  },
};
