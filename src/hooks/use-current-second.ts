"use client";

import { useEffect, useState } from "react";

export function useCurrentSecond() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;

    const tick = () => {
      const nextNow = new Date();
      setNow(nextNow);

      const delay = 1000 - nextNow.getMilliseconds();
      timeoutId = window.setTimeout(tick, delay);
    };

    tick();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return now;
}
