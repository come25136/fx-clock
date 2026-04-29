"use client";

import { useEffect, useMemo, useState } from "react";

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

type SegmentLayout = {
  leftPercent: number;
  widthPercent: number;
  flagOffsetPercent: number;
  pairAnchorPercent: number | null;
  pairAlign: "left" | "right";
  clippedLeft: boolean;
  clippedRight: boolean;
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
const WEEK_IN_MS = 7 * FULL_DAY_IN_MS;
const centerLineTextGapPx = 12;
const flagInsetPx = 38;
const contentGapPx = 12;
const rightInsetPx = 12;

const flagByCity: Record<string, string> = {
  Tokyo: "🇯🇵",
  London: "🇬🇧",
  Sydney: "🇦🇺",
  "New York": "🇺🇸",
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
});

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  hourCycle: "h23",
});

const timelineSectionClass = "ml-[calc(50%-50vw)] grid w-screen gap-[14px] bg-[#070A13]";
const axisClass = "relative h-8 overflow-hidden bg-[#070A13] pb-2";
const axisInnerClass = "absolute inset-0 will-change-transform";
const axisLabelClass =
  "absolute bottom-1.5 -translate-x-1/2 whitespace-nowrap text-[0.83rem] text-[rgba(222,227,241,0.88)] [font-variant-numeric:tabular-nums] max-[640px]:text-[0.74rem]";
const rowsClass = "relative grid gap-0 bg-[#070A13] pb-4";
const nowLineClass = "pointer-events-none absolute inset-[-8px_auto_0_50%] z-20 w-0.5 -translate-x-px";
const trackClass = "relative h-10.5 overflow-hidden bg-[#070A13] max-[640px]:h-11.5";
const barClass =
  "absolute top-1 bottom-1 overflow-hidden whitespace-nowrap bg-[#535866] px-3 text-[rgba(244,247,255,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(161,174,212,0.22),0_8px_18px_rgba(0,0,0,0.18)] max-[640px]:px-2";
const barTextClass = "text-[0.85rem] [font-variant-numeric:tabular-nums]";
const barStrongClass = `${barTextClass} font-bold`;
const barPairsClass = `overflow-hidden text-ellipsis whitespace-nowrap ${barTextClass} max-[640px]:text-[0.74rem]`;
const flagClass = "absolute top-1/2 -translate-y-1/2 text-[0.9rem] leading-none";
const edgeFlagClass =
  "absolute top-1/2 z-10 flex h-[calc(100%-8px)] w-7 -translate-y-1/2 items-center justify-center bg-[#535866] text-[0.9rem] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";
const barContentClass =
  "absolute inset-y-0 left-[38px] right-3 flex items-center gap-3 max-[640px]:right-2 max-[640px]:gap-2";
const pairSlotClass = "min-w-0 flex-1";
const openTimeClass = `shrink-0 ${barStrongClass}`;
const closeTimeClass = `shrink-0 text-right ${barStrongClass}`;

let measureCanvas: HTMLCanvasElement | null = null;

function measureTextWidthPx(text: string, fontSizePx: number, fontWeight: number) {
  if (typeof document === "undefined") {
    return text.length * fontSizePx;
  }

  measureCanvas ??= document.createElement("canvas");
  const context = measureCanvas.getContext("2d");

  if (!context) {
    return text.length * fontSizePx;
  }

  const fontFamily = getComputedStyle(document.body).fontFamily;
  context.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;

  return Math.ceil(context.measureText(text).width);
}

function formatTime(date: Date) {
  return timeFormatter.format(date);
}

function getRatio(date: Date, start: Date) {
  return (date.getTime() - start.getTime()) / FULL_DAY_IN_MS;
}

function findSessionBoundary(
  point: Date,
  clock: ClockConfig,
  direction: "backward" | "forward",
) {
  const step = direction === "backward" ? -STEP_IN_MS : STEP_IN_MS;
  let cursor = point.getTime();

  for (let traversed = 0; traversed <= WEEK_IN_MS; traversed += STEP_IN_MS) {
    const probe = new Date(cursor + step);

    if (getMarketSessionState(probe, clock.timeZone, clock.session) !== "open") {
      return direction === "backward" ? new Date(cursor) : probe;
    }

    cursor += step;
  }

  return point;
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
    getMarketSessionState(start, clock.timeZone, clock.session) === "open"
      ? findSessionBoundary(start, clock, "backward")
      : null;

  for (let cursor = start.getTime() + STEP_IN_MS; cursor <= end.getTime(); cursor += STEP_IN_MS) {
    const point = new Date(cursor);
    const isOpen = getMarketSessionState(point, clock.timeZone, clock.session) === "open";

    if (isOpen && segmentStart === null) {
      segmentStart = point;
      continue;
    }

    if (!isOpen && segmentStart !== null) {
      segments.push({
        startRatio: getRatio(segmentStart, start),
        endRatio: getRatio(point, start),
        startLabel: formatTime(segmentStart),
        endLabel: formatTime(point),
      });
      segmentStart = null;
    }
  }

  if (segmentStart !== null) {
    const segmentEnd = findSessionBoundary(new Date(end.getTime() - STEP_IN_MS), clock, "forward");

    segments.push({
      startRatio: getRatio(segmentStart, start),
      endRatio: getRatio(segmentEnd, start),
      startLabel: formatTime(segmentStart),
      endLabel: formatTime(segmentEnd),
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
      label: hourFormatter.format(point),
      left: ((cursor - start.getTime()) / FULL_DAY_IN_MS) * 100,
    });
  }

  return markers;
}

function getSegmentLayout(segment: TimelineSegment, translatePercent: number): SegmentLayout {
  const leftPercent = segment.startRatio * 100 - translatePercent;
  const widthPercent = Math.max((segment.endRatio - segment.startRatio) * 100, 1.8);
  const hiddenLeftPercent = Math.max(0, -leftPercent);
  const flagOffsetPercent = Math.min((hiddenLeftPercent / widthPercent) * 100, 100);
  const midpointPercent = leftPercent + widthPercent / 2;
  const centerAnchorPercent = ((50 - leftPercent) / widthPercent) * 100;
  const pairAnchorPercent =
    centerAnchorPercent >= 0 && centerAnchorPercent <= 100 ? centerAnchorPercent : null;

  return {
    leftPercent,
    widthPercent,
    flagOffsetPercent,
    pairAnchorPercent,
    pairAlign: midpointPercent < 50 ? "right" : "left",
    clippedLeft: leftPercent < 0,
    clippedRight: leftPercent + widthPercent > 100,
  };
}

export function MarketSessionTimeline({ clocks, now }: MarketSessionTimelineProps) {
  const [viewportWidth, setViewportWidth] = useState(0);
  const anchorMinute = now ? Math.floor(now.getTime() / STEP_IN_MS) * STEP_IN_MS : null;
  const minuteProgress = now ? (now.getTime() % STEP_IN_MS) / STEP_IN_MS : 0;
  const translatePercent = (minuteProgress / 1440) * 100;
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

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  const isCompact = viewportWidth > 0 && viewportWidth <= 640;
  const rootFontSizePx =
    typeof document === "undefined"
      ? 16
      : Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const barFontSizePx = rootFontSizePx * (isCompact ? 0.74 : 0.85);

  return (
    <section className={timelineSectionClass} aria-label="Market sessions timeline">
      <div className={axisClass} aria-hidden="true">
        <div className={axisInnerClass} style={contentStyle}>
          {hourMarkers.map((marker) => (
            <span
              key={marker.key}
              className={axisLabelClass}
              style={{ left: `${marker.left}%` }}
            >
              {marker.label}
            </span>
          ))}
        </div>
      </div>

      <div className={rowsClass}>
        <div className={nowLineClass} style={nowLineStyle} aria-hidden="true" />

        {rows.map(({ clock, segments }) => (
          <article key={clock.city} className="relative" aria-label={`${clock.city} session`}>
            <div className={trackClass}>
              <div className={axisInnerClass} style={contentStyle}>
                {segments.length > 0 ? (
                  segments.map((segment) => (
                    (() => {
                      const layout = getSegmentLayout(segment, translatePercent);
                      const pairText = clock.pairs.join("　");
                      const openWidthPx = measureTextWidthPx(segment.startLabel, barFontSizePx, 700);
                      const closeWidthPx = measureTextWidthPx(segment.endLabel, barFontSizePx, 700);
                      const pairTextWidthPx = measureTextWidthPx(pairText, barFontSizePx, 400);
                      const contentLeftPx = flagInsetPx;
                      const contentRightPx = rightInsetPx;
                      const leftPx = (layout.leftPercent / 100) * viewportWidth;
                      const widthPx = (layout.widthPercent / 100) * viewportWidth;
                      const centerAnchorPx = viewportWidth / 2 - leftPx;
                      const pairBaseStartPx = contentLeftPx + openWidthPx + contentGapPx;
                      const pairSlotWidthPx =
                        widthPx - contentLeftPx - openWidthPx - contentGapPx - closeWidthPx - contentRightPx;
                      const pairIndentPx = Math.max(
                        centerAnchorPx - pairBaseStartPx + centerLineTextGapPx,
                        0,
                      );
                      const availableRightPx = pairSlotWidthPx - pairIndentPx;
                      const canAttachToCenter =
                        layout.pairAnchorPercent !== null &&
                        centerAnchorPx >= pairBaseStartPx &&
                        availableRightPx >= pairTextWidthPx;

                      return (
                        <div key={`${clock.city}-${segment.startRatio}-${segment.endRatio}`}>
                          <div
                            className={barClass}
                            style={{
                              left: `${segment.startRatio * 100}%`,
                              width: `${layout.widthPercent}%`,
                            }}
                          >
                            {!layout.clippedLeft && !layout.clippedRight ? (
                              <span className={flagClass} style={{ left: "12px" }} aria-hidden="true">
                                {flagByCity[clock.city] ?? "◦"}
                              </span>
                            ) : null}
                            <div
                              className={barContentClass}
                              style={{ left: `${contentLeftPx}px`, right: `${contentRightPx}px` }}
                            >
                              <span className={openTimeClass} style={{ width: `${openWidthPx}px` }}>
                                {segment.startLabel}
                              </span>
                              <div className={pairSlotClass}>
                                <span
                                  className={`block ${layout.pairAlign === "right" && !canAttachToCenter ? "text-right" : ""} ${
                                    layout.clippedLeft || layout.clippedRight ? `overflow-visible whitespace-nowrap ${barTextClass}` : barPairsClass
                                  }`}
                                  style={canAttachToCenter ? { paddingLeft: `${pairIndentPx}px` } : undefined}
                                >
                                  {pairText}
                                </span>
                              </div>
                              <span className={closeTimeClass} style={{ width: `${closeWidthPx}px` }}>
                                {segment.endLabel}
                              </span>
                            </div>
                          </div>
                          {layout.clippedLeft ? (
                            <span className={`${edgeFlagClass} left-0`} aria-hidden="true">
                              {flagByCity[clock.city] ?? "◦"}
                            </span>
                          ) : null}
                          {layout.clippedRight ? (
                            <span
                              className={edgeFlagClass}
                              style={{ left: `${Math.max(layout.leftPercent, 0)}%` }}
                              aria-hidden="true"
                            >
                              {flagByCity[clock.city] ?? "◦"}
                            </span>
                          ) : null}
                        </div>
                      );
                    })()
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
