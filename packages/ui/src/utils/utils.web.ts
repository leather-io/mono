export function getScrollParent(node: HTMLElement | null) {
  if (node === null) return null;
  if (node.scrollHeight > node.clientHeight) return node;
  return getScrollParent(node.parentNode as HTMLElement);
}
