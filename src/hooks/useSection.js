import { useQueuedLayout } from '../animation/setupQueue';
import { gsap } from '../animation/gsap';

/**
 * Runs `setup` inside a gsap.context scoped to `ref`. Everything created in it
 * (tweens, ScrollTriggers) is reverted on unmount; `cleanups` handles non-GSAP
 * side effects such as text-split reverts and event listeners.
 */
export function useSection(ref, setup, deps = []) {
  useQueuedLayout(() => {
    const cleanups = [];
    const ctx = gsap.context(() => setup({ cleanups, scope: ref.current }), ref);
    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
