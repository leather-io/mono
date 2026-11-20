import { isTypeOnlyImport, kernelPackage } from './shared.js';

export const noBlocksOutsideKernelFilesRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Codecs and formats may only be assembled from @leather.io/kernel blocks inside *.kernel.ts files.',
    },
    schema: [],
    messages: {
      defineInKernelFile:
        'Define the codec or format in a *.kernel.ts file and import it here. Those files may contain nothing but kernel blocks, which is what keeps the Lean guarantees valid. See the kernel-formats skill.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== kernelPackage || isTypeOnlyImport(node)) return;
        context.report({ node, messageId: 'defineInKernelFile' });
      },
    };
  },
};
