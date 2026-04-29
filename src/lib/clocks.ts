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
  pairs: string[];
};

export const CLOCKS: ClockConfig[] = [
  {
    city: "London",
    timeZone: "Europe/London",
    session: { openHour: 8, openMinute: 0, closeHour: 17, closeMinute: 0 },
    pairs: ["ユーロ/米ドル", "ポンド/米ドル", "ユーロ/英ポンド"],
  },
  {
    city: "Tokyo",
    timeZone: "Asia/Tokyo",
    session: { openHour: 9, openMinute: 0, closeHour: 18, closeMinute: 0 },
    pairs: ["米ドル/円", "豪ドル/円", "ユーロ/円"],
  },
  {
    city: "Sydney",
    timeZone: "Australia/Sydney",
    session: { openHour: 7, openMinute: 0, closeHour: 16, closeMinute: 0 },
    pairs: ["豪ドル/米ドル", "NZドル/米ドル", "豪ドル/円"],
  },
  {
    city: "New York",
    timeZone: "America/New_York",
    session: { openHour: 8, openMinute: 0, closeHour: 17, closeMinute: 0 },
    pairs: ["ユーロ/米ドル", "米ドル/カナダドル", "ポンド/米ドル"],
  },
];
