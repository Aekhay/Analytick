"use client";

import { useEffect } from "react";

/**
 * Keeps two scrollable elements locked to each other.
 * Scrolling either pane mirrors the position to the other.
 */
export function useSyncScroll(refA, refB) {
  useEffect(() => {
    const a = refA.current;
    const b = refB.current;
    if (!a || !b) return;

    let locked = false;

    const syncFrom = (source, target) => () => {
      if (locked) return;
      locked = true;
      target.scrollTop = source.scrollTop;
      target.scrollLeft = source.scrollLeft;
      requestAnimationFrame(() => {
        locked = false;
      });
    };

    const onScrollA = syncFrom(a, b);
    const onScrollB = syncFrom(b, a);

    a.addEventListener("scroll", onScrollA);
    b.addEventListener("scroll", onScrollB);

    return () => {
      a.removeEventListener("scroll", onScrollA);
      b.removeEventListener("scroll", onScrollB);
    };
  }, [refA, refB]);
}
