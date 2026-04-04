import type { MarketSummary } from "@/lib/db";

function formatChange(value: number | null): { text: string; className: string } {
  if (value === null) return { text: "—", className: "" };
  const sign = value >= 0 ? "+" : "";
  return { text: `${sign}${value.toFixed(1)}%`, className: value >= 0 ? "positive" : "negative" };
}

function fearGreedLabel(score: number | null): { text: string; className: string } {
  if (score === null) return { text: "—", className: "" };
  if (score <= 25) return { text: `${score} Extreme Fear`, className: "negative" };
  if (score <= 45) return { text: `${score} Fear`, className: "negative" };
  if (score <= 55) return { text: `${score} Neutral`, className: "neutral" };
  if (score <= 75) return { text: `${score} Greed`, className: "neutral" };
  return { text: `${score} Extreme Greed`, className: "positive" };
}

export default function MarketSummaryBar({ summary }: { summary: MarketSummary | null }) {
  if (!summary) return <div style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "13px" }}>No market data available yet.</div>;
  const items = [
    { label: "S&P 500", value: summary.sp500?.toLocaleString() ?? "—", change: formatChange(summary.sp500_change) },
    { label: "NASDAQ", value: summary.nasdaq?.toLocaleString() ?? "—", change: formatChange(summary.nasdaq_change) },
    { label: "DOW", value: summary.dow?.toLocaleString() ?? "—", change: formatChange(summary.dow_change) },
    { label: "VIX", value: summary.vix?.toFixed(1) ?? "—", change: { text: "", className: "" } },
  ];
  const fg = fearGreedLabel(summary.fear_greed);
  return (
    <div style={{ display: "flex", gap: "12px", padding: "12px 24px", overflowX: "auto" }}>
      {items.map((item) => (
        <div key={item.label} className="card" style={{ flex: 1, padding: "10px 14px" }}>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>{item.label}</div>
          <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "4px" }}>{item.value} <span className={item.change.className} style={{ fontSize: "13px" }}>{item.change.text}</span></div>
        </div>
      ))}
      <div className="card" style={{ flex: 1, padding: "10px 14px" }}>
        <div style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Fear / Greed</div>
        <div className={fg.className} style={{ fontSize: "15px", fontWeight: 600, marginTop: "4px" }}>{fg.text}</div>
      </div>
    </div>
  );
}
