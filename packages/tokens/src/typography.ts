const fontMap = {
  web: {
    firaCode: 'Fira Code',
    diatype: 'Diatype',
    marchePro: 'Marche',
  },
  mobile: {
    firaCode: 'Fira Code',
    diatype: 'DiatypeRegular',
    marchePro: 'MarcheSuperPro',
  },
};

// we might want to split up mobile into ios and android in the future.
type Platform = 'mobile' | 'web';

function getTextVariants({ platform }: { platform: Platform }) {
  const commonMarcheProStyles = {
    fontFamily: fontMap[platform].marchePro,
    textTransform: 'uppercase',
  };

  const commonDiatypeStyles = {
    fontFamily: fontMap[platform].diatype,
  };

  const commonFiracodeStyles = {
    fontFamily: fontMap[platform].firaCode,
  };

  function transformSize<T extends number>(size: T) {
    switch (platform) {
      case 'web':
        return `${(size / 16).toFixed(4)}rem` as const;
      case 'mobile':
        return size;
    }
  }

  function transformWeight<T extends number>(weight: T) {
    switch (platform) {
      case 'web':
        return weight;
      case 'mobile':
        return weight.toString();
    }
  }

  const display01 = {
    ...commonMarcheProStyles,
    fontSize: transformSize(150),
    lineHeight: transformSize(120),
  };
  const display02 = {
    ...commonMarcheProStyles,
    fontSize: transformSize(64),
    lineHeight: transformSize(56),
  };
  const heading01 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(53),
    fontWeight: transformWeight(500),
    lineHeight: transformSize(60),
  };
  const heading02 = {
    ...commonMarcheProStyles,
    fontSize: transformSize(44),
    fontWeight: transformWeight(800),
    lineHeight: transformSize(44),
  };
  const heading03 = {
    ...commonMarcheProStyles,
    fontSize: transformSize(32),
    fontWeight: transformWeight(800),
    lineHeight: transformSize(35),
    letterSpacing: 0.64,
  };
  const heading04 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(26),
    fontWeight: transformWeight(500),
    lineHeight: transformSize(36),
  };
  const heading05 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(21),
    fontWeight: transformWeight(500),
    lineHeight: transformSize(28),
  };
  const label01 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(16),
    fontWeight: transformWeight(500),
    lineHeight: transformSize(24),
    letterSpacing: 0.16,
  };
  const label02 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(15),
    fontWeight: transformWeight(500),
    lineHeight: transformSize(20),
  };
  const label03 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(13),
    fontWeight: transformWeight(500),
    lineHeight: transformSize(16),
  };
  const body01 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(17),
    fontWeight: transformWeight(400),
    lineHeight: transformSize(24),
  };
  const body02 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(15),
    fontWeight: transformWeight(400),
    lineHeight: transformSize(20),
  };
  const caption01 = {
    ...commonDiatypeStyles,
    fontSize: transformSize(15),
    fontWeight: transformWeight(400),
    lineHeight: transformSize(20),
  };

  const code = {
    ...commonFiracodeStyles,
    fontSize: transformSize(13),
    lineHeight: transformSize(18),
    fontWeight: transformWeight(450),
  };

  const textVariants = {
    display01,
    display02,
    heading01,
    heading02,
    heading03,
    heading04,
    heading05,
    label01,
    label02,
    label03,
    body01,
    body02,
    caption01,
    code,
    defaults: body01,
  };

  return textVariants;
}

export function getExtensionTextVariants() {
  const textVariants = getTextVariants({ platform: 'web' });

  return {
    'display.01': {
      description: 'display.01',
      value: textVariants.display01,
    },
    'display.02': {
      description: 'display.02',
      value: textVariants.display02,
    },

    'heading.01': {
      description: 'heading.01',
      value: textVariants.heading01,
    },
    'heading.02': {
      description: 'heading.02',
      value: textVariants.heading02,
    },
    'heading.03': {
      description: 'heading.03',
      value: textVariants.heading03,
    },
    'heading.04': {
      description: 'heading.04',
      value: textVariants.heading04,
    },
    'heading.05': {
      description: 'heading.05',
      value: textVariants.heading05,
    },

    'label.01': {
      description: 'label.01',
      value: textVariants.label01,
    },
    'label.02': {
      description: 'label.02',
      value: textVariants.label02,
    },
    'label.03': {
      description: 'label.03',
      value: textVariants.label03,
    },

    'body.01': {
      description: 'body.01',
      value: textVariants.body01,
    },
    'body.02': {
      description: 'body.02',
      value: textVariants.body02,
    },

    'caption.01': {
      description: 'caption.01',
      value: textVariants.caption01,
    },

    code: {
      description: 'code',
      value: textVariants.code,
    },
  } as const;
}

export function getMobileTextVariants() {
  return getTextVariants({ platform: 'mobile' });
}
