export const dynamic = "force-dynamic";

import { getStockByTicker, getArticlesForTicker, getEarningsForTicker, isInWatchlist } from "@/lib/db";
import type { Stock } from "@/lib/db";
import TickerHeader from "@/components/TickerHeader";
import IndicatorsCard from "@/components/IndicatorsCard";
import RangeCard from "@/components/RangeCard";
import SignalsCard from "@/components/SignalsCard";
import RelatedNewsCard from "@/components/RelatedNewsCard";

async function fetchStockLive(ticker: string): Promise<Stock | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const closes = quotes.close.filter((c: number | null) => c !== null);
    if (closes.length === 0) return null;
    const current = closes[closes.length - 1];
    const previous = closes.length > 1 ? closes[closes.length - 2] : current;
    return {
      id: ticker,
      ticker,
      name: meta.shortName ?? meta.symbol ?? ticker,
      price: current,
      change_pct: ((current - previous) / previous) * 100,
      volume: quotes.volume?.[quotes.volume.length - 1] ?? null,
      rsi: null,
      sma_20: null,
      sma_50: null,
      high_52w: Math.max(...closes),
      low_52w: Math.min(...closes),
      signal: null,
      signal_reason: null,
      date: new Date().toISOString().split("T")[0],
    };
  } catch {
    return null;
  }
}

export default async function TickerPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();
  const [dbStock, articles, earnings, watchlisted] = await Promise.all([
    getStockByTicker(ticker), getArticlesForTicker(ticker), getEarningsForTicker(ticker), isInWatchlist(ticker),
  ]);

  const stock = dbStock ?? await fetchStockLive(ticker);

  if (!stock) {
    return (
      <main style={{ padding: "24px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
          <a href="/" style={{ color: "var(--text-muted)" }}>← Back</a>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>{ticker}</h2>
        <p style={{ color: "var(--text-muted)" }}>Could not find data for this ticker. Please check the symbol and try again.</p>
      </main>
    );
  }

  return (
    <main>
      <TickerHeader stock={stock} inWatchlist={watchlisted} />
      <div className="widget-grid">
        <IndicatorsCard stock={stock} />
        <RangeCard stock={stock} />
        <SignalsCard stock={stock} earnings={earnings} />
        <RelatedNewsCard articles={articles} />
      </div>
    </main>
  );
}
