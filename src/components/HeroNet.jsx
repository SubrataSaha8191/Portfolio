import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../animation/gsap';

/**
 * A quiet neural field behind the headline: nodes drift, near neighbours connect, and the
 * cursor pulls nearby nodes toward it with lime links. 2D canvas, ~55 nodes, paused offscreen.
 */
export default function HeroNet() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const reduced = prefersReducedMotion();
    const mobile = window.innerWidth < 820;
    const N = mobile ? 28 : 56;
    let w = 0, h = 0, dpr = 1, raf = 0, vis = true;
    const m = { x: -9999, y: -9999 };
    const nodes = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00018, vy: (Math.random() - 0.5) * 0.00018, r: 1 + Math.random() * 1.8 }));

    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0 });
    io.observe(c);
    const mv = (e) => { const r = c.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; };
    window.addEventListener('pointermove', mv, { passive: true });

    const LINK = mobile ? 110 : 150;
    const draw = (dt) => {
      ctx.clearRect(0, 0, w, h);
      const P = nodes.map((n) => {
        if (!reduced) {
          n.x += n.vx * dt; n.y += n.vy * dt;
          if (n.x < 0 || n.x > 1) n.vx *= -1;
          if (n.y < 0 || n.y > 1) n.vy *= -1;
        }
        let x = n.x * w, y = n.y * h;
        const dx = m.x - x, dy = m.y - y, d = Math.hypot(dx, dy);
        if (d < 240 && !reduced) { const k = (1 - d / 240) * 0.22; x += dx * k; y += dy * k; }
        return { x, y, r: n.r, d };
      });
      ctx.lineWidth = 1;
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
          if (d < LINK) { ctx.strokeStyle = `rgba(236,232,220,${(1 - d / LINK) * 0.17})`; ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke(); }
        }
        if (P[i].d < 200) { ctx.strokeStyle = `rgba(198,255,61,${(1 - P[i].d / 200) * 0.5})`; ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(m.x, m.y); ctx.stroke(); }
      }
      P.forEach((p) => { ctx.fillStyle = p.d < 200 ? 'rgba(198,255,61,0.9)' : 'rgba(236,232,220,0.45)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
    };

    let last = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(now - last, 50); last = now;
      if (vis && !document.hidden) draw(dt);
    };
    if (reduced) draw(0); else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', mv); };
  }, []);

  return <canvas ref={ref} className="hero__net" aria-hidden="true" />;
}
