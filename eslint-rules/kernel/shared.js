export const kernelPackage = '@leather.io/kernel';
export const codecLibrary = 'micro-packed';
export const looseTextCoders = new Set(['string', 'cstring']);

const directUseBlocks = new Set([
  'quantity',
  'sumQuantities',
  'settle',
  'webOrigin',
  'isSameWebOrigin',
]);

export function importsOnlyDirectUseBlocks(node) {
  return (
    node.specifiers.length > 0 &&
    node.specifiers.every(
      specifier =>
        specifier.importKind === 'type' ||
        (specifier.type === 'ImportSpecifier' && directUseBlocks.has(specifier.imported.name))
    )
  );
}

const kernelFileSuffix = /\.kernel(\.ts)?$/;

export function isKernelFileSource(source) {
  return source.startsWith('.') && kernelFileSuffix.test(source);
}

export function isTypeOnlyImport(node) {
  return (
    node.importKind === 'type' ||
    (node.specifiers.length > 0 &&
      node.specifiers.every(specifier => specifier.importKind === 'type'))
  );
}
