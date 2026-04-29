import type { CSSProperties } from "react";

import type { ClockConfig } from "@/lib/clocks";
import { getClockDisplay, getMarketRingState } from "@/lib/time";

type MarketClockProps = {
  clock: ClockConfig;
  now: Date | null;
};

const clockCardClass = "aspect-square w-full max-w-[276px]";
const ringShellClass = "grid size-full place-items-center rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.03),inset_0_0_16px_rgba(112,140,219,0.08)]";
const ringGapClass = "grid size-[calc(100%-16px)] place-items-center rounded-full bg-[var(--background)]";
const innerRingClass = "grid size-[calc(100%-12px)] place-items-center rounded-full";
const faceClass =
  "grid size-[calc(100%-28px)] place-items-center content-center gap-2.5 rounded-full bg-[var(--face)] shadow-[inset_0_0_0_2px_rgba(50,60,91,0.45),0_16px_40px_rgba(0,0,0,0.22)]";
const cityClass =
  "m-0 text-[clamp(1.35rem,1.5vw,1.7rem)] leading-none font-normal text-[var(--muted)] underline decoration-[1.5px] underline-offset-[0.18em]";
const clockValueClass = "m-0 leading-[0.9] font-bold tracking-[-0.04em] [font-variant-numeric:tabular-nums]";
const timeClass = `${clockValueClass} text-[clamp(1.7rem,1.9vw,2.3rem)]`;
const secondsClass = `${clockValueClass} text-[clamp(2rem,2.2vw,2.8rem)]`;

function getProgressDegrees(progress: number) {
  return Math.min(Math.max(progress, 0), 1) * 360;
}

function ringStyle(clock: ClockConfig, now: Date | null) {
  const ringState = getMarketRingState(now, clock.timeZone, clock.session);
  const outerDegrees = getProgressDegrees(ringState.outerProgress);
  const secondDegrees = getProgressDegrees(ringState.secondProgress);
  const outerRing =
    ringState.sessionState === "open"
      ? `conic-gradient(from 0deg, #2d3556 0deg ${360 - outerDegrees}deg, #2cff05 ${360 - outerDegrees}deg 360deg)`
      : `conic-gradient(from 0deg, #c30d03 0deg ${outerDegrees}deg, #2d3556 ${outerDegrees}deg 360deg)`;

  return {
    "--outer-ring": outerRing,
    "--inner-ring": `conic-gradient(from 0deg, #2d3556 0deg ${360 - secondDegrees}deg, #f2b400 ${360 - secondDegrees}deg 360deg)`,
  } as CSSProperties;
}

export function MarketClock({ clock, now }: MarketClockProps) {
  const display = getClockDisplay(now, clock.timeZone);
  const style = ringStyle(clock, now);

  return (
    <article className={clockCardClass} style={style}>
      <div className={ringShellClass} style={{ background: "var(--outer-ring)" }}>
        <div className={ringGapClass}>
          <div className={innerRingClass} style={{ background: "var(--inner-ring)" }}>
            <div className={faceClass}>
              <h2 className={cityClass}>{clock.city}</h2>
              <p className={timeClass} suppressHydrationWarning>
                {display.time}
              </p>
              <p className={secondsClass} suppressHydrationWarning>
                {display.seconds}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
