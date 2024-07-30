export function nextAnimationFrame() {
  return new Promise(requestAnimationFrame);
}
