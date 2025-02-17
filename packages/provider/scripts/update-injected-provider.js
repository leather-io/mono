import fs from 'fs';
import path from 'path';

export function updateInjectedProvider() {
  const projectRoot = path.resolve(import.meta.dirname, '../');
  const fileString = fs.readFileSync(path.resolve(projectRoot, 'dist/mobile.js'), {
    encoding: 'utf8',
  });
  fs.writeFileSync(
    path.resolve(projectRoot, 'dist/injected-provider.js'),
    `export default ({branch, commitSha, version}) =>  \`${fileString
      .replaceAll('`', '\\`')
      .replaceAll('$', '\\$')}\``
      .replace('"replace_branch"', '"${branch}"')
      .replace('"replace_commit_sha"', '"${commitSha}"')
      .replace('"replace_version"', '"${version}"')
  );
}
