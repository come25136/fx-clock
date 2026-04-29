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
  market: string;
  symbol: string;
  pairs: string[];
  headline: string;
};

export const CLOCKS: ClockConfig[] = [
  {
    city: "London",
    timeZone: "Europe/London",
    session: { openHour: 8, openMinute: 0, closeHour: 17, closeMinute: 0 },
    market: "London Session",
    symbol: "EUR / GBP",
    pairs: ["ユーロ/米ドル", "ポンド/米ドル", "ユーロ/英ポンド"],
    headline: "ユーロとポンドが動きやすい時間帯",
  },
  {
    city: "Tokyo",
    timeZone: "Asia/Tokyo",
    session: { openHour: 9, openMinute: 0, closeHour: 18, closeMinute: 0 },
    market: "Tokyo Session",
    symbol: "JPY / AUD",
    pairs: ["米ドル/円", "豪ドル/円", "ユーロ/円"],
    headline: "円主導でアジア通貨が活発になりやすい",
  },
  {
    city: "Sydney",
    timeZone: "Australia/Sydney",
    session: { openHour: 7, openMinute: 0, closeHour: 16, closeMinute: 0 },
    market: "Sydney Session",
    symbol: "AUD / NZD",
    pairs: ["豪ドル/米ドル", "NZドル/米ドル", "豪ドル/円"],
    headline: "豪ドルとNZドルの初動が出やすい",
  },
  {
    city: "New York",
    timeZone: "America/New_York",
    session: { openHour: 8, openMinute: 0, closeHour: 17, closeMinute: 0 },
    market: "New York Session",
    symbol: "USD / CAD",
    pairs: ["ユーロ/米ドル", "米ドル/カナダドル", "ポンド/米ドル"],
    headline: "ドル主導で主要ペアの値動きが強まりやすい",
  },
];
