import { LiveMarketClocks } from "@/components/live-market-clocks";
import { LiveMarketSessionTimeline } from "@/components/live-market-session-timeline";
import { VoicevoxJihouControl } from "@/components/voicevox-jihou-control";

export function ClockGrid() {
  return (
    <main className="grid min-h-screen grid-rows-[1fr_1fr] px-6 pt-12 pb-9 max-[640px]:px-4 max-[640px]:pt-7 max-[640px]:pb-[34px]">
      <VoicevoxJihouControl />
      <section
        className="grid content-end justify-items-center pb-10 max-[640px]:pb-6"
        aria-label="World clocks"
      >
        <LiveMarketClocks />
      </section>
      <section className="grid content-center">
        <LiveMarketSessionTimeline />
      </section>
      <p className="pointer-events-none fixed right-5 bottom-4 z-20 text-[11px] font-medium tracking-[0.14em] text-white/38 max-[640px]:right-4 max-[640px]:bottom-3 max-[640px]:text-[10px]">
        cv:VOICEVOX（ずんだもん）
      </p>
    </main>
  );
}
