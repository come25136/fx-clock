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
    <main className="grid min-h-screen grid-rows-[1fr_1fr] px-6 pt-12 pb-9 max-[640px]:px-4 max-[640px]:pt-7 max-[640px]:pb-[34px]">
      <section
        className="grid content-end justify-items-center pb-10 max-[640px]:pb-6"
        aria-label="World clocks"
      >
        <div className="grid w-full max-w-[1560px] grid-cols-4 justify-items-center gap-[clamp(28px,3vw,72px)] max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-6">
          {CLOCKS.map((clock) => (
            <MarketClock key={clock.city} clock={clock} now={clockNow} />
          ))}
        </div>
      </section>
      <section className="grid content-center">
        <MarketSessionTimeline clocks={CLOCKS} now={timelineNow} />
      </section>
    </main>
  );
}
