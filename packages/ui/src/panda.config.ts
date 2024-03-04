import { defineGlobalStyles } from '@pandacss/dev';

import { pandaConfig } from './panda.config.base';

// Use dummy globalCss without any extension specific styles
const dummyGlobalCss = defineGlobalStyles({});

export default pandaConfig({ globalCss: dummyGlobalCss });
