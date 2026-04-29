"use client";

import { useEffect, useState } from "react";

export function useCurrentMinute() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;

    const tick = () => {
      const nextNow = new Date();
      setNow(nextNow);

      const delay =
        (60 - nextNow.getSeconds()) * 1000 - nextNow.getMilliseconds();
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
