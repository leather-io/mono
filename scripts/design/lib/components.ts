import { existsSync, globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { repoRoot } from './system.ts';

interface ComponentInfo {
  name: string;
  file: string;
  line: number;
  kind: 'function' | 'styled';
  props: string[];
  // Props inherited wholesale from another component (ButtonProps, ComponentProps<typeof Button>).
  inherits: string[];
  baseElement: string | null;
  renders: string[];
  // Where each rendered tag comes from: '@leather.io/ui', 'leather-styles/jsx', 'local', 'intrinsic'.
  renderSources: Record<string, string>;
  styleValues: Record<string, string[]>;
  // Attributes a wrapper hard-codes on the @leather.io/ui components it renders.
  presets: Record<string, string[]>;
  // Exported from its file (export function / export const / export { … }).
  exported?: boolean;
}

interface UiMeta {
  name: string;
  file: string;
  useWhen: string[];
  dontUseWhen: { situation: string; use: string }[];
  replaces: string[];
  playground?: string;
}

interface UiCatalog {
  components: ComponentInfo[];
  exports: string[];
  // Icon components (LockIcon, InfoCircleIcon): not assessed as components, but
  // their size and colour props count as restyles.
  icons: string[];
  meta: Map<string, UiMeta>;
}

const uiRoot = path.join(repoRoot, 'packages/ui/src');
const isPascal = (name: string) => /^[A-Z][A-Za-z0-9]*$/.test(name);
const signatureKeys = new Set([
  'borderRadius',
  'rounded',
  'height',
  'h',
  'textStyle',
  'bg',
  'color',
  'px',
  'py',
  'gap',
  'border',
]);

function parse(file: string) {
  const text = readFileSync(file, 'utf8');
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
}

function walk(node: ts.Node, visit: (node: ts.Node) => void) {
  visit(node);
  node.forEachChild(child => walk(child, visit));
}

function containsJsx(node: ts.Node) {
  let found = false;
  walk(node, child => {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child))
      found = true;
  });
  return found;
}

function importsOf(sf: ts.SourceFile) {
  const map = new Map<string, { module: string; imported: string }>();
  for (const statement of sf.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !statement.importClause ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      continue;
    const module = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (clause.name) map.set(clause.name.text, { module, imported: 'default' });
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        map.set(element.name.text, {
          module,
          imported: (element.propertyName ?? element.name).text,
        });
      }
    }
    if (bindings && ts.isNamespaceImport(bindings))
      map.set(bindings.name.text, { module, imported: '*' });
  }
  return map;
}

// styled('button', {...}) / styled.button({...}) / styled.button`...`
function styledCall(
  node: ts.Expression | undefined
): { element: string; config?: ts.ObjectLiteralExpression } | null {
  if (!node) return null;
  if (ts.isCallExpression(node)) {
    const callee = node.expression;
    if (ts.isIdentifier(callee) && callee.text === 'styled') {
      const first = node.arguments[0];
      const element =
        first && ts.isStringLiteral(first) ? first.text : first ? first.getText() : '?';
      const config =
        node.arguments[1] && ts.isObjectLiteralExpression(node.arguments[1])
          ? node.arguments[1]
          : undefined;
      return { element, config };
    }
    if (
      ts.isPropertyAccessExpression(callee) &&
      ts.isIdentifier(callee.expression) &&
      callee.expression.text === 'styled'
    ) {
      const config =
        node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])
          ? node.arguments[0]
          : undefined;
      return { element: callee.name.text, config };
    }
  }
  if (ts.isTaggedTemplateExpression(node) && ts.isPropertyAccessExpression(node.tag)) {
    const tag = node.tag;
    if (ts.isIdentifier(tag.expression) && tag.expression.text === 'styled')
      return { element: tag.name.text };
  }
  return null;
}

function propName(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return null;
}

function variantKeys(config: ts.ObjectLiteralExpression | undefined): string[] {
  if (!config) return [];
  for (const prop of config.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      propName(prop.name) === 'variants' &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      return prop.initializer.properties.flatMap(variant => {
        const name = variant.name ? propName(variant.name) : null;
        return name ? [name] : [];
      });
    }
  }
  return [];
}

function collectStyleValues(node: ts.Node, into: Record<string, string[]>) {
  const add = (key: string, value: string) => {
    if (!signatureKeys.has(key)) return;
    const list = (into[key] ??= []);
    if (!list.includes(value)) list.push(value);
  };
  walk(node, child => {
    if (ts.isPropertyAssignment(child)) {
      const key = propName(child.name);
      if (key && (ts.isStringLiteral(child.initializer) || ts.isNumericLiteral(child.initializer)))
        add(key, child.initializer.text);
    }
    if (ts.isJsxAttribute(child) && ts.isIdentifier(child.name) && child.initializer) {
      const init = child.initializer;
      if (ts.isStringLiteral(init)) add(child.name.text, init.text);
      if (
        ts.isJsxExpression(init) &&
        init.expression &&
        (ts.isStringLiteral(init.expression) || ts.isNumericLiteral(init.expression))
      ) {
        add(child.name.text, init.expression.text);
      }
    }
  });
}

interface FileContext {
  sf: ts.SourceFile;
  imports: Map<string, { module: string; imported: string }>;
  styled: Map<string, { element: string; variants: string[] }>;
  types: Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>;
}

function fileContext(file: string): FileContext {
  const sf = parse(file);
  const styled = new Map<string, { element: string; variants: string[] }>();
  const types = new Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>();
  for (const statement of sf.statements) {
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement))
      types.set(statement.name.text, statement);
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        const call = styledCall(decl.initializer);
        if (call && ts.isIdentifier(decl.name))
          styled.set(decl.name.text, { element: call.element, variants: variantKeys(call.config) });
      }
    }
  }
  return { sf, imports: importsOf(sf), styled, types };
}

const strip = (name: string) => name.replace(/Props$/, '');

type PropsOut = { props: Set<string>; inherits: Set<string>; baseElement: string | null };

// Resolves a props type into own prop names and inherited component names.
function resolveProps(type: ts.TypeNode | undefined, ctx: FileContext, out: PropsOut, depth = 0) {
  if (!type || depth > 4) return;
  if (ts.isTypeLiteralNode(type)) {
    for (const member of type.members) {
      const name = member.name ? propName(member.name) : null;
      if (name) out.props.add(name);
    }
    return;
  }
  if (ts.isIntersectionTypeNode(type) || ts.isUnionTypeNode(type)) {
    for (const part of type.types) resolveProps(part, ctx, out, depth + 1);
    return;
  }
  if (ts.isParenthesizedTypeNode(type)) return resolveProps(type.type, ctx, out, depth + 1);
  if (ts.isTypeReferenceNode(type))
    resolveNamed(type.typeName.getText(), type.typeArguments ?? [], ctx, out, depth);
}

// A named type, from a type reference or an interface `extends` clause.
function resolveNamed(
  name: string,
  args: readonly ts.TypeNode[],
  ctx: FileContext,
  out: PropsOut,
  depth: number
) {
  if (depth > 4) return;
  if (/^(Omit|Pick|Partial|Required|Readonly)$/.test(name) && args[0]) {
    const inner: PropsOut = { props: new Set(), inherits: new Set(), baseElement: null };
    resolveProps(args[0], ctx, inner, depth + 1);
    const keys = args[1]
      ? [...args[1].getText().matchAll(/'([^']+)'|"([^"]+)"/g)].map(m => m[1] ?? m[2])
      : [];
    const keep = (prop: string) =>
      name === 'Omit' ? !keys.includes(prop) : name === 'Pick' ? keys.includes(prop) : true;
    inner.props.forEach(prop => keep(prop) && out.props.add(prop));
    inner.inherits.forEach(inherited => out.inherits.add(inherited));
    out.baseElement ??= inner.baseElement;
    return;
  }
  if (/ComponentProps(WithoutRef|WithRef)?$/.test(name) && args[0]) {
    const arg = args[0];
    if (ts.isTypeQueryNode(arg)) {
      const target = arg.exprName.getText();
      const styled = ctx.styled.get(target);
      if (styled) {
        styled.variants.forEach(variant => out.props.add(variant));
        out.baseElement ??= styled.element;
      } else out.inherits.add(target);
    } else if (ts.isLiteralTypeNode(arg) && ts.isStringLiteral(arg.literal)) {
      out.baseElement ??= arg.literal.text;
    }
    return;
  }
  if (/^HTMLStyledProps$|HTMLAttributes$/.test(name)) {
    const literal =
      args[0] && ts.isLiteralTypeNode(args[0]) && ts.isStringLiteral(args[0].literal)
        ? args[0].literal.text
        : null;
    out.baseElement ??= literal ?? (name.includes('Button') ? 'button' : null);
    return;
  }
  const local = ctx.types.get(name);
  if (local) {
    if (ts.isInterfaceDeclaration(local)) {
      for (const member of local.members) {
        const prop = member.name ? propName(member.name) : null;
        if (prop) out.props.add(prop);
      }
      for (const clause of local.heritageClauses ?? []) {
        for (const heritage of clause.types) {
          resolveNamed(
            heritage.expression.getText(),
            heritage.typeArguments ?? [],
            ctx,
            out,
            depth + 1
          );
        }
      }
    } else resolveProps(local.type, ctx, out, depth + 1);
    return;
  }
  const imported = ctx.imports.get(name);
  if (imported || /Props$/.test(name)) out.inherits.add(strip(imported?.imported ?? name));
}

function jsxTag(node: ts.JsxTagNameExpression): string {
  return node.getText();
}

function functionComponent(
  name: string,
  fn: ts.SignatureDeclaration & { body?: ts.Node },
  ctx: FileContext,
  file: string,
  line: number
): ComponentInfo {
  const out: PropsOut = { props: new Set(), inherits: new Set(), baseElement: null };
  const param = fn.parameters[0];
  if (param) {
    resolveProps(param.type, ctx, out);
    if (ts.isObjectBindingPattern(param.name)) {
      for (const element of param.name.elements) {
        if (element.dotDotDotToken) continue;
        const key = element.propertyName
          ? propName(element.propertyName)
          : ts.isIdentifier(element.name)
            ? element.name.text
            : null;
        if (key) out.props.add(key);
      }
    }
  }
  // Props destructured from `props` inside the body: const { a, b } = props
  if (fn.body && param && ts.isIdentifier(param.name)) {
    const paramName = param.name.text;
    walk(fn.body, node => {
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        ts.isIdentifier(node.initializer) &&
        node.initializer.text === paramName &&
        ts.isObjectBindingPattern(node.name)
      ) {
        for (const element of node.name.elements) {
          if (element.dotDotDotToken) continue;
          const key = element.propertyName
            ? propName(element.propertyName)
            : ts.isIdentifier(element.name)
              ? element.name.text
              : null;
          if (key) out.props.add(key);
        }
      }
    });
  }
  const renders: string[] = [];
  const renderSources: Record<string, string> = {};
  const styleValues: Record<string, string[]> = {};
  const presets: Record<string, string[]> = {};
  if (fn.body) {
    walk(fn.body, node => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = jsxTag(node.tagName);
        if (!renders.includes(tag)) renders.push(tag);
        const root = tag.split('.')[0];
        const imported = ctx.imports.get(root);
        if (imported?.module === '@leather.io/ui') {
          const attrs = node.attributes.properties.flatMap(attr =>
            ts.isJsxAttribute(attr) ? [attr.getText().replace(/\s+/g, ' ')] : []
          );
          if (attrs.length) presets[tag] = [...(presets[tag] ?? []), ...attrs];
        }
        renderSources[tag] = /^[a-z]/.test(tag)
          ? 'intrinsic'
          : imported
            ? imported.module
            : ctx.styled.has(tag)
              ? 'local styled'
              : 'local';
      }
    });
    collectStyleValues(fn.body, styleValues);
  }
  let baseElement = out.baseElement;
  for (const tag of renders) {
    if (baseElement) break;
    if (tag === 'button' || tag === 'styled.button') baseElement = 'button';
    else if (ctx.styled.get(tag)?.element === 'button') baseElement = 'button';
  }
  for (const tag of ctx.styled.keys()) {
    if (renders.includes(tag)) {
      const decl = findVariable(ctx.sf, tag);
      if (decl) collectStyleValues(decl, styleValues);
    }
  }
  return {
    name,
    file,
    line,
    kind: 'function',
    props: [...out.props].filter(prop => prop !== 'children'),
    inherits: [...out.inherits],
    baseElement,
    renders,
    renderSources,
    styleValues,
    presets,
  };
}

function findVariable(sf: ts.SourceFile, name: string): ts.VariableDeclaration | null {
  for (const statement of sf.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === name) return decl;
    }
  }
  return null;
}

function unwrapFunction(
  expr: ts.Expression | undefined
): (ts.ArrowFunction | ts.FunctionExpression) | null {
  if (!expr) return null;
  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) return expr;
  if (ts.isCallExpression(expr) && /(^|\.)(forwardRef|memo)$/.test(expr.expression.getText()))
    return unwrapFunction(expr.arguments[0]);
  if (ts.isParenthesizedExpression(expr)) return unwrapFunction(expr.expression);
  return null;
}

export function componentsInFile(
  file: string,
  displayFile = file,
  only?: Set<string>
): ComponentInfo[] {
  const ctx = fileContext(file);
  const found: ComponentInfo[] = [];
  const lineOf = (node: ts.Node) => ctx.sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  for (const statement of ctx.sf.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && isPascal(statement.name.text)) {
      if (only && !only.has(statement.name.text)) continue;
      if (statement.body && containsJsx(statement.body)) {
        found.push(
          functionComponent(statement.name.text, statement, ctx, displayFile, lineOf(statement))
        );
      }
    }
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !isPascal(decl.name.text)) continue;
        const name = decl.name.text;
        if (only && !only.has(name)) continue;
        const styled = styledCall(decl.initializer);
        if (styled) {
          const styleValues: Record<string, string[]> = {};
          if (styled.config) collectStyleValues(styled.config, styleValues);
          found.push({
            name,
            file: displayFile,
            line: lineOf(decl),
            kind: 'styled',
            props: variantKeys(styled.config),
            inherits: [],
            baseElement: styled.element,
            renders: [`styled.${styled.element}`],
            renderSources: { [`styled.${styled.element}`]: 'leather-styles/jsx' },
            styleValues,
            presets: {},
          });
          continue;
        }
        const fn = unwrapFunction(decl.initializer);
        if (fn && containsJsx(fn))
          found.push(functionComponent(name, fn, ctx, displayFile, lineOf(decl)));
      }
    }
  }
  const exported = exportedNames(ctx.sf);
  for (const component of found) component.exported = exported.has(component.name);
  return found;
}

function hasExportModifier(node: ts.Node) {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
  );
}

// Names a file exports itself: `export function X`, `export const X`,
// `export { X }` and `export default X`.
function exportedNames(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  for (const statement of sf.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && hasExportModifier(statement))
      names.add(statement.name.text);
    if (ts.isVariableStatement(statement) && hasExportModifier(statement))
      for (const decl of statement.declarationList.declarations)
        if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
    if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    )
      for (const element of statement.exportClause.elements)
        names.add((element.propertyName ?? element.name).text);
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression))
      names.add(statement.expression.text);
  }
  return names;
}

// ---------- @leather.io/ui catalog ----------

function resolveModule(fromFile: string, specifier: string): string | null {
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.web.ts'),
  ]) {
    if (existsSync(candidate) && !candidate.endsWith(path.sep) && /\.tsx?$/.test(candidate))
      return candidate;
  }
  return null;
}

// name -> defining file, following `export *` and `export { X } from` chains.
function collectExports(file: string, into: Map<string, string>, depth = 0) {
  if (depth > 4) return;
  const sf = parse(file);
  for (const statement of sf.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      !statement.isTypeOnly
    ) {
      const target = resolveModule(file, statement.moduleSpecifier.text);
      if (!target) continue;
      if (!statement.exportClause) collectExports(target, into, depth + 1);
      else if (ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          if (element.isTypeOnly) continue;
          const local = (element.propertyName ?? element.name).text;
          const sub = new Map<string, string>();
          collectExports(target, sub, depth + 1);
          into.set(element.name.text, sub.get(local) ?? target);
        }
      }
      continue;
    }
    const exported =
      ts.canHaveModifiers(statement) &&
      ts.getModifiers(statement)?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) into.set(statement.name.text, file);
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations)
        if (ts.isIdentifier(decl.name)) into.set(decl.name.text, file);
    }
  }
}

function stringArray(node: ts.Expression | undefined): string[] {
  if (!node || !ts.isArrayLiteralExpression(node)) return [];
  return node.elements.flatMap(element => (ts.isStringLiteralLike(element) ? [element.text] : []));
}

function loadMeta(): Map<string, UiMeta> {
  const metas = new Map<string, UiMeta>();
  for (const rel of globSync('**/*.meta.shared.ts', { cwd: uiRoot })) {
    const file = path.join(uiRoot, rel);
    walk(parse(file), node => {
      if (!ts.isCallExpression(node) || node.expression.getText() !== 'defineComponentMeta') return;
      const arg = node.arguments[0];
      if (!arg || !ts.isObjectLiteralExpression(arg)) return;
      const get = (key: string) => {
        const prop = arg.properties.find(
          p => ts.isPropertyAssignment(p) && propName(p.name) === key
        );
        return prop && ts.isPropertyAssignment(prop) ? prop.initializer : undefined;
      };
      const name = get('name');
      if (!name || !ts.isStringLiteralLike(name)) return;
      const dont = get('dontUseWhen');
      const playground = get('playground');
      metas.set(name.text, {
        name: name.text,
        file: path.relative(repoRoot, file),
        useWhen: stringArray(get('useWhen')),
        replaces: stringArray(get('replaces')),
        playground: playground && ts.isStringLiteralLike(playground) ? playground.text : undefined,
        dontUseWhen:
          dont && ts.isArrayLiteralExpression(dont)
            ? dont.elements.flatMap(element => {
                if (!ts.isObjectLiteralExpression(element)) return [];
                const field = (key: string) => {
                  const prop = element.properties.find(
                    p => ts.isPropertyAssignment(p) && propName(p.name) === key
                  );
                  return prop &&
                    ts.isPropertyAssignment(prop) &&
                    ts.isStringLiteralLike(prop.initializer)
                    ? prop.initializer.text
                    : '';
                };
                return [{ situation: field('situation'), use: field('use') }];
              })
            : [],
      });
    });
  }
  return metas;
}

export function loadUiCatalog(): UiCatalog {
  const exportsMap = new Map<string, string>();
  collectExports(path.join(uiRoot, 'exports.web.ts'), exportsMap);
  const names = [...exportsMap.keys()].filter(isPascal);
  const byFile = new Map<string, Set<string>>();
  for (const [name, file] of exportsMap) {
    if (!isPascal(name)) continue;
    const wanted = byFile.get(file) ?? new Set<string>();
    wanted.add(name);
    byFile.set(file, wanted);
  }
  const components: ComponentInfo[] = [];
  for (const [file, wanted] of byFile) {
    const display = path.relative(repoRoot, file);
    const found = componentsInFile(file, display, wanted);
    components.push(...found);
    // Compound components (Tooltip = Object.assign(...), DropdownMenu = { Root, ... }) still count by name.
    for (const name of wanted) {
      if (!found.some(component => component.name === name) && !/Icon$/.test(name)) {
        components.push({
          name,
          file: display,
          line: 1,
          kind: 'function',
          props: [],
          inherits: [],
          baseElement: null,
          renders: [],
          renderSources: {},
          styleValues: {},
          presets: {},
        });
      }
    }
  }
  return {
    components: components.filter(
      component => !/Icon$/.test(component.name) || component.name === 'IconButton'
    ),
    exports: names.filter(name => !/Icon$/.test(name) || name === 'IconButton'),
    icons: names.filter(name => /Icon$/.test(name) && name !== 'IconButton'),
    meta: loadMeta(),
  };
}

// ---------- similarity ----------

const domProps = new Set([
  'onClick',
  'onChange',
  'onFocus',
  'onBlur',
  'onKeyDown',
  'onPointerDown',
  'type',
  'disabled',
  'href',
  'id',
  'title',
  'style',
  'className',
  'ref',
  'key',
  'name',
  'value',
  'tabIndex',
  'role',
  'form',
  'target',
  'rel',
  'aria-label',
  'aria-busy',
  'aria-pressed',
  'aria-expanded',
]);
// Common local names for things ui already expresses differently.
const synonyms: Record<string, string> = {
  loading: 'aria-busy',
  isLoading: 'aria-busy',
  busy: 'aria-busy',
  pending: 'aria-busy',
  block: 'fullWidth',
  wide: 'fullWidth',
  stretch: 'fullWidth',
  fullwidth: 'fullWidth',
  tone: 'intent',
  danger: 'intent',
  destructive: 'intent',
  kind: 'variant',
  appearance: 'variant',
  icon: 'iconStart',
  leftIcon: 'iconStart',
  rightIcon: 'iconEnd',
  startIcon: 'iconStart',
  endIcon: 'iconEnd',
  isDisabled: 'disabled',
  onPress: 'onClick',
};

const words = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean);

function levenshteinRatio(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return 1 - row[b.length] / Math.max(a.length, b.length, 1);
}

interface PropCoverage {
  prop: string;
  how: 'own prop' | 'DOM/HTML prop' | 'inherited' | `maps to ${string}` | 'missing';
}

interface Candidate {
  ui: string;
  file: string;
  total: number;
  scores: { name: number; props: number; structure: number; meta: number };
  reasons: string[];
  coverage: PropCoverage[];
}

function coverageFor(local: ComponentInfo, ui: ComponentInfo): PropCoverage[] {
  const own = new Set(ui.props);
  const dom = ui.baseElement !== null;
  return local.props
    .filter(prop => prop !== 'className')
    .map(prop => {
      if (local.inherits.includes(ui.name)) return { prop, how: 'inherited' as const };
      if (own.has(prop)) return { prop, how: 'own prop' as const };
      if (dom && (domProps.has(prop) || prop.startsWith('aria-') || prop.startsWith('data-')))
        return { prop, how: 'DOM/HTML prop' as const };
      const mapped = synonyms[prop];
      if (mapped && (own.has(mapped) || (dom && domProps.has(mapped))))
        return { prop, how: `maps to ${mapped}` as const };
      return { prop, how: 'missing' as const };
    });
}

function scoreCandidates(local: ComponentInfo, catalog: UiCatalog): Candidate[] {
  const localWords = words(local.name);
  const localRawTags = new Set(
    local.renders.map(tag => (tag === 'styled.button' || tag === 'button' ? 'button' : tag))
  );
  return catalog.components
    .map(ui => {
      const reasons: string[] = [];
      const uiWords = words(ui.name);
      const common = uiWords.filter(word => localWords.includes(word));
      const wordScore = common.length
        ? 0.7 * (common.length / uiWords.length) + 0.3 * (common.length / localWords.length)
        : 0;
      const charScore = 0.6 * levenshteinRatio(local.name.toLowerCase(), ui.name.toLowerCase());
      const name = Math.max(wordScore, charScore);
      if (common.length) reasons.push(`name shares "${common.join(' ')}"`);

      const coverage = coverageFor(local, ui);
      let props = 0;
      if (local.inherits.includes(ui.name)) {
        props = 1;
        reasons.push(`props type is ${ui.name}Props`);
      } else if (coverage.length) {
        const weight = coverage.reduce(
          (sum, entry) => sum + (entry.how === 'own prop' ? 1 : entry.how === 'missing' ? 0 : 0.5),
          0
        );
        props = weight / coverage.length;
        const shared = coverage.filter(entry => entry.how === 'own prop').map(entry => entry.prop);
        if (shared.length) reasons.push(`shares prop(s) ${shared.join(', ')}`);
      }

      let structure = 0;
      if (local.renders.includes(ui.name) && local.renderSources[ui.name] === '@leather.io/ui') {
        structure = 1;
        reasons.push(`renders <${ui.name}> directly (a wrapper)`);
      } else if (ui.baseElement && local.baseElement === ui.baseElement) {
        structure = 0.6;
        reasons.push(`same base element <${ui.baseElement}>`);
      } else {
        // Compound parts compare by part name: RadixTooltip.Root ~ Tooltip.Root.
        const normalise = (tag: string) =>
          tag.includes('.') && /^[A-Z]/.test(tag) ? `.${tag.split('.').pop()}` : tag;
        const uiTags = new Set(ui.renders.filter(tag => /^[A-Z]/.test(tag)).map(normalise));
        const localTags = [
          ...new Set([...localRawTags].filter(tag => /^[A-Z]/.test(tag)).map(normalise)),
        ];
        const shared = localTags.filter(tag => uiTags.has(tag));
        if (shared.length) {
          structure = 0.5 * (shared.length / new Set([...uiTags, ...localTags]).size);
          reasons.push(`both render ${shared.join(', ')}`);
        }
      }

      let meta = 0;
      const info = catalog.meta.get(ui.name);
      if (info) {
        const replaced = info.replaces.filter(pattern => {
          if (pattern === '<button>') return local.renders.includes('button');
          if (/^styled[.(]/.test(pattern))
            return (
              local.renders.includes('styled.button') ||
              (local.kind === 'styled' && local.baseElement === 'button')
            );
          return false;
        });
        if (replaced.length) {
          meta = 1;
          reasons.push(`meta: ${ui.name} replaces ${replaced.join(', ')}`);
        }
        const useText = info.useWhen.join(' ').toLowerCase();
        const hits = localWords.filter(word => word.length > 3 && useText.includes(word));
        if (hits.length && meta < 1) {
          meta = Math.max(meta, 0.3);
          reasons.push(`meta useWhen mentions ${hits.join(', ')}`);
        }
      }
      // dontUseWhen entries say "not <meta component>, use <this one>", so they
      // only apply to locals that could have been the meta component: interactive ones.
      const interactive =
        local.baseElement === 'button' ||
        local.baseElement === 'a' ||
        local.props.some(prop => /^(onClick|onPress|onSelect|href)$/.test(prop));
      for (const other of interactive ? catalog.meta.values() : []) {
        for (const alt of other.dontUseWhen) {
          if (alt.use !== ui.name) continue;
          const situation = alt.situation.toLowerCase();
          const hits = localWords.filter(word => word.length > 3 && situation.includes(word));
          if (hits.length) {
            meta = Math.max(meta, 0.5);
            reasons.push(`${other.name} meta: "${alt.situation}" → use ${ui.name}`);
          }
        }
      }

      const total = 0.35 * name + 0.25 * props + 0.25 * structure + 0.15 * meta;
      const r = (n: number) => Math.round(n * 100) / 100;
      return {
        ui: ui.name,
        file: ui.file,
        total: r(total),
        scores: { name: r(name), props: r(props), structure: r(structure), meta: r(meta) },
        reasons,
        coverage,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export const thresholds = { match: 0.45 };

type ComponentVerdict =
  | { kind: 'scaffolding'; text: string }
  | { kind: 'reuse'; ui: string; text: string }
  | { kind: 'extend'; ui: string; props: string[]; text: string }
  | { kind: 'new'; text: string };

export interface ComponentAssessment {
  component: ComponentInfo;
  candidates: Candidate[];
  verdict: ComponentVerdict;
  evidence: string[];
}

const pxOf = (value: string, radii: Record<string, number>) =>
  radii[value] ??
  (/^\d+(\.\d+)?px$/.test(value) ? parseFloat(value) : /^\d+$/.test(value) ? Number(value) : null);

export function assessComponent(
  local: ComponentInfo,
  catalog: UiCatalog,
  radii: Record<string, number>
): ComponentAssessment {
  if (/(Page|Route|Layout)$/.test(local.name)) {
    return {
      component: local,
      candidates: [],
      verdict: { kind: 'scaffolding', text: 'page scaffolding — not a system component' },
      evidence: [],
    };
  }
  // Exploration screens are compositions of recipes, not candidates for
  // packages/ui: names ending in Screen, and in a variants/<x>/<x>-screens.tsx
  // file the components it exports (index.tsx maps them to screens) plus local
  // screen bodies (they take the screen's `frame` or render a page shell).
  // Rows, cards, buttons and other pieces defined in a -screens.tsx file are
  // real components and are still assessed.
  const isScreensFile = /-screens\.tsx$/.test(local.file);
  const isScreenBody =
    local.props.includes('frame') ||
    local.renders.some(tag => /^(FramePage|PopupPage|TabPage)$/.test(tag));
  if (/Screen$/.test(local.name) || (isScreensFile && (local.exported !== false || isScreenBody))) {
    return {
      component: local,
      candidates: [],
      verdict: { kind: 'scaffolding', text: 'screen composition — not a system component' },
      evidence: [],
    };
  }
  const visual = local.renders.some(tag => !/Provider$/.test(tag));
  if (!visual) {
    return {
      component: local,
      candidates: [],
      verdict: {
        kind: 'scaffolding',
        text: 'non-visual wrapper (providers only) — not a system component',
      },
      evidence: [],
    };
  }
  const candidates = scoreCandidates(local, catalog).slice(0, 3);
  const best = candidates[0];
  const evidence: string[] = [];
  if (!best || best.total < thresholds.match) {
    return {
      component: local,
      candidates,
      verdict: {
        kind: 'new',
        text: 'new component — needs a meta file (useWhen/dontUseWhen/replaces) and a gallery entry',
      },
      evidence: [
        `best match ${best ? `${best.ui} ${best.total}` : 'none'} is below ${thresholds.match}`,
      ],
    };
  }
  const ui = catalog.components.find(component => component.name === best.ui);
  if (!ui) throw new Error(`Missing UI component for candidate ${best.ui}`);
  // Style values the local hard-codes that ui already has (or does differently).
  for (const key of ['borderRadius', 'rounded']) {
    for (const value of local.styleValues[key] ?? []) {
      const uiValues = [...(ui.styleValues.borderRadius ?? []), ...(ui.styleValues.rounded ?? [])];
      const localPx = pxOf(value, radii);
      const same = uiValues.find(
        uiValue => uiValue === value || (localPx !== null && pxOf(uiValue, radii) === localPx)
      );
      if (same)
        evidence.push(`${key} ${value} = ${ui.name}'s borderRadius "${same}" (already built in)`);
      else if (uiValues.length)
        evidence.push(`${key} ${value} differs from ${ui.name}'s "${uiValues.join('/')}"`);
    }
  }
  const presets = local.presets[ui.name];
  if (presets?.length) {
    evidence.push(
      `only presets ${presets.join(' ')} on ${ui.name}: pass those at the call site instead of keeping a wrapper`
    );
  }
  const mapped = best.coverage.filter(entry => entry.how.startsWith('maps to'));
  for (const entry of mapped)
    evidence.push(`${entry.prop} → ${entry.how.replace('maps to ', '')} on ${ui.name}`);
  const missing = best.coverage.filter(entry => entry.how === 'missing').map(entry => entry.prop);
  if (missing.length === 0) {
    return {
      component: local,
      candidates,
      verdict: { kind: 'reuse', ui: ui.name, text: `reuse ${ui.name} as-is` },
      evidence,
    };
  }
  return {
    component: local,
    candidates,
    verdict: {
      kind: 'extend',
      ui: ui.name,
      props: missing,
      text: `extend ${ui.name} with prop(s) ${missing.join(', ')}`,
    },
    evidence,
  };
}
