"use client";

import { useEffect, useState } from "react";

export function useCurrentTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let frameId: number | undefined;

    const tick = () => {
      setNow(new Date());
      frameId = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return now;
}
