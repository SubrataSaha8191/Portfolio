import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { dab, PAINT } from '../animation/spray';
import { wallTile } from '../animation/wall';
import { tunnel } from '../animation/state';
import { scrollToTarget } from '../animation/smoothScroll';
import CanIcon from './CanIcon';

/* ----------------------------------------------------------------------------------
   OPENING FILM  —  "go through the wall"
   1 the wall    2 a can sprays a bullseye on it    3 a paint bazooka rises into frame
   4 it fires: a paint rocket crosses the room and hits the target
   5 the wall cracks, paint explodes, a ragged hole is punched through it
   6 the film hands over to SCROLL: as you scroll you travel through the hole (it grows
     until it swallows the screen) while the landing page fades from 0 to full opacity.
   The wall is one canvas (concrete + paint) with the hole cut out of it every frame, so the
   hole can keep growing with scroll and scrolling back up closes the wall again.
------------------------------------------------------------------------------------- */

const VB = { w: 1200, h: 700 };
const RING = (r) => `M${600 + r} 350 A${r} ${r} 0 1 1 ${600 - r} 350 A${r} ${r} 0 1 1 ${600 + r} 350`;
const STROKES = [
  { id: 't1', d: RING(125), c: PAINT.red, r: 12, n: 46, t: 0.6 },
  { id: 't2', d: RING(62), c: PAINT.yellow, r: 9, n: 40, t: 0.42 },
  { id: 't3', d: 'M600 185 V515 M435 350 H765', c: PAINT.ink, r: 7, n: 34, t: 0.4 },
];
const SCENES = ['the wall', 'the target', 'the bazooka', 'impact', 'the other side'];
const SUBS = ['a wall.', 'someone marks a target.', 'someone brought a bazooka.', '', 'scroll to go through the wall.'];
const TAU = Math.PI * 2;
const norm = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };

export default function Preloader({ ready, onReveal }) {
  const root = useRef(null);
  const viewRef = useRef(null);
  const fxRef = useRef(null);
  const pathsRef = useRef(null);
  const canRef = useRef(null);
  const bazRef = useRef(null);
  const muzzleRef = useRef(null);
  const rocketRef = useRef(null);
  const flashRef = useRef(null);
  const muzzleFlash = useRef(null);
  const shardsRef = useRef(null);
  const sceneEl = useRef(null);
  const subRef = useRef(null);
  const barsRef = useRef(null);
  const skipRef = useRef(null);
  const master = useRef(null);
  const waiting = useRef(false);
  const readyRef = useRef(ready);
  const phase = useRef('film'); // film -> open
  const alive = useRef(true);
  const cb = useRef({ onReveal });
  cb.current = { onReveal };
  readyRef.current = ready;

  useEffect(() => { if (ready && waiting.current && master.current) { waiting.current = false; master.current.play(); } }, [ready]);

  const { contextSafe } = useGSAP(() => {
    alive.current = true;
    const el = root.current;
    const reduced = prefersReducedMotion();
    const W = window.innerWidth, H = window.innerHeight;
    const lowPower = W < 820 || (navigator.hardwareConcurrency || 8) <= 4;
    const view = viewRef.current, fx = fxRef.current;
    view.width = fx.width = W; view.height = fx.height = H;
    const vctx = view.getContext('2d'), fctx = fx.getContext('2d');
    const art = document.createElement('canvas'); art.width = W; art.height = H;
    const actx = art.getContext('2d');
    const sc = Math.min(W / VB.w, H / VB.h) * 0.8;
    const ox = (W - VB.w * sc) / 2, oy = (H - VB.h * sc) / 2 - H * 0.02;
    const CX = ox + 600 * sc, CY = oy + 350 * sc;
    const can = canRef.current, baz = bazRef.current, rocket = rocketRef.current;
    const setScene = (i) => {
      if (sceneEl.current) sceneEl.current.textContent = SCENES[i];
      if (subRef.current) { subRef.current.textContent = SUBS[i]; gsap.fromTo(subRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }); }
    };

    // ---------- the wall: concrete + paint, with a jagged hole cut out each frame ----------
    const pattern = wallTile ? vctx.createPattern(wallTile, 'repeat') : null;
    const hole = { r: 0, on: false };
    const R0 = Math.min(W, H) * 0.17, RMAX = Math.max(Math.hypot(W, H) * 0.64, Math.hypot(Math.max(CX, W - CX), Math.max(CY, H - CY)) * 1.3 + 60); // always reaches the far corner, whatever the aspect ratio
    const N = 44;
    const shape = Array.from({ length: N }, (_, i) => 0.84 + Math.random() * 0.3 + (i % 7 === 0 ? 0.34 : 0));
    const holePath = (c, r) => {
      c.beginPath();
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * TAU, rr = r * shape[i % N];
        const x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr;
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.closePath();
    };
    const draw = () => {
      vctx.globalCompositeOperation = 'source-over';
      vctx.clearRect(0, 0, W, H);
      vctx.fillStyle = pattern || '#262522';
      vctx.fillRect(0, 0, W, H);
      vctx.drawImage(art, 0, 0);
      if (hole.on && hole.r > 0) {
        holePath(vctx, hole.r);
        vctx.save();
        vctx.globalCompositeOperation = 'destination-out'; vctx.fill();
        vctx.globalCompositeOperation = 'source-atop';
        vctx.lineJoin = 'round';
        vctx.strokeStyle = '#0d0c0b'; vctx.lineWidth = 18; vctx.stroke();
        vctx.strokeStyle = '#ffd60a'; vctx.lineWidth = 4; vctx.stroke();
        vctx.restore();
      }
    };
    draw();

    // scroll hook: the hero's ScrollTrigger drives this (0 = just punched through, 1 = fully through)
    tunnel.render = (p) => {
      if (!hole.on) return;
      const e = p * p * (0.4 + 0.6 * p);
      hole.r = R0 + (RMAX - R0) * e;
      view.style.transform = `scale(${1 + 0.35 * p})`;
      view.style.transformOrigin = `${CX}px ${CY}px`;
      view.style.visibility = p > 0.995 ? 'hidden' : 'visible';
      if (subRef.current) subRef.current.style.opacity = String(Math.max(0, 1 - p * 5));
      if (skipRef.current) skipRef.current.style.opacity = String(Math.max(0, 1 - p * 5));
      draw();
    };

    const finish = () => { /* the film ends open; the scroll takes over */ };

    if (reduced) {
      // short alternative: no bazooka; the page simply appears (hero shows fully, no fly-through)
      setScene(4);
      view.style.display = 'none';
      const m = gsap.timeline();
      master.current = m;
      m.to({}, { duration: 0.4 }).call(() => { if (!readyRef.current) { waiting.current = true; m.pause(); } }).call(() => { tunnel.open = false; cb.current.onReveal(); el.style.display = 'none'; });
      return;
    }

    // ---------- helpers ----------
    const pathEl = (id) => pathsRef.current.querySelector(`[data-id="${id}"]`);
    const toScreen = (pt) => ({ x: ox + pt.x * sc, y: oy + pt.y * sc });
    gsap.set(can, { x: W + 80, y: H * 0.5, opacity: 0, rotation: -32, transformOrigin: '50% 6%' });
    const stroke = (s) => {
      const p = pathEl(s.id), L = p.getTotalLength(), tl = gsap.timeline();
      const start = toScreen(p.getPointAtLength(0));
      tl.to(can, { x: start.x - 28, y: start.y - 6, rotation: -32 + (Math.random() - 0.5) * 14, duration: 0.14, ease: 'power2.inOut' });
      const st = { v: 0 }; let last = 0;
      tl.to(st, {
        v: 1, duration: s.t, ease: 'power1.inOut',
        onUpdate: () => {
          const from = last * L, to = st.v * L, step = Math.max(2, s.r * sc * 0.34);
          for (let l = from; l <= to; l += step) {
            const q = toScreen(p.getPointAtLength(l));
            dab(actx, q.x, q.y, s.r * sc, s.c, s.n, 0.6, [0.8, 2.4]);
            if (Math.random() < 0.3) dab(actx, q.x, q.y, s.r * sc * 2.8, s.c, 7, 0.28, [0.6, 1.5]);
          }
          last = st.v;
          const e = toScreen(p.getPointAtLength(to));
          gsap.set(can, { x: e.x - 28, y: e.y - 6 }); draw();
        },
      });
      return tl;
    };

    // ---------- the bazooka: placed bottom-right, aimed at the target ----------
    const bw = Math.min(W * 0.52, 640), bh = bw * (280 / 640);
    gsap.set(baz, { width: bw, height: bh, right: -bw * 0.06, bottom: -bh * 0.12, transformOrigin: '100% 100%', opacity: 1, yPercent: 130, rotation: 0 });
    // Solve the aim analytically: the launcher pivots about its bottom-right corner, the muzzle sits at a fixed
    // offset from that pivot, and the barrel must point from the (rotated) muzzle at the target.
    const aim = () => {
      const px = W + bw * 0.06, py = H + bh * 0.12;
      const mx0 = -bw * 0.984, my0 = -bh * 0.5;
      let best = 0, bestErr = Infinity;
      for (let th = 0; th < 1.45; th += 0.002) {
        const mx = px + mx0 * Math.cos(th) - my0 * Math.sin(th), my = py + mx0 * Math.sin(th) + my0 * Math.cos(th);
        const err = Math.abs(norm(Math.atan2(CY - my, CX - mx) - Math.PI - th));
        if (err < bestErr) { bestErr = err; best = th; }
      }
      return best;
    };

    const m = gsap.timeline({ delay: 0.1 });
    master.current = m;
    setScene(0);
    const bars = barsRef.current.children;
    gsap.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: 'expo.out', delay: 0.15 });

    // scene 1-2: the can paints the target
    const first = toScreen(pathEl('t1').getPointAtLength(0));
    m.to(can, { opacity: 1, x: first.x - 28, y: first.y - 6, duration: 0.7, ease: 'power3.out' }, 0.45)
      .call(() => setScene(1), null, 0.9);
    let t = 1.0;
    STROKES.forEach((s) => { m.add(stroke(s), t); t += s.t + 0.2; });
    m.to(can, { x: -120, y: H * 0.15, rotation: -50, duration: 0.45, ease: 'power2.in' }, t);

    // scene 3: the bazooka rises and settles on the target
    let theta = 0;
    m.addLabel('baz', t + 0.2)
      .call(() => { setScene(2); theta = aim(); gsap.set(baz, { rotation: (theta * 180) / Math.PI, yPercent: 130 }); }, null, 'baz')
      .to(baz, { yPercent: 0, duration: 0.8, ease: 'back.out(1.4)' }, 'baz+=0.05')
      .to(baz, { rotation: () => (theta * 180) / Math.PI + 2.4, duration: 0.18, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 'baz+=0.85')
      .addLabel('hold', 'baz+=1.6')
      .call(() => { if (!readyRef.current) { waiting.current = true; m.pause(); } }, null, 'hold');

    // scene 4: charge, fire, the rocket crosses the room
    const flight = { x: 0, y: 0, s: 1 };
    let mz = { x: 0, y: 0 };
    const rocketLive = () => { gsap.set(rocket, { x: flight.x - 70, y: flight.y - 35, scale: flight.s, rotation: (theta * 180) / Math.PI }); };
    m.addLabel('fire', 'hold+=0.1')
      .call(() => {
        setScene(3);
        const r = muzzleRef.current.getBoundingClientRect();
        mz = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        flight.x = mz.x; flight.y = mz.y; flight.s = 1;
        gsap.set(rocket, { opacity: 1 }); rocketLive();
        gsap.set(muzzleFlash.current, { x: mz.x - 90, y: mz.y - 90, opacity: 1, scale: 0.3 });
        // smoke at the muzzle
        for (let i = 0; i < 6; i++) dab(actx, mz.x - 20 - i * 12, mz.y + (Math.random() - 0.5) * 24, 34 + i * 8, i % 2 ? '#efe8d6' : '#8d8a82', 22, 0.28, [2, 5]);
        draw();
      }, null, 'fire')
      .to(muzzleFlash.current, { scale: 1.5, opacity: 0, duration: 0.28, ease: 'power3.out' }, 'fire')
      .to(baz, { x: 46, y: 26, rotation: () => (theta * 180) / Math.PI + 3, duration: 0.09, ease: 'power4.out' }, 'fire')
      .to(baz, { x: 0, y: 0, rotation: () => (theta * 180) / Math.PI, duration: 0.55, ease: 'elastic.out(1,0.5)' }, 'fire+=0.09')
      .to(flight, {
        x: CX, y: CY, s: 0.12, duration: 0.8, ease: 'power2.in',
        onUpdate: () => {
          const prev = rocket._p || { x: mz.x, y: mz.y }; const cur = { x: flight.x, y: flight.y };
          const steps = Math.max(1, Math.ceil(Math.hypot(cur.x - prev.x, cur.y - prev.y) / 10));
          const cols = [PAINT.red, PAINT.yellow, PAINT.cyan, PAINT.pink];
          for (let i = 1; i <= steps; i++) {
            const x = prev.x + ((cur.x - prev.x) * i) / steps, y = prev.y + ((cur.y - prev.y) * i) / steps;
            dab(actx, x, y, 16 * (0.3 + flight.s), cols[(i + steps) % 4], 14, 0.6, [1, 3]);
            if (Math.random() < 0.5) dab(actx, x, y, 34 * (0.3 + flight.s), '#efe8d6', 5, 0.22, [1, 3]);
          }
          rocket._p = cur; rocketLive(); draw();
        },
      }, 'fire+=0.12')
      .set(rocket, { opacity: 0 }, 'fire+=0.92');

    // scene 5: impact — paint explosion, cracks, shards, a hole in the wall
    const cracks = Array.from({ length: 11 }, (_, k) => {
      const a = (k / 11) * TAU + Math.random() * 0.4, pts = [[CX, CY]];
      let x = CX, y = CY, len = Math.min(W, H) * (0.34 + Math.random() * 0.46), aa = a;
      for (let d = 0; d < len; d += 26 + Math.random() * 30) { aa += (Math.random() - 0.5) * 0.6; x += Math.cos(aa) * (26 + Math.random() * 30); y += Math.sin(aa) * (26 + Math.random() * 30); pts.push([x, y]); }
      return pts;
    });
    const impact = () => {
      // dense splat core + yellow centre
      dab(actx, CX, CY, Math.min(W, H) * 0.44, PAINT.red, 14000, 0.95, [2, 4.5]);
      dab(actx, CX, CY, Math.min(W, H) * 0.24, PAINT.yellow, 6000, 0.95, [2, 4]);
      draw();
      gsap.set(flashRef.current, { opacity: 1 });
      gsap.to(flashRef.current, { opacity: 0, duration: 0.7, ease: 'power2.out' });
      gsap.fromTo(el, { x: 0, y: 0 }, { x: 14, y: -10, duration: 0.05, repeat: 9, yoyo: true, ease: 'none', onComplete: () => gsap.set(el, { x: 0, y: 0 }) });
      // shards fly toward the camera
      const box = shardsRef.current;
      const cols = ['#3b3935', '#2a2926', '#4a4843', PAINT.paper, PAINT.red, PAINT.yellow];
      for (let i = 0; i < (lowPower ? 12 : 22); i++) {
        const d = document.createElement('div'); d.className = 'pre__shard';
        const w = 50 + Math.random() * 140, h = 40 + Math.random() * 120, a = Math.random() * TAU;
        Object.assign(d.style, { left: `${CX - w / 2}px`, top: `${CY - h / 2}px`, width: `${w}px`, height: `${h}px`, background: cols[(Math.random() * cols.length) | 0], clipPath: `polygon(${Math.random() * 40}% 0, 100% ${Math.random() * 50}%, ${50 + Math.random() * 50}% 100%, 0 ${40 + Math.random() * 60}%)` });
        box.appendChild(d);
        gsap.fromTo(d, { x: 0, y: 0, scale: 0.3, rotation: Math.random() * 90 }, { x: Math.cos(a) * (W * (0.3 + Math.random() * 0.6)), y: Math.sin(a) * (H * (0.3 + Math.random() * 0.6)), scale: 1.2 + Math.random() * 2.4, rotation: (Math.random() - 0.5) * 700, duration: 1.1, ease: 'power3.out' });
        gsap.to(d, { opacity: 0, duration: 0.45, delay: 0.7 });
      }
      // paint burst rays
      const v = { t: 0 }; const colors = [PAINT.red, PAINT.yellow, PAINT.cyan, PAINT.pink, PAINT.paper, PAINT.ink];
      gsap.to(v, { t: 1, duration: 0.6, ease: 'power2.out', onUpdate: () => {
        for (let k = 0; k < 20; k++) { const a = Math.random() * TAU, rr = v.t * Math.max(W, H) * 0.6 * Math.pow(Math.random(), 0.55); dab(actx, CX + Math.cos(a) * rr, CY + Math.sin(a) * rr * 0.9, 14 + Math.random() * 40, colors[(Math.random() * colors.length) | 0], 24, 0.75, [1.4, 4]); }
        draw();
      } });
      // cracks race out of the impact
      const cr = { t: 0 }; const done = cracks.map(() => 0);
      gsap.to(cr, { t: 1, duration: 0.55, ease: 'power2.out', onUpdate: () => {
        cracks.forEach((pts, k) => {
          const upto = Math.floor(cr.t * (pts.length - 1));
          for (let i = done[k]; i < upto; i++) {
            actx.strokeStyle = '#0d0c0b'; actx.lineWidth = 4; actx.lineCap = 'round';
            actx.beginPath(); actx.moveTo(pts[i][0], pts[i][1]); actx.lineTo(pts[i + 1][0], pts[i + 1][1]); actx.stroke();
            actx.strokeStyle = 'rgba(239,232,214,0.7)'; actx.lineWidth = 1.2;
            actx.beginPath(); actx.moveTo(pts[i][0] + 1.5, pts[i][1] + 1.5); actx.lineTo(pts[i + 1][0] + 1.5, pts[i + 1][1] + 1.5); actx.stroke();
          }
          done[k] = upto;
        });
        draw();
      } });
      // drips from the splat
      for (let i = 0; i < 9; i++) {
        const dx = CX + (Math.random() - 0.5) * Math.min(W, H) * 0.7, dy0 = CY + Math.min(W, H) * (0.12 + Math.random() * 0.2), dl = 60 + Math.random() * 200, dd = { v: 0 }; let lastD = 0;
        gsap.to(dd, { v: 1, duration: 1.1 + Math.random() * 0.8, delay: 0.5, ease: 'power1.in', onUpdate: () => { for (let y = lastD * dl; y <= dd.v * dl; y += 3) dab(actx, dx, dy0 + y, 5, i % 2 ? PAINT.red : PAINT.yellow, 9, 0.8, [1.4, 3]); lastD = dd.v; draw(); } });
      }
    };
    m.addLabel('hit', 'fire+=0.92')
      .call(impact, null, 'hit')
      .call(() => { hole.on = true; hole.r = 0; }, null, 'hit+=0.18')
      .to(hole, { r: R0, duration: 0.55, ease: 'back.out(2)', onUpdate: draw }, 'hit+=0.2')
      .to(bars, { scaleY: 0, duration: 0.8, ease: 'expo.inOut' }, 'hit+=0.7')
      .to(baz, { yPercent: 140, rotation: '+=8', duration: 0.8, ease: 'power3.in' }, 'hit+=0.4')
      .call(() => {
        setScene(4);
        phase.current = 'open';
        el.classList.add('is-open');
        tunnel.open = true; tunnel.p = 0;
        if (skipRef.current) skipRef.current.firstChild.textContent = 'Go through ';
        cb.current.onReveal();
      }, null, 'hit+=0.9');
    m.timeScale(lowPower ? 1.5 : 1.2);
  }, { scope: root, dependencies: [] });

  const skip = contextSafe(() => {
    const m = master.current;
    if (phase.current === 'open') { scrollToTarget(window.innerHeight * 1.05, { duration: 2.4 }); return; }
    if (!m || m.timeScale() >= 3) return;
    gsap.to(m, { timeScale: 3.4, duration: 0.3, ease: 'power2.out' });
  });

  useEffect(() => {
    const key = (e) => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { if (phase.current === 'film') e.preventDefault(); skip(); } };
    window.addEventListener('keydown', key);
    return () => { alive.current = false; tunnel.render = null; window.removeEventListener('keydown', key); };
    // eslint-disable-next-line
  }, []);

  return (
    <div ref={root} className="pre" role="status" aria-label="Loading portfolio">
      <canvas ref={viewRef} className="pre__view" aria-hidden="true" />
      <div ref={shardsRef} className="pre__shards" aria-hidden="true" />
      <div ref={flashRef} className="pre__flash" aria-hidden="true" />
      <canvas ref={fxRef} className="pre__fx" aria-hidden="true" />
      <svg ref={pathsRef} className="pre__paths" viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true">
        {STROKES.map((s) => <path key={s.id} data-id={s.id} d={s.d} fill="none" />)}
      </svg>
      <div ref={canRef} className="pre__can"><CanIcon color="#ff3b1d" /></div>

      <div ref={bazRef} className="pre__baz" aria-hidden="true">
        <svg viewBox="0 0 640 280" className="pre__bazsvg" focusable="false">
          <path d="M520 78 L620 38 V242 L520 202 Z" fill="#2b2a27" stroke="#0d0c0b" strokeWidth="6" strokeLinejoin="round" />
          <path d="M540 104 L602 82 M540 140 L612 140 M540 176 L602 198" stroke="#ff3b1d" strokeWidth="7" strokeLinecap="round" />
          <rect x="130" y="80" width="400" height="120" rx="26" fill="#4a4843" stroke="#0d0c0b" strokeWidth="7" />
          <rect x="152" y="92" width="356" height="15" rx="7" fill="#efe8d6" opacity=".25" />
          <rect x="236" y="80" width="24" height="120" fill="#ffd60a" stroke="#0d0c0b" strokeWidth="5" />
          <rect x="420" y="80" width="24" height="120" fill="#ffd60a" stroke="#0d0c0b" strokeWidth="5" />
          <text x="290" y="156" fontFamily="Anton, Impact, sans-serif" fontSize="58" fill="#ff3b1d" stroke="#0d0c0b" strokeWidth="3" paintOrder="stroke" transform="rotate(-4 290 156)">SS</text>
          <path d="M130 68 L84 46 V234 L130 212 Z" fill="#ffd60a" stroke="#0d0c0b" strokeWidth="7" strokeLinejoin="round" />
          <path d="M112 96 L92 88 M112 140 L92 140 M112 184 L92 192" stroke="#0d0c0b" strokeWidth="7" strokeLinecap="round" />
          <g className="pre__loaded"><rect x="14" y="98" width="82" height="84" rx="16" fill="#ff3b1d" stroke="#0d0c0b" strokeWidth="6" /><rect x="40" y="98" width="24" height="84" fill="#efe8d6" stroke="#0d0c0b" strokeWidth="4" /><rect x="2" y="128" width="16" height="24" rx="4" fill="#0d0c0b" /></g>
          <rect x="330" y="58" width="16" height="24" fill="#0d0c0b" /><circle cx="338" cy="54" r="11" fill="#ffd60a" stroke="#0d0c0b" strokeWidth="4" />
          <path d="M296 200 L286 266 H350 L362 200 Z" fill="#2b2a27" stroke="#0d0c0b" strokeWidth="6" strokeLinejoin="round" />
          <path d="M468 200 Q478 252 520 254 L542 202 Z" fill="#ff4fa3" stroke="#0d0c0b" strokeWidth="6" strokeLinejoin="round" />
          <path d="M196 200 Q256 246 296 200" fill="none" stroke="#0d0c0b" strokeWidth="6" />
          <path d="M452 112 l9 18 20 2 -15 14 5 20 -19 -10 -19 10 5 -20 -15 -14 20 -2z" fill="#11b5e4" stroke="#0d0c0b" strokeWidth="4" strokeLinejoin="round" />
        </svg>
        <i ref={muzzleRef} className="pre__muzzle" />
      </div>
      <div ref={rocketRef} className="pre__rocket" aria-hidden="true">
        <svg viewBox="0 0 160 70" focusable="false"><path d="M118 20 L158 4 L146 35 L158 66 L118 50 Z" fill="#ffd60a" stroke="#0d0c0b" strokeWidth="4" strokeLinejoin="round" /><path d="M124 28 L146 35 L124 42" fill="#ff3b1d" /><rect x="14" y="12" width="104" height="46" rx="12" fill="#ff3b1d" stroke="#0d0c0b" strokeWidth="5" /><rect x="34" y="12" width="18" height="46" fill="#efe8d6" stroke="#0d0c0b" strokeWidth="3.5" /><rect x="2" y="27" width="14" height="16" rx="3" fill="#0d0c0b" /><path d="M64 14 L88 4 L100 14 M64 56 L88 66 L100 56" fill="#11b5e4" stroke="#0d0c0b" strokeWidth="3.5" strokeLinejoin="round" /></svg>
      </div>
      <svg ref={muzzleFlash} className="pre__mflash" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><path d="M60 4 L70 40 L108 30 L82 58 L116 80 L76 80 L74 116 L56 84 L22 108 L38 72 L4 52 L44 46 Z" fill="#ffd60a" stroke="#ff3b1d" strokeWidth="5" strokeLinejoin="round" /></svg>

      <div ref={barsRef} className="pre__bars" aria-hidden="true"><i /><i /></div>
      <p ref={subRef} className="pre__sub" aria-hidden="true" />
      <div className="pre__hud mono" aria-hidden="true">
        <span>Subrata Saha — a film on a wall</span>
        <span>scene / <b ref={sceneEl}>the wall</b></span>
      </div>
      <button ref={skipRef} className="pre__skip mono" onClick={skip}><span>Skip intro </span><kbd>↵</kbd></button>
      <span className="sr-only">Loading portfolio. Press Enter to skip the intro animation, then scroll to enter the page.</span>
    </div>
  );
}
