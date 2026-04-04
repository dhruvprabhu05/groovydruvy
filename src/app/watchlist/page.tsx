import { getWatchlist, getWatchlistStocks } from "@/lib/db";
import Link from "next/link";
import WatchlistActions from "./WatchlistActions";

export default async function WatchlistPage() {
  const [watchlist, stocks] = await Promise.all([getWatchlist(), getWatchlistStocks()]);
  const stockMap = new Map(stocks.map((s) => [s.ticker, s]));
  return (
    <main style={{ padding: "24px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Your Watchlist</h2>
      <WatchlistActions />
      {watchlist.length === 0 ? <p style={{ color: "var(--text-muted)", marginTop: "16px" }}>No stocks in your watchlist yet. Use the search bar to find a stock and add it.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
          {watchlist.map((item) => {
            const stock = stockMap.get(item.ticker);
            return (
              <div key={item.ticker} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link href={`/stock/${item.ticker}`} style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: "15px" }}>{item.ticker}</span><span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "10px" }}>{item.name}</span></Link>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {stock && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px" }}>${stock.price?.toFixed(2) ?? "—"}</div>
                      <div className={stock.change_pct !== null && stock.change_pct >= 0 ? "positive" : "negative"} style={{ fontSize: "12px" }}>{stock.change_pct !== null ? `${stock.change_pct >= 0 ? "+" : ""}${stock.change_pct.toFixed(1)}%` : ""}</div>
                      {stock.rsi !== null && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>RSI: {stock.rsi.toFixed(0)}</div>}
                    </div>
                  )}
                  <WatchlistActions ticker={item.ticker} mode="remove" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
