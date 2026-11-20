const bannedConstructors = new Map([
  ['DataView', 'uint(width, endian) or another @leather.io/kernel codec'],
  ['TextDecoder', 'text(length) or thenRestAsText(head) from @leather.io/kernel'],
  ['TextEncoder', 'text(length) or thenRestAsText(head) from @leather.io/kernel'],
]);

const bannedImports = new Map([
  ['concatBytes', 'tuple(…) or another @leather.io/kernel codec'],
  ['utf8ToBytes', 'text(length) or thenRestAsText(head) from @leather.io/kernel'],
]);

const parseIntReplacement = 'numeral(10) or numeral(16) from @leather.io/kernel';

function isParseInt(callee) {
  if (callee.type === 'Identifier') return callee.name === 'parseInt';
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'Number' &&
    callee.property.name === 'parseInt'
  );
}

export const noHandRolledEncodingRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Build and parse bytes and structured text with @leather.io/kernel instead of by hand.',
    },
    schema: [
      {
        type: 'object',
        properties: { allow: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      useKernel:
        'Do not use {{name}} here. Use {{replacement}}, defined in a *.kernel.ts file. See the kernel-formats skill.',
    },
  },
  create(context) {
    const allowed = new Set(context.options[0]?.allow ?? []);

    function report(node, name, replacement) {
      if (allowed.has(name)) return;
      context.report({ node, messageId: 'useKernel', data: { name, replacement } });
    }

    return {
      NewExpression(node) {
        if (node.callee.type !== 'Identifier') return;
        const replacement = bannedConstructors.get(node.callee.name);
        if (replacement) report(node, node.callee.name, replacement);
      },
      CallExpression(node) {
        if (isParseInt(node.callee)) report(node, 'parseInt', parseIntReplacement);
      },
      ImportSpecifier(node) {
        if (node.imported.type !== 'Identifier') return;
        const replacement = bannedImports.get(node.imported.name);
        if (replacement) report(node, node.imported.name, replacement);
      },
    };
  },
};
