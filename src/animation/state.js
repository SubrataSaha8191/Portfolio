// Mutable, non-reactive bridge between scroll/pointer (GSAP, DOM) and the WebGL
// render loop. Nothing here triggers a React render.
export const motion = {
  pointer: { x: 0, y: 0, px: 0, py: 0 }, // ndc + pixel
  scroll: 0, // px
  velocity: 0, // px/frame-ish, smoothed
  disperse: 0, // 0 = portrait, 1 = neural field
  contact: 0, // 0 = hero layout, 1 = contact layout
  ambient: 0, // canvas opacity weight outside hero
  menuOpen: false,
  ready: false,
};
