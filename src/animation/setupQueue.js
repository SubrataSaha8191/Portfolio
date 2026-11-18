import { useLayoutEffect } from 'react';

// Sections build their ScrollTriggers synchronously in mount order (pins must be created top to bottom).
// (A deferred queue was tried; it moved the work into the opening film and made it hitch, so it is not used.)
export const flushSetups = () => {};

export function useQueuedLayout(setup, deps = []) {
  useLayoutEffect(() => {
    const cleanup = setup();
    return () => { if (cleanup) cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
