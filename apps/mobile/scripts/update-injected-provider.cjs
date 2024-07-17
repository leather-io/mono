const fs = require('fs');
const path = require('path');

function updateInjectedProvider() {
  const projectRoot = path.resolve(__dirname, '../');
  const fileString = fs.readFileSync(
    path.resolve(projectRoot, 'src/scripts/injected-provider.js'),
    {
      encoding: 'utf8',
    }
  );
  fs.mkdirSync(path.resolve(projectRoot, 'src/scripts/dist'), { recursive: true });
  fs.writeFileSync(
    path.resolve(projectRoot, 'src/scripts/dist/injected-provider.ts'),
    `export default \`${fileString}\``
  );
}

module.exports = { updateInjectedProvider };
