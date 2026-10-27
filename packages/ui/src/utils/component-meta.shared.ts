type MetaPlatform = 'web' | 'native';

interface MetaAlternative {
  situation: string;
  use: string;
}

interface MetaExample {
  title: string;
  platform: MetaPlatform;
  code: string;
  seenIn?: string;
}

export interface ComponentMeta {
  name: string;
  importFrom: Partial<Record<MetaPlatform, '@leather.io/ui' | '@leather.io/ui/native'>>;
  useWhen: string[];
  dontUseWhen: MetaAlternative[];
  replaces: string[];
  examples: MetaExample[];
  playground?: string;
}

export function defineComponentMeta(meta: ComponentMeta): ComponentMeta {
  return meta;
}
