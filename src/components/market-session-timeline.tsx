"use client";

import { useMemo } from "react";

import type { ClockConfig } from "@/lib/clocks";
import { getMarketSessionState } from "@/lib/time";

type MarketSessionTimelineProps = {
  clocks: ClockConfig[];
  now: Date | null;
};

type TimelineSegment = {
  startRatio: number;
  endRatio: number;
  startLabel: string;
  endLabel: string;
};

type TimelineRow = {
  clock: ClockConfig;
  segments: TimelineSegment[];
};

type HourMarker = {
  key: string;
  label: string;
  left: number;
};

const HALF_DAY_IN_MS = 12 * 60 * 60 * 1000;
const FULL_DAY_IN_MS = HALF_DAY_IN_MS * 2;
const STEP_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * STEP_IN_MS;

const flagByCity: Record<string, string> = {
  Tokyo: "🇯🇵",
  London: "🇬🇧",
  Sydney: "🇦🇺",
  "New York": "🇺🇸",
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hourCycle: "h23",
});

function formatTime(date: Date) {
  return timeFormatter.format(date);
}

function clampRatio(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function getTimelineBounds(anchor: Date) {
  return {
    start: new Date(anchor.getTime() - HALF_DAY_IN_MS),
    end: new Date(anchor.getTime() + HALF_DAY_IN_MS),
  };
}

function buildSegments(clock: ClockConfig, anchor: Date): TimelineSegment[] {
  const { start, end } = getTimelineBounds(anchor);
  const segments: TimelineSegment[] = [];
  let segmentStart: Date | null =
    getMarketSessionState(start, clock.timeZone, clock.session) === "open" ? start : null;

  for (let cursor = start.getTime() + STEP_IN_MS; cursor <= end.getTime(); cursor += STEP_IN_MS) {
    const point = new Date(cursor);
    const isOpen = getMarketSessionState(point, clock.timeZone, clock.session) === "open";

    if (isOpen && segmentStart === null) {
      segmentStart = point;
      continue;
    }

    if (!isOpen && segmentStart !== null) {
      segments.push({
        startRatio: clampRatio((segmentStart.getTime() - start.getTime()) / FULL_DAY_IN_MS),
        endRatio: clampRatio((point.getTime() - start.getTime()) / FULL_DAY_IN_MS),
        startLabel: formatTime(segmentStart),
        endLabel: formatTime(point),
      });
      segmentStart = null;
    }
  }

  if (segmentStart !== null) {
    segments.push({
      startRatio: clampRatio((segmentStart.getTime() - start.getTime()) / FULL_DAY_IN_MS),
      endRatio: 1,
      startLabel: formatTime(segmentStart),
      endLabel: formatTime(end),
    });
  }

  return segments;
}

function buildRows(clocks: ClockConfig[], anchor: Date): TimelineRow[] {
  return clocks.map((clock) => ({
    clock,
    segments: buildSegments(clock, anchor),
  }));
}

function buildHourMarkers(anchor: Date): HourMarker[] {
  const { start, end } = getTimelineBounds(anchor);
  const firstHour = new Date(start);
  firstHour.setMinutes(0, 0, 0);

  if (firstHour.getTime() > start.getTime()) {
    firstHour.setHours(firstHour.getHours() - 1);
  }

  const markers: HourMarker[] = [];

  for (let cursor = firstHour.getTime(); cursor <= end.getTime() + HOUR_IN_MS; cursor += HOUR_IN_MS) {
    const point = new Date(cursor);
    markers.push({
      key: point.toISOString(),
      label: `${hourFormatter.format(point)}:00`,
      left: ((cursor - start.getTime()) / FULL_DAY_IN_MS) * 100,
    });
  }

  return markers;
}

export function MarketSessionTimeline({ clocks, now }: MarketSessionTimelineProps) {
  const anchorMinute = now ? Math.floor(now.getTime() / STEP_IN_MS) * STEP_IN_MS : null;
  const minuteProgress = now ? (now.getTime() % STEP_IN_MS) / STEP_IN_MS : 0;
  const contentStyle = {
    transform: `translateX(calc(${minuteProgress} * -100% / 1440))`,
  };
  const nowLineStyle = {
    background: "rgba(255, 255, 255, 0.8)",
    boxShadow: "0 0 22px rgba(255, 255, 255, 0.18)",
  };

  const hourMarkers = useMemo(
    () => (anchorMinute !== null ? buildHourMarkers(new Date(anchorMinute)) : []),
    [anchorMinute],
  );
  const rows = useMemo(
    () => (anchorMinute !== null ? buildRows(clocks, new Date(anchorMinute)) : []),
    [anchorMinute, clocks],
  );

  return (
    <section
      className="ml-[calc(50%-50vw)] grid w-screen gap-[14px] bg-[#070A13]"
      aria-label="Market sessions timeline"
    >
      <div
        className="relative h-8 overflow-hidden bg-[#070A13] pb-2"
        aria-hidden="true"
      >
        <div className="absolute inset-0 will-change-transform" style={contentStyle}>
          {hourMarkers.map((marker) => (
            <span
              key={marker.key}
              className="absolute bottom-1.5 translate-x-[-50%] whitespace-nowrap text-[0.83rem] text-[rgba(222,227,241,0.88)] [font-variant-numeric:tabular-nums] max-[640px]:text-[0.74rem]"
              style={{ left: `${marker.left}%` }}
            >
              {marker.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative grid gap-0 bg-[#070A13] pb-4">
        <div
          className="pointer-events-none absolute inset-[-8px_auto_0_50%] z-20 w-0.5 translate-x-[-1px]"
          style={nowLineStyle}
          aria-hidden="true"
        />

        {rows.map(({ clock, segments }) => (
          <article
            key={clock.city}
            className="relative"
            aria-label={`${clock.city} session`}
          >
            <div className="relative h-10.5 overflow-hidden bg-[#070A13] shadow-[inset_0_0_0_1px_rgba(63,74,109,0.38)] max-[640px]:h-11.5">
              <div className="absolute inset-0 will-change-transform" style={contentStyle}>
                {segments.length > 0 ? (
                  segments.map((segment) => (
                    <div
                      key={`${clock.city}-${segment.startRatio}-${segment.endRatio}`}
                      className="absolute top-1 bottom-1 flex items-center gap-2.5 overflow-hidden whitespace-nowrap bg-[#535866] px-3 text-[rgba(244,247,255,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(161,174,212,0.22),0_8px_18px_rgba(0,0,0,0.18)] max-[640px]:gap-2 max-[640px]:px-2"
                      style={{
                        left: `${segment.startRatio * 100}%`,
                        width: `${Math.max((segment.endRatio - segment.startRatio) * 100, 1.8)}%`,
                      }}
                    >
                      <span className="text-[0.9rem] leading-none" aria-hidden="true">
                        {flagByCity[clock.city] ?? "◦"}
                      </span>
                      <span className="text-[0.85rem] font-bold [font-variant-numeric:tabular-nums]">
                        {segment.startLabel}
                      </span>
                      <span className="min-w-0 overflow-hidden text-ellipsis text-[0.85rem] [font-variant-numeric:tabular-nums] max-[640px]:text-[0.74rem]">
                        {clock.pairs.join("　")}
                      </span>
                      <span className="ml-auto text-[0.85rem] font-bold [font-variant-numeric:tabular-nums]">
                        {segment.endLabel}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[0.82rem] text-[rgba(148,157,184,0.65)]">
                    この24時間に該当セッションはありません
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
