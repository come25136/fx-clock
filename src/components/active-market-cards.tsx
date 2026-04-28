"use client";

import type { ClockConfig } from "@/lib/clocks";
import { getMarketSessionState } from "@/lib/time";

type ActiveMarketCardsProps = {
  clocks: ClockConfig[];
  now: Date | null;
};

function ActiveCard({ clock }: { clock: ClockConfig }) {
  return (
    <article className="fx-market-card">
      <p className="fx-market-card-symbol">{clock.symbol}</p>
      <h3 className="fx-market-card-headline">{clock.headline}</h3>
      <p className="fx-market-card-meta">
        {clock.market} · {clock.pairs.join(" · ")}
      </p>
    </article>
  );
}

export function ActiveMarketCards({ clocks, now }: ActiveMarketCardsProps) {
  const activeMarkets = clocks.filter(
    (clock) => getMarketSessionState(now, clock.timeZone, clock.session) === "open",
  );

  return (
    <section className="fx-market-section" aria-label="Active currencies">
      <header className="fx-market-section-header">
        <p className="fx-market-section-title">Active Pairs</p>
        <span className="fx-market-section-status">
          {activeMarkets.length > 0 ? "市場オープン中" : "主要市場は休場中"}
        </span>
      </header>
      <div className="fx-market-card-grid">
        {activeMarkets.length > 0 ? (
          activeMarkets.map((clock) => <ActiveCard key={clock.city} clock={clock} />)
        ) : (
          <article className="fx-market-card fx-market-card-muted">
            <p className="fx-market-card-symbol">WAIT</p>
            <h3 className="fx-market-card-headline">今は主要市場のオープン前です</h3>
            <p className="fx-market-card-meta">ロンドン・東京・シドニー・ニューヨークの開始を待機中</p>
          </article>
        )}
      </div>
    </section>
  );
}
