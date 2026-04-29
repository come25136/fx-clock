"use client";

import { MarketSessionTimeline } from "@/components/market-session-timeline";
import { useCurrentMinute } from "@/hooks/use-current-minute";
import { CLOCKS } from "@/lib/clocks";

export function LiveMarketSessionTimeline() {
  const now = useCurrentMinute();

  return <MarketSessionTimeline clocks={CLOCKS} now={now} />;
}
