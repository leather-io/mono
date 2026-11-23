import {
  codecLibrary,
  importsOnlyDirectUseBlocks,
  isTypeOnlyImport,
  kernelPackage,
} from './shared.js';

export const noBlocksOutsideKernelFilesRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Codecs and formats may only be assembled from micro-packed coders and @leather.io/kernel blocks inside *.kernel.ts files. Arithmetic and origin blocks are used directly.',
    },
    schema: [],
    messages: {
      defineInKernelFile:
        'Define the codec or format in a *.kernel.ts file and import it here. Those files may contain nothing but micro-packed coders and kernel blocks, which is what keeps the kernel guarantees valid. See the kernel-formats skill.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (isTypeOnlyImport(node) || ![kernelPackage, codecLibrary].includes(source)) return;
        if (source === kernelPackage && importsOnlyDirectUseBlocks(node)) return;
        context.report({ node, messageId: 'defineInKernelFile' });
      },
    };
  },
};
