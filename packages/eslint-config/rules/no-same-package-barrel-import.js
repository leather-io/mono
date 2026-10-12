import fs from 'node:fs';
import path from 'node:path';

const resolvableExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const indexFilePattern = /^index\.(ts|tsx|js|jsx)$/;
const packageInfoCache = new Map();

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function findPackageInfo(dir) {
  if (packageInfoCache.has(dir)) return packageInfoCache.get(dir);
  const packageJsonPath = path.join(dir, 'package.json');
  let info = null;
  if (isFile(packageJsonPath)) {
    try {
      const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      info = { dir, name: typeof name === 'string' ? name : null };
    } catch {
      info = { dir, name: null };
    }
  } else {
    const parent = path.dirname(dir);
    info = parent === dir ? null : findPackageInfo(parent);
  }
  packageInfoCache.set(dir, info);
  return info;
}

function resolveToFile(basePath) {
  if (resolvableExtensions.some(ext => basePath.endsWith(ext)) && isFile(basePath)) return basePath;
  for (const ext of resolvableExtensions) {
    if (isFile(basePath + ext)) return basePath + ext;
  }
  for (const ext of resolvableExtensions) {
    const indexPath = path.join(basePath, `index${ext}`);
    if (isFile(indexPath)) return indexPath;
  }
  return null;
}

function matchPathPattern(pattern, specifier) {
  const starIndex = pattern.indexOf('*');
  if (starIndex === -1) return specifier === pattern ? '' : null;
  const prefix = pattern.slice(0, starIndex);
  const suffix = pattern.slice(starIndex + 1);
  if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) return null;
  if (specifier.length < prefix.length + suffix.length) return null;
  return specifier.slice(prefix.length, specifier.length - suffix.length);
}

function resolveAliasedSpecifier(specifier, compilerOptions) {
  if (!compilerOptions || !compilerOptions.paths) return null;
  const base = compilerOptions.baseUrl ?? compilerOptions.pathsBasePath;
  if (!base) return null;
  for (const [pattern, targets] of Object.entries(compilerOptions.paths)) {
    const wildcard = matchPathPattern(pattern, specifier);
    if (wildcard === null) continue;
    for (const target of targets) {
      const resolved = resolveToFile(path.resolve(base, target.replace('*', wildcard)));
      if (resolved) return resolved;
    }
  }
  return null;
}

function isWithin(parentDir, childPath) {
  return childPath === parentDir || childPath.startsWith(parentDir + path.sep);
}

export const noSamePackageBarrelImportRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing a package from inside itself, and importing an index barrel from within its own directory tree. Both create circular dependencies.',
    },
    messages: {
      selfImport:
        "Do not import '{{name}}' from inside its own package. Import the module file directly.",
      barrelImport:
        "Do not import the barrel '{{barrel}}' from within its own directory tree. Import the module file directly to avoid circular dependencies.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename;
    const fileDir = path.dirname(filename);
    const packageInfo = findPackageInfo(fileDir);
    const program = context.sourceCode.parserServices?.program;
    const compilerOptions = program ? program.getCompilerOptions() : null;

    function check(sourceNode) {
      if (!sourceNode || sourceNode.type !== 'Literal' || typeof sourceNode.value !== 'string') {
        return;
      }
      const specifier = sourceNode.value;

      if (
        packageInfo?.name &&
        (specifier === packageInfo.name || specifier.startsWith(`${packageInfo.name}/`))
      ) {
        context.report({
          node: sourceNode,
          messageId: 'selfImport',
          data: { name: packageInfo.name },
        });
        return;
      }

      const resolved = specifier.startsWith('.')
        ? resolveToFile(path.resolve(fileDir, specifier))
        : resolveAliasedSpecifier(specifier, compilerOptions);
      if (!resolved || !indexFilePattern.test(path.basename(resolved))) return;

      const barrelDir = path.dirname(resolved);
      if (!isWithin(barrelDir, fileDir)) return;
      if (packageInfo && !isWithin(packageInfo.dir, barrelDir)) return;

      context.report({
        node: sourceNode,
        messageId: 'barrelImport',
        data: { barrel: path.relative(packageInfo ? packageInfo.dir : fileDir, resolved) },
      });
    }

    return {
      ImportDeclaration(node) {
        check(node.source);
      },
      ExportNamedDeclaration(node) {
        check(node.source);
      },
      ExportAllDeclaration(node) {
        check(node.source);
      },
      ImportExpression(node) {
        check(node.source);
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          check(node.arguments[0]);
        }
      },
    };
  },
};
