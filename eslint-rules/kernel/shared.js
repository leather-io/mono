export const kernelPackage = '@leather.io/kernel';

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
