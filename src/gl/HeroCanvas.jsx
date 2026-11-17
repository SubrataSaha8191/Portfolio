import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { motion } from '../animation/state';

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/**
 * Fixed full-viewport WebGL layer. The hero introduces it, scroll disperses it into a
 * neural field, the contact section re-assembles the same points into the portrait.
 */
export default function HeroCanvas({ onReady, introGate }) {
  const ref = useRef(null);
  const sceneRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!hasWebGL()) {
      setFallback(true);
      onReady?.({ count: 0, fallback: true });
      return;
    }
    const reduced = prefersReducedMotion();
    const mobile = window.matchMedia('(max-width: 820px)').matches;
    let dead = false;
    let scene = null;
    const onResize = () => scene && scene.resize();
    const boot = import('./PortraitScene').then(({ default: PortraitScene }) => {
      if (dead) return null;
      scene = new PortraitScene(ref.current, { src: '/portrait.webp', reduced, mobile });
      sceneRef.current = scene;
      return scene.load();
    });

    boot
      .then((count) => {
        if (dead || count == null) return;
        scene.start();
        onReady?.({ count, scene });
      })
      .catch(() => {
        if (dead) return;
        setFallback(true);
        onReady?.({ count: 0, fallback: true });
      });

    window.addEventListener('resize', onResize);
    const onPointer = (e) => {
      motion.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      motion.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      motion.pointer.px = e.clientX;
      motion.pointer.py = e.clientY;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    const onLost = (e) => {
      e.preventDefault();
      setFallback(true);
    };
    ref.current.addEventListener('webglcontextlost', onLost);

    return () => {
      dead = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      scene && scene.dispose();
      sceneRef.current = null;
    };
  }, []); // eslint-disable-line

  // expose intro playback
  useEffect(() => {
    if (!introGate || !sceneRef.current) return;
    const s = sceneRef.current;
    if (prefersReducedMotion()) {
      s.uniforms.uScan.value = 1.2;
      s.uniforms.uSettle.value = 1;
      return;
    }
    // push-in, then the halftone draws itself in behind a single scan
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(s.intro, { v: 1, duration: 2.4, ease: 'expo.out' }, 0)
      .to(s.uniforms.uScan, { value: 1.2, duration: 2.1, ease: 'power2.inOut' }, 0)
      .to(s.uniforms.uSettle, { value: 1, duration: 1.4, ease: 'power2.inOut' }, 1.3);
    return () => { tl.kill(); };
  }, [introGate]);

  return (
    <>
      <canvas ref={ref} className={`gl-canvas ${fallback ? 'is-hidden' : ''}`} aria-hidden="true" data-gl />
      {fallback && (
        <div className="gl-fallback" aria-hidden="true">
          <img src="/portrait.webp" alt="" />
          <i />
        </div>
      )}
    </>
  );
}
