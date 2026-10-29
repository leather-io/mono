// Keyframes for the marketing pages' entrance motion, rebuilt from the Framer site's appear
// effects. Registered in panda.config.ts. Entrances start at opacity 0.001 (as Framer does) rather
// than 0, so the browser still counts the first paint for LCP.
export const marketingKeyframes = {
  // Hero copy, store buttons, phishing banner (A02)
  marketingAppear: {
    from: { opacity: 0.001 },
    to: { opacity: 1 },
  },
  // Hero headline, one word at a time (A01)
  marketingWordIn: {
    from: { opacity: 0.001, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'none' },
  },
  // Hero mockups (A03)
  marketingDropIn: {
    from: { opacity: 0.001, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'none' },
  },
  // /news and /posts list rows (N01, P01)
  marketingRiseIn: {
    from: { opacity: 0.001, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'none' },
  },
  // /explorer hero stickers (E01); the resting angle comes from --sticker-rotate
  marketingStickerPop: {
    from: { opacity: 0.001, transform: 'scale(1.15) rotate(0deg)' },
    to: { opacity: 1, transform: 'scale(1) rotate(var(--sticker-rotate, 0deg))' },
  },
  // 404 illustration (X01)
  marketingFlyIn: {
    from: { opacity: 0.001, transform: 'translate(-300px, -300px) rotate(-30deg)' },
    to: { opacity: 1, transform: 'rotate(-10deg)' },
  },
  // Install modal, desktop dialog (M01)
  marketingModalIn: {
    from: { opacity: 0, transform: 'translate(52px, 50px) scale(0.7)' },
    to: { opacity: 1, transform: 'none' },
  },
  marketingModalOut: {
    from: { opacity: 1, transform: 'none' },
    to: { opacity: 0, transform: 'translate(26px, 25px) scale(0.85)' },
  },
  // Install modal, mobile bottom sheet (M01)
  marketingSheetIn: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'none' },
  },
  marketingSheetOut: {
    from: { transform: 'none' },
    to: { transform: 'translateY(100%)' },
  },
};
