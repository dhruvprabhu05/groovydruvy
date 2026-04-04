import Link from "next/link";
import type { Stock } from "@/lib/db";

export default function RecommendedWidget({ stocks }: { stocks: Stock[] }) {
  return (
    <div className="card">
      <div className="card-title">Recommended Stocks</div>
      {stocks.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No recommendations today.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {stocks.map((stock) => (
            <Link key={stock.id} href={`/stock/${stock.ticker}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.03)" }}>
              <div><span style={{ fontWeight: 600, fontSize: "14px" }}>{stock.ticker}</span><span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>{stock.name}</span></div>
              <div style={{ textAlign: "right" }}>
                <div className={stock.change_pct !== null && stock.change_pct >= 0 ? "positive" : "negative"} style={{ fontSize: "13px", fontWeight: 600 }}>{stock.change_pct !== null ? `${stock.change_pct >= 0 ? "+" : ""}${stock.change_pct.toFixed(1)}%` : "—"}</div>
                <div style={{ fontSize: "11px", color: stock.signal === "analyst_pick" ? "var(--green)" : "var(--yellow)" }}>{stock.signal === "analyst_pick" ? "✦ " : "⚡ "}{stock.signal_reason ?? stock.signal}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
