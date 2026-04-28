export type SessionHours = {
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
};

export type ClockConfig = {
  city: string;
  timeZone: string;
  session: SessionHours;
};

export const CLOCKS: ClockConfig[] = [
  {
    city: "London",
    timeZone: "Europe/London",
    session: { openHour: 8, openMinute: 0, closeHour: 17, closeMinute: 0 },
  },
  {
    city: "Tokyo",
    timeZone: "Asia/Tokyo",
    session: { openHour: 9, openMinute: 0, closeHour: 18, closeMinute: 0 },
  },
  {
    city: "Sydney",
    timeZone: "Australia/Sydney",
    session: { openHour: 7, openMinute: 0, closeHour: 16, closeMinute: 0 },
  },
  {
    city: "New York",
    timeZone: "America/New_York",
    session: { openHour: 8, openMinute: 0, closeHour: 17, closeMinute: 0 },
  },
];
