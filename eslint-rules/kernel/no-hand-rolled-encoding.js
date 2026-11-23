const bannedConstructors = new Map([
  ['DataView', 'a micro-packed coder such as U32BE'],
  ['TextDecoder', 'strictText(length) from @leather.io/utils/kernel'],
  ['TextEncoder', 'strictText(length) from @leather.io/utils/kernel'],
]);

const bannedImports = new Map([
  ['concatBytes', 'tuple([…]) or struct({…}) from micro-packed'],
  ['utf8ToBytes', 'strictText(length) from @leather.io/utils/kernel'],
]);

const parseIntReplacement = 'numeral(10) or numeral(16) from @leather.io/utils/kernel';

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
        'Build and parse bytes and structured text with @leather.io/utils/kernel instead of by hand.',
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
