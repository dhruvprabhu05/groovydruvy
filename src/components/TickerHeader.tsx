"use client";
import { useRouter } from "next/navigation";
import type { Stock } from "@/lib/db";

export default function TickerHeader({ stock, inWatchlist }: { stock: Stock; inWatchlist: boolean }) {
  const router = useRouter();
  async function toggleWatchlist() {
    await fetch("/api/watchlist", { method: inWatchlist ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticker: stock.ticker, name: stock.name }) });
    router.refresh();
  }
  const changeClass = stock.change_pct !== null && stock.change_pct >= 0 ? "positive" : "negative";
  const changeText = stock.change_pct !== null ? `${stock.change_pct >= 0 ? "+" : ""}${stock.change_pct.toFixed(1)}%` : "";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 24px" }}>
      <div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}><a href="/" style={{ color: "var(--text-muted)" }}>← Back</a></div>
        <div style={{ fontSize: "22px", fontWeight: 700 }}>{stock.ticker} <span style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-secondary)" }}>{stock.name}</span></div>
        <div className={changeClass} style={{ fontSize: "24px", fontWeight: 700, marginTop: "4px" }}>${stock.price?.toFixed(2) ?? "—"} <span style={{ fontSize: "16px" }}>{changeText}</span></div>
      </div>
      <button onClick={toggleWatchlist} className="card" style={{ cursor: "pointer", fontSize: "12px", color: inWatchlist ? "var(--red)" : "var(--green)", borderColor: inWatchlist ? "rgba(255,87,87,0.3)" : "rgba(0,212,170,0.3)" }}>
        {inWatchlist ? "− Remove from Watchlist" : "+ Add to Watchlist"}
      </button>
    </div>
  );
}
