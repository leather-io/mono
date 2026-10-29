// A bad import (a name the module doesn't export, e.g. a native-only icon from
// @leather.io/ui) is a SyntaxError at module link time. On a deep link it kills
// React Router's hydration script before React runs, so no error boundary can
// catch it and the page stays blank. This inline classic script runs before the
// module scripts, listens for that error and draws a plain-DOM message naming
// the failing file (and variant, for exploration areas).
const guard = `(function () {
  if (window.__playgroundLoadGuard) return;
  window.__playgroundLoadGuard = true;
  function where(file, line) {
    var path = String(file || '').replace(/^https?:\\/\\/[^/]+/, '').replace(/[?#].*$/, '');
    var area = /\\/areas\\/([^/]+)\\/(?:variants\\/([^/]+)\\/)?/.exec(path);
    var short = path.replace(/^.*\\/pages\\/playground\\//, '');
    var label = area ? 'Area ' + area[1] + (area[2] ? ' · variant ' + area[2] : '') : 'Playground';
    return { label: label, file: short ? short + (line ? ':' + line : '') : '' };
  }
  function show(message, file, line) {
    if (document.getElementById('playground-load-error')) return;
    var at = where(file, line);
    var missingExport = /does not provide an export named/.test(message);
    var hint = missingExport
      ? 'An import names something its module does not export on web. Icons that exist only in the ui package\\'s native entry (packages/ui/src/icons/*.native.tsx, @leather.io/ui/native) are not exported on web; use one listed in packages/ui/src/icons/index.web.ts. Run pnpm --filter @leather.io/web typecheck to find every bad import.'
      : 'Run pnpm --filter @leather.io/web typecheck, then check the browser console.';
    var box = document.createElement('div');
    box.id = 'playground-load-error';
    box.setAttribute('role', 'alert');
    box.style.cssText = 'position:fixed;inset:24px auto auto 24px;z-index:2147483647;max-width:720px;padding:20px 24px;border:1px solid var(--colors-ink-border-default, #ccc);border-left:4px solid var(--colors-red-action-primary-default, #d33);border-radius:8px;background:var(--colors-ink-background-primary, #fff);color:var(--colors-ink-text-primary, #111);font:14px/1.45 system-ui, sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.12)';
    var title = document.createElement('strong');
    title.textContent = at.label + ' failed to load';
    var src = document.createElement('div');
    src.style.cssText = 'margin-top:6px;font-family:ui-monospace, monospace;font-size:12px';
    src.textContent = at.file;
    var msg = document.createElement('div');
    msg.style.cssText = 'margin-top:8px;font-family:ui-monospace, monospace;font-size:12px;white-space:pre-wrap;word-break:break-word';
    msg.textContent = message;
    var tip = document.createElement('div');
    tip.style.cssText = 'margin-top:10px;font-size:13px;opacity:.8';
    tip.textContent = hint;
    box.append(title, src, msg, tip);
    (document.body || document.documentElement).appendChild(box);
  }
  window.addEventListener('error', function (event) {
    var isSyntax = (event.error && event.error.name === 'SyntaxError') || /SyntaxError/.test(event.message || '');
    if (isSyntax) show(String(event.message || event.error).replace(/^Uncaught /, ''), event.filename, event.lineno);
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    var message = String((reason && reason.message) || reason);
    if (/does not provide an export named|dynamically imported module|Importing a module script failed/.test(message))
      show(message, '', 0);
  });
})();`;

export function LoadGuard() {
  // Runs once from the server-rendered HTML; React only hydrates the tag.
  return <script id="playground-load-guard" dangerouslySetInnerHTML={{ __html: guard }} />;
}
