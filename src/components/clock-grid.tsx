"use client";

import { ActiveMarketCards } from "@/components/active-market-cards";
import { MarketClock } from "@/components/market-clock";
import { useCurrentTime } from "@/hooks/use-current-time";
import { CLOCKS } from "@/lib/clocks";

export function ClockGrid() {
  const now = useCurrentTime();

  return (
    <main className="fx-clock-shell">
      <section className="fx-clock-grid" aria-label="World clocks">
        {CLOCKS.map((clock) => (
          <MarketClock key={clock.city} clock={clock} now={now} />
        ))}
      </section>
      <ActiveMarketCards clocks={CLOCKS} now={now} />
    </main>
  );
}
