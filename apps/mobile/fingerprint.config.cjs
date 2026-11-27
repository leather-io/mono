const fs = require('node:fs');
const path = require('node:path');

const alternateAppIconPattern = /^(adaptive-)?icon-\d+\.png$/;

const alternateAppIcons = fs
  .readdirSync(path.join(__dirname, 'src/assets'))
  .filter(name => alternateAppIconPattern.test(name))
  .sort()
  .map(name => ({
    type: 'file',
    filePath: `src/assets/${name}`,
    reasons: ['expoAlternateAppIcons'],
  }));

module.exports = {
  extraSources: [
    { type: 'dir', filePath: '../../patches', reasons: ['pnpmPatches'] },
    ...alternateAppIcons,
  ],
};
