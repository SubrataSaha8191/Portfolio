import { gsap, prefersReducedMotion } from './gsap';
import { splitText } from './split';

/**
 * Shared scroll motion, declared with attributes so sections stay free of animation code.
 *   data-split [= chars|words]  + data-fx = rise | fall | wave | zoom | flip | slide
 *   data-reveal                 fade + lift
 *   data-clip                   clip-path wipe (images)
 *   .bgword                     giant outlined word that drifts with scroll
 * Exit: every .sect-head shrinks and dims as it leaves, so sections breathe in and out.
 */
export function initReveals(scope, cleanups) {
  const reduced = prefersReducedMotion();
  scope.querySelectorAll('[data-split]').forEach((el) => {
    const mode = el.dataset.split === 'words' ? 'words' : 'chars';
    const fx = el.dataset.fx || 'rise';
    const s = splitText(el, mode);
    cleanups.push(s.revert);
    if (reduced) return;
    const t = mode === 'words' ? s.words : s.chars;
    const play = { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' };
    const scrub = (start, end, amt = 0.8) => ({ trigger: el, start, end, scrub: amt });

    if (fx === 'fall') {
      el.classList.add('fx-open');
      gsap.set(t, { yPercent: -320, rotate: () => gsap.utils.random(-50, 50), opacity: 0 });
      gsap.to(t, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.5, ease: 'bounce.out', stagger: { each: 0.045, from: 'random' }, scrollTrigger: play });
    } else if (fx === 'wave') {
      gsap.set(t, { yPercent: 130, opacity: 0.15 });
      gsap.to(t, { yPercent: 0, opacity: 1, ease: 'power3.out', stagger: { each: 0.05, from: 'start' }, scrollTrigger: scrub('top 95%', 'top 40%', 1) });
    } else if (fx === 'zoom') {
      gsap.fromTo(el, { scale: 3.2, opacity: 0, transformOrigin: '0% 60%' }, { scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: scrub('top 105%', 'top 50%', 0.8) });
      gsap.set(t, { yPercent: 0 });
    } else if (fx === 'flip') {
      el.classList.add('fx-open');
      gsap.set(t, { rotationX: -95, yPercent: 40, opacity: 0, transformOrigin: '50% 100%', transformPerspective: 700 });
      gsap.to(t, { rotationX: 0, yPercent: 0, opacity: 1, ease: 'back.out(1.6)', stagger: 0.035, scrollTrigger: scrub('top 95%', 'top 55%', 0.9) });
    } else if (fx === 'slide') {
      const dir = Number(el.dataset.dir || 1);
      gsap.set(t, { xPercent: dir * 70, opacity: 0 });
      gsap.to(t, { xPercent: 0, opacity: 1, ease: 'power3.out', stagger: 0.08, scrollTrigger: scrub('top 95%', 'top 55%', 0.8) });
    } else {
      gsap.set(t, { yPercent: 115, rotate: mode === 'chars' ? 6 : 0 });
      gsap.to(t, { yPercent: 0, rotate: 0, duration: 1.1, stagger: mode === 'chars' ? 0.025 : 0.06, ease: 'expo.out', scrollTrigger: play });
    }
  });
  if (reduced) return;

  scope.querySelectorAll('.display').forEach((el) => {
    gsap.fromTo(el, { yPercent: 14 }, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  scope.querySelectorAll('.sect-head').forEach((el) => {
    gsap.to(el, { scale: 0.86, opacity: 0.25, yPercent: -8, transformOrigin: '0% 100%', ease: 'none', scrollTrigger: { trigger: el, start: 'bottom 45%', end: 'bottom -10%', scrub: true } });
  });
  scope.querySelectorAll('.bgword').forEach((el, i) => {
    const dir = el.dataset.dir === 'r' ? 1 : -1;
    gsap.fromTo(el, { xPercent: dir * -18, scale: 0.9 }, { xPercent: dir * 18, scale: 1.12, ease: 'none', scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });
  scope.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, delay: Number(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
  });
  scope.querySelectorAll('[data-clip]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } });
  });
}

/** Section entrance: a rounded curtain that opens as the section arrives (non-pinned sections). */
export function curtain(el) {
  if (prefersReducedMotion()) return;
  gsap.fromTo(el, { clipPath: 'inset(7% 3% 0% 3% round 56px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', immediateRender: true,
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 30%', scrub: true },
  });
}

/** Section entrance for pinned sections: content scales and brightens into place. */
export function enterScale(el, target) {
  if (prefersReducedMotion()) return;
  const t = el.querySelector(target);
  if (!t) return;
  gsap.fromTo(t, { scale: 0.9, opacity: 0.25, transformOrigin: '50% 0%' }, {
    scale: 1, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: true },
  });
}

const trig = (el, start = 'top bottom', end = 'top 28%', scrub = 0.8) => ({ trigger: el, start, end, scrub });

/** Lab: split doors. The list slides in from the left, the diagram from the right. */
export function revealDoors(scope) {
  if (prefersReducedMotion()) return;
  gsap.fromTo(scope.querySelector('.lab__left'), { xPercent: -40, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out', scrollTrigger: trig(scope) });
  gsap.fromTo(scope.querySelector('.lab__right'), { xPercent: 40, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out', scrollTrigger: trig(scope) });
}

/** About: the whole composition swings up from its lower-left corner like a turned page. */
export function revealSwing(scope) {
  if (prefersReducedMotion()) return;
  gsap.fromTo(scope.querySelector('.about__grid'), { rotate: -8, yPercent: 16, opacity: 0, transformOrigin: '0% 100%' }, { rotate: 0, yPercent: 0, opacity: 1, ease: 'power3.out', scrollTrigger: trig(scope) });
}

/** Arsenal: the bands open one after another like blinds, the stack rises from below. */
export function revealBlinds(scope) {
  if (prefersReducedMotion()) return;
  gsap.fromTo(scope.querySelectorAll('.band'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', stagger: 0.12, ease: 'power3.inOut', scrollTrigger: trig(scope, 'top 95%', 'top 20%') });
  gsap.fromTo(scope.querySelector('.stack'), { yPercent: 45, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', scrollTrigger: trig(scope, 'top 95%', 'top 20%') });
}

/** Path: every chapter flips in around its left edge, one by one, as it reaches the reader. */
export function revealFlips(scope) {
  if (prefersReducedMotion()) return;
  gsap.utils.toArray(scope.querySelectorAll('.step')).forEach((el) => {
    gsap.fromTo(el, { rotationY: -58, opacity: 0, transformOrigin: '0% 50%', transformPerspective: 900 }, { rotationY: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 62%', scrub: 0.7 } });
  });
}

/** Contact: a lime sunrise floods up from the bottom edge. */
export function revealSunrise(scope) {
  if (prefersReducedMotion()) return;
  gsap.fromTo(scope.querySelector('.contact__flood'), { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, transformOrigin: '50% 100%', ease: 'power2.out', scrollTrigger: trig(scope, 'top 80%', 'top -10%', 1) });
}
