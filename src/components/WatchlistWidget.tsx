import Link from "next/link";
import type { Stock } from "@/lib/db";

export default function WatchlistWidget({ stocks }: { stocks: Stock[] }) {
  return (
    <div className="card">
      <div className="card-title">Your Watchlist</div>
      {stocks.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No stocks in watchlist. Search for a ticker to add one.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {stocks.map((stock) => (
            <Link key={stock.ticker} href={`/stock/${stock.ticker}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.03)" }}>
              <span style={{ fontWeight: 600, fontSize: "13px" }}>{stock.ticker}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "13px" }}>${stock.price?.toFixed(2) ?? "—"} </span>
                <span className={stock.change_pct !== null && stock.change_pct >= 0 ? "positive" : "negative"} style={{ fontSize: "12px" }}>{stock.change_pct !== null ? `${stock.change_pct >= 0 ? "+" : ""}${stock.change_pct.toFixed(1)}%` : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
