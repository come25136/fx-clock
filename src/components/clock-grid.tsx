"use client";

import { MarketClock } from "@/components/market-clock";
import { MarketSessionTimeline } from "@/components/market-session-timeline";
import { useCurrentSecond } from "@/hooks/use-current-second";
import { useCurrentTime } from "@/hooks/use-current-time";
import { CLOCKS } from "@/lib/clocks";

export function ClockGrid() {
  const clockNow = useCurrentTime();
  const timelineNow = useCurrentSecond();

  return (
    <main className="relative grid min-h-screen content-center justify-items-center px-6 pt-12 pb-9 max-[640px]:px-4 max-[640px]:pt-7 max-[640px]:pb-[34px]">
      <section className="fx-clock-grid" aria-label="World clocks">
        {CLOCKS.map((clock) => (
          <MarketClock key={clock.city} clock={clock} now={clockNow} />
        ))}
      </section>
      <div className="h-[220px] w-full max-[640px]:h-[180px]" aria-hidden="true" />
      <section className="absolute inset-x-0 bottom-0 grid h-1/2 content-center">
        <MarketSessionTimeline clocks={CLOCKS} now={timelineNow} />
      </section>
    </main>
  );
}
