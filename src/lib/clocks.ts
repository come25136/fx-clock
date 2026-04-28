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
    pairs: ["EUR/USD", "GBP/USD", "EUR/GBP"],
    headline: "ユーロとポンドが動きやすい時間帯",
  },
  {
    city: "Tokyo",
    timeZone: "Asia/Tokyo",
    session: { openHour: 9, openMinute: 0, closeHour: 18, closeMinute: 0 },
    market: "Tokyo Session",
    symbol: "JPY / AUD",
    pairs: ["USD/JPY", "AUD/JPY", "EUR/JPY"],
    headline: "円主導でアジア通貨が活発になりやすい",
  },
  {
    city: "Sydney",
    timeZone: "Australia/Sydney",
    session: { openHour: 7, openMinute: 0, closeHour: 16, closeMinute: 0 },
    market: "Sydney Session",
    symbol: "AUD / NZD",
    pairs: ["AUD/USD", "NZD/USD", "AUD/JPY"],
    headline: "豪ドルとNZドルの初動が出やすい",
  },
  {
    city: "New York",
    timeZone: "America/New_York",
    session: { openHour: 8, openMinute: 0, closeHour: 17, closeMinute: 0 },
    market: "New York Session",
    symbol: "USD / CAD",
    pairs: ["EUR/USD", "USD/CAD", "GBP/USD"],
    headline: "ドル主導で主要ペアの値動きが強まりやすい",
  },
];
