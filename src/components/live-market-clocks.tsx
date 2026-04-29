"use client";

import { MarketClock } from "@/components/market-clock";
import { useCurrentTime } from "@/hooks/use-current-time";
import { CLOCKS } from "@/lib/clocks";

export function LiveMarketClocks() {
  const now = useCurrentTime();

  return (
    <div className="grid w-full max-w-[1560px] grid-cols-4 justify-items-center gap-[clamp(28px,3vw,72px)] max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-6">
      {CLOCKS.map((clock) => (
        <MarketClock key={clock.city} clock={clock} now={now} />
      ))}
    </div>
  );
}
