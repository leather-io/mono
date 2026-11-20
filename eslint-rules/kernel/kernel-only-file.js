import { existsSync } from 'node:fs';

import { isKernelFileSource, isTypeOnlyImport, kernelPackage } from './shared.js';

const bytesHelperSource = '@noble/hashes/utils';
const bytesHelperName = 'hexToBytes';

function isLiteral(node) {
  return node.type === 'Literal' && ['string', 'number'].includes(typeof node.value);
}

function isBytesHelperImport(node) {
  return (
    node.source.value === bytesHelperSource &&
    node.specifiers.every(
      specifier =>
        specifier.type === 'ImportSpecifier' && specifier.imported.name === bytesHelperName
    )
  );
}

export const kernelOnlyFileRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'A *.kernel.ts file may only define codecs and formats by calling @leather.io/kernel blocks.',
    },
    schema: [
      {
        type: 'object',
        properties: { requireSpec: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: {
      missingSpec:
        'Add {{spec}} with at least one fixed vector for each codec or format in this file, so a change to its layout is deliberate.',
      onlyKernelImports:
        'Import only from @leather.io/kernel or another *.kernel.ts file here. Other code belongs in the file that uses the codec or format.',
      onlyConstDefinitions:
        'Only `const` definitions built from @leather.io/kernel blocks are allowed here. Move functions, branches and other logic to the file that uses the codec or format.',
      onlyKernelBlocks:
        'Build this value only from @leather.io/kernel blocks, other codecs or formats, and string or number literals. See the kernel-formats skill.',
    },
  },
  create(context) {
    const blocks = new Set();
    const values = new Set();
    const bytesHelpers = new Set();

    function isKnownValue(node) {
      return node.type === 'Identifier' && (values.has(node.name) || blocks.has(node.name));
    }

    function isOptions(node) {
      return (
        node.type === 'ObjectExpression' &&
        node.properties.every(
          property =>
            property.type === 'Property' &&
            !property.computed &&
            (isLiteral(property.value) || isKnownValue(property.value))
        )
      );
    }

    function isLiteralBytes(node) {
      if (node.type !== 'CallExpression') return false;
      const { callee } = node;
      if (callee.type === 'Identifier' && bytesHelpers.has(callee.name))
        return node.arguments.length === 1 && isLiteral(node.arguments[0]);
      return (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.object.type === 'Identifier' &&
        callee.object.name === 'Uint8Array' &&
        callee.property.name === 'of' &&
        node.arguments.every(isLiteral)
      );
    }

    function isBlockCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        blocks.has(node.callee.name) &&
        node.arguments.every(isArgument)
      );
    }

    function isArgument(node) {
      return (
        isLiteral(node) ||
        isKnownValue(node) ||
        isOptions(node) ||
        isLiteralBytes(node) ||
        isBlockCall(node)
      );
    }

    function checkImport(node) {
      if (isTypeOnlyImport(node)) return;
      const source = node.source.value;
      const names = node.specifiers.map(specifier => specifier.local.name);
      if (source === kernelPackage) return names.forEach(name => blocks.add(name));
      if (isKernelFileSource(source)) return names.forEach(name => values.add(name));
      if (isBytesHelperImport(node)) return names.forEach(name => bytesHelpers.add(name));
      context.report({ node, messageId: 'onlyKernelImports' });
    }

    function checkDefinition(node) {
      if (node.kind !== 'const') return context.report({ node, messageId: 'onlyConstDefinitions' });
      for (const declarator of node.declarations) {
        const { id, init } = declarator;
        const isAllowed =
          id.type === 'Identifier' &&
          init &&
          (isLiteral(init) || isKnownValue(init) || isLiteralBytes(init) || isBlockCall(init));
        if (!isAllowed) context.report({ node: declarator, messageId: 'onlyKernelBlocks' });
        if (id.type === 'Identifier') values.add(id.name);
      }
    }

    function checkStatement(node) {
      if (node.type === 'ImportDeclaration') return checkImport(node);
      if (node.type === 'TSTypeAliasDeclaration' || node.type === 'TSInterfaceDeclaration') return;
      if (node.type === 'VariableDeclaration') return checkDefinition(node);
      if (node.type === 'ExportNamedDeclaration' && node.declaration) {
        return checkStatement(node.declaration);
      }
      context.report({ node, messageId: 'onlyConstDefinitions' });
    }

    return {
      Program(node) {
        node.body.forEach(checkStatement);
        if (!context.options[0]?.requireSpec) return;
        const spec = context.filename.replace(/\.ts$/, '.spec.ts');
        if (!existsSync(spec))
          context.report({ node, messageId: 'missingSpec', data: { spec: spec.split('/').pop() } });
      },
    };
  },
};
