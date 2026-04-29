import { LiveMarketClocks } from "@/components/live-market-clocks";
import { LiveMarketSessionTimeline } from "@/components/live-market-session-timeline";

export function ClockGrid() {
  return (
    <main className="grid min-h-screen grid-rows-[1fr_1fr] px-6 pt-12 pb-9 max-[640px]:px-4 max-[640px]:pt-7 max-[640px]:pb-[34px]">
      <section
        className="grid content-end justify-items-center pb-10 max-[640px]:pb-6"
        aria-label="World clocks"
      >
        <LiveMarketClocks />
      </section>
      <section className="grid content-center">
        <LiveMarketSessionTimeline />
      </section>
    </main>
  );
}
