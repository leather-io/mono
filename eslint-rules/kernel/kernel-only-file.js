import { existsSync } from 'node:fs';

import {
  codecLibrary,
  isKernelFileSource,
  isTypeOnlyImport,
  kernelPackage,
  looseTextCoders,
} from './shared.js';

const bytesHelperSource = '@noble/hashes/utils';
const bytesHelperName = 'hexToBytes';

function isLiteral(node) {
  if (node.type !== 'Literal') return false;
  return node.raw === 'null' || ['string', 'number'].includes(typeof node.value);
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
        'A *.kernel.ts file may only define codecs and formats by calling micro-packed coders and @leather.io/kernel blocks.',
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
        'Import only from micro-packed, @leather.io/kernel or another *.kernel.ts file here. Other code belongs in the file that uses the codec or format.',
      onlyConstDefinitions:
        'Only `const` definitions built from micro-packed coders and @leather.io/kernel blocks are allowed here. Move functions, branches and other logic to the file that uses the codec or format.',
      onlyKernelBlocks:
        'Build this value only from micro-packed coders, @leather.io/kernel blocks, other codecs or formats, and literals. See the kernel-formats skill.',
      useStrictText:
        'Do not use {{name}} from micro-packed: it repairs invalid UTF-8 instead of refusing it. Use strictText(length) from @leather.io/kernel.',
    },
  },
  create(context) {
    const blocks = new Set();
    const values = new Set();
    const bytesHelpers = new Set();
    const libraryNamespaces = new Set();

    function isLibraryMember(node) {
      if (node.type !== 'MemberExpression' || node.computed) return false;
      const { object } = node;
      if (object.type === 'Identifier') return libraryNamespaces.has(object.name);
      return isLibraryMember(object);
    }

    function isKnownValue(node) {
      if (isLibraryMember(node)) return true;
      return node.type === 'Identifier' && (values.has(node.name) || blocks.has(node.name));
    }

    function isOptions(node) {
      return (
        node.type === 'ObjectExpression' &&
        node.properties.every(
          property =>
            property.type === 'Property' && !property.computed && isArgument(property.value)
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

    function isBlock(callee) {
      if (callee.type === 'Identifier') return blocks.has(callee.name);
      return isLibraryMember(callee) && callee.object.type === 'Identifier';
    }

    function isBlockCall(node) {
      return (
        node.type === 'CallExpression' && isBlock(node.callee) && node.arguments.every(isArgument)
      );
    }

    function isField(node) {
      return node.type === 'ArrayExpression' && node.elements.every(isArgument);
    }

    function isArgument(node) {
      return (
        node !== null &&
        (isField(node) ||
          isLiteral(node) ||
          isKnownValue(node) ||
          isOptions(node) ||
          isLiteralBytes(node) ||
          isBlockCall(node))
      );
    }

    function checkLibraryImport(node) {
      for (const specifier of node.specifiers) {
        if (specifier.type === 'ImportNamespaceSpecifier') {
          libraryNamespaces.add(specifier.local.name);
        } else if (specifier.type !== 'ImportSpecifier') {
          context.report({ node: specifier, messageId: 'onlyKernelImports' });
        } else if (looseTextCoders.has(specifier.imported.name)) {
          const data = { name: specifier.imported.name };
          context.report({ node: specifier, messageId: 'useStrictText', data });
        } else {
          blocks.add(specifier.local.name);
        }
      }
    }

    function checkImport(node) {
      if (isTypeOnlyImport(node)) return;
      const source = node.source.value;
      if (source === codecLibrary) return checkLibraryImport(node);
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
      MemberExpression(node) {
        const { object, property } = node;
        if (node.computed || object.type !== 'Identifier') return;
        if (!libraryNamespaces.has(object.name) || !looseTextCoders.has(property.name)) return;
        context.report({ node, messageId: 'useStrictText', data: { name: property.name } });
      },
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
