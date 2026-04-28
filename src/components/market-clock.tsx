import type { CSSProperties } from "react";

import type { ClockConfig } from "@/lib/clocks";
import { getClockDisplay, getMarketRingState } from "@/lib/time";

type MarketClockProps = {
  clock: ClockConfig;
  now: Date | null;
};

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

  return (
    <article className="fx-clock-card" style={ringStyle(clock, now)}>
      <div className="fx-clock-outer-ring">
        <div className="fx-clock-ring-gap">
          <div className="fx-clock-inner-ring">
            <div className="fx-clock-face">
              <h2>{clock.city}</h2>
              <p className="fx-clock-time" suppressHydrationWarning>
                {display.time}
              </p>
              <p className="fx-clock-seconds" suppressHydrationWarning>
                {display.seconds}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
