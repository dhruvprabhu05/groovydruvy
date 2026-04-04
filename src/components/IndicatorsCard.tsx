import type { Stock } from "@/lib/db";

function rsiColor(rsi: number | null): string {
  if (rsi === null) return "";
  if (rsi >= 70) return "negative";
  if (rsi <= 30) return "positive";
  return "neutral";
}

export default function IndicatorsCard({ stock }: { stock: Stock }) {
  const indicators = [
    { label: "RSI", value: stock.rsi?.toFixed(1) ?? "—", className: rsiColor(stock.rsi) },
    { label: "SMA 20", value: stock.sma_20 ? `$${stock.sma_20.toFixed(2)}` : "—", className: "" },
    { label: "SMA 50", value: stock.sma_50 ? `$${stock.sma_50.toFixed(2)}` : "—", className: "" },
  ];
  return (
    <div className="card">
      <div className="card-title">Key Indicators</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {indicators.map((ind) => (
          <div key={ind.label}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{ind.label}</div>
            <div className={ind.className} style={{ fontSize: "16px", fontWeight: 600, marginTop: "2px" }}>{ind.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
