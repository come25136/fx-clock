"use client";

import { useEffect, useState } from "react";

export function useCurrentTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;

    const tick = () => {
      setNow(new Date());

      const delay = 1000 - (Date.now() % 1000);
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
