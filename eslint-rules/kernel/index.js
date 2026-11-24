import { kernelOnlyFileRule } from './kernel-only-file.js';
import { noBlocksOutsideKernelFilesRule } from './no-blocks-outside-kernel-files.js';
import { noHandRolledEncodingRule } from './no-hand-rolled-encoding.js';

export const kernelPlugin = {
  rules: {
    'kernel-only-file': kernelOnlyFileRule,
    'no-blocks-outside-kernel-files': noBlocksOutsideKernelFilesRule,
    'no-hand-rolled-encoding': noHandRolledEncodingRule,
  },
};
