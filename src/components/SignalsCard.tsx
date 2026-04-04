import type { Stock, EarningsEntry } from "@/lib/db";

export default function SignalsCard({ stock, earnings }: { stock: Stock; earnings: EarningsEntry | null }) {
  const signals: { icon: string; text: string; color: string }[] = [];
  if (stock.signal === "analyst_pick") signals.push({ icon: "✦", text: stock.signal_reason ?? "Analyst Upgrade", color: "var(--green)" });
  if (stock.signal === "trending") signals.push({ icon: "⚡", text: stock.signal_reason ?? "Trending", color: "var(--yellow)" });
  if (stock.signal === "momentum") signals.push({ icon: "🔥", text: stock.signal_reason ?? "Price momentum", color: "var(--yellow)" });
  if (earnings) {
    const dateStr = new Date(earnings.earnings_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    signals.push({ icon: "📅", text: `Earnings: ${dateStr}`, color: "var(--text-secondary)" });
  }
  return (
    <div className="card">
      <div className="card-title">Signals</div>
      {signals.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No signals for this stock.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {signals.map((sig, i) => <div key={i} style={{ fontSize: "13px", color: sig.color }}>{sig.icon} {sig.text}</div>)}
        </div>
      )}
    </div>
  );
}
