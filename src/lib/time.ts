import type { SessionHours } from "@/lib/clocks";

type LocalTimeParts = {
  weekday: number;
  hour: number;
  minute: number;
  second: number;
};

type SessionWindow = {
  open: number;
  close: number;
};

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const secondsPerMinute = 60;
const secondsPerHour = 60 * secondsPerMinute;
const secondsPerDay = 24 * secondsPerHour;
const secondsPerWeek = 7 * secondsPerDay;

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string) {
  const cached = formatters.get(timeZone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  formatters.set(timeZone, formatter);

  return formatter;
}

function getLocalTimeParts(now: Date, timeZone: string): LocalTimeParts {
  const values = Object.fromEntries(
    getFormatter(timeZone)
      .formatToParts(now)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return {
    weekday: weekdayMap[values.weekday] ?? 0,
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function toDaySeconds(hour: number, minute: number) {
  return hour * secondsPerHour + minute * secondsPerMinute;
}

function getSessionWindows(session: SessionHours): SessionWindow[] {
  const openSeconds = toDaySeconds(session.openHour, session.openMinute);
  const closeSeconds = toDaySeconds(session.closeHour, session.closeMinute);

  return [1, 2, 3, 4, 5].map((weekday) => ({
    open: weekday * secondsPerDay + openSeconds,
    close: weekday * secondsPerDay + closeSeconds,
  }));
}

function getWeeklySecond(parts: LocalTimeParts) {
  return (
    parts.weekday * secondsPerDay +
    parts.hour * secondsPerHour +
    parts.minute * secondsPerMinute +
    parts.second
  );
}

function getClosedProgress(currentWeekSecond: number, sessions: SessionWindow[]) {
  const closes = sessions.map(({ close }) => close);
  const opens = sessions.map(({ open }) => open);

  let lastClose = closes.findLast((close) => close <= currentWeekSecond);

  if (lastClose === undefined) {
    lastClose = closes.at(-1)! - secondsPerWeek;
  }

  let nextOpen = opens.find((open) => open > currentWeekSecond);

  if (nextOpen === undefined) {
    nextOpen = opens[0] + secondsPerWeek;
  }

  const elapsed = currentWeekSecond - lastClose;
  const duration = nextOpen - lastClose;

  return duration > 0 ? elapsed / duration : 0;
}

export function getClockDisplay(now: Date | null, timeZone: string) {
  if (!now) {
    return {
      time: "--:--",
      seconds: "--",
    };
  }

  const parts = getLocalTimeParts(now, timeZone);

  return {
    time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
    seconds: String(parts.second).padStart(2, "0"),
  };
}

export function getMarketRingState(
  now: Date | null,
  timeZone: string,
  session: SessionHours,
) {
  if (!now) {
    return {
      sessionState: "closed" as const,
      outerProgress: 0,
      secondProgress: 0,
    };
  }

  const parts = getLocalTimeParts(now, timeZone);
  const currentWeekSecond = getWeeklySecond(parts);
  const sessions = getSessionWindows(session);
  const currentSession = sessions.find(
    ({ open, close }) => currentWeekSecond >= open && currentWeekSecond < close,
  );

  const secondProgress = (secondsPerMinute - parts.second) / secondsPerMinute;

  if (currentSession) {
    const elapsed = currentWeekSecond - currentSession.open;
    const duration = currentSession.close - currentSession.open;
    const remaining = duration - elapsed;

    return {
      sessionState: "open" as const,
      outerProgress: duration > 0 ? remaining / duration : 0,
      secondProgress,
    };
  }

  return {
    sessionState: "closed" as const,
    outerProgress: getClosedProgress(currentWeekSecond, sessions),
    secondProgress,
  };
}

export function getMarketSessionState(
  now: Date | null,
  timeZone: string,
  session: SessionHours,
) {
  return getMarketRingState(now, timeZone, session).sessionState;
}
